/**
 * This is a sample use of the Nodatron module.  It will sweep a servo back
 * and forth from 0 to 180 degrees.
 *
 * Note: The call to servo.move() is non-blocking.
*/

var nodatron = require('../../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var servo         = arduino.createServo(9);

  var resetFlag = false;

  setInterval(function(){
    if(!resetFlag){
      servo.move(180);
      resetFlag = true;
    }
    else{
      servo.move(0);
    }
  },10000);

});
