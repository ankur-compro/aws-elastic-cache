var redis = require("redis");

var options = {
  "host": "test-clstr-enabled-2.dwnzoe.clustercfg.usw2.cache.amazonaws.com",
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

var redisKey = 's:cluster-enabled-2:config:1';
console.log(redisKey);
 
var timestamp = Date.now();

console.log('client');
console.log(client);
client.set(redisKey, timestamp, function(err, response) {
  if(err) {
    console.log('error while setting redis key');
    console.log(err);
  } else {
    console.log('SET Redis Value : ' + timestamp);
  }
});
