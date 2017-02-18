/**
 * New node file
 */
var MongoClient = require('mongodb').MongoClient;
var db2;
var connected = false;

/**
 * Connects to the MongoDB Database with the provided URL
 */
exports.connect = function(url, callback) {
	var options = {
		db : {
			numberOfRetries : 5
		},
		server : {
			auto_reconnect : true,
			poolSize : 90,
			socketOptions : {
				connectTimeoutMS : 5000
			}
		},
		replSet : {},
		mongos : {}
	};
	MongoClient.connect(url, options, function(err, _db2) {
		if (err) {
			throw new Error('Could not connect: ' + err);
		}
		db2 = _db2;
		connected = true;
		console.log(connected + " is connected?");
		callback(db2);
	});
};

/**
 * Returns the collection on the selected database
 */
exports.collection = function(name) {
	if (!connected) {
		throw new Error('Must connect to Mongo before calling "collection"');
	}
	return db2.collection(name);
};