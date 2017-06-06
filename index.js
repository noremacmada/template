"use strict;"
const serverNs = require("./app/server/server.js")
const server = new serverNs()
const http = require("http")
http.createServer(server.requestHandler).listen(3000)
