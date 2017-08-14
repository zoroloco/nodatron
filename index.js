/**
 *
 * Wrapper class for components on different control devices.
 *
 *
*/

"use strict"

var pathUtil = require('path'),
    _        = require('underscore'),
    util     = require("util"),
    events   = require('events'),
    arduino  = require(pathUtil.join(__dirname,'./lib/arduinoConnection.js')),
    button   = require(pathUtil.join(__dirname,'./lib/components/button.js')),
    led      = require(pathUtil.join(__dirname,'./lib/components/led.js')),
    pir      = require(pathUtil.join(__dirname,'./lib/components/pir.js')),
    servo    = require(pathUtil.join(__dirname,'./lib/components/servo.js')),
    emic     = require(pathUtil.join(__dirname,'./lib/components/emicToSpeech.js'));

const readline = require('readline');

process.title   = "nodatron";

module.exports = nodatron;

function nodatron(properties){
  var self = this;
  events.EventEmitter.call(this);
  this._serialConnection = null;
  this._components       = new Array();

	if(this instanceof nodatron === false){
		throw new TypeError("Classes can't be function-called.");
	}

  if(properties.device == 'arduino'){
      this._serialConnection = new arduino(properties.devPath,properties.baud);
  }

  this._serialConnection.connect(
    //connected
    function(){
      self.emit("connected");
    },
    //callback for data coming in from serial port.
    function(data){
      var splitData = data.split(":");
        if(!_.isEmpty(splitData[0])){
          if(!_.isEmpty(self._components) && self._components.length>0){
            var c = self._components[splitData[0]];

            if(!_.isEmpty(c)){
              c.processMessage(splitData[1]);
            }
            else{
              console.error("Could not find component with pin:"+splitData[0]);
            }
          }
        }
  },
   function(msg){
    self.emit("serialLostConnection",msg);
   }
 );//connect

  //define handlers for this main process.
  process.on('SIGTERM', function() {//called from /etc/init.d/nodatron.sh from kill pid
    console.info("Got kill signal. Exiting.");
    self.shutdown();
  });

  process.on('SIGINT', function() {
    console.warn("Caught interrupt signal(Ctrl-C)");
    self.shutdown();
  });

  process.on('exit', function(){
    console.info("Nodatron exiting...");
  })

  process.on('uncaughtException', function (err) {
    var msg="Uncaught Exception ";
    if( err.name === 'AssertionError' ) {
      msg += err.message;
    } else {
      msg += err;
    }
    console.error(msg);
    process.exit(1);
  });

  nodatron.prototype.enableConsole = function(){
    var self = this;

    const rl = readline.createInterface({
			input :process.stdin
		});

		rl.on('line', (cmd) => {//on enter key
		  if(!_.isEmpty(self._serialConnection)){
				self._serialConnection.sendCommand(cmd+'\r\n');
		  }
		});
  }

  nodatron.prototype.createLed = function(pin){
    this._components[pin] = new led(pin,this._serialConnection);
    return this._components[pin];
  }

  nodatron.prototype.createButton = function(pin){
    this._components[pin] = new button(pin,this._serialConnection);
    return this._components[pin];
  }

  nodatron.prototype.createPir = function(pin){
    this._components[pin] = new pir(pin,this._serialConnection);
    return this._components[pin];
  }

  nodatron.prototype.createServo = function(pin){
    this._components[pin] = new servo(pin,this._serialConnection);
    return this._components[pin];
  }

  nodatron.prototype.createEmicToSpeech = function(pin){
    this._components[pin] = new emic(pin,this._serialConnection);
    return this._components[pin];
  }

  nodatron.prototype.shutdown = function(){
    console.info("Starting clean shutdown of Nodatron.");
    if(!_.isEmpty(this._serialConnection)){
      this._serialConnection.shutdown();
    }
  }

}//constructor

util.inherits(nodatron, events.EventEmitter);
