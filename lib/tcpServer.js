var pathUtil = require('path'),
    net      = require('net'),
    os       = require('os'),
    _        = require('underscore'),
    log      = require(pathUtil.join(__dirname,'./logger.js'));

    function TcpServer(port){
    	var self     = this;
      this._port   = port;
      this._server;

      //log.info("Echoing out network settings of the server:"+JSON.stringify(os.networkInterfaces()));

    	TcpServer.prototype.shutdown = function(cb){
    		log.warn("Shutting down tcp server.");
        if(!_.isEmpty(self._server)){

          //12 second timeout to close connections.
          setTimeout(function(){
            log.warn("Timeout occurred while waiting to close client connections.");
            cb();
          },12000);

          self._server.close(function(){
           log.info("TCP Server gracefully closed.");
           cb();
         });
        }
    	}

    	TcpServer.prototype.connect = function(onConnection,onReceiveData,onServerError){

        self._server = net.createServer((socket) => {
          log.info("Client has connected on port:"+self._port);
          onConnection(socket.localAddress);

          //if(socket.write("write to client")){}
          socket.on('data', (data) =>{
            log.info("Received data on socket:"+data);
            onReceiveData(data);
          });

          socket.on('end', () => {
            log.warn("Client has disconnected.");
          });
        })

        //check the number of active connections
        self._server.getConnections(function(err,count){
          if(err){
            log.error("Error determining socket connection count:"+err);
          }
          else{
            log.info("Sockets connected = "+count);
          }
        });

        self._server.listen(self._port, () => {
           log.info("TCP server now bound to "+JSON.stringify(self._server.address()));
        });

        self._server.on('error', (e) => {
          if (e.code == 'EADDRINUSE') {
            log.error("Address in use.");
            onServerError();
          }
        });

        //server close event emitted.(can be called from an error or explicitly)
        self._server.on('close', (e) =>{
          log.info("TCP Server has been closed.");
        });

        //call onServerError() when tcp issue occurs.
    	}//connect


    }//TcpServer

    module.exports = TcpServer;
