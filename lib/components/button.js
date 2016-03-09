var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Button;

function Button(pin,arduino){
	var self         = this;
  this._on         = false;

  this.setPin(pin);
  this.setSerialConnection(arduino);

  Button.super_.call(this);//call Svc constructor
  log.info("Created button component with pin "+this._pin);

  Button.prototype.isOn = function(){
    return this._on;
  }

  Button.prototype.processMessage = function(msg){
    if(!_isEmpty(msg) && _.isNumber(msg)){
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
