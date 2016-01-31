"use strict";

var pathUtil     = require('path'),
    fs           = require('fs'),
	  util         = require("util"),
    async        = require('async'),
	  childprocess = require('child_process'),
    nodeChild    = require(pathUtil.join(__dirname,'./nodeChild.js')),
	  utils        = require(pathUtil.join(__dirname,'./commonutils.js')),
	  Logger       = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "nodatron";

//message for inter-process communication
var IPMSG = {
  "senderTitle"   : "",
  "receiverTitle" : "",
  "status"        : "", //0=shutdown complete
  "data"          : ""
}
exports.ipMessage = IPMSG;

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

	//Member definitions//
  Nodatron.prototype.processSenderStatus = function processSenderStatus(senderTitle,senderStatus){
    self._log.info(senderTitle+" reported status of:"+senderStatus);
  }

  Nodatron.prototype.processChildMessage = function processChildMessage(ipMsg){
    if(!utils.isEmpty(ipMsg)){
      self._log.info("Received message from a child process:"+JSON.stringify(ipMsg));

      try{
        if(!utils.isEmpty(ipMsg.senderTitle)){
          if(!utils.isEmpty(ipMsg.status)){
            processSenderStatus(ipMsg.senderTitle,ipMsg.status);
          }
          if(!utils.isEmpty(ipMsg.receiverTitle)){
            if(!utils.isEmpty(ipMsg.data)){
              self._childProcesses[ipMsg.receiverTitle].processObject.send(ipMsg.data);
            }
          }
        }
      }
      catch(e){
        self._log.error("Received invalid ipMsg format from a child process.");
      }
    }
    else{
      self._log.warn("Nodatron received empty message from child process.");
    }
  }

  //start up a service defined in the config file.
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
			self._log.info("Just attempted to fork child:"+svcName+" with parameters:\n"+paramArray);

			if(!utils.isEmpty(nodeChildProcess)){
        self._log.info("Successfully forked "+service.title+" with pid:"+nodeChildProcess.pid);

        //create a new CPROCESS and add to array
        self._childProcesses.push(new NodeChild(nodeChildProcess,service.title,service.keepAlive));

        //handle incoming message from a child process
        nodeChildProcess.on('message', (data) => {
          self.processChildMessage(data);
        });//on message

				nodeChildProcess.on('error', function(err){
					self._log.error(service.title+" child process error: "+err);

        self.removeChildProcess(service.title);
        //  if(self._childProcesses[service.title].retryFlag){
        //    retryService(service.title);
        //  }
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
						self._log.error(svcName+" child process terminated by signal: "+signal);
					}
					else{
						self._log.info(svcName+" child process exited.");
					}

          self.removeChildProcess(service.title);
          //if(self._childProcesses[service.title].retryFlag){
          //  retryService(service.title);
          //}
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
      else{
        self._log.warn("Child process with "+service.title+" fork returned null.");
      }

		}//enabled service
		else{
			self._log.info("Not starting "+svcName+" because it is disabled.");
		}

		function retryService(processTitle){
				var secondsElapsed = 10;
				self._log.info("Retrying "+processTitle+" in "+secondsElapsed+" seconds.");

				setInterval(function(){
					secondsElapsed--;

					if(secondsElapsed <= 0){
						clearInterval(this);
						startService(service);
					}
				},1000);
		}//retryService

	}//startService

	Nodatron.prototype.start = function start(){

    //define handlers for this main process.
    process.on('SIGTERM', function() {//called from /etc/init.d/nodatron.sh from kill pid
      self._log.info("Got kill signal. Exiting.");
      self.shutdown('SIGTERM');
    });

    process.on('SIGINT', function() {
      self._log.warn("Caught interrupt signal(Ctrl-C)");
      self.shutdown('SIGINT');
    });

    process.on('exit', function(){
      self._log.info("Nodatron exiting...");
    })

    process.on('uncaughtException', function (err) {
      var msg="Uncaught Exception ";
      if( err.name === 'AssertionError' ) {
        msg += err.message;
      } else {
        msg += err;
      }
      self._log.error(msg);
    });

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
				self._log.info("No services defined. Nothing to do. Please check your config file.");
			}
		}
	}//start

  Nodatron.prototype.getNodeChild = function getNodeChild(title){
    if(!utils.isEmpty(self._childProcesses) && self._childProcesses.length>0){
      for(var cp in self._childProcesses){
        if(cp.getTitle() == title){
          return cp;
        }
      }
    }
  }

  Nodatron.prototype.removeChildProcess = function removeChildProcess(title){
    var index = 0;
    if(!utils.isEmpty(self._childProcesses) && self._childProcesses.length>0){
      for(var cp in self._childProcesses){
        if(cp.getTitle() == title){
          self._childProcesses.splice(index, 1);
          self._log.info("Removed "+title+" from child process array.");
          return;
        }
        index++;
      }
    }
  }

  Nodatron.prototype.shutdown = function shutdown(INTERRUPT){
      self._log.warn("Starting shutdown of "+self._childProcesses.length+" child processes.");
      for(var nc in self._childProcesses){
          if(!utils.isEmpty(nc) && nc.getInstance().pid != 0){
            //turning off flag so retry won't happen anymore on this child process.
            self._log.warn("Turning off keep-alive flag for "+np.getTitle());

            //cp.retryFlag = false;//update cp
            //self._childProcesses[cp.processObject.title] = cp;//update array element

            //send down the kill signal to child
            self._log.warn("Sending "+INTERRUPT+" signal to pid:"+np.getInstance().pid);
            process.kill(np.getInstance().pid,INTERRUPT);
          }//cp
      }//for every child

    self._log.info("Now calling process.exit()");
    process.exit();
  }

}//end constructor
