var pathUtil = require('path'),
    async    = require('async'),
    _        = require('underscore'),
    log      = require(pathUtil.join(__dirname,'./logger.js')),
	  utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
    button   = require(pathUtil.join(__dirname,'./components/button.js')),
    led      = require(pathUtil.join(__dirname,'./components/led.js')),
    pir      = require(pathUtil.join(__dirname,'./components/pir.js')),
    servo    = require(pathUtil.join(__dirname,'./components/servo.js'));

module.exports = RobotController;

function RobotController(serialConnection,components){

	var self               = this;
  this._componentArray   = new Array();
  this._serialConnection = serialConnection;

  if(this instanceof RobotController === false){
		throw new TypeError("Classes can't be function-called.");
	}

  //component object factory
  var comps = JSON.parse(components);
  if(!_.isEmpty(comps) && comps.length>0){
    for(i = 0; i < comps.length; i++){
      var comp = comps[i];
      log.info("Initializing component:"+comp.name+" of type:"+comp.type+" using pin:"+comp.pin);

      if(comp.type == 'servo'){
        this._componentArray[comp.name] = new servo(comp.pin,comp.name,this._serialConnection);
      }
      else if(comp.type == 'pir'){
        this._componentArray[comp.name] = new pir(comp.pin,comp.name,this._serialConnection);
      }
      else if(comp.type == 'led'){
        this._componentArray[comp.name] = new led(comp.pin,comp.name,this._serialConnection);
      }
      else if(comp.type == 'button'){
        this._componentArray[comp.name] = new button(comp.pin,comp.name,this._serialConnection);
      }
    }
  }
  else{
    log.warn("No Arduino components defined. Please check your config file.");
  }

  //Arduino sent some data. Lets perform some action based on what Arduino just did.
  //This method represents the "muscle memory" of the robot.
  RobotController.prototype.processInput = function(data){
    //sample data would be:  pirSensor:1 which means the motion sensor detected movement.
    log.info("Processing message from Arduino:"+data);

    var splitData = data.split(":");
    if(!_.isEmpty(splitData[0])){

      //POWER BUTTON
      if(splitData[0] == 'powerButton'){
        if(splitData[1] == "1"){//if button was turned on
          this.powerUp();
        }
        else if(splitData[1] == "0"){//if button was turned off
          self.powerDown();
        }
      }
      else{
        //non-power button event

        if(self._componentArray['powerButton'].isOn()){

          //FRONT SENSOR
          if(splitData[0] == 'pirSensorFront'){
            if(splitData[1] == "1"){//if sensor movement started
              self._componentArray['motionLed'].turnOn();
              self._componentArray['motionLed'].startBlink();
              //move camera to face this sensor.
              self._componentArray['baseServo'].move(100);//move to center
              self._componentArray['camServo'].move(85);//move to center
            }
            else if(splitData[1] == "0"){//if sensor movement ended
              self._componentArray['motionLed'].turnOff();
              self._componentArray['motionLed'].stopBlink();
            }
          }//front sensor
          //LEFT SENSOR
          else if(splitData[0] == 'pirSensorLeft'){
            if(splitData[1] == "1"){
              self._componentArray['motionLed'].turnOn();
              self._componentArray['motionLed'].startBlink();
              //move camera to face this sensor.
              self._componentArray['baseServo'].move(180);//move to center
              self._componentArray['camServo'].move(85);//move to center
            }
            else if(splitData[1] == "0"){
              self._componentArray['motionLed'].turnOff();
              self._componentArray['motionLed'].stopBlink();
            }
          }//left sensor
          //RIGHT SENSOR
          else if(splitData[0] == 'pirSensorRight'){
            if(splitData[1] == "1"){
              self._componentArray['motionLed'].turnOn();
              self._componentArray['motionLed'].startBlink();
              //move camera to face this sensor.
              self._componentArray['baseServo'].move(33);//move to center
              self._componentArray['camServo'].move(85);//move to center
            }
            else if(splitData[1] == "0"){
              self._componentArray['motionLed'].turnOff();
              self._componentArray['motionLed'].stopBlink();
            }
          }//right sensor
        }//on
        else{
          log.info("Ignoring event "+data+" from Arduino because Nodatron is off.");
        }//off
      }
     }
  }

  //Some command came from an outside source.
  RobotController.prototype.processRemoteCommand = function(ipMsg){
    log.info("Processing remote command:"+ipMsg);
    //self._serialConnection.sendCommand(data+'\r\n');
    if(ipMsg.senderTitle == 'tcpSvc'){
      if(ipMsg.status == 'Connected'){
        self._componentArray['tcpLed'].turnOn();
      }
      else{
        self._serialConnection.sendCommand(data+'\r\n');
      }
    }
  }

  RobotController.prototype.processRawCommand = function(data){
    log.info("Processing raw command:"+data);
    self._serialConnection.sendCommand(data+'\r\n');
  }

  RobotController.prototype.powerUp = function(){
    log.info("POWER ON");
    self._componentArray['powerButton'].setState(true);
    self._componentArray['powerLed'].turnOn();
    self._componentArray['baseServo'].move(110);//move to center
    self._componentArray['camServo'].move(85);//move to center

    utils.executeCommand("/usr/local/src/startStream.sh",function(result,msg){
      if(result){
        log.info(msg);
      }
      else{
        log.error(msg);
      }
    });
  }

  RobotController.prototype.powerDown = function(){
    log.info("POWER OFF");
    self._componentArray['powerButton'].setState(false);
    self._componentArray['baseServo'].move(110);//move to center
    self._componentArray['camServo'].move(0);//go to sleep!

    self._componentArray['motionLed'].turnOff();
    self._componentArray['powerLed'].turnOff();
    self._componentArray['tcpLed'].turnOff();
    self._componentArray['activityLed'].turnOff();

    utils.executeCommand("/usr/local/src/stopStream.sh",function(result,msg){
      if(result){
        log.info(msg);
      }
      else{
        log.error(msg);
      }
    });
  }
}//constructor
