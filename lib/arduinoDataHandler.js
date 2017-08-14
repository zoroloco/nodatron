var pathUtil = require('path'),
    events   = require('events'),
    util     = require('util');

module.exports = DataHandler;

function DataHandler(){
	var self         = this;
  this._inputData  = '';

  events.EventEmitter.call(this);

	if(this instanceof DataHandler === false){
		throw new TypeError("Classes can't be function-called.");
  }

  DataHandler.prototype.processRawData = function(data){
    if(Buffer.isBuffer(data)){
      var dataStr    = data.toString('ascii');//data.replace(/(\r\n|\n|\r)/gm,"");

      for(var i = 0; i < data.length; i++){
        if(dataStr.charAt(i) == '{'){
          self._inputData = '';
        }
        else if(dataStr.charAt(i) == '}'){
          this.emit("inputData",self._inputData);
          self._inputData = '';
        }
        else{
          self._inputData += dataStr.charAt(i);
          //log.info("Input data now built up to:"+self._inputData);
        }
      }
    }    
  }

}//constructor

util.inherits(DataHandler, events.EventEmitter);
