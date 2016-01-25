var nodatron = require('../lib/nodatron.js');

var myNodatron = new nodatron(require('./conf.json'));

myNodatron.start();
