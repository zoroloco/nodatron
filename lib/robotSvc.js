var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
	robot    = require(pathUtil.join(__dirname,'./robot.js'));

process.title = "arduinoSvc";

function ArduinoSvc(){
	var self      = this;	
	this._device  = '';
	this._baud    = '';
	
	ArduinoSvc.super_.call(this);//call Svc constructor
	
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
	
	ArduinoSvc.prototype.init = function(){
		self._log.info("Initializing Arduino service.");
		
		var wambo = new robot(self._log,self._device,self._baud);
		
	}
}

util.inherits(ArduinoSvc,Svc);

var arduinoService = new ArduinoSvc();
arduinoService.init();