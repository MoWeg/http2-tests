const http2 = require('http2');
const fs = require('fs');
const finalhandler = require('finalhandler');
const proxy = require('http2-proxy');

const server = http2.createSecureServer({
  key: fs.readFileSync('ssl/localhost-privkey.pem'),
  cert: fs.readFileSync('ssl/localhost-cert.pem')
});
server.on('error', (err) => console.error(err));



const defaultWebHandler = (err, req, res) => {
  if (err) {
    console.error('proxy error', err)
    finalhandler(req, res)(err)
  }
}

server.on('request', (req, res) => {
    proxy.web(req, res, {
      hostname: 'localhost',
      port: 8080
    }, defaultWebHandler)
  });

console.log("listening to 8443");
server.listen(8443);