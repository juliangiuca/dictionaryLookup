var Whoisjs = require('whoisjs').whois;
var fs = require('fs');
var Q = require('q')
var _ = require('underscore')

var who = new Whoisjs();
var openDict = function() {
  var deferred = Q.defer();

  fs.readFile('/usr/share/dict/words', {"encoding": "utf-8"}, function (err, text) {
    if (err) { 
      deferred.reject(new Error(err)) 
    } else {
      deferred.resolve(text) 
    }
  })

  return deferred.promise;
}

var writeWord = function(word) {
  if (_.isUndefined(word) || _.isNull(word)) { return }

  fs.appendFileSync("words.txt", word)
}

var lookUp = function(word) {
  var deferred = Q.defer();
  console.log("Looking up " + word);

  who.query(word + ".com", function (result) {
    if (result.available()) {
      deferred.resolve(word + "\n");
    } else {
      deferred.reject();
    }
  });

  return deferred.promise;
}

openDict()
.then( function (text) {
  return text.split("\n")
}).then( function (arrayOfWords) {
  return _.select(arrayOfWords, function (word) { return word.length >= 4 } )
}).then(function (groomedWords) {
  var allPromises = _.each(groomedWords, function (word) { return lookUp(word).then(function (word) { writeWord(word) } )});
});
