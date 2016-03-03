var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Led;

function Led(pin,serialConnection){
	var self         = this;
  this._pin        = pin;
  this._on         = false;
  this._isBlinking = false;
  this._blinker    = null;

	Led.super_.call(this);//call Svc constructor

  this.setSerialConnection(serialConnection);

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
    if(!utils.isEmpty(this._blinker)){
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
