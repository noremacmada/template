"use strict;"
const mdlServer = require("./app/server/server.js")
const mdlHttp = require("http")

const server = new mdlServer()
mdlHttp.createServer(server.requestHandler).listen(3000)
