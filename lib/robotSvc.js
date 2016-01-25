var util     = require("util"),    
	pathUtil = require('path'),
	Svc      = require(pathUtil.join(__dirname,'./svc.js')),
	utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
	robot    = require(pathUtil.join(__dirname,'./robot.js'));

process.title = "robotSvc";

function RobotSvc(){
	var self      = this;	
	this._device  = '';
	this._baud    = '';
	
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
		
		var wambo = new robot(self._log,self._device,self._baud);
		wambo.init();//makes serial connection.
	}
}

util.inherits(RobotSvc,Svc);

var arduinoService = new RobotSvc();
arduinoService.init();