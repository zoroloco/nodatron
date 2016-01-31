var winston  = require('winston'),
    pathUtil = require('path'),
	  fs       = require('fs'),
	  utils    = require(pathUtil.join(__dirname,'./commonutils.js'));

process.title = "logger";

module.exports = Logger;
function Logger(){
	var self = this;

	//default console logger
	this._log = new (winston.Logger)({
	  transports: [
		new (winston.transports.Console)({'timestamp' : true,'colorize': true})],
	  exitOnError: false
	});

	this._log.info("Created console logger.");
}//constructor

Logger.prototype.enableFileLogging = function enableFileLogging(name,logDir){
	if(utils.isEmpty(name)){
		this._log.error("Please specify name to enable file logging. Sticking with just console logging.");
		return;
	}

	this._log.info("Enabling file logging. File names will be prefixed with:"+name);

	if(!utils.isEmpty(logDir)){
		//create the log dir if it does not already exist.
		try {
		   this._log.info("Creating log directory:"+logDir);
		   fs.mkdirSync(logDir);
		}
		catch(e) {
		   if ( e.code != 'EEXIST' ){
			   throw e;
		   }
		}

		this._log = new (winston.Logger)({
		  transports: [
			new (winston.transports.Console)({'timestamp' : true,'colorize': true})
			,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"error.log"), name:'file.error',
				level: 'error','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
			,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"warn.log"), name:'file.warn',
				level: 'warn','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
			,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"info.log"), name:'file.info',
				level: 'info','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
		  ],
		  exceptionHandlers: [
			new (winston.transports.Console)({'timestamp' : true,'colorize': true})
			,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"exception.log"),
				level: 'error','maxsize':4194304,'maxFiles':256 })
		  ],
		  exitOnError: false
		});

		this._log.info(name+" log files will be located on:"+logDir);
	}
	else{
		this._log.error(process.title+": You must specify a log directory. Only console logging will be used.");
	}
}//init

Logger.prototype.info = function log_info(msg){
	this._log.info(process.title+":"+msg);
}

Logger.prototype.warn = function log_warn(msg){
	this._log.warn(process.title+":"+msg);
}

Logger.prototype.error = function log_error(msg){
	this._log.error(process.title+":"+msg);
}
