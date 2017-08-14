var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js'));

module.exports = EmicToSpeech;

function EmicToSpeech(pin,arduino){
	var self         = this;
  this._pin        = pin;

	EmicToSpeech.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  EmicToSpeech.prototype.speak = function(msg){
    if(!_.isEmpty(msg) && msg.length<1023){
      self.sendCommand(this._pin+":"+msg);
    }
    else{
      //invalid message for emic to speech module.
    }
 	}

}//constructor

util.inherits(EmicToSpeech,ComponentBase);
