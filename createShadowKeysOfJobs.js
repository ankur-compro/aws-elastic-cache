var redis = require('redis');

var options = {
  'host': '',
  'port': '',
  'password': ''
};

var client = redis.createClient(options.port, options.host);
if(options.password) {
  client.auth(options.password, function(err) {
      if(err) {
        console.log(err, { stats: 'count#redis.' + options.host + '~~' + options.type + '.connection.failed=1' },
         'Error while Authenticating to Redis Server for ' + options.type);
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

  client.keys('s:auth:org:*:job:*', function(err, keys) {
    if (err) {
      console.log('err');
      console.log(err);
    }
    console.log('Total Keys');
    console.log(keys.length);
    expireKey(keys);
  });
});


function expireKey(keys) {
  if(keys.length) {
    var jobKey = keys.pop();
    var jobExpireKey = 'i:' + jobKey;
    console.log(' job which is going to expire: ' + jobExpireKey);
    client.setex(jobExpireKey, (60*60*24*7), '', function(err) {
      if(err) {
        console.log('err');
        console.log(err);
      }
      else {
        console.log('Key: ' + jobExpireKey + ' set.');
        console.log('Keys left to expire: ' + keys.length);
        setTimeout(function() { expireKey(keys); }, 50);
      }
    });
  }
  else {
    console.log('***********All Keys expired successfully**********');
  }
}
