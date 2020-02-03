var redis = require("redis");

var options = {
  "host": process.env.REDIS_HOST,
  "port": process.env.REDIS_PORT,
  "password": process.env.REDIS_PASSWORD
};

var timeoutDelay = 100;

var client = redis.createClient(options.port, options.host);
if(options.password) {
  client.auth(options.password, function(err) {
      if(err) {
        console.log(err, { stats: 'count#redis.' + options.host + '~~' + 'core' + '.connection.failed=1' },
         'Error while Authenticating to Redis Server for core');
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
  client.keys('s:*job*', function(err, keys) {
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
    client.hmget(jobKey, ['status', 'itype'], function(err, values) {
      var itype = values[1] || '';
      if(!err && (values[0] === 'completed' || itype.startsWith('pub-'))) {
        client.setex( 'i:' + jobKey, 1, '', function(err) {
          if(err) { console.log("err while exping key: "+jobKey); }
          else {
            console.log('Key: ' + jobKey + ' has expired.');
            console.log('Keys left to expire: ' + keys.length);
            setTimeout(function() { expireKey(keys); }, timeoutDelay);
          }
        });
      }
      else {
        expireKey(keys);
      }
    });
  }
  else {
    console.log('***********All Keys expired successfully**********');
  }
}
