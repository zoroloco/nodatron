Installation instructions for Nodatron.

apt-get update
apt-get upgrade
apt-get nodejs


install npm
install python 2

cd /usr/local/src

npm install nodatron

cd node_modules/nodatron

chmod +x nodatron.sh

Copy the start up script located in the dir: rpi/etc/init.d/nodatron.sh to /etc/init.d

chmod +x /etc/init.d/nodatron.sh

sudo update-rc.d nodatron.sh defaults (will add this to startup script)

mkdir /var/log/nodatron

#now set time for an accurate log file time stamp.
sudo raspi-config
2. Internationalization options
3. Change Time Zone
4. Select geographical area
5. Select city or region.
6. Reboot your pi.

now run with:  /etc/init.d/nodatron.sh start
stop    with:  /etc/init.d/nodatron.sh stop
