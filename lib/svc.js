var pathUtil = require('path'),
    _        = require('underscore'),
    log      = require(pathUtil.join(__dirname,'./logger.js')),
	  utils    = require(pathUtil.join(__dirname,'./commonutils.js'));

module.exports = Svc;

function Svc(){
	this._debug       = false;
  this._ipMsg       = utils.createIpcMsg();
  this._loggerProps = null;

	var self         = this;
	var processTitle = null;

	if(this instanceof Svc === false){
		throw new TypeError("Classes can't be function-called.");
	}

	//process command-line arguments common across all services.
	process.argv.forEach(function (val, index, array){

		if(val == '-debug'){
			this._debug = true;
		}

		if(val == '-title' && array.length>=index+1){
			processTitle = process.argv[index+1];
		}

    if(val == '-logger' && array.length>=index+1){
      this._loggerProps = JSON.parse(process.argv[index+1]);
    }
	});

	//validate arguments
	if(_.isEmpty(processTitle)){
		log.error("Process title is a required argument. Please run with -title")
		process.exit(1);
	}

	process.title = processTitle;

	Svc.prototype.send = function send(msg){
		if(!self._debug){
			process.send(msg);
		}
		else{
			log.info(msg);
		}
	}
}//constructor
