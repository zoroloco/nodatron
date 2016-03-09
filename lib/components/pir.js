var pathUtil      = require('path'),
    util          = require("util"),
    ComponentBase = require(pathUtil.join(__dirname,'./componentBase.js')),
    log           = require(pathUtil.join(__dirname,'../logger.js'));

module.exports = Pir;

function Pir(pin,arduino){
	var self         = this;
  this._motionDetected = false;

	Pir.super_.call(this);//call Svc constructor

  this.setPin(pin);
  this.setSerialConnection(arduino);

  log.info("Created Pir component with pin "+this._pin);

  Pir.prototype.processMessage = function(msg){
    if(!_isEmpty(msg) && _.isNumber(msg)){
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
