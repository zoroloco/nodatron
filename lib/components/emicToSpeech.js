var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = EmicToSpeech;

function EmicToSpeech(pin,arduino){
	var self         = this;
  this._pin        = pin;

	EmicToSpeech.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  log.info("Created EmicToSpeech component with pin "+this._pin);

  EmicToSpeech.prototype.speak = function(msg){
    if(!_.isEmpty(msg) && msg.length<1023){
      log.info("EmicToSpeech module with pin:"+this._pin+" will speak:"+msg);
      self.sendCommand(this._pin+":"+msg);
    }
    else{
      log.warn("Invalid message for emic to speech module:"+msg);
    }
 	}

}//constructor

util.inherits(EmicToSpeech,ComponentBase);
