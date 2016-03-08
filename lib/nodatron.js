"use strict";

var pathUtil     = require('path'),
    fs           = require('fs'),
	  util         = require("util"),
    async        = require('async'),
	  childprocess = require('child_process'),
    _            = require('underscore'),
    log          = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "nodatron";

var serviceArray = new Array();

module.exports = Nodatron;

function Nodatron(conf){
	var self             = this;

  log.init(conf.logger);

	this._conf           = conf;

	if(this instanceof Nodatron === false){
		throw new TypeError("Classes can't be function-called.");
	}

	//Member definitions//
  Nodatron.prototype.processSenderStatus = function processSenderStatus(senderTitle,senderStatus){
    log.info(senderTitle+" reported status of:"+senderStatus);
  }

  Nodatron.prototype.processChildMessage = function processChildMessage(ipMsg){

    if(!_.isEmpty(ipMsg)){
      log.info("Received message from a child process:"+JSON.stringify(ipMsg));

      try{
        if(!_.isEmpty(ipMsg.senderTitle)){
          if(!_.isEmpty(ipMsg.status)){
            processSenderStatus(ipMsg.senderTitle,ipMsg.status);
          }
          if(!_.isEmpty(ipMsg.receiverTitle)){
            if(!_.isEmpty(ipMsg.data)){
              if(ipMsg.senderTitle == 'tcpSvc'){
                if(ipMsg.receiverTitle == 'robotSvc'){
                  log.info("Sending data from tcpSvc to robotSvc");
                  serviceArray['robotSvc'].send(ipMsg);
                }//receiver is robotSvc
              }//sender was tcpSvc
            }//got data
          }
        }
      }
      catch(e){
        log.error("Received invalid ipMsg format from a child process.");
      }
    }
    else{
      log.warn("Nodatron received empty message from child process.");
    }
  }

  //start up a service defined in the config file.
	Nodatron.prototype.startService = function startService(service){
		var svcName = service.filename+"-"+service.title;

		if(_.isEmpty(service.filename)){
			log.error("Service.filename is required. This needs to be the name of the service file.");
			return;
		}

		if(!service.disabled){
			var paramArray = new Array();

			for(var attributename in service){//build the service commandline arguments
				paramArray.push("-"+attributename);

        if(_.isArray(service[attributename]) || _.isObject(service[attributename])){
          paramArray.push(JSON.stringify(service[attributename]));
        }
        else{
          paramArray.push(service[attributename]);
        }
			}

			var p = pathUtil.join(__dirname,service.filename);
			log.info("Attempting to fork child node process:"+p);

			var nodeChildProcess = childprocess.fork(p,paramArray,{timeout: 25000,env: process.env});
			log.info("Just attempted to fork child:"+svcName+" with parameters:\n"+paramArray);

			if(!_.isEmpty(nodeChildProcess)){
        log.info("Successfully forked "+service.title+" with pid:"+nodeChildProcess.pid);

        serviceArray[service.title] = nodeChildProcess;

        //handle incoming message from a child process
        nodeChildProcess.on('message', (data) => {
          self.processChildMessage(data);
        });//on message

				nodeChildProcess.on('error', function(err){
					log.error(service.title+" child process error: "+err);
          retryService(service.title);
				});

				nodeChildProcess.on('close', function(code,signal){
					if(!_.isEmpty(code)){
						if(code == 0){
							log.info(svcName+" child process exited normally with code: "+code);
						}
						else{
							log.error(svcName+" child process exited with code: "+code);
						}
					}
					else if(!_.isEmpty(signal)){
						log.error(svcName+" child process terminated by signal: "+signal);
					}
					else{
						log.info(svcName+" child process exited.");
					}

          retryService(service.title);
				});

				nodeChildProcess.on('uncaughtException', function (err) {
					var msg="Uncaught Exception with node process:"+svcName+" ";
					if( err.name === 'AssertionError' ) {
						msg += err.message;
					} else {
						msg += err;
					}
					log.error(msg);
				});
			}
      else{
        log.warn("Child process with "+service.title+" fork returned null.");
      }

		}//enabled service
		else{
			log.info("Not starting "+svcName+" because it is disabled.");
		}

		function retryService(processTitle){
				var secondsElapsed = 10;
				log.info("Retrying "+processTitle+" in "+secondsElapsed+" seconds.");

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
      log.info("Got kill signal. Exiting.");
      self.shutdown('SIGTERM');
    });

    process.on('SIGINT', function() {
      log.warn("Caught interrupt signal(Ctrl-C)");
      self.shutdown('SIGINT');
    });

    process.on('exit', function(){
      log.info("Nodatron exiting...");
    })

    process.on('uncaughtException', function (err) {
      var msg="Uncaught Exception ";
      if( err.name === 'AssertionError' ) {
        msg += err.message;
      } else {
        msg += err;
      }
      log.error(msg);
    });

		log.info("Attempting to start service(s)");
		if(!_.isEmpty(this._conf)){
			if(!_.isEmpty(this._conf.services) && this._conf.services.length>0){
				//loop through the services defined in config and auto start them.
				async.forEach(this._conf.services, this.startService, function(err){
					if(err)
						log.error("Error auto starting services with error: "+err);
					else{
						log.info("Finished auto starting service(s) - "+JSON.stringify(this._conf.services));
					}
				});
			}
			else{
				log.warn("No services defined. Nothing to do. Please check your config file.");
			}
		}
	}//start

  Nodatron.prototype.shutdown = function shutdown(INTERRUPT){
    log.warn("Starting shutdown of child processes.");

    for(var i = 0; i < serviceArray.length; i++){
      var curService = serviceArray[i];
      if(!_.isEmpty(curService)){
        log.info("Killing "+curService.title+" with pid:"+curService.pid);
        process.kill(curService.pid,INTERRUPT);
      }
    }

    process.exit();
  }

}//end constructor
