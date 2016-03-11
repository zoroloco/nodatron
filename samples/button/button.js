/**
 * This is a sample use of the Nodatron module.  It will create a connection
 * to the Arduino and then read the state of a button on pin 6.
*/

var nodatron = require('../../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){

  var button = arduino.createButton(6);

  button.on('on',function(){
    console.log("button toggled to on.");
  });

  button.on('off',function(){
    console.log("button toggled to off.");
  });

});
