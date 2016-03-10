var pathUtil      = require('path'),
    util          = require("util"),
    _             = require("underscore"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Pir;

function Pir(pin,arduino){
	var self             = this;
  this._pin            = pin;

	Pir.super_.call(this);//call Svc constructor

  this.setSerialConnection(arduino);

  log.info("Created Pir component with pin "+this._pin);

  Pir.prototype.processMessage = function(msg){
    if(!_.isEmpty(msg) && _.isNumber(msg)){
      if(msg == 0){
        log.info("PIR sensor with pin:"+this._pin+" detected motion stop.");
        this.emit("stop");
      }
      else if(msg == 1){
        log.info("PIR sensor with pin:"+this._pin+" detected motion start.");
        this.emit("start");
      }
    }
  }
}//constructor

util.inherits(Pir,ComponentBase);
