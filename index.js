const http2 = require('http2');
const fs = require('fs');
const proxy = require('http2-proxy');
const Logger = require('./my-transformer');
const trumpet = require('trumpet');

const server = http2.createSecureServer({
  key: fs.readFileSync('ssl/localhost-privkey.pem'),
  cert: fs.readFileSync('ssl/localhost-cert.pem'),
  allowHTTP1: true
});
server.on('error', (err) => console.error(err));

function getNewTrumpet(){
  let myTrumpet = trumpet();
  let writeStream = myTrumpet.select('h1').createWriteStream();
  writeStream.end('CHANGED');
  return myTrumpet;
}

function getFileWriter(filename){
  let dir = 'written';

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  if(!filename){
    filename = 'index.html';
  }
  return fs.createWriteStream('written/'+filename);
}

const onResponse = function (req, resOrSocket, proxyRes, callback) {
  const headers = proxyRes.headers;
  resOrSocket.statusCode = proxyRes.statusCode
  for (const [ key, value ] of Object.entries(headers)) {
    resOrSocket.setHeader(key, value)
  }
  let contentType = headers['content-type']  
  if(contentType && contentType.includes("text/html")){
    let transformer = getNewTrumpet();
    let filename = req.originalUrl || req.url;
    console.log('filename',filename);
    
    // let writer = getFileWriter(filename);
    let writer = getFileWriter();
    proxyRes.pipe(transformer).pipe(resOrSocket);
    proxyRes.pipe(writer);
  }else {
    proxyRes.pipe(resOrSocket);
  }
}

server.on('request', (req, res) => {
  proxy.web(req, res, {
    hostname: 'localhost',
    port: 8080,
    onRes: onResponse
  });
});

// const headersSymbol = Symbol('headers')
// server.on('stream', (stream, headers) => {
//   let req = stream;
//   let res = stream;
//   req.headers = headers;
//   req[headersSymbol] = headers;
  
//   proxy.web(req, res, {
//     hostname: 'localhost',
//     port: 8080,
//     onRes: onResponse
//   });
// });



console.log("listening to 8443");
server.listen(8443);