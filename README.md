# nodatron

Node JS -> Python -> Arduino robot

#INSTALL

npm install nodatron

#RUN

node node_modules/nodatron/test/test

Please see sample config file in test dir.

The test script will launch nodatron.js which is the manager of 2 node js child processes.  The
child processes and their configurable values are defined in conf.json.

If any of the child processes die, then nodatron will wait 10 seconds and try to restart it.
nodatron will also accept sigint (ctrl-c) interrupt and then forward the interrupt to the child processes.

Nodatron will handle incoming messages from the TcpSvc and forward them to the RobotSvc for processing down the
serial port.

#RobotSvc

This process will create an arduino object and establish a serial connection.  If the connection fails or is lost, then
this robotSvc will exit and then nodatron will try to restart it after 10 seconds.  

This service also accepts command line input that is triggered with the enter key.  This input will be fed to the connected serial device.

Implements process.on('message') so it can recieve messages from the Nodatron parent process.

#TcpSvc

Will listen at a specified port and host configured in conf.json.  If this process dies, then Nodatron will wait 10 seconds and try to restart it.  

Any incoming messages on the socket will be forwarded to Nodatron.
