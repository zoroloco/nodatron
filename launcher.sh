#!/bin/sh
# launcher.sh
#
# chmod 755 launcher.sh
#
# http://www.instructables.com/id/Raspberry-Pi-Launch-Python-script-on-startup/
#
#
# crontab -e
# now enter the following line in the crontab.
# @reboot sh /usr/local/src/node_modules/nodatron/launcher.sh 
#
#

sudo node /usr/local/src/node_modules/nodatron/test/test.js
