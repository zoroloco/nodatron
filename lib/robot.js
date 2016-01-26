var cp       = require('child_process'),
    pathUtil = require('path');

function Robot(log,device,baud){
	var self     = this;
	this._log    = log;
	this._cmd    = pathUtil.join(__dirname,"serialpy.py");
	this._arduino= null;
	
	Robot.prototype.init = function(){		
		self.connectToSerial();
	}
	
	Robot.prototype.connectToSerial = function(){
		self._log.info("Spawning Arduino serial connection script: "+self._cmd);
				
		self._arduino = cp.spawn('python',
		                       [self._cmd,
							   "--device",device,"--baud",baud]);
					
		self._arduino.stdout.on('data', (data) => {
			if(data == "CONNECTED"){
				self._log.info("Serial connection successful.");
			}
			else{
			    self._log.info("stdout: "+data);	
			}		  
		});

		self._arduino.stderr.on('data', (data) => {
		  self._log.error("stderr: "+data);
		  retry();
		});
		
		self._arduino.on('error', (err) => {
		  self._log.error("Failed to spawn child process with error "+err);
		  retry();
		});

		self._arduino.on('close', (code) => {
		  self._log.info("Arduino process closed with code "+code);
		});
		
		self._arduino.on('exit', (code) => {
			self._log.info("Arduino process exited with code "+code);
			retry();
		});					
	}
	
	function retry(){	
		var secondsElapsed = 10;
		self._log.info("Retrying serial port connection in "+secondsElapsed+" seconds.");
		
		setInterval(function(){					
			secondsElapsed--;
			
			if(secondsElapsed <= 0){
				clearInterval(this);
				connectToSerial();
			}
		},1000);
	}
	
}

module.exports = Robot;