
var p = '/default?access_token' + token + '&limit=10';

var request = require('request');
var Q = require('q');

function checkSubmissions() {

}

function getAndCheck(org, cursor) {
	var deferred = Q.defer();
	var path = url + '/aberystwyth-thor' + p;
	request.get(path, function(err, res, body) {
		console.log(body)
	})
}

getAndCheck();
