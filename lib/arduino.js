var cp       = require('child_process'),
    pathUtil = require('path'),
  	utils    = require(pathUtil.join(__dirname,'./commonutils.js'));

function Arduino(log,device,baud){
	var self     = this;
	this._log    = log;
	this._cmd    = pathUtil.join(__dirname,"serialpy.py");
	this._arduino= null;//the child process object of the python process.

	Arduino.prototype.shutdown = function(){
		self._log.warn("Shutting down arduino serial connection.");
		if(!utils.isEmpty(self._arduino)){
		    process.kill(self._arduino.pid);//clean-up python serial connection
		}
	}

	Arduino.prototype.connect = function(onReceiveData,onLostConnection){
		self._log.info("Spawning arduino serial connection script: "+self._cmd);

		self._arduino = cp.spawn('python',
		                       [self._cmd,
							   "--device",device,"--baud",baud]);

        self._arduino.stdin.setEncoding('utf-8');

		//data came in from Arduino
		self._arduino.stdout.on('data', (data) => {
			//self._log.info("stdout: "+data);
			onReceiveData(data);//forward the data to the callback.
		});

		self._arduino.stderr.on('data', (data) => {
		    self._log.error("stderr: "+data);
	        onLostConnection();
		});

		self._arduino.on('error', (err) => {
		    self._log.error("Failed to spawn child process with error "+err);
			onLostConnection();
		});

		self._arduino.on('close', (code) => {
		    self._log.info("Arduino process closed with code "+code);
            onLostConnection();
		});

		self._arduino.on('exit', (code) => {
			self._log.info("Arduino process exited with code "+code);
			onLostConnection();
		});
	}

	Arduino.prototype.sendCommand = function(cmd){
    self._log.info("Arduino serial client received message:"+cmd);
		if(!utils.isEmpty(self._arduino)){
      self._log.info("Arduino serial client now sending:"+cmd);
			self._arduino.stdin.write(cmd);//just send down raw
		}
    else{
      self._log.error("Arduino serial client cannot send message:"+cmd);
    }
	}
}

module.exports = Arduino;
