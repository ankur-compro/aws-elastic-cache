var Redis = require('ioredis');

var options = {
  "host": "test-cluster-enabled-0003-001.dwnzoe.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

//var redis = new Redis(options);

var redis = new Redis.Cluster([options]);

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

var redisKey = 's:baljinder';
console.log(redisKey);
 
setInterval(function() {
  redis.get(redisKey, function(err, response) {
    if(err) {
      console.log('error while getting redis key');
      console.log(err);
    } else {
      console.log('GET Redis Key : ' + redisKey + ' Response: ' +  response + ' @ ' + Date.now());
    }
  });
}, 500);
