var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Pir;

function Pir(pin,arduino){
	var self         = this;
  this._motionDetected = false;

	Pir.super_.call(this);//call Svc constructor

  this.setPin(pin);
  this.setSerialConnection(arduino);
}//constructor

util.inherits(Pir,ComponentBase);
