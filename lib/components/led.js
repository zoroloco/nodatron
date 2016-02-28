var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Led;

function Led(pin,serialConnection){
	var self         = this;
  this._pin        = pin;
  this._on         = false;

	Led.super_.call(this);//call Svc constructor

  this.setSerialConnection(serialConnection);

  Led.prototype.turnOn = function(){
    self.sendCommand(this._pin+":1");
 	}

  Led.prototype.turnOff = function(){
    self.sendCommand(this._pin+":0");
  }

  Led.prototype.blink = function(numberOfBlinks){
    if(numberOfBlinks>1){
      self._turnOff();
      self._turnOn();

      setInterval(function(){
        numberOfBlinks--;

        if(numberOfBlinks <= 0){
          clearInterval(this);
          self._turnOff();
        }
      },1000);
    }
  }

}//constructor

util.inherits(Led,ComponentBase);
