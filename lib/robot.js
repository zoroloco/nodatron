var cp       = require('child_process'),
    pathUtil = require('path');

function Robot(log,device,baud){
	var self     = this;
	this._log    = log;
	this._cmd    = "python "+path.join(__dirname,"/scripts/arduino.py")+" --device "+device+" --baud "+baud;
	
	Robot.prototype.init = function(){		
		self._log.info("Spawning Arduino serial connection script: "+self._cmd);
				
		var arduino = cp.spawn(self._cmd ,function(error,stdout,stderr){
			
			arduino.stdout.on('data', (data) => {
			  self._log.info("stdout: ${data}");
			});

			arduino.stderr.on('data', (data) => {
			  self._log.error("stderr: ${data}");
			});

			arduino.on('close', (code) => {
			  self._log.info("Arduino process closed with code ${code}");
			});
			
			arduino.on('exit', (code) => {
				self._log.info("Arduino process exited with code ${code}")
			});
			
		});						
	}
}