var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./ComponentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Led;

function Led(pin){
	var self         = this;
  this._pin        = pin;
  this._on         = false;

	Led.super_.call(this);//call Svc constructor

  Led.prototype.turnOn = function(){
    self.sendCommand(self._pin+"1");
 	}

  Led.prototype.turnOff = function(){
    self.sendCommand(self._pin+"0");
  }

}//constructor

util.inherits(Led,ComponentBase);
