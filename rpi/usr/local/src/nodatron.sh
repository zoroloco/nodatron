#!/bin/sh
# nodatron.sh
#
# chmod +x nodatron.sh
#

#start the video stream
echo "Starting video stream..."
if pgrep mjpg_streamer > /dev/null
then
  echo "mjpg_streamer already running"
else
  LD_LIBRARY_PATH=/opt/mjpg-streamer/ /opt/mjpg-streamer/mjpg_streamer -i "input_raspicam.so -fps 15 -q 50 -x 640 -y 480" -o "output_http.so -p 8171 -w /opt/mjpg-streamer/www -c $
  echo "mjpg_streamer started"
fi

#start nodatron node js
echo "Starting nodatron..."
sudo node /usr/local/src/node_modules/nodatron/test/test.js
