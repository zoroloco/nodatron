/**
 * This is a sample use of the Nodatron module.  It will create a connection
 * to the Arduino and then read the value of a motion sensor on pin 7.
*/

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
