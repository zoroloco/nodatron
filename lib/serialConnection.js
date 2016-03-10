var cp          = require('child_process'),
    pathUtil    = require('path'),
    _           = require('underscore'),
    util        = require("util"),
    events      = require('events'),
    dataHandler = require(pathUtil.join(__dirname,'./dataHandler.js')),
    log         = require(pathUtil.join(__dirname,'./logger.js'));

function Arduino(device,baud){
  events.EventEmitter.call(this);

	var self                 = this;
  this._serialInConnected  = false;
  this._serialOutConnected = false;
	this._cmd                = pathUtil.join(__dirname,"serialpy.py");
  this._dataHandler        = new dataHandler();
	this._arduino            = null;

	Arduino.prototype.shutdown = function(){
		log.warn("Shutting down arduino serial connection.");
		if(!_.isEmpty(self._arduino)){
		    process.kill(self._arduino.pid);//clean-up python serial connection
		}
	}

	Arduino.prototype.connect = function(onReceiveData,onDisconnected){

		log.info("Spawning arduino serial connection script: "+self._cmd);

		this._arduino = cp.spawn('python',
		                       [self._cmd,
							   "--device",device,"--baud",baud]);

    this._arduino.stdin.setEncoding('utf-8');

		//data came in from Arduino
		this._arduino.stdout.on('data', (data) => {
			this._dataHandler.processRawData(data);
		});

		this._arduino.stderr.on('data', (data) => {
	      onDisconnected("stderr on serial connection:"+data);
		});

		this._arduino.on('error', (err) => {
			  onDisconnected("error on serial connection:"+err);
		});

		this._arduino.on('close', (code) => {
        onDisconnected("Serial connection closed.");
		});

		this._arduino.on('exit', (code) => {
			onDisconnected("Serial connection exited.");
		});

    this._dataHandler.on('inputData',function(data){
      if(!this._serialInConnected && !this._serialOutConnected){
        var splitData = data.split(":");
        if(!_.isEmpty(splitData[0])){

          if(splitData[0] == 'SERIALPY'){
              if(splitData[1] == 'CONNECTED-SerialIn'){
                serialInConnected = true;
              }
              else if(splitData[1] == 'CONNECTED-SerialOut'){
                serialOutConnected = true;
              }

              if(serialInConnected && serialOutConnected){
                self.emit("connected");
              }
          }

        }
      }
      else{
        log.info("Processing complete message from Arduino:"+msg);
        onReceiveData(msg);
      }
    });
	}

  //send a command down to the Arduino.
	Arduino.prototype.sendCommand = function(cmd){
    log.info("Serial client received message:"+cmd);
		if(!_.isEmpty(self._arduino)){
      log.info("Serial client now sending:"+cmd);
			this._arduino.stdin.write(cmd);//just send down raw
		}
    else{
      log.error("Serial client cannot send message:"+cmd);
    }
	}

}//arduino

util.inherits(Arduino, events.EventEmitter);

module.exports = Arduino;
