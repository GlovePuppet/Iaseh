function loadStatus() {
  let urlGetStatus = '/pandar.cgi?action=get&object=lidar_config';
  function updateStatus() {
    $.ajax({url: urlGetStatus})
    .done((data) => {
      let dataJSON = JSON.parse(data)
      let body = dataJSON['Body'];
      let spinRate = Math.pow(2, parseInt(body['SpinSpeed']) - 1) * 300;
      $('#spin-rate').text(spinRate + '  rpm');
      // $('#temperature').text(body['Temp'] + ' \xB0C');
      if (parseInt(body['GPS']) === 1) {
        $('#gps-lock').text('Locked');
      }
      else {
        $('#gps-lock').text('Unlock');
      }
      setTimeout(updateStatus, 1000 * 2);
    });
  }

  updateStatus();

  let urlGetDevicoInfo = '/pandar.cgi?action=get&object=device_info'
  $.ajax({url: urlGetDevicoInfo})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    $('#sn').text(body['SN']);
    $('#model').text(body['SN'].slice(0, 4));
  });
}


function loadDeviceInfo() {
  var url = '/pandar.cgi?action=get&object=device_info'
  $.ajax({
    url: url
    }
  )
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    $('#s-version').text(body['SW_Ver']);
    $('#h-version').text(body['HW_Ver'])
    $('#f-version').text(body['FW_Ver']);
    $('#mac').text(body['Mac']);
    $('#sn').text(body['SN']);
    $('#model').text(body['SN'].slice(0, 4));
  });
}

let lidar_type = null;

function loadSettingInfo() {
  let urlGetDevicoInfo = '/pandar.cgi?action=get&object=device_info';

  let urlGetEthernet = '/pandar.cgi?action=get&object=ethernet_all';
  let urlGetlidarConfig = '/pandar.cgi?action=get&object=lidar_config';
  let urlGetSyncAngle = '/pandar.cgi?action=get&object=lidar_sync&key=sync_angle';
  let urlGetLidarRange = '/pandar.cgi?action=get&object=lidar_data&key=lidar_range';
  let urlGetLidarMode = '/pandar.cgi?action=get&object=lidar_data&key=lidar_mode';

  $.ajax({url: urlGetDevicoInfo})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    lidar_type = body['Model'];

    console.log(lidar_type);
    if(lidar_type != "Pandar_ARM"){
      $('#stream-ip').hide();
      $('#stream-ip').next().hide();
      $('#stream-ip').prev().hide();
    }
    if(lidar_type != "Pandar_ZYNQ"){
      $('#gps-row').hide();
    }

    $.ajax({url: urlGetlidarConfig})
    .done((data) => {
      let dataJSON = JSON.parse(data)
      let body = dataJSON['Body'];
      $('#setting-spin-rate').val(body['SpinSpeed']);
      $('#destination-ip').val(body['DestIp'])
      $('#destination-lidar-port').val(body['DestPort']);
      if(lidar_type === "Pandar_ZYNQ"){
        $('#destination-gps-port').val(body['GpsPort']);
      }
    });
  });


  $.ajax({url: urlGetEthernet})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    $('#ip-address').val(body['Control_IP']['IPv4']);
    $('#ip-mask').val(body['Control_IP']['Mask'])
    $('#ip-gateway').val(body['Control_IP']['Gateway']);
    $('#stream-ip-address').val(body['Stream_IP']['IPv4']);
  });

  $.ajax({url: urlGetSyncAngle})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    
    $('#sync-angle').val(body['syncAngle']);

    if(parseInt(body['sync']) === 0){
        $("#sync-angle").attr("disabled", true);
        $("#sync-angle-checkbox").attr("checked", false);
    }
    else{
        $("#sync-angle").attr("disabled", false);
        $("#sync-angle-checkbox").attr("checked", true);
    }
  });

  $.ajax({url: urlGetLidarRange})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    
    $('#start-angle').val(body['StartAngle']);
    $('#end-angle').val(body['EndAngle']);
  });

  $.ajax({url: urlGetLidarMode})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    
    $('#setting-lidar-mode').val(body['lidar_mode']);
  });
}

function loadUpgradeInfo() {
  var url = '/pandar.cgi?action=get&object=device_info'
  $.ajax({url: url})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    $('#s-version').text(body['SW_Ver']);
     $('#fs-version').text(body['SW_Ver']);
     $('#fc-version').text(body['FW_Ver']);
  });




    
  $('#upload-file').change(function() {
    console.log('upload file')
    let waitMillisecond = 5 * 10000; // 3 second
    let startTime = Date.now();
    let consumedTim = 0;
    let persent = 0;
    function showProgress() {
      consumedTime = Date.now() - startTime;
      if (consumedTime > waitMillisecond){
        window.location.reload();
      }
      persent = Number.parseInt((consumedTime * 100)/waitMillisecond);
      $('#progress').css('width', 2 * persent + '%');
      $('#percent').text(persent + '%');
      setTimeout(showProgress, 100);
    }
    let formData = new FormData();
    formData.append('update-file', this.files[0]);

    // $('.progress-show').css('display', 'block');
    
    // showProgress()

     $.ajax({
        url: '/upgrade.cgi',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false,
      })
      .done((data, status, xhr) => {
        let dataJSON = JSON.parse(data);
        
        if (parseInt(dataJSON['Head']['ErrorCode']) != 0) {
          alert('Something is wrong when uploading the file');
          window.location.reload();
          return;
        }
        window.location.reload();
      });
  });

  $('#upload-firmware').change(function() {
    let waitMillisecond = 5 * 1000; // 3 second
    let startTime = Date.now();
    let consumedTim = 0;
    let persent = 0;
    function showProgress() {
      consumedTime = Date.now() - startTime;
      if (consumedTime > waitMillisecond){
        window.location.reload();
      }
      persent = Number.parseInt((consumedTime * 100)/waitMillisecond);
      $('#progress').css('width', 2 * persent + '%');
      $('#percent').text(persent + '%');
      setTimeout(showProgress, 100);
    }

    let formData = new FormData();
    formData.append('update-file', this.files[0]);
    $('.progress-show').css('display', 'block');
    showProgress();
     $.ajax({
        url: '/firmwareup.cgi',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false,
      })
      .done((data, status, xhr) => {
        // $('.progress-show').css('display', 'none');
        if (status !== 'success') {
          alert('Something is wrong when uploading the file');
          window.location.reload();
          return;
        }
        
      });
  });

}

function loadFirmUpgradeInfo() {
  var url = '/pandar.cgi?action=get&object=device_info'
  $.ajax({url: url})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    $('#s-version').text(body['FW_Ver']);
  });

  $('#upload-file').change(function() {
    let formData = new FormData();
    formData.append('update-file', this.files[0]);
     $.ajax({
        url: '/firmwareup.cgi',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false,
      })
      .done((data, status, xhr) => {
        if (status !== 'success') {
          alert('Something is wrong when uploading the file');
          return;
        }
        $('.progress-show').css('display', 'block');
        let waitMillisecond = 5 * 1000; // 3 second
        let startTime = Date.now();
        let consumedTim = 0;
        let persent = 0;
        function showProgress() {
          consumedTime = Date.now() - startTime;
          if (consumedTime > waitMillisecond){
            window.location.reload();
          }
          persent = Number.parseInt((consumedTime * 100)/waitMillisecond);
          $('#progress').css('width', 2 * persent + '%');
          $('#percent').text(persent + '%');
          setTimeout(showProgress, 100);
        }
        showProgress();
      });
  });

}


function loadFactoryInfo() {
  let urlGetDevicoInfo = '/pandar.cgi?action=get&object=device_info'
  $.ajax({url: urlGetDevicoInfo})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    $('#factory-sn').val(body['SN']);
    $('#factory-mac-address').val(body['Mac']);
    $('#factory-angle').val(body['AngleOffset']);
    $('#factory-spin-rate').val(2); // default 600RPM

    if( body['CalibSize'] > 0)
    {
      console.log(body['CalibSize']);
      $('#upcalibration_choosefile').attr("style", "color: red");
    }
  });
  $('#upload-calibration').hide();
  $('#upload-calibration').change(function() {
    console.log('upload calibration')
    let waitMillisecond = 5 * 10000; // 3 second
    let startTime = Date.now();
    let consumedTim = 0;
    let persent = 0;
    
    let formData = new FormData();
    formData.append('update-calibration', this.files[0]);

     $.ajax({
        url: '/upcalibration.cgi',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false,
      })
      .done((data, status, xhr) => {
        let dataJSON = JSON.parse(data);
        
        if (parseInt(dataJSON['Head']['ErrorCode']) != 0) {
          alert('Something is wrong when uploading the file');
          window.location.reload();
          return;
        }
        alert('Clibration File Up Successfully!!!');
      });
  });

  $('#destroy').click(() => {
    $.ajax({url: 'pandar.cgi?action=set&object=factory_destroy'})
    .done((data) => {
      let head = JSON.parse(data)['Head'];
      if (head['ErrorCode'] === '0') {
        alert('Well destroyed');
      }
      else {
        alert(head);
      }
    })
  })
}

function handleSyncAngle() {



  let checkbox = document.getElementById("sync-angle-checkbox");
  console.log($("#sync-angle").attr("disabled"));
  if(!checkbox.checked){
    $("#sync-angle").attr("disabled", true);
  }
  else{
    $("#sync-angle").attr("disabled", false);
  }
}

function setLaserMode() {
  if(parseInt($('#laser-mode').val()) === 2){
    let dom = "";
    for(let i=0; i<40; i++){
      dom += "<option>" + (i+1) + "</option>";
    }

    $(document).ready(function(){
                $('#laser-mode-td').append("<select class='form-control' style='margin-right: 10px' id='line-num'>" + dom + "</select>");
            });
      
  }
  else{
    $("#line-num").remove();
  }
}

function setLaserIntensity() {
  if(parseInt($('#laser-intensity').val()) === 2){
    $(document).ready(function(){
                $('#laser-intensity-td').append("<input type='text' class='form-control' style='margin-right: 10px' id='intensity-value'></input>");
            });
      
  }
  else{
    $("#intensity-value").remove();
  }
}

var flag = -1;
function saveSetting() {  
  let isDHCP = '0';
  let controlIp = $('#ip-address');
  let controlMask = $('#ip-mask');
  let controlGateway =  $('#ip-gateway');
  let streamIp = null;
  if(lidar_type === "Pandar_ARM")
    streamIp = $('#stream-ip-address');
  let spinRate = $('#setting-spin-rate');
  let destinationIp = $('#destination-ip');
  let destinationPort = $('#destination-lidar-port');
  let destinationGPSPort = null;

  let syncAngle = $('#sync-angle');
  let startAngle = $('#start-angle');
  let endAngle = $('#end-angle');

  let lidarMode = $('#setting-lidar-mode');
  // remove isDHCP in Map(user transparent)
  let variablesToValiate = new Map([['IPv4 address', controlIp], ['IPv4 mask', controlMask], ['IPv4 gateway', controlGateway], ['Stream IP', streamIp]
  , ['Spin rate', spinRate], ['Destination ip', destinationIp], ['Destination port', destinationPort], ['Sync Angle', syncAngle], ['Start Angle', startAngle], ['End Angle', endAngle], ['Lidar Mode', lidarMode]]);
  
  if(lidar_type != "Pandar_ARM"){
    variablesToValiate.delete('Stream IP');
  }
  if(lidar_type === "Pandar_ZYNQ"){
    destinationGPSPort = $('#destination-gps-port');
    variablesToValiate.set('Destination GPS port', destinationGPSPort);
  }


  if($("#sync-angle-checkbox").prop("checked") === false)
  variablesToValiate.delete('Sync Angle');
  
  let pos = 0;
  for (let [key, value] of variablesToValiate) {
    if (value.val() === undefined || value.val() === '') {
      // alert(key + " can't be empty");
      if(flag === pos){
        value.focus();
        return;
      }
      //prevent multiple warnings
      flag = pos;
      
      if(document.getElementById("warn") != null){
        $("#warn").remove();
      } 

      $(document).ready(function(){
          $("#save").before("<p id='warn' style='color: red;text-align: left'>" + key + " cannot be empty!</p>");
      });

      value.focus();
      return;
    }
    pos++;
  };
  console.log("ok! pass!");
  let urlSetStreamIp = null;
  if(lidar_type === "Pandar_ARM")
    urlSetStreamIp = `pandar.cgi?action=set&object=stream_port&key=ip&value={"IPv4":"${streamIp.val()}"}`
  let urlSetLidarRate = `pandar.cgi?action=set&object=lidar&key=spin_speed&value=${spinRate.val()}`;
  let urlSetStreamDestinationIp = null;
  if(lidar_type === "Pandar_ZYNQ"){
    urlSetStreamDestinationIp = `pandar.cgi?action=set&object=lidar&key=ip_disnation&value={"IPv4":"${destinationIp.val()}", "Port":${destinationPort.val()}, "GpsPort":${destinationGPSPort.val()}}`;
  }
  else{
    urlSetStreamDestinationIp = `pandar.cgi?action=set&object=lidar&key=ip_disnation&value={"IPv4":"${destinationIp.val()}", "Port":${destinationPort.val()}}`;  
  }
  let urlSetControlIp = `pandar.cgi?action=set&object=control_port&key=ip&value={"DHCP":${isDHCP}, "IPv4":"${controlIp.val()}", "Mask":"${controlMask.val()}", "Gateway":"${controlGateway.val()}"}`;
  let urlSetLidarMode = `pandar.cgi?action=set&object=lidar_data&key=lidar_mode&value=${lidarMode.val()}`;
  
  let enableSync = 0;
  let syncAngleVal = 0;
  if($("#sync-angle").attr("disabled") === undefined){
    enableSync = 1;
    syncAngleVal = syncAngle.val();
  }
  else{
    enableSync = 0;
  }
  console.log("enableSync: " + enableSync);
  let urlSetSyncAngle = `pandar.cgi?action=set&object=lidar_sync&key=sync_angle&value={"sync":${enableSync}, "syncAngle":${syncAngleVal}}`;
  let urlSetAngleRange = `pandar.cgi?action=set&object=lidar_data&key=lidar_range&value={"StartAngle":${startAngle.val()}, "EndAngle":${endAngle.val()}}`;

  let currentSubmitConut = 0;
  let urlAll = new Map([['ControlIp',urlSetControlIp], ['LidarRate', urlSetLidarRate], ['DestinationIp', urlSetStreamDestinationIp], ['StreamIp', urlSetStreamIp],['SyncAngle', urlSetSyncAngle], ['AngleRange', urlSetAngleRange], ['LidarMode', urlSetLidarMode]]);
  if(lidar_type != "Pandar_ARM")
    urlAll.delete('StreamIp');
  let expectedSuccessCount = urlAll.size;
  console.log(spinRate.val());
  console.log(expectedSuccessCount);
  let errorMsg = 'Error!\n';
  for (let [key, url] of urlAll) {
    console.log(url);
    $.ajax({url: url})
    .done((data) => {
      let dataJSON = JSON.parse(data)
      let head = dataJSON['Head'];
      if (head['ErrorCode'] !== '0') {
        errorMsg += key + ', Error code:' + head['ErrorCode'] + ', Message: ' + head['Message'] + '\n';
      }
      currentSubmitConut++;
      if (currentSubmitConut === expectedSuccessCount) {
        if (errorMsg !== 'Error!\n') {
          alert(errorMsg);
        }
        else {
          alert('Successfully saved!');
        }
      }

    });
  };

}
flag3 = -1;
function saveRegisterConfig() {
  let regKey = $('#reg-key');
  let regValue = $('#reg-value');

  let variablesToValiate = new Map([['Register Key', regKey], ['Register Value', regValue]]);
  let pos = 0;
  for(let [key, value] of variablesToValiate) {
    if (value.val() === undefined || value.val() === '') {
      if(flag3 === pos){
          value.focus();
          return;
      }
      //prevent multiple warnings
      flag3 = pos;
      
      if(document.getElementById("warn2") != null){
        $("#warn2").remove();
      } 

      $(document).ready(function(){
          $("#warn-td").append("<p id='warn2' style='color: red;text -align: left'>" + key + " cannot be empty!</p>");
      });

      value.focus();
      return;
    }
    pos++;
  }

  let urlSetRegister = `pandar.cgi?action=set&object=up_register&key=${regKey.val()}&value=${regValue.val()}`;

  let errorMsg = 'Error!\n';
  console.log(urlSetRegister);
  $.ajax({url: urlSetRegister})
  .done((data) => {
    let dataJSON = JSON.parse(data)
    let head = dataJSON['Head'];
    if (head['ErrorCode'] !== '0') {
      errorMsg += key + ', Error code:' + head['ErrorCode'] + ', Message: ' + head['Message'] + '\n';
    }
    if (errorMsg !== 'Error!\n') {
      alert(errorMsg);
    }
    else {
      alert('Successfully saved!');
      window.location.reload();
    }

  });
}

flag2 = -1;
function saveFactorySetting() {
  let macAddress = $('#factory-mac-address');
  let sn = $('#factory-sn');
  let angleOffset = $('#factory-angle');
  let spinRate = $('#factory-spin-rate');
  let laserMode = $('#laser-mode');
  let laserIntensity = $('#laser-intensity');

  let variablesToValiate = new Map([['Mac address', macAddress], ['S/N', sn], ['Spin Rate', spinRate], ['Laser Mode', laserMode], ['Laser Intensity', laserIntensity]]);
  let pos = 0;
  for (let [key, value] of variablesToValiate) {
    if (value.val() === undefined || value.val() === '') {
      if(flag2 === pos){
          value.focus();
          return;
      }
      //prevent multiple warnings
      flag2 = pos;
      
      if(document.getElementById("warn") != null){
        $("#warn").remove();
      } 

      $(document).ready(function(){
          $("#save-factory").before("<p id='warn' style='color: red;text -align: left'>" + key + " cannot be empty!</p>");
      });

      value.focus();
      return;
    }
    pos++;
  }
  let urlFactorySetting = `pandar.cgi?action=set&object=lidar&key=factory_setting&value={"SN":"${sn.val()}", "Mac":"${macAddress.val()}" , "AngleOffset":${angleOffset.val()}}`;

  let urlSetSpinRate = `pandar.cgi?action=set&object=lidar&key=spin_speed&value=${spinRate.val()}`;

  let laserSet = 256;
  if(parseInt($('#laser-mode').val()) === 1){
    console.log("multi laser");
    laserSet = 256;
  }
  else{
    console.log("single laser!!!");
    laserSet = $('#line-num').val() - 1;
  }
  console.log("laserSet: " + laserSet);
  
  let urlSetLaserMode = `pandar.cgi?action=set&object=laser_control&key=laser_enable&value=${laserSet}`

  let intensityVal = 0;
  if(parseInt($('#laser-intensity').val()) === 1){
    console.log("fluid intensity");
    intensityVal = 0;
  }
  else{
    console.log("fixed laser!!!");
    intensityVal = parseInt($('#intensity-value').val());
  }
  console.log("intensityVal: " + intensityVal);
  
  let urlSetLaserIntensity = ` pandar.cgi?action=set&object=laser_control&key=laser_intensity&value=${intensityVal}`

  
  // ********
  let currentSubmitConut = 0;
  let urlAll = new Map([['FactorySetting',urlFactorySetting], ['Spin Rate', urlSetSpinRate], ['Laser Mode', urlSetLaserMode], ['Laser Intensity', urlSetLaserIntensity]]);
  let expectedSuccessCount = urlAll.size;

  let errorMsg = 'Error!\n';
  for (let [key, url] of urlAll) {
    console.log(url);
    $.ajax({url: url})
    .done((data) => {
      let dataJSON = JSON.parse(data)
      let head = dataJSON['Head'];
      if (head['ErrorCode'] !== '0') {
        errorMsg += key + ', Error code:' + head['ErrorCode'] + ', Message: ' + head['Message'] + '\n';
      }
      currentSubmitConut++;
      if (currentSubmitConut === expectedSuccessCount) {
        if (errorMsg !== 'Error!\n') {
          alert(errorMsg);
        }
        else {
          alert('Successfully saved!');
          window.location.reload();
        }
      }

    });
  };
  // ********
}

function loadUpgradingProgress() {
  let urlGetUpgradingProgress = '/pandar.cgi?action=get&object=workmode';

  let workMode = 0;

  var breaker=1000;
  let step = [];
  let fail = 0;
  let len = 0;

  $.ajax({url: urlGetUpgradingProgress})
    .done((data) => {
      let dataJSON = JSON.parse(data)
        let body = dataJSON['Body'];
        workMode = parseInt(body['WorkMode']);
        if(!workMode){
          //upgrade complete!
          return;
        }
        else{
          len = body['UpdateStatus'].length;

          for(let i=0; i<len; i++){
            step.push(0);
          }

          let dom = ``;
          for(let i=0; i<len; i++){
            dom += `
                  <tr>
                  <td>${body['UpdateStatus'][i]['Bref']}</td>
                  <td>
                    <div class="progress">
                        <div class="progress-bar progress-bar-info progress-bar-striped active" id="progressbar-${i}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
                            <span id="aa-${i}">0%</span>
                        </div>
                    </div>
                  </td>
                  </tr>`
          }
          dom += `<tr>
                    <td></td>
                    <td></td>
                  </tr>`;

          $(document).ready(function(){
                $('#progress-table-title-tr').after(dom);
              });

        }

    });

  // ---
  function checkLoop(){
        
    $.ajax({url: urlGetUpgradingProgress})
      .done((data) => {
        let dataJSON = JSON.parse(data)
        let body = dataJSON['Body'];
        workMode = parseInt(body['WorkMode']);
        if(!workMode){
          //upgrade complete!
          return;
        }
        else{
          ///get progress status
          ///get percent

          for(let i=0; i<len; i++){
              let progressVal = parseInt(body['UpdateStatus'][i]['Process']);
              $("#aa-" + i).html(progressVal+"%");
              $("#progressbar-" + i).attr("style", "width:"+progressVal+"%");
          }

          for(let i=0; i<len; i++){
              statusId = parseInt(body['UpdateStatus'][i]['Status']);
              if(statusId === 2){
                $("#aa-" + i).html("Complete");
                $("#progressbar-" + i).attr("style", "width: 100%");
                $("#progressbar-" + i).removeClass("progress-bar-info");
                $("#progressbar-" + i).addClass("progress-bar-success");
                $("#progressbar-" + i).removeClass("active");
                step[i] = 1;
              }
              else if (statusId === 3){
                $("#aa-" + i).html("Failed");
                $("#progressbar-" + i).attr("style", "width: 100%");
                $("#progressbar-" + i).removeClass("progress-bar-info");
                $("#progressbar-" + i).addClass("progress-bar-danger");
                $("#progressbar-" + i).removeClass("active");
                step[i] = 1;
                fail = 1;
                for(let j=0; j<len; j++){
                  if(step[j] === 0){
                    $("#aa-" + j).html("Aborted");
                    $("#aa-" + j).attr("style", "color: red");
                  }
                  step[j] = 1;
                }
                //when error occurs, break looop
                break;
              }
          }

          let pass = 0;
          for(let i=0; i<len; i++){
            if(step[i] === 1)
              pass++;
          }
        
          if(pass === len){
            clearInterval(timer);            
            // after finish all, add button to go back to index
            $('#progress-warn-msg').remove();
            if(!fail){
              $(document).ready(function(){
                $(document.getElementsByClassName("config-table")).append(`
                  <div class="alert alert-success center" role="alert">Upgrade successful, please reboot the device.</div>
                  <div class="center"><a href="upgrade.html" class="btn btn-success">Complete</a></div>
                `);
              });
            }
            else {
              $(document).ready(function(){
                $(document.getElementsByClassName("config-table")).append("\
                  <div class='alert alert-danger center' role='alert'>An error occurs when upgrading, please reboot the device, check upgrade patch and try again.</div>\
                  <div class='center'><a href='upgrade.html' class='btn btn-info'>ok</a></div>\
                ");
              });
            }
          }
        }
      });
  }
  // ---
  // setInterval method execute first loop will delay breaker period, to avoid this, call checkLoop for first time
  checkLoop();
  var timer = setInterval(checkLoop, breaker);
}

function init() {
  $('.portOnly').keyup(function () {
    this.value = this.value.replace(/[^0-9]/g,'');
  });
  $('.ipOnly').keyup(function () {
    this.value = this.value.replace(/[^0-9\.]/g,'');
  });

  $('.portOnly').blur(function() {
    if (!this.value || Number.parseInt(this.value) > 65535) {
      $(this).siblings('.glyphicon-ok').css('display', 'none');
      $(this).siblings('.glyphicon-remove').css('display', 'inline-block');
    }
    else {
      $(this).siblings('.glyphicon-remove').css('display', 'none');
      $(this).siblings('.glyphicon-ok').css('display', 'inline-block');
    }
  });

  $('.ipOnly').blur(function() {
    let isLegal = true;
    let splitNums = this.value.split('.');
    if (splitNums.length === 4) {
      for (let num of splitNums) {
        num = Number.parseInt(num);
        if (Number.isNaN(num) || num > 255) {
          isLegal = false;
          break;
        }
      }
    }
    else {
      isLegal = false;
    }

    if (isLegal) {
      $(this).siblings('.glyphicon-remove').css('display', 'none');
      $(this).siblings('.glyphicon-ok').css('display', 'inline-block');
    }
    else {
      $(this).siblings('.glyphicon-ok').css('display', 'none');
      $(this).siblings('.glyphicon-remove').css('display', 'inline-block');
    }
  });

  $('.macAddressOnly').blur(function() {
    let macAddressValiateExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (macAddressValiateExp.test(this.value)) {
      $(this).siblings('.glyphicon-remove').css('display', 'none');
      $(this).siblings('.glyphicon-ok').css('display', 'inline-block');
    }
    else {
      $(this).siblings('.glyphicon-ok').css('display', 'none');
      $(this).siblings('.glyphicon-remove').css('display', 'inline-block');
    }
  });

  $('.angleOnly').blur(function() {
    let value = parseInt(this.value);

    if (value >= 0 && value <= 359) {
      $(this).siblings('.glyphicon-remove').css('display', 'none');
      $(this).siblings('.glyphicon-ok').css('display', 'inline-block');
    }
    else {
      $(this).siblings('.glyphicon-ok').css('display', 'none');
      $(this).siblings('.glyphicon-remove').css('display', 'inline-block');
    }
  });

  let start_angle = 0;
  
  $('.startAngleOnly').blur(function() {
    let value = parseInt(this.value);
    start_angle = value;
    if (value >= 0 && value <= 359) {
      $(this).siblings('.glyphicon-remove').css('display', 'none');
      $(this).siblings('.glyphicon-ok').css('display', 'inline-block');
    }
    else {
      $(this).siblings('.glyphicon-ok').css('display', 'none');
      $(this).siblings('.glyphicon-remove').css('display', 'inline-block');
    }
  });

  $('.endAngleOnly').blur(function() {
    let value = parseInt(this.value);
    
    if (value >= 1 && value <= 360 && value > start_angle) {
      $(this).siblings('.glyphicon-remove').css('display', 'none');
      $(this).siblings('.glyphicon-ok').css('display', 'inline-block');
    }
    else {
      $(this).siblings('.glyphicon-ok').css('display', 'none');
      $(this).siblings('.glyphicon-remove').css('display', 'inline-block');
    }
  })
}

init();
console.log("HELLO!!!");
// var pageStatus = 0;//upgrading
// loadSettingInfo();
console.log(window.location.pathname);

var workMode = 0;//0: normal, 1: upgrading
//// check current work mode
let urlGetWorkMode = '/pandar.cgi?action=get&object=workmode';
  $.ajax({url: urlGetWorkMode})
  .done((data) => {
    console.log("finish!");
    let dataJSON = JSON.parse(data)
    let body = dataJSON['Body'];
    workMode = parseInt(body['WorkMode']);
    console.log(parseInt(body['WorkMode']));
    console.log(workMode);

    console.log("work mode: " + workMode);
    
    if(!workMode){
      if (window.location.pathname === '/' || window.location.pathname === '/index.html'){
        loadStatus();
      }
      else if (window.location.pathname === '/information.html'){
        loadDeviceInfo();
      }
      else if (window.location.pathname === '/setting.html'){
        loadSettingInfo();
      }
      else if (window.location.pathname === '/upgrade.html'){
        $('#progress-table').hide();
        loadUpgradeInfo();
      }
      else if (window.location.pathname === '/factory_setting.html'){
        loadFactoryInfo();
      }
    }
    else{
      if (window.location.pathname === '/upgrade.html'){
        let close = document.getElementById("version-table");
        close.style.display = "none";

        $(document).ready(function(){
                $('#progress-table').after("<div class='alert alert-warning center' id='progress-warn-msg' role='alert'>Upgrading is in progress! Please do not shut down the device!</div>");
            });
        loadUpgradingProgress();
      }
      else{
        console.log("upgrading!!")
        let tempDoms = document.getElementsByClassName("config-table");
        itemlists = tempDoms.item(0).children;
        let len = itemlists.length;
        console.log("length in config table: " + len);
        for(let i=0;i<len;i++){
          itemlists.item(i).style.display = "none";
        }

        $(document).ready(function(){
                $(itemlists.item(len - 1)).after("\
                  <div class='jumbotron center'>\
                  <h1>Upgrading</h1>\
                  <p>Upgrading is in progress, please wait!</p>\
                  <p><a class='btn btn-primary btn-lg' href='upgrade.html' role='button'>Check Upgrading Status</a></p>\
                  </div>\
                ");
            });
      }
    }
  });
////

