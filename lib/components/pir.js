var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js'));

module.exports = Pir;

function Pir(pin,arduino){
	var self             = this;
  this._pin            = pin;

	Pir.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  Pir.prototype.processMessage = function(msg){
    if(!_.isEmpty(msg)){
      if(msg == 0){
        this.emit("stop");
      }
      else if(msg == 1){
        this.emit("start");
      }
    }
  }
}//constructor

util.inherits(Pir,ComponentBase);
