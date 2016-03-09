var cp          = require('child_process'),
    pathUtil    = require('path'),
    _           = require('underscore'),
    dataHandler = require(pathUtil.join(__dirname,'./dataHandler.js')),
    log         = require(pathUtil.join(__dirname,'./logger.js'));

function Arduino(device,baud){
	var self          = this;
	this._cmd         = pathUtil.join(__dirname,"serialpy.py");
  this._dataHandler = new dataHandler();
	this._arduino     = null;//the child process object of the python process.

	Arduino.prototype.shutdown = function(){
		log.warn("Shutting down arduino serial connection.");
		if(!_.isEmpty(self._arduino)){
		    process.kill(self._arduino.pid);//clean-up python serial connection
		}
	}

	Arduino.prototype.connect = function(onReceiveData,onLostConnection){
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
        var errMsg = "stderr: "+data;
		    log.error(errMsg);
	      onLostConnection(errMsg);
		});

		this._arduino.on('error', (err) => {
        var errMsg = "Failed to spawn child process with error "+err;
		    log.error(errMsg);
			  onLostConnection(errMsg);
		});

		this._arduino.on('close', (code) => {
        var errMsg = "Arduino process closed with code "+code;
        if(code == 0){
		      log.info(errMsg);
        }
        else{
          log.error(errMsg);
        }
        onLostConnection(errMsg);
		});

		this._arduino.on('exit', (code) => {
      var errMsg = "Arduino process exited with code "+code;
      if(code == 0){
        log.info(errMsg);
      }
      else{
        log.error(errMsg);
      }
			onLostConnection(errMsg);
		});

    this._dataHandler.on('inputData',function(msg){
      log.info("Processing complete message from Arduino:"+msg);
      onReceiveData(msg);
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

module.exports = Arduino;
