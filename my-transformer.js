const util = require('util');
const stream = require('stream');

module.exports = function Logger(options) {
  return MyLogger.call(this, options);
}

function MyLogger(options) {
  // allow use without new
  if (!(this instanceof MyLogger)) {
    return new MyLogger(options);
  }

  // init Transform
  stream.Transform.call(this, options);
  // stream.Writable.call(this);
}
util.inherits(MyLogger, stream.Transform);

MyLogger.prototype._transform = function (chunk, enc, cb) {
  // console.log("chunk start"); 
  // console.log(Buffer.from(chunk).toString('utf8'));
  // console.log("chunk end");
  this.push(chunk);
  cb();
};

// util.inherits(MyLogger, stream.Writable);

// MyLogger.prototype._write = function (chunk, encoding, done) { // step 3
//     console.log(chunk.toString());
//     done();
//   }