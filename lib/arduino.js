/*
 * Create an instance of this class for every Arduino connected.
 *
*/

var cp       = require('child_process'),
    pathUtil = require('path'),
    log      = require(pathUtil.join(__dirname,'./logger.js')),
    _        = require('underscore');

function Arduino(device,baud){
	var self     = this;
	this._cmd    = pathUtil.join(__dirname,"serialpy.py");
	this._arduino= null;//the child process object of the python process.

	Arduino.prototype.shutdown = function(){
		log.warn("Shutting down arduino serial connection.");
		if(!_.isEmpty(self._arduino)){
		    process.kill(self._arduino.pid);//clean-up python serial connection
		}
	}

	Arduino.prototype.connect = function(onReceiveData,onLostConnection){
		log.info("Spawning arduino serial connection script: "+self._cmd);

		self._arduino = cp.spawn('python',
		                       [self._cmd,
							   "--device",device,"--baud",baud]);

        self._arduino.stdin.setEncoding('utf-8');

		//data came in from Arduino
		self._arduino.stdout.on('data', (data) => {
			//log.info("stdout: "+data);
			onReceiveData(data);//forward the data to the callback.
		});

		self._arduino.stderr.on('data', (data) => {
		    log.error("stderr: "+data);
	        onLostConnection();
		});

		self._arduino.on('error', (err) => {
		    log.error("Failed to spawn child process with error "+err);
			onLostConnection();
		});

		self._arduino.on('close', (code) => {
		    log.info("Arduino process closed with code "+code);
            onLostConnection();
		});

		self._arduino.on('exit', (code) => {
			log.info("Arduino process exited with code "+code);
			onLostConnection();
		});
	}

  //send a command down to the Arduino.
	Arduino.prototype.sendCommand = function(cmd){
    log.info("Arduino serial client received message:"+cmd);
		if(!_.isEmpty(self._arduino)){
      log.info("Arduino serial client now sending:"+cmd);
			self._arduino.stdin.write(cmd);//just send down raw
		}
    else{
      log.error("Arduino serial client cannot send message:"+cmd);
    }
	}
}

module.exports = Arduino;
