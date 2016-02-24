var pathUtil = require('path'),
	  utils    = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = ComponentBase;

function ComponentBase(){
	var self               = this;
  this._serialConnection = '';

	if(this instanceof ComponentBase === false){
		throw new TypeError("Classes can't be function-called.");
	}

	ComponentBase.prototype.setSerialConnection = function(setSerialConnection){
    self._serialConnection = setSerialConnection;
	}

	ComponentBase.prototype.sendCommand = function(cmd){
		self._serialConnection(cmd+'\r\n');
	}
}//constructor
