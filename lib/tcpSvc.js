var util    = require("util"),
	pathUtil  = require('path'),
	_         = require('underscore'),
	log       = require(pathUtil.join(__dirname,'./logger.js')),
	Svc       = require(pathUtil.join(__dirname,'./svc.js')),
  tcpServer = require(pathUtil.join(__dirname,'./tcpServer.js'));

process.title = "tcpSvc";

function TcpSvc(){
	var self          = this;
	this._port        = '';
  this._tcpServer   = '';
	this._securityKey = '';

	TcpSvc.super_.call(this);//call Svc constructor

	process.argv.forEach(function (val, index, array){
		if(val == '-port' && array.length>=index+1){
			self._port = process.argv[index+1];
		}
		if(val == '-securityKey' && array.length>=index+1){
			self._securityKey = process.argv[index+1];
		}
	});

	log.init(this._loggerProps);

	if(_.isEmpty(this._port)){
		log.error("--port is a required parameter.");
		process.exit(1);
	}
	else{
		log.info("Port set to:"+this._port);
	}

	TcpSvc.prototype.init = function(){
		log.info("Initializing TCP service.");

		//create the tcp connection
		self._tcpServer = new tcpServer(self._port);

    self._tcpServer.connect(function(remoteIp){
			log.info("A client has connected to the TCP server from IP:"+remoteIp);
			this._ipMsg.senderTitle   = process.title;
			this._ipMsg.receiverTitle = "robotSvc";
			this._ipMsg.status        = "Connection";
			this._ipMsg.data          = "";

			//if(self._securityKey == the message's securityKey) TODO
			self.send(self._ipMsg);//send data up to Nodatron
		},
			function(data){
      log.info("Received data from TCP server:"+data);

      if(!_.isEmpty(data)){
				this._ipMsg.senderTitle   = process.title;
				this._ipMsg.receiverTitle = "robotSvc";
				this._ipMsg.status        = "";
				this._ipMsg.data          = data.toString('utf8');

        //if(self._securityKey == the message's securityKey) TODO
	      self.send(self._ipMsg);//send data up to Nodatron
			}
			else{
				log.warn("Data from client was empty.");
			}
    },function(){
      log.error("TCP Server died.");
      self.shutdown();
    });

		process.on('SIGINT', function() {
			log.warn("Got SIGINT signal. Exiting process.");
			self.shutdown();
		});

		process.on('SIGTERM', function() {
			log.warn("Got SIGTERM kill signal. Exiting process.");
			self.shutdown();
		});

		process.on('uncaughtException', function(err) {
			log.error("Caught exception: " + err);
			self.shutdown();
		});

		process.on('message', function(data) {
			if(!_.isEmpty(data)){
				log.info("Received data from parent process.");
				var parsedData = JSON.parse(data);
			}
		});
	}

	//graceful shutdown.
  TcpSvc.prototype.shutdown = function(){
        try{
            if(!_.isEmpty(self._tcpServer)){
				        self._tcpServer.shutdown(function(){
						    		log.info("Now exiting...");
										process.exit();
								});
			      }
						else{
							log.info("Now exiting...");
				      process.exit();
						}
        }
        catch(e){
        	log.warn("Could not shutdown tcp server - "+e);
					process.exit();
        }
	}
}

util.inherits(TcpSvc,Svc);

//start this service.
var tcpService = new TcpSvc();
tcpService.init();
