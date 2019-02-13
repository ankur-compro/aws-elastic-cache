//var redis = require("redis");
var Redis = require('ioredis');

var options = {
  "host": "test-clstr-enabled-2.dwnzoe.clustercfg.usw2.cache.amazonaws.com",
  "port": 6379
};

var redis = new Redis(options);

console.log('Creating Redis Client');

redis.on("error", function (err) {
    console.log("Error " + err);
});

redis.on('connect', function() {
  console.log('Redis connect event');
});

redis.on('ready', function() {
  console.log('Redis ready event');
});

var redisKey = 's:cluster-enabled-2:config:1';
console.log(redisKey);
 
var timestamp = Date.now();

redis.set(redisKey, timestamp, function(err, response) {
  if(err) {
    console.log('error while setting redis key');
    console.log(err);
  } else {
    console.log('SET Redis Value : ' + timestamp);
  }
});
