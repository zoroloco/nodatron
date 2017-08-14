/**
 * This is a sample use of the Nodatron module.  It will create a connection
 * to the Arduino and then define some LEDs , a button , 3 sensors and 2 servos.
 * If the button is turned on, then sensors will be turned on along the activity led.
 * If a sensor goes off, then the motion LED blinks until the sensor indicates motion stopped.
 * Servos are moved to face the correct sensor that was triggered.
 * If button turned off, then sensors disabled and LEDs turned off and servos go to a rest
 * position.
*/

var nodatron = require('nodatron');

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
    panCenter();
  });

  powerButton.on('off',function(){
    powerLed.turnOff();
    motionLed.turnOff();
    connectivityLed.turnOff();
    activityLed.turnOff();
    sleepCam();
  });

  motionSensorFront.on('start',function(){
    if(powerButton.isOn()){
      motionLed.startBlink();
      panCenter();
    }
  });

  motionSensorFront.on('stop',function(){
    motionLed.stopBlink();
  });

  motionSensorLeft.on('start',function(){
    if(powerButton.isOn()){
      motionLed.startBlink();
      panLeft();
    }
  });

  motionSensorLeft.on('stop',function(){
    motionLed.stopBlink();
  });

  motionSensorRight.on('start',function(){
    if(powerButton.isOn()){
      motionLed.startBlink();
      panRight();
    }
  });

  motionSensorRight.on('stop',function(){
    motionLed.stopBlink();
  });

  function panLeft(){
    baseServo.move(180);
    camServo.move(85);
  }

  function panRight(){
    baseServo.move(33);
    camServo.move(85);
  }

  function panCenter(){
    baseServo.move(110);
    camServo.move(85);
  }

  //move camera to a rest position.
  function sleepCam(){
    baseServo.move(110);
    camServo.move(0);
  }
});
