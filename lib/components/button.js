var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js'));

module.exports = Button;

function Button(pin,arduino){
	var self         = this;
  this._on         = false;
  this._pin        = pin;

  this.setSerialConnection(arduino);

  Button.super_.call(this);//call Svc constructor

  Button.prototype.isOn = function(){
    return this._on;
  }

  Button.prototype.processMessage = function(msg){
    if(!_.isEmpty(msg)){
      if(msg == 0){
        this._on = false;
        this.emit("off");
      }
      else if(msg == 1){
        this._on = true;
        this.emit("on");
      }
    }
  }
}//constructor

util.inherits(Button,ComponentBase);
