const mdlFs = require("fs")
const mdlResponseWrapper = require("./response-wrapper.js")
const mdlUrl = require("url")
const mdlQuerystring = require("querystring")

module.exports = class Router{
  constructor(){
    this.handlers = new Object()
    this.loadHandlers()
    this.overrides = [
      {
        name: "fileHandler",
        pattern: "www/.*/.*\.",
        handler: "file",
        method: "pipe",
        getParams: (path) => {
          return {relPath: path.replace("www/","")}
        }
      }
    ]
  }

  loadHandlers(){
    let pathHandlers = __dirname + "\\handlers"
    let arrFiles = mdlFs.readdirSync(pathHandlers)
    let arrJsFiles = arrFiles.filter(file => file.match(".+\..js") != null)
    arrJsFiles.forEach(this.loadHandler.bind(this))
  }

  loadHandler(fileName){
    let mdl = require("./handlers/" + fileName)
    let rspnsMock = {setHeader: () => {}}
    let inst = new mdl(rspnsMock)
    let methods = Object.keys(inst)
      .filter(key => typeof(inst[key]) === "function")
      .map(key => {return {name: key.toLowerCase(), method:key}})

    this.handlers[inst.className.toLowerCase()] = {
      mdlHandler: mdl,
      methods: methods
    }
  }

  getHandlerName(request){
    let handlerName = "";
    let path = mdlUrl.parse(request.url).pathname.substring(1).toLowerCase();
    let overrides = this.overrides.filter(
      override =>
        path.match(override.pattern) != null
    )
    let isOverridden = overrides.length > 0
    if(isOverridden){
      handlerName = overrides[0].handler
    }
    else{
      let arrPath = path.split("/")
      handlerName= arrPath[0] != "" ? arrPath[0] : "default"
    }
    return handlerName
  }

  getHandlerMetadata(request){
    let handlerMetadata = {
      sessionId: request.sessionId,
      requestType: request.method,
      user: request.user,
      path: mdlUrl.parse(request.url).pathname.substring(1).toLowerCase()
    }
    let overrides = this.overrides.filter(
      override =>
        handlerMetadata.path.match(override.pattern) != null
    )
    handlerMetadata.isOverridden = overrides.length > 0
    if(handlerMetadata.isOverridden){
      handlerMetadata.handlerName = overrides[0].handler
      handlerMetadata.methodName = overrides[0].method
      handlerMetadata.params = overrides[0].getParams(handlerMetadata.path)
    }
    else{
      let arrPath = handlerMetadata.path.split("/")
      handlerMetadata.handlerName= arrPath[0] != "" ? arrPath[0] : "default"
      handlerMetadata.methodName = arrPath.length > 1 && arrPath[1] != "" ? arrPath[1] : "default"
      handlerMetadata.params = mdlQuerystring.parse(mdlUrl.parse(request.url).query)
    }
    return handlerMetadata
  }

  isAuthReqd(handlerMetadata){
    let mdlHandler = this.handlers[handlerMetadata.handlerName].mdlHandler
    return new mdlHandler({setHeader: () => {}}).isAuthReqd

  }
  handle(handlerMetadata, response){
    let objHandler = this.handlers[handlerMetadata.handlerName]
    let arrMethods = objHandler == null
      ? null
      : objHandler.methods.filter(objMethod => objMethod.name == handlerMetadata.methodName)
    let objMethod = arrMethods != null && arrMethods.length == 1 ? arrMethods[0] : null
    if(objMethod != null){
      let handler = new objHandler.mdlHandler(response)
      let methodName = objMethod.method
      try{
        handler[methodName](
          {
            requestType: handlerMetadata.requestType,
            user: handlerMetadata.user,
            sessionId: handlerMetadata.sessionId
          },
          handlerMetadata.params,
          response
        )
      }
      catch(err){
        let responseWrapper = new mdlResponseWrapper(response)
        responseWrapper.error(500, err.stack)
      }
    }
    else{
      let responseWrapper = new mdlResponseWrapper(response)
      responseWrapper.error(404)
    }
  }
}
