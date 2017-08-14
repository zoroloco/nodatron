var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js'));

module.exports = Servo;

function Servo(pin,arduino){
	var self         = this;
  this._angle      = 0;
  this._speed      = 1;
  this._pin        = pin;

	Servo.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  Servo.prototype.move = function(angle){
    self.sendCommand(this._pin+":"+angle);
  }

  Servo.prototype.center = function(){
    self.sendCommand(this._pin+":"+90)
  }
}//constructor

util.inherits(Servo,ComponentBase);
