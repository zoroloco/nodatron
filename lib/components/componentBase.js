var pathUtil = require('path'),
    util     = require("util"),
    events   = require('events'),
		log      = require(pathUtil.join(__dirname,'../logger.js'));

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
    log.info("Component sending to serial connection:"+cmd);
		self._serialConnection.sendCommand(cmd+'\r\n');
	}

	ComponentBase.prototype.processMessage = function(msg){
		log.info("ComponentBase eating up message:"+msg);
	}
}//constructor

util.inherits(ComponentBase, events.EventEmitter);
