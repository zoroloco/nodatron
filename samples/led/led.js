/**
 * This is a sample use of the Nodatron module.  It will create a connection
 * to the Arduino and then blink an LED on pin 2.
*/

var nodatron = require('../../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var led          = arduino.createLed(2);

  led.startBlink();
});
