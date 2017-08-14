var cp          = require('child_process'),
    pathUtil    = require('path'),
    _           = require('underscore'),
    dataHandler = require(pathUtil.join(__dirname,'./arduinoDataHandler.js'));

function Arduino(device,baud){
	var self                 = this;
  this._serialInConnected  = false;
  this._serialOutConnected = false;
	this._cmd                = pathUtil.join(__dirname,"arduinoSerial.py");
  this._dataHandler        = new dataHandler();
	this._arduino            = null;

	Arduino.prototype.shutdown = function(){
		if(!_.isEmpty(self._arduino)){
		    process.kill(self._arduino.pid);//clean-up python serial connection
		}
	}

	Arduino.prototype.connect = function(onConnected,onReceiveData,onDisconnected){
    var self = this;

		this._arduino = cp.spawn('python',
		                       [self._cmd,
							   "--device",device,"--baud",baud]);

    this._arduino.stdin.setEncoding('utf-8');

		//data came in from Arduino
		this._arduino.stdout.on('data', (data) => {
			this._dataHandler.processRawData(data);
		});

		this._arduino.stderr.on('data', (data) => {
	      onDisconnected("stderr on serial connection:"+data);
		});

		this._arduino.on('error', (err) => {
			  onDisconnected("error on serial connection:"+err);
		});

		this._arduino.on('close', (code) => {
        onDisconnected("Serial connection closed.");
		});

		this._arduino.on('exit', (code) => {
			onDisconnected("Serial connection exited.");
		});

    this._dataHandler.on('inputData',function(data){
      if(!self._serialInConnected || !self._serialOutConnected){
        var splitData = data.split(":");
        if(!_.isEmpty(splitData[0])){

          if(splitData[0] == 'SERIALPY'){
              if(splitData[1] == 'CONNECTED-SerialIn'){
                console.info("Serial-In process connected.");
                self._serialInConnected = true;
              }
              else if(splitData[1] == 'CONNECTED-SerialOut'){
                console.info("Serial-Out process connected.");
                self._serialOutConnected = true;
              }

              if(self._serialInConnected && self._serialOutConnected){
                onConnected();
              }
          }

        }
      }
      else{
        onReceiveData(data);
      }
    });
	}

  //send a command down to the Arduino.
	Arduino.prototype.sendCommand = function(cmd){
		if(!_.isEmpty(self._arduino)){
			this._arduino.stdin.write(cmd);//just send down raw
		}
    else{
      console.error("Serial client cannot send message:"+cmd);
    }
	}

}//arduino

module.exports = Arduino;
