"use strict;"
const mdlRoutes = require("./routes.js")

module.exports = class Server{
  constructor(){
    //load session ref
    //load db ref
    //load route ref
    this.routes = new mdlRoutes()
  }

  requestHandler(request, response) {
    //authenticate
    //route
    //authorize
    //handle
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write("Helloah");
    response.end();
  }

}
