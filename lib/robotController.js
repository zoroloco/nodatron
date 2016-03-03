var pathUtil = require('path'),
    async    = require('async'),
    Logger   = require(pathUtil.join(__dirname,'./logger.js')),
	  utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
    button   = require(pathUtil.join(__dirname,'./components/button.js')),
    led      = require(pathUtil.join(__dirname,'./components/led.js')),
    pir      = require(pathUtil.join(__dirname,'./components/pir.js')),
    servo    = require(pathUtil.join(__dirname,'./components/servo.js'));

module.exports = RobotController;

function RobotController(serialConnection,components){

	var self             = this;
  this._log            = new Logger("robotController");
  this._componentArray = new Array();

  if(this instanceof RobotController === false){
		throw new TypeError("Classes can't be function-called.");
	}

  //component object factory
  var comps = JSON.parse(components);
  if(!utils.isEmpty(comps) && comps.length>0){
    for(i = 0; i < comps.length; i++){
      var comp = comps[i];
      this._log.info("Initializing component:"+comp.name+" of type:"+comp.type+" using pin:"+comp.pin);

      if(comp.type == 'servo'){
        this._componentArray[comp.name] = new servo(comp.pin,serialConnection);
      }
      else if(comp.type == 'pir'){
        this._componentArray[comp.name] = new pir(comp.pin,serialConnection);
      }
      else if(comp.type == 'led'){
        this._componentArray[comp.name] = new led(comp.pin,serialConnection);
      }
      else if(comp.type == 'button'){
        this._componentArray[comp.name] = new button(comp.pin,serialConnection);
      }
    }
  }
  else{
    this._log.warn("No Arduino components defined. Please check your config file.");
  }

  //Arduino sent some data. Lets perform some action based on what Arduino just did.
  //This method represents the "muscle memory" of the robot.
  RobotController.prototype.processInput = function(data){
    //sample data would be:  pirSensor:1 which means the motion sensor detected movement.
    self._log.info("Processing message from Arduino:"+data);

    var splitData = data.split(":");
    if(!utils.isEmpty(splitData[0])){

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
          self._log.info("Ignoring event "+data+" from Arduino because Nodatron is off.");
        }//off
      }
     }
  }

  //Some command came from an outside source.
  RobotController.prototype.processRemoteCommand = function(data){
    self._log.info("Processing remote command:"+data);
    self._serialConnection.sendCommand(data+'\r\n');
  }

  RobotController.prototype.powerUp = function(){
    self._log.info("POWER ON");
    self._componentArray['powerButton'].setState(true);
    self._componentArray['powerLed'].turnOn();
    self._componentArray['baseServo'].move(110);//move to center
    self._componentArray['camServo'].move(85);//move to center

    utils.executeCommand("/usr/local/src/startStream.sh",function(result,msg){
      if(result){
        self._log.info(msg);
      }
      else{
        self._log.error(msg);
      }
    });
  }

  RobotController.prototype.powerDown = function(){
    self._log.info("POWER OFF");
    self._componentArray['powerButton'].setState(false);
    self._componentArray['baseServo'].move(110);//move to center
    self._componentArray['camServo'].move(0);//go to sleep!

    self._componentArray['motionLed'].turnOff();
    self._componentArray['powerLed'].turnOff();
    self._componentArray['tcpLed'].turnOff();
    self._componentArray['activityLed'].turnOff();

    utils.executeCommand("/usr/local/src/stopStream.sh",function(result,msg){
      if(result){
        self._log.info(msg);
      }
      else{
        self._log.error(msg);
      }
    });
  }
}//constructor
