# nodatron

Node JS -> Python -> Arduino robot

#INSTALL

npm install nodatron

#RUN

node node_modules/nodatron/test/test.js

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

Implements process.on('message') so it can recieve messages from the Nodatron parent process. This is how the robotSvc will get commands from the TcpSvc.

This class also has a dataHandler which is an eventEmitter.  Any data that comes in from the serial connection will come in 4 byte chunks. This raw data is fed to the dataHandler which emits an 'inputData' event once a full message from the Arduino is received. 

Once a full message from the Arduino is received, this message is fed to another class called the robotController.  This class has a component object for each component setup on the Arduino.

Note: *******The config file's component pins should match up to your INO file pin setup********

The robotController holds all the internal robot logic.  For example, if the arduino sent a message that the front sensor was triggered, then the servos are moved to the front position.  Also, if a person hits the button on the robot, then the servos will go to a rest position and the video streaming will be turned off, etc...

#TcpSvc

Will listen at a specified port and host configured in conf.json.  If this process dies, then Nodatron will wait 10 seconds and try to restart it.  

Any incoming messages on the socket will be forwarded to Nodatron.

The config file also defines a unique key that the connected client must also send in the message.  Without this key, then the command will be ignored.
