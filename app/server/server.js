"use strict;"
const mdlRoutes = require("./routes.js")
//load route ref
const routes = new mdlRoutes()

module.exports = class Server{
  constructor(){
    //load session ref
    //load db ref
  }

  requestHandler(request, response) {
    //authenticate
    //route
    let data = null
    request.addListener(
      "data",
      (chunk) => {data += chunks}
    )
    request.addListener(
      "end",
      () => {
        let handlerMetadata = routes.getHandlerMetadata(request, data)
        //authorize
        //handle
        routes.handle(handlerMetadata, response)
      }
    )

  }

}
