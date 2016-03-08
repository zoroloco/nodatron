var util   = require("util"),
	pathUtil = require('path'),
	_        = require('underscore'),
	log      = require(pathUtil.join(__dirname,'./logger.js')),
	Svc      = require(pathUtil.join(__dirname,'./svc.js')),
	arduino  = require(pathUtil.join(__dirname,'./arduino.js')),
	dataHandler     = require(pathUtil.join(__dirname,'./dataHandler.js')),
	robotController = require(pathUtil.join(__dirname,'./robotController.js'));

const readline = require('readline');

process.title = "robotSvc";

function RobotSvc(){
	var self      = this;
	this._device  = '';
	this._baud    = '';
	this._stdinEnabled = false;
	this._serialConnection;
	this._robotController;
  this._components;
	this._dataHandler;

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
		if(val == '-components' && array.length>=index+1){
			self._components = process.argv[index+1];
		}
	});

	log.init(this._loggerProps);

	if(_.isEmpty(this._device) || _.isEmpty(this._baud)){
		log.error("--device and --baud are required parameters.");
		process.exit(1);
	}
	else{
		log.info("Device set to:"+this._device+" with baud rate of:"+this._baud+" stdinEnabled flag is set to "+this._stdinEnabled);
	}

  /**
	 * Initialize the serial connection to the Arduino and the controller for the
	 * robot.
	 *
	*/
	RobotSvc.prototype.init = function(){
		log.info("Initializing Arduino service.");

    log.info("Creating arduino robot controller object.");

		//create the serial connection to the Arduino.
		log.info("Creating arduino interface object.");

		self._serialConnection = new arduino(self._device,self._baud);
    self._robotController  = new robotController(self._serialConnection,self._components);
    self._dataHandler      = new dataHandler();

    //callback once a full data message has been received from the Arduino.
    self._dataHandler.on('inputData', function(inputData){
			self._robotController.processInput(inputData);
		});

		self._serialConnection.connect(
      //callback for data coming in from serial port.
			function(data){
        self._dataHandler.processRawData(data);//builds up the chunks of data.
		},function(){
			log.error("Serial connection lost or connection could not be established.");
			self.shutdown();
		});

		process.on('uncaughtException', function(err) {
			log.error("Caught exception: " + err);
			self.shutdown();
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

util.inherits(RobotSvc,Svc);

//start this service.
var arduinoService = new RobotSvc();
arduinoService.init();
