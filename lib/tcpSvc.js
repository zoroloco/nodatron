var util   = require("util"),
	pathUtil = require('path'),
	Svc      = require(pathUtil.join(__dirname,'./svc.js')),
	utils    = require(pathUtil.join(__dirname,'./commonutils.js')),
  tcpServer= require(pathUtil.join(__dirname,'./tcpServer.js'));

process.title = "tcpSvc";

function TcpSvc(){
	var self        = this;
	this._port      = '';
  this._tcpServer = '';

	TcpSvc.super_.call(this);//call Svc constructor

	process.argv.forEach(function (val, index, array){
		if(val == '-port' && array.length>=index+1){
			self._port = process.argv[index+1];
		}
	});

	if(utils.isEmpty(this._port)){
		this._log.error("--port is a required parameter.");
		process.exit(1);
	}
	else{
		this._log.info("Port set to:"+this._port);
	}

	TcpSvc.prototype.init = function(){
		self._log.info("Initializing TCP service.");

		//create the tcp connection
		self._tcpServer = new tcpServer(self._log,self._port);

    self._tcpServer.connect(function(data){
      self._log.info("Received data from TCP server:"+data);

      if(!utils.isEmpty(data)){
				self._ipMsg.senderTitle   = process.title;
				self._ipMsg.receiverTitle = "robotSvc";
				self._ipMsg.status        = "";
				self._ipMsg.data          = data.toString('utf8');

	      self.send(self._ipMsg);//send data up to Nodatron
			}
			else{
				self._info.log("Data from client was empty.");
			}
    },function(){
      self._log.error("TCP Server died.");
      self.shutdown();
    });

		process.on('SIGINT', function() {
			self._log.warn("Got SIGINT signal. Exiting process.");
			self.shutdown();
		});

		process.on('SIGTERM', function() {
			self._log.warn("Got SIGTERM kill signal. Exiting process.");
			self.shutdown();
		});

		process.on('uncaughtException', function(err) {
			self._log.error("Caught exception: " + err);
			self.shutdown();
		});

		process.on('message', function(data) {
			if(!utils.isEmpty(data)){
				this._log.info("Received data from parent process.");
				var parsedData = JSON.parse(data);
			}
		});
	}

	//graceful shutdown.
  TcpSvc.prototype.shutdown = function(){
        try{
            if(!utils.isEmpty(self._tcpServer)){
				        self._tcpServer.shutdown(function(){
						    		self._log.info("Now exiting...");
										process.exit();
								});
			      }
						else{
							self._log.info("Now exiting...");
				      process.exit();
						}
        }
        catch(e){
        	self._log.warn("Could not shutdown tcp server - "+e);
					process.exit();
        }
	}
}

util.inherits(TcpSvc,Svc);

//start this service.
var tcpService = new TcpSvc();
tcpService.init();
