var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./ComponentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Servo;

function Servo(pin){
	var self         = this;
  this._pin        = pin;
  this._angle      = 0;
  this._speed      = 1;

	Servo.super_.call(this);//call Svc constructor
}//constructor

util.inherits(Servo,ComponentBase);
