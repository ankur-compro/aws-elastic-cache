var redis = require("redis");
 
//var redisBatch = new RedisBatch(redis, { flushAfter: 3000 });


//var _und = require('underscore');
var options = {
  "host": "thor-analytics.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

var client = redis.createClient(options.port, options.host);

client.on('error', function (err) {
    console.log('Error ' + err);
});

client.on('connect', function() {
  console.log('Redis connect event');
});

client.on('ready', function() {
  console.log('Redis ready event');
});

client.keys('s:anal:*:analytics:user:*', function(err, keys) {
  if (err) {
    console.log('err');
    console.log(err);
  }
  console.log('Total Keys');
  console.log(keys.length);
  expireKey(keys);
});


function expireKey(keys) {
  if(keys.length) {
    var userProgressKey = keys.pop();
    var splittedLastItemUserProgress = userProgressKey.split(':').pop();
    if(splittedLastItemUserProgress === 'userstate') {
      expireKey(keys);
    }
    else {
      var userProgressToExpire = 'i:' + userProgressKey;
      console.log('UserProgress Key which is going to expire: ' + userProgressToExpire);
      client.setex(userProgressToExpire, 1, '', function(err) {
        if(err) {
          console.log('err');
          console.log(err);
        }
        else {
          console.log('Key: ' + userProgressToExpire + ' has expired.');
          console.log('Keys left to expire: ' + keys.length);
          setTimeout(function() { expireKey(keys); }, 5000);
        }
      });
    }
  }
  else {
    console.log('***********All Keys expired successfully**********');
  }
}
