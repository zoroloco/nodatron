//logger singleton.
var winston  = require('winston'),
    pathUtil = require('path'),
	  fs       = require('fs'),
    _        = require('underscore');

var properties = null;//private

var log = new (winston.Logger)({//create the default console logger.
  transports: [
  new (winston.transports.Console)({'timestamp' : true,'colorize': true})],
  exitOnError: false
});

var self = module.exports = {

  /*
    Init should pass in an object that looks like the following:

  {
    "enabled" : true,
    "dir"     : ""
  }
  */
  init: function init(props){
    properties = props;

    if(!_.isEmpty(properties)){
      if(properties.enabled){
        if(!_.isEmpty(properties.dir)){
          //create the log dir if it does not already exist.
      		try {
      		   log.info("Creating log directory:"+properties.dir);
      		   fs.mkdirSync(properties.dir);
      		}
      		catch(e) {
      		   if ( e.code != 'EEXIST' ){
               log.error("Log directory already exists. "+properties.dir);
      			   throw e;
      		   }
      		}

          log = new (winston.Logger)({
        		  transports: [
        			new (winston.transports.Console)({'timestamp' : true,'colorize': true})
        			,new winston.transports.File({ filename: pathUtil.join(properties.dir,process.title+"_"+"error.log"), name:'file.error',
        				level: 'error','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
        			,new winston.transports.File({ filename: pathUtil.join(properties.dir,process.title+"_"+"warn.log"), name:'file.warn',
        				level: 'warn','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
        			,new winston.transports.File({ filename: pathUtil.join(properties.dir,process.title+"_"+"info.log"), name:'file.info',
        				level: 'info','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
        		  ],
        		  exceptionHandlers: [
        			new (winston.transports.Console)({'timestamp' : true,'colorize': true})
        			,new winston.transports.File({ filename: pathUtil.join(properties.dir,process.title+"_"+"exception.log"),
        				level: 'error','maxsize':4194304,'maxFiles':256 })
        		  ],
        		  exitOnError: false
        		});

            log.info("Log files will be located in:"+properties.dir);
        }
      }
    }
  },

  info: function info(msg){
    log.info(process.title+":"+msg);
  },

  warn: function warn(msg){
    log.warn(process.title+":"+msg);
  },

  error: function error(msg){
    log.error(process.title+":"+msg);
  }

};
