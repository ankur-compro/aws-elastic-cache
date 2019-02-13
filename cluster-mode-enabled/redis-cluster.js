var RedisClustr = require('redis-clustr');
 
var redis = new RedisClustr({
  servers: [
    {
      host: 'test-cluster-enabled.dwnzoe.clustercfg.usw2.cache.amazonaws.com',
      port: 6379
    }
  ]
});
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

setInterval(
  function() {
    redis.set(redisKey + ':' + Date.now(), timestamp, function(err, response) {
      if(err) {
        console.log('error while setting redis key');
        console.log(err);
      } else {
        console.log('SET Redis Value : ' + timestamp);
      }
    });
}, 1000);
