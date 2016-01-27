var util   = require("util"),
	pathUtil = require('path'),
	Svc      = require(pathUtil.join(__dirname,'./svc.js')),
	utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
	arduino  = require(pathUtil.join(__dirname,'./arduino.js'));

const readline = require('readline');

process.title = "robotSvc";

function RobotSvc(){
	var self      = this;
	this._device  = '';
	this._baud    = '';
	this._stdinEnabled = false;
	this._serialConnection;

	RobotSvc.super_.call(this);//call Svc constructor

	process.argv.forEach(function (val, index, array){
		if(val == '-device' && array.length>=index+1){
			self._device = process.argv[index+1];
		}
		if(val == '-baud' && array.length>=index+1){
			self._baud = process.argv[index+1];
		}
		if(val == '-stdinEnabled' && array.length>=index+1){
			self._stdinEnabled = process.argv[index+1];
		}
	});

	if(utils.isEmpty(this._device) || utils.isEmpty(this._baud)){
		this._log.error("--device and --baud are required parameters.");
		process.exit(1);
	}
	else{
		this._log.info("Device set to:"+this._device+" with baud rate of:"+this._baud+" stdinEnabled flag is set to "+this._stdinEnabled);
	}

	RobotSvc.prototype.init = function(){
		self._log.info("Initializing Arduino service.");

		//create the serial connection to the Arduino.
		self._serialConnection = new arduino(self._log,self._device,self._baud);
		self._serialConnection.connect(function(data){//callback for data coming in from serial port.
		    self._log.info("Serial connection incoming data: "+data);
		},function(){
			self._log.error("Serial connection lost or connection could not be established.");
			self.shutdown();
		});

		process.on('SIGINT', function() {
			self._log.warn("Got SIGINT signal. Exiting process.");
			self.shutdown();
		});

		process.on('SIGTERM', function() {
			self._log.warn("Got SIGTERM kill signal. Exiting process.");
			self.shutdown();
		});

		process.on('uncaughtException', function(err) {
			self._log.error("Caught exception: " + err);
			self.shutdown();
		});

		process.on('message', function(data) {
			if(!utils.isEmpty(data)){
				self._log.info("Received data from parent process:"+data);
				//TODO: msg validation
				if(!utils.isEmpty(self._serialConnection)){
					self._serialConnection.sendCommand(data);//forward
				}
			}
		});

		//read data from the commandline.
		if(self._stdinEnabled == 'true'){
			const rl = readline.createInterface({
				input :process.stdin
			});

			rl.on('line', (cmd) => {//on enter key
			  if(!utils.isEmpty(self._serialConnection)){
				  self._serialConnection.sendCommand(cmd);//forward
			  }
			});
		}

	}//init

	//graceful shutdown.
    RobotSvc.prototype.shutdown = function(){
        try{
            if(!utils.isEmpty(self._serialConnection)){
				self._serialConnection.shutdown();
				process.exit();
			}
        }
        catch(e){
        	self._log.warn("Could not disconnect serial in/out - "+e);
        }
	}
}

util.inherits(RobotSvc,Svc);

//start this service.
var arduinoService = new RobotSvc();
arduinoService.init();
