"use strict"

var pathUtil = require('path'),
    _        = require('underscore'),
    util     = require("util"),
    events   = require('events'),
    arduino  = require(pathUtil.join(__dirname,'./serialConnection.js')),
    button   = require(pathUtil.join(__dirname,'./components/button.js')),
    led      = require(pathUtil.join(__dirname,'./components/led.js')),
    pir      = require(pathUtil.join(__dirname,'./components/pir.js')),
    servo    = require(pathUtil.join(__dirname,'./components/servo.js')),
    log      = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "nodatron";

module.exports = Nodatron;

function Nodatron(properties){
  var self = this;
  events.EventEmitter.call(this);
  this._serialConnection = null;
  this._components       = new Array();

	if(this instanceof Nodatron === false){
		throw new TypeError("Classes can't be function-called.");
	}

  this._serialConnection = new arduino(properties.device,properties.baud);
  this._serialConnection.connect(
    //callback for data coming in from serial port.
    function(data){
      var splitData = data.split(":");
      if(!_.isEmpty(splitData[0])){

        if(splitData[0] == 'SERIALPY'){
          self.emit("connected");
        }
        else{
          if(!_.isEmpty(this._components) && this._components.length>0){
            //tell component an event came in for them so they can emit it back.
            var c = _.find(this._components,function(curComponent){
              return curComponent.getPin() == splitData[0];
            });
            if(_.isEmpty(c)){
              c.processMessage(splitdata[1]);
            }
          }
        }
      }
  },
   function(msg){
    log.info(msg);
    self.emit("serialLostConnection",err);
   }
 );//connect

  //define handlers for this main process.
  process.on('SIGTERM', function() {//called from /etc/init.d/nodatron.sh from kill pid
    log.info("Got kill signal. Exiting.");
    self.shutdown();
  });

  process.on('SIGINT', function() {
    log.warn("Caught interrupt signal(Ctrl-C)");
    self.shutdown();
  });

  process.on('exit', function(){
    log.info("Nodatron exiting...");
  })

  process.on('uncaughtException', function (err) {
    var msg="Uncaught Exception ";
    if( err.name === 'AssertionError' ) {
      msg += err.message;
    } else {
      msg += err;
    }
    log.error(msg);
  });

  Nodatron.prototype.enableFileLogging = function(logDir){
    log.enableFileLogging(logDir);
  }

  Nodatron.prototype.createLed = function(pin){
    this._components[pin] = new led(pin,this._serialConnection);
    return this._components[pin];
  }

  Nodatron.prototype.createButton = function(pin){
    this._components[pin] = new button(pin,this._serialConnection);
    return this._components[pin];
  }

  Nodatron.prototype.createPir = function(pin){
    this._components[pin] = new pir(pin,this._serialConnection);
    return this._components[pin];
  }

  Nodatron.prototype.createServo = function(pin){
    this._components[pin] = new servo(pin,this._serialConnection);
    return this._components[pin];
  }

  Nodatron.prototype.shutdown = function(){
    log.info("Starting clean shutdown of Nodatron.");
    if(!_.isEmpty(this._serialConnection)){
      this._serialConnection.shutdown();
    }
  }

}//constructor

util.inherits(Nodatron, events.EventEmitter);
