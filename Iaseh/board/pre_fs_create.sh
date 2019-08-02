#!/bin/sh

# Fix for pandar_control binary 
cd $1/usr/lib
ln -sf libpcre.so.1.2.10 libpcre.so.0
cd ../..

