var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Servo;

function Servo(pin,serialConnection){
	var self         = this;
  this._pin        = pin;
  this._angle      = 0;
  this._speed      = 1;

	Servo.super_.call(this);//call Svc constructor

  this.setSerialConnection(serialConnection);

  Servo.prototype.move = function(angle){
    self.sendCommand(self._pin+":"+angle);
  }
}//constructor

util.inherits(Servo,ComponentBase);
