'use strict;'
const mdlServer = require("./app/server/server.js")
const mdlHttps = require("https")
const mdlFs = require('fs');

const options = {
  key: mdlFs.readFileSync('app/server/ssl/localhost.key'),
  cert: mdlFs.readFileSync('app/server/ssl/localhost.cert')
};

const server = new mdlServer()
mdlHttps.createServer(options, server.requestHandler).listen(3000)
