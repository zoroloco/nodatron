var pathUtil = require('path'),
    util     = require("util"),
    events   = require('events'),
		log      = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = ComponentBase;

function ComponentBase(){
	events.EventEmitter.call(this);

	var self               = this;
  this._serialConnection = '';
	this._pin              = '';

	if(this instanceof ComponentBase === false){
		throw new TypeError("Classes can't be function-called.");
	}

	ComponentBase.prototype.setPin = function(pin){
		this._pin = pin;
	}

	ComponentBase.prototype.getPin = function(){
		return this._pin;
	}

	ComponentBase.prototype.setSerialConnection = function(setSerialConnection){
    self._serialConnection = setSerialConnection;
	}

	ComponentBase.prototype.sendCommand = function(cmd){
		self._serialConnection.sendCommand(cmd+'\r\n');
	}

	ComponentBase.prototype.processMessage = function(msg){
		log.info("ComponentBase eating up message:"+msg);
	}
}//constructor

util.inherits(ComponentBase, events.EventEmitter);
