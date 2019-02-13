var redis = require("redis");

var options = {
  "host": "test-cluster-enabled-0001-001.dwnzoe.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

console.log('Creating Redis Client');
var client = redis.createClient(options.port, options.host);

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on('connect', function() {
  console.log('Redis connect event');
});

client.on('ready', function() {
  console.log('Redis ready event');
});

var redisKey = 's:cluster-enabled:shard-2:1';
console.log(redisKey);
 
var timestamp = Date.now();
client.set(redisKey, timestamp, function(err, response) {
  if(err) {
    console.log('error while setting redis key');
    console.log(err);
  } else {
    console.log('SET Redis Value : ' + timestamp);
  }
});
