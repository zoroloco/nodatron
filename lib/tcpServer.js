var pathUtil = require('path'),
  	utils    = require(pathUtil.join(__dirname,'./commonutils.js'));

    function TcpServer(log,host,port){
    	var self     = this;
    	this._log    = log;

    	TcpServer.prototype.shutdown = function(){
    		self._log.warn("Shutting down tcp server.");
    	}

    	TcpServer.prototype.connect = function(onReceiveData,onLostConnection){
        //onReceiveData(33);

        //call onLostConnection() when tcp issue occurs.
    	}
    }//TcpServer

    module.exports = TcpServer;
