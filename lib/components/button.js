var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = Button;

function Button(pin,serialConnection){
	var self         = this;
  this._pin        = pin;
  this._on         = false;

  Button.super_.call(this);//call Svc constructor

  this.setSerialConnection(serialConnection);

  Button.prototype.isOn = function(){
    return self._on;
  }

  Button.prototype.setState = function(state){
    self._on = state;
  }
}//constructor

util.inherits(Button,ComponentBase);
