var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Pir;

function Pir(pin,name,arduino){
	var self         = this;
  this._pin        = pin;
  this._motionDetected = false;

	Pir.super_.call(this);//call Svc constructor

  this.setName(name);
  this.setSerialConnection(arduino);
}//constructor

util.inherits(Pir,ComponentBase);
