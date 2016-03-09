var nodatron = require('../lib/nodatron.js'),
    cp       = require('child_process');

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

    executeCommand("/usr/local/src/startStream.sh",function(result,msg){
      if(result){
        console.info(msg);
      }
      else{
        console.error(msg);
      }
    });
  });

  powerButton.on('off',function(){
    powerLed.turnOff();
    motionLed.turnOff();
    connectivityLed.turnOff();
    activityLed.turnOff();
    sleepCam();

    executeCommand("/usr/local/src/stopStream.sh",function(result,msg){
      if(result){
        console.info(msg);
      }
      else{
        console.error(msg);
      }
    });
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
    camServo.move(0);
  }

  //move camera to a rest position.
  function sleepCam(){
    baseServo.move(110);
    camServo.move(0);
  }

  function executeCommand(cmd,cb){
  	var child = cp.exec(cmd ,function(error,stdout,stderr){
  		if (stderr){
  			cb(false,"Error executing command "+cmd+" with stderr:"+stderr);
  		}
  		if (error) {
  			cb(false,"Error executing command "+cmd+" with error:"+error);
  		}
  		if(stdout){
  			cb(true,cmd+" successfully executed with no errors.",stdout);
  		}
  	});
  }

});
