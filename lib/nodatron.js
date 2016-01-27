"use strict";

var pathUtil     = require('path'),
    fs           = require('fs'),
	util         = require("util"),
    async        = require('async'),
	childprocess = require('child_process'),
	utils        = require(pathUtil.join(__dirname,'./commonutils.js')),
	Logger       = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "nodatron";

/*
 * Constructor
*/

module.exports = Nodatron;

function Nodatron(config){
	var self             = this;
	this._conf           = null;
	this._log            = new Logger();
	this._childProcesses = new Array();

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

	process.on('SIGTERM', function() {
		self._info("Got kill signal. Exiting.");
		process.exit();
	});

	process.on('SIGINT', function() {
		self._log.warn("Caught interrupt signal(Ctrl-C) - Starting shutdown of child processes.");
		if(!utils.isEmpty(self._childProcesses)){
			for(var cp in self._childProcesses){
          if(!utils.isEmpty(cp) && cp.pid !=0){
				    process.kill(cp.pid,'SIGINT');
          }
			}
		}

		process.exit();
	});

	//Member definitions//

	Nodatron.prototype.startService = function startService(service){
		var svcName = service.filename+"-"+service.title;

		if(utils.isEmpty(service.filename)){
			self._log.error("Service.filename is required. This needs to be the name of the service file.");
			return;
		}

		if(!service.disabled){
			var paramArray = new Array();

			for(var attributename in service){//build the service commandline arguments
				paramArray.push("-"+attributename);
				paramArray.push(service[attributename]);
			}

			var p = pathUtil.join(__dirname,service.filename);
			self._log.info("Attempting to fork child node process:"+p);

			var nodeChildProcess = childprocess.fork(p,paramArray,{timeout: 25000,env: process.env});
			self._log.info("Just forked child:"+svcName+" with parameters:\n"+paramArray);

			if(!utils.isEmpty(nodeChildProcess)){
        //store away the pid
        self._childProcesses[service.title] = nodeChildProcess;

        //handle incoming message from a child process
        nodeChildProcess.on('message', (data) => {
          self._log.info("Nodatron received a message from a child process:"+data);
          if(nodeChildProcess.title == 'tcpSvc'){
            if(!utils.isEmpty(self._childProcesses['robotSvc'])){
              self._log.info("Forwarding data to robotSvc");
              self._childProcesses['robotSvc'].send(data);
            }
            else{
              self._log.warn("Could not forward data to robotSvc because it is not running. Data lost.");
              //TODO: buffer data
            }
          }
        });

				nodeChildProcess.on('error', function(err){
					self._log.error(svcName+" child process error "+err);
					self._childProcesses[service.title] = '';
					retryService();
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

					self._childProcesses[service.title] = '';
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
