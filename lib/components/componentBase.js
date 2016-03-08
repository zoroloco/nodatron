var pathUtil = require('path'),
	  utils    = require(pathUtil.join(__dirname,'../commonutils.js')),
		log      = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = ComponentBase;

function ComponentBase(){
	var self               = this;
  this._serialConnection = '';
	this._name             = '';

	if(this instanceof ComponentBase === false){
		throw new TypeError("Classes can't be function-called.");
	}

	ComponentBase.prototype.setName = function(name){
		this._name = name;
	}

	ComponentBase.prototype.setSerialConnection = function(setSerialConnection){
    self._serialConnection = setSerialConnection;
	}

	ComponentBase.prototype.sendCommand = function(cmd){
		self._serialConnection.sendCommand(cmd+'\r\n');
	}
}//constructor
