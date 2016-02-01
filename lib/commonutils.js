var cp      = require('child_process');

/**
 *
 * @param o - the var to be evaluated.
 * @returns {Boolean}
 */
function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}
/**
 *
 * @param v
 * @returns {Boolean}
 */
function isEmpty(v){
	return (v== undefined || v==null || v=='');
}

function createIpcMsg(){
  //message for inter-process communication
  var ipMessage = {
    "senderTitle"   : "",
    "receiverTitle" : "",
    "status"        : "", //0=shutdown complete
    "data"          : ""
  };
  return ipMessage;
}

/**
 *
 * @param cmd
 * @param cb
*/
function executeCommand(cmd,cb){
	var child = cp.exec(cmd ,function(error,stdout,stderr){
		if (stderr){
			cb(false,"Error executing command "+cmd+" with stderr:"+stderr);
		}
		if (error) {
			cb(false,"Error executing command "+cmd+" with error:"+error);
		}
		if(stdout){
			cb(true,cmd+" successfully executed with no errors.",stdout);
		}
	});
}

exports.isNumber       = isNumber;
exports.isEmpty        = isEmpty;
exports.executeCommand = executeCommand;
exports.createIpcMsg   = createIpcMsg;
