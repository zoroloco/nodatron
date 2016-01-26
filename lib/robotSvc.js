var util     = require("util"),    
	pathUtil = require('path'),
	Svc      = require(pathUtil.join(__dirname,'./svc.js')),
	utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
	arduino  = require(pathUtil.join(__dirname,'./arduino.js'));

process.title = "robotSvc";

function RobotSvc(){
	var self      = this;	
	this._device  = '';
	this._baud    = '';
	this._serialConnection;
	
	RobotSvc.super_.call(this);//call Svc constructor
	
	process.argv.forEach(function (val, index, array){
		if(val == '-device' && array.length>=index+1){	 
			self._device = process.argv[index+1];	
		}		
		if(val == '-baud' && array.length>=index+1){	 
			self._baud = process.argv[index+1];	
		}		
	});				
	
	if(utils.isEmpty(this._device) || utils.isEmpty(this._baud)){
		this._log.error("--device and --baud are required parameters.");
		process.exit(1);
	}	
	else{
		this._log.info("Device set to:"+this._device+" with baud rate of:"+this._baud);
	}
	
	RobotSvc.prototype.init = function(){
		self._log.info("Initializing Arduino service.");
		
		//create the serial connection to the Arduino.
		self._serialConnection = new Arduino(self._log,self._device,self._baud,function(){
			self._log.info("Got data from Arduino stdin.");
		});		
		
		process.on('SIGINT', function() {
			self._log.warn("Got SIGINT signal. Exiting process.");
			self.shutdown();
			process.exit();
		});
	
		process.on('SIGTERM', function() {
			self._log.warn("Got SIGTERM kill signal. Exiting process.");
			self.shutdown();
			process.exit();
		});
		
		process.on('uncaughtException', function(err) {
			self._log.error("Caught exception: " + err);
			self.shutdown();
			process.exit(1);
		});
		
		process.on('message', function(data) {
			if(!utils.isEmpty(data)){
				this._log.info("Received data from parent process.");		
				var parsedData = JSON.parse(data);
			}
		});
		
		//setup stdin from keyboard for helpful debug
		process.stdin.setEncoding('utf8');
        
		process.stdin.on('readable', () => {
			var chunk = process.stdin.read();
			if (chunk !== null) {
				//send keyboard input to serial connection.
				if(!utils.isEmpty(self._serialConnection)){
					self._serialConnection.sendCommand(chunk);
				}
			}
		});
		
		process.stdin.on('end', () => {
		    self._log.info("End of stdin input.");
		});
		
	}

    RobotSvc.prototype.shutdown = function(){
		if(!utils.isEmpty(self._serialConnection)){
			self._serialConnection.shutdown();
		}
	}    
}

util.inherits(RobotSvc,Svc);

//start this service.
var arduinoService = new RobotSvc();
arduinoService.init();