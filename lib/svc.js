var pathUtil = require('path'),
    Logger   = require(pathUtil.join(__dirname,'./logger.js')),	
	utils    = require(pathUtil.join(__dirname,'./commonutils.js'));	

module.exports = Svc;

function Svc(){
	this._log      = new Logger(process.title);
	this._debug    = false;	
	
	this._log.info("in svc constructor.");		
	
	var self         = this;	
	var logToFile    = false;
	var logDir       = null;		
	var processTitle = null;
		
	if(this instanceof Svc === false){
		throw new TypeError("Classes can't be function-called.");
	}	
	
	//process command-line arguments common across all services.	
	process.argv.forEach(function (val, index, array){						
	
		if(val == '-debug'){
			this._debug = true;
		}		
		
		if(val == '-log' && array.length>=index+1 && process.argv[index+1] == 'true'){	 
			logToFile = true;
		}						
		
		if(val == '-logDir' && array.length>=index+1){	 
			logDir = process.argv[index+1];
		}						
		
		if(val == '-title' && array.length>=index+1){	 
			processTitle = process.argv[index+1];	
		}			
	});	

	//validate arguments
	if(utils.isEmpty(processTitle)){
		this._log.error("Process title is a required argument. Please run with -title")
		process.exit(1);
	}				
	
	process.title = processTitle;
	

	if(logToFile){
		if(!utils.isEmpty(logDir)){
			this._log.enableFileLogging(process.title,logDir);	
		}
		else{
			this._log.enableFileLogging(process.title,__dirname);
		}
	}	
	
	Svc.prototype.send = function send(msg){		
		if(!self._debug){
			process.send(msg);
		}
		else{
			self._log.info(msg);
		}
	}
}//constructor

		