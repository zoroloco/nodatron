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

  //Arduino sent some data
  RobotController.prototype.processInput = function(data){
    //sample data would be:  pirSensor:1 which means the motion sensor detected movement.
    self._log.info("Processing message from Arduino:"+data);

    var splitData = data.split(":");
    if(!utils.isEmpty(splitData[0])){
        //Sensor sent some data
        if(splitData[0] == 'pirSensorFront'){
          if(splitData[1] == "1"){//if sensor movement started
            self._componentArray['motionLed'].turnOn();
            //move camera to face this sensor.
            self._componentArray['baseServo'].move(100);//move to center
            self._componentArray['camServo'].move(100);//move to center
          }
          else if(splitData[1] == "0"){//if sensor movement ended
            self._componentArray['motionLed'].turnOff();
          }
        }
        //Button sent some data
        else if(splitData[0] == 'streamButton'){
          if(splitData[1] == "1"){//if button was turned on
            self._componentArray['streamButton'].setState(true);//should I be replicating state again? Could get out of sync.
            self._componentArray['baseServo'].move(100);//move to center
            self._componentArray['camServo'].move(100);//move to center
          }
          else if(splitData[1] == "0"){//if button was turned off
            self._componentArray['streamButton'].setState(false);
            self._componentArray['baseServo'].move(100);//move to center
            self._componentArray['camServo'].move(180);//go to sleep!
            self._componentArray['motionLed'].turnOff();
          }
        }
     }
  }

  //Some command came from an outside source.
  RobotController.prototype.processCommand = function(data){
    self._log.info("Processing command:"+data);
    //self._serialConnection.sendCommand(arduinoMessage+'\r\n');//forward tcp
    //self._serialConnection.sendCommand(cmd+"\n");//forward local
  }
}//constructor
