var AWS = require('aws-sdk');

var aws = new AWS.S3({
    accessKeyId: '',
    secretAccessKey: '',
    maxRetries: 7,
    region: 'us-west-2',
    signatureVersion: 'v4'
  });

var options = {
    Bucket: '',
    Key: 'big-1mb-json-file.json'
  };
  
aws.getObject(options, function(err, reponse) {
    if(err) { console.log('error'); console.log(err); }
    else {
      try {
        var buffer = new Buffer(reponse.Body, 'base64');
        var objectJSON = buffer.toString('utf-8');
        objectJSON = JSON.parse(objectJSON);
        console.log(objectJSON);
      }
      catch(e) {
        console.log('error');
        console.log(e);
      }
    }
  });
