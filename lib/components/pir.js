var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Pir;

function Pir(pin,serialConnection){
	var self         = this;
  this._pin        = pin;
  this._motionDetected = false;

	Pir.super_.call(this);//call Svc constructor

  this.setSerialConnection(serialConnection);
}//constructor

util.inherits(Pir,ComponentBase);
