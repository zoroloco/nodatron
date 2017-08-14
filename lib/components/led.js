var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js'));

module.exports = Led;

function Led(pin,arduino){
	var self         = this;
  this._on         = false;
  this._isBlinking = false;
  this._blinker    = null;
  this._pin        = pin;

	Led.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  Led.prototype.turnOn = function(){
    self.sendCommand(this._pin+":1");
    this._on = true;
 	}

  Led.prototype.turnOff = function(){
    self.sendCommand(this._pin+":0");
    this.stopBlink();
    this._on = false;
  }

  Led.prototype.stopBlink = function(){
    if(!_.isEmpty(this._blinker)){
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
