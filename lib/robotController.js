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
        var newServo = new servo(comp.pin);
        newServo.setSerialConnection(serialConnection);
        this._componentArray[comp.name] = newServo;
      }
      else if(comp.type == 'pir'){
        var newPir = new pir(comp.pin);
        newPir.setSerialConnection(serialConnection);
        this._componentArray[comp.name] = newPir;
      }
      else if(comp.type == 'led'){
        var newLed = new led(comp.pin);
        newLed.setSerialConnection(serialConnection);
        this._componentArray[comp.name] = newLed;
      }
      else if(comp.type == 'button'){
        var newButton = new button(comp.pin);
        newButton.setSerialConnection(serialConnection);
        this._componentArray[comp.name] = newButton;
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
        if(splitData[0] == 'pirSensor'){
          if(splitData[1] == "1"){//if sensor movement
            self._componentArray['motionLed'].turnOn();
          }
          else if(splitData[1] == "0"){//if sensor movement ended
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
