# nodatron

This module will allow you to easily create objects for your
Arduino components, such as LEDs, sensors, buttons and servos.  You can send commands
by easily calling methods on these objects.  These objects will also emit events when
something happens, such as a button being pressed.  

There are many samples.  

Note:  

This module is NOT Johnny-five.  Use Johnny-five for a completely tested framework that supports
many different boards and a lot more components. Each sample here comes with its corresponding sketch.
You will still need to upload a sketch to your Arduino.

This framework has only been tested on an Arduino Uno R3 board.

#INSTALL

npm install nodatron

#RUN

npm test (will test a connection.)

npm button (will print out to the console whenever a button is toggled.)
npm led (will blink an led.)
npm sensor (will print out to the console when a sensor is triggered.)
npm servo (will sweep a servo from 0-180 degrees.)


#LED blink

var nodatron = require('../../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var led          = arduino.createLed(2);

  led.startBlink();
});

#Sensor

var nodatron = require('../../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){

  var motionSensor = arduino.createPir(7);

  motionSensor.on('start',function(){
    console.log("sensor detected some movement! Intruder alert!");
  });

  motionSensor.on('stop',function(){
    console.log("movement has stopped.");
  });

});
