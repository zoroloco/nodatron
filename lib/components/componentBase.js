var pathUtil = require('path'),
    util     = require("util"),
    events   = require('events');

module.exports = ComponentBase;

function ComponentBase(){
	events.EventEmitter.call(this);

	var self               = this;
  this._serialConnection = '';

	if(this instanceof ComponentBase === false){
		throw new TypeError("Classes can't be function-called.");
	}

	ComponentBase.prototype.setSerialConnection = function(setSerialConnection){
    self._serialConnection = setSerialConnection;
	}

	ComponentBase.prototype.sendCommand = function(cmd){
		self._serialConnection.sendCommand(cmd+'\r\n');
	}

	ComponentBase.prototype.processMessage = function(msg){
    
	}
}//constructor

util.inherits(ComponentBase, events.EventEmitter);
