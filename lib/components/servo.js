var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Servo;

function Servo(pin,arduino){
	var self         = this;
  this._angle      = 0;
  this._speed      = 1;
  this._pin        = pin;

	Servo.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  log.info("Created servo component with pin "+this._pin);

  Servo.prototype.move = function(angle){
    log.info("Moving servo at pin:"+this._pin+" to:"+angle);
    self.sendCommand(this._pin+":"+angle);
  }

  Servo.prototype.center = function(){
    log.info("Moving servo at pin:"+this._pin+" to center position.");
    self.sendCommand(this._pin+":"+90)
  }
}//constructor

util.inherits(Servo,ComponentBase);
