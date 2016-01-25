"use strict";

var pathUtil     = require('path'),    
    fs           = require('fs'),
	util         = require("util"),
    async        = require('async'),
	childprocess = require('child_process'),
	utils        = require(pathUtil.join(__dirname,'./commonutils.js')),
	Logger       = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "svcMgr";
	
/**
 * 
 * 
 */
process.on('SIGTERM', function() {
	console.log(process.title+": Got kill signal. Exiting.");
	process.exit();
});

/*
 * Constructor
*/

module.exports = Nodatron;

function Nodatron(config){
	var self   = this;
	this._conf = null;
	this._log  = new Logger();
	
	if(this instanceof Nodatron === false){
		throw new TypeError("Classes can't be function-called.");
	}			
	
	this._conf = config;

	try{
		if(!utils.isEmpty(this._conf)){
			this._log.info("Successfully read well-formatted config file:\n"+JSON.stringify(this._conf));
			
			if(!utils.isEmpty(this._conf.log) && this._conf.log == 'true'){
				var logDir = pathUtil.join(__dirname,"../"+process.title+"_logs");//default
				this._log.info("Turning on file logging.");				
				if(!utils.isEmpty(this._conf.logDir)){//optional field
					logDir = this._conf.logDir;
				}
				
				this._log.enableFileLogging(process.title,logDir);
				this._log.info("File logging enabled. Log files will be kept in:"+logDir);
			}			
		}
		else{
			this._log.warn("No config file defined.");
			this._log.info("Creating default config file with file logging off.");
			this._conf = {"log" : "false"};
		}				
	}
	catch(e){
		this._log.warn("Reading the config file resulted in the exception:"+e);				
	}	

	//Member definitions//
	
	Nodatron.prototype.startService = function startService(service){
		var svcName = service.name+"-"+service.title;
		
		if(utils.isEmpty(service.name)){
			self._log.error("Service.name is required. This needs to be the name of the service file.");
			return;
		}
		
		if(!service.disabled){
			var paramArray = new Array();
		
			for(var attributename in service){//build the service commandline arguments
				paramArray.push("-"+attributename);
				paramArray.push(service[attributename]);
			}
		
			var p = pathUtil.join(pathUtil.join(pathUtil.join(__dirname,service.name));
			self._log.info("Attempting to fork child node process:"+p);
		
			var nodeChildProcess = childprocess.fork(p,paramArray,{timeout: 25000,env: process.env});
			self._log.info("Just forked child:"+svcName+" with parameters:\n"+paramArray);
			
			if(!utils.isEmpty(nodeChildProcess)){											
				//nodeChildProcess.send(data);			
				
				nodeChildProcess.on('message', function(nodeServiceOutput){
					self._log.info(service.name+" sent up message:"+nodeServiceOutput);
				});						

				nodeChildProcess.on('error', function(err){
					self._log.error(svcName+" child process error "+err);
				});

				nodeChildProcess.on('close', function(code,signal){
					if(!utils.isEmpty(code)){
						if(code == 0){
							self._log.info(svcName+" child process exited normally with code: "+code);	
						}
						else{
							self._log.error(svcName+" child process exited with code: "+code);
						}					
					}
					else if(!utils.isEmpty(signal)){
						self._log.error(svcName+" child process terminated by signal "+signal);
					}
					else{
						self._log.warn(svcName+" child process exited.");
					}	

					retryService();									
				});
				
				nodeChildProcess.on('uncaughtException', function (err) {
					var msg="Uncaught Exception with node process:"+svcName+" ";
					if( err.name === 'AssertionError' ) {
						msg += err.message;
					} else {
						msg += err;
					}
					self._log.error(msg);
				});
			}
			
		}//enabled service
		else{
			self._log.info("Not starting "+svcName+" because it is disabled.");
		}

		function retryService(){
			if(service.keepAlive == true){
				var secondsElapsed = 10;
				self._log.info("Retrying "+svcName+" in "+secondsElapsed+" seconds.");
				
				setInterval(function(){					
					secondsElapsed--;
					//self._log.info("Retrying "+service.name+" in "+secondsElapsed+" seconds.");
					
					if(secondsElapsed <= 0){
						clearInterval(this);
						startService(service);
					}
				},1000);				
			}		
		}			
	}
	   	 
	Nodatron.prototype.start = function start(){
		self._log.info("Attempting to start service(s)");
		if(!utils.isEmpty(this._conf)){
			if(!utils.isEmpty(this._conf.services) && this._conf.services.length>0){
				//loop through the services defined in config and auto start them.
				async.forEach(this._conf.services, this.startService, function(err){
					if(err)
						self._log.error("Error auto starting services with error: "+err);
					else{
						self._log.info("Finished auto starting service(s) - "+JSON.stringify(this._conf.services));
					}
				});	
			}
			else{
				self._log.info("No services defined. Nothing to do.");
			}
		}						
	}//start			
}//end constructor