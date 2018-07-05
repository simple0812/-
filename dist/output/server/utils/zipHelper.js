var fs = require('fs');
var Promise = require('bluebird');
var zipper = require('zip-local');

function zip(srcPath, destFileName) {
  return new Promise((resolve, reject) => {
    zipper.zip(srcPath, function(err, zipped) {
      if(err) return reject(err);
      zipped.compress(); 
      var buff = zipped.memory();
      zipped.save(destFileName, function(error) {
        if(error) return reject(error);
        resolve();
      });
    });
  })
}

export { zip };
