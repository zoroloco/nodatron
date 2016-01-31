module.exports = NodeChild;

function NodeChild(instance,title,keepAlive){
  this._cpInstance  = instance;
	this._cpTitle     = title;
	this._cpKeepAlive = keepAlive;

	var self          = this;

	if(this instanceof NodeChild === false){
		throw new TypeError("Classes can't be function-called.");
	}

	NodeChild.prototype.getInstance = function getInstance(){
		return self._cpInstance;
	}

	NodeChild.prototype.getTitle = function getTitle(){
		return self._cpTitle;
	}

	NodeChild.prototype.isKeepAlive = function isKeepAlive(){
		return self._cpKeepAlive;
	}
}//constructor
