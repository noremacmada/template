const mdlRoutes = require("./routes.js")
const mdlAuthentication = require("./authentication.js")
const mdlAuthorization = require("./authorization.js")
const mdlResponseWrapper= require("./response-wrapper.js")
//load route ref
const routes = new mdlRoutes()
const authentication = new mdlAuthentication()
const authorization = new mdlAuthorization()

module.exports = class Server{
  constructor(){ }

  requestHandler(request, response) {
    //authenticate
    authentication.setSessionId(request, response)

    //route
    let handlerMetadata = routes.getHandlerMetadata(request)

    //authorize
    let isUnathorized =
      routes.isAuthReqd(handlerMetadata)
      && !authorization.isAuthorized(request, handlerMetadata)
    if(isUnathorized){
      let responseWrapper = new mdlResponseWrapper(response)
      if(request.user == null){
        responseWrapper.redirect("www/content/login.html")
        return
      }
      else{
        responseWrapper.error(401)
        return
      }
    }

    //handle
    let data = null
    request.addListener("data", (chunk) => {data += chunks})
    request.addListener(
      "end",
      () => {
        //handle
        handlerMetadata.params = handlerMetadata.isOverridden
          ? handlerMetadata.getParams(handlerMetadata.path)
          : Object.assign(
              mdlQuerystring.parse(mdlUrl.parse(request.url).query),
              mdlQuerystring.parse(data)
            )
        routes.handle(handlerMetadata, response)
      }
    )
  }
}
