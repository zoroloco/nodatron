var nodatron = require('../lib/nodatron.js');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var powerLed          = arduino.createLed(2);
  var activityLed       = arduino.createLed(3);
  var motionLed         = arduino.createLed(4);
  var connectivityLed   = arduino.createLed(5);
  var powerButton       = arduino.createButton(6);
  var motionSensorFront = arduino.createPir(7);
  var motionSensorLeft  = arduino.createPir(8);
  var motionSensorRight = arduino.createPir(11);
  var baseServo         = arduino.createServo(9);
  var camServo          = arduino.createServo(10);

  powerButton.on('on',function(){
    powerLed.turnOn();
  });

  powerButton.on('off',function(){
    powerLed.turnOff();
  });

  motionSensorFront.on('start',function(){

  });

  motionSensorFront.on('stop',function(){

  });

  motionSensorLeft.on('start',function(){

  });

  motionSensorLeft.on('stop',function(){

  });

  motionSensorRight.on('start',function(){

  });

  motionSensorRight.on('stop',function(){

  });
});
