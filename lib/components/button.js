var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
	  utils         = require(pathUtil.join(__dirname,'../commonutils.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Button;

function Button(pin,arduino){
	var self         = this;
  this._on         = false;

  this.setPin(pin);
  this.setSerialConnection(arduino);

  Button.super_.call(this);//call Svc constructor

  Button.prototype.isOn = function(){
    return this._on;
  }

  Button.prototype.setState = function(state){
    this._on = state;
  }
}//constructor

util.inherits(Button,ComponentBase);
