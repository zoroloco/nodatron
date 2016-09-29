/**
 * This test just tests the connection to the connected Arduino device.
 *
 * For specific implementations, please take a look at the sample folder.
*/

var nodatron = require('../../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  console.log("Successfully connected to device.");
});
