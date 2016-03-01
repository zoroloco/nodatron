#!/bin/bash

#move this file to /usr/local/src

if pgrep mjpg_streamer > /dev/null
then
  echo "mjpg_streamer already running"
else
  LD_LIBRARY_PATH=/opt/mjpg-streamer/ /opt/mjpg-streamer/mjpg_streamer -i "input_raspicam.so -fps 15 -q 50 -x 640 -y 480" -o "output_http.so -p 8171 -w /opt/mjpg-streamer/www" > /dev/null 2>&1&
  echo "mjpg_streamer started"
fi
