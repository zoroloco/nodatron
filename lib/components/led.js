var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Led;

function Led(pin,arduino){
	var self         = this;
  this._on         = false;
  this._isBlinking = false;
  this._blinker    = null;

	Led.super_.call(this);//call Svc constructor

  this.setPin(pin);
  this.setSerialConnection(arduino);

  log.info("Created LED component with pin "+this._pin);

  Led.prototype.turnOn = function(){
    log.info("Led with pin:"+this._pin+" set to on.");
    self.sendCommand(this._pin+":1");
    this._on = true;
 	}

  Led.prototype.turnOff = function(){
    log.info("Led with pin:"+this._pin+" set to off.");
    self.sendCommand(this._pin+":0");
    this.stopBlink();
    this._on = false;
  }

  Led.prototype.stopBlink = function(){
    if(!_.isEmpty(this._blinker)){
      log.info("Stopping blink.");
      clearInterval(this._blinker);
    }
  }

  Led.prototype.toggleLed = function(){
    if(this._on){
      this.turnOff();
    }
    else{
      this.turnOn();
    }
  }

  Led.prototype.startBlink = function(){
    var that = this;

    this.stopBlink();

    this._blinker = setInterval(
      function(){
        that.toggleLed();//TODO:
      },500);//500 ms.
  }

}//constructor

util.inherits(Led,ComponentBase);
