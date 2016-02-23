var pathUtil = require('path'),
	  utils    = require(pathUtil.join(__dirname,'../commonutils.js'));

module.exports = ComponentBase;

function ComponentBase(){
	var self         = this;

	if(this instanceof ComponentBase === false){
		throw new TypeError("Classes can't be function-called.");
	}

}//constructor
