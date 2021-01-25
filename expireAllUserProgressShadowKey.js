var redis = require("redis");

var orgName = '*';
 
var options = {
  "host": "",
  "port": 
};

var client = redis.createClient(options.port, options.host);
if(options.password) {
  client.auth(options.password, function(err) {
      if(err) {
        console.log(err, { stats: 'count#redis.' + host + '~~' + type + '.connection.failed=1' },
         'Error while Authenticating to Redis Server for ' + type);
      }
    });
}

client.on('error', function (err) {
    console.log('Error ' + err);
});

client.on('connect', function() {
  console.log('Redis connect event');
});

client.on('ready', function() {
  console.log('Redis ready event');
});

client.keys('s:anal:' + orgName + ':analytics:user:*', function(err, keys) {
  if (err) {
    console.log('err');
    console.log(err);
  }
 else {
  console.log('Total Keys');
  console.log(keys.length);
  expireKey(keys);
 }
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
          console.log('Key: ' + userProgressToExpire + ' is going to expire in 1 second.');
          console.log('Keys left to expire: ' + keys.length);
          setTimeout(function() { expireKey(keys); }, 200);
        }
      });
    }
  }
  else {
    console.log('***********All Keys expired successfully**********');
    process.exit();
  }
}
