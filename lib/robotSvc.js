var util   = require("util"),
	pathUtil = require('path'),
	_        = require('underscore'),
	log      = require(pathUtil.join(__dirname,'./logger.js')),
	Svc      = require(pathUtil.join(__dirname,'./svc.js')),
	arduino  = require(pathUtil.join(__dirname,'./arduino.js')),

	robotController = require(pathUtil.join(__dirname,'./robotController.js'));

const readline = require('readline');

function RobotSvc(){




  /**
	 * Initialize the serial connection to the Arduino and the controller for the
	 * robot.
	 *
	*/
	RobotSvc.prototype.init = function(){
    self._robotController  = new robotController(self._serialConnection,self._components);


    //callback once a full data message has been received from the Arduino.
    self._dataHandler.on('inputData', function(inputData){
			self._robotController.processInput(inputData);
		});

    //message came from nodatron (probably originated from tcp service)
		process.on('message', function(data) {
			if(!_.isEmpty(data)){
				log.info("Received data from parent process:"+JSON.stringify(data));
				if(!_.isEmpty(self._robotController)){
					self._robotController.processRemoteCommand(data);
					//self._serialConnection.sendCommand(data+'\r\n');
				}
			}
		});

		//read data from the commandline.
		if(self._stdinEnabled == 'true'){
			const rl = readline.createInterface({
				input :process.stdin
			});

			rl.on('line', (cmd) => {//on enter key
			  if(!_.isEmpty(self._robotController)){
					log.info("Received raw data from command line.");
					self._robotController.processRawCommand(cmd+"\n");//forward local
			  }
			});
		}

	}//init

	//graceful shutdown.
    RobotSvc.prototype.shutdown = function(){
        try{
            if(!_.isEmpty(self._serialConnection)){
				        self._serialConnection.shutdown();//blocking
			      }
        }
        catch(e){
        	log.warn("Could not disconnect serial in/out - "+e);
        }

				log.info("Now exiting...");
				process.exit();
	  }
}//constructor
