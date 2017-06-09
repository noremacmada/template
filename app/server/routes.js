const mdlUrl = require("url")
const mdlFs = require("fs")
const mdlQuerystring = require("querystring")
const mdlResponseWrapper = require("./response-wrapper.js")

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
        getParams: (path) => {return {relPath: path.replace("www/")}}
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
    let inst = new mdl()
    let methods = Object.keys(inst)
      .filter(key => typeof(inst[key]) === "function")
      .map(key => {return {name: key.toLowerCase(), method:key}})

    this.handlers[inst.className.toLowerCase()] = {
      mdlHandler: mdl,
      methods: methods
    }
  }

  getHandlerMetadata(request, data){
    let handlerMetadata = {requestType: request.method}
    let path = mdlUrl.parse(request.url).pathname.substring(1).toLowerCase();
    let overrides = this.overrides.filter(
      override =>
        path.match(override.pattern) != null
    )
    let isOverridden = overrides.length > 0
    if(isOverridden){
      handlerMetadata.handlerName = overrides[0].handlerName
      handlerMetadata.methodName = overrides[0].methodName
      handlerMetadata.params = overrides[0].getParams()
    }
    else{
      let arrPath = path.split("/")
      handlerMetadata.handlerName= arrPath[0] != "" ? arrPath[0] : "default"
      handlerMetadata.methodName = arrPath.length > 1 && arrPath[1] != "" ? arrPath[1] : "default"
      handlerMetadata.params = Object.assign(
        mdlQuerystring.parse(mdlUrl.parse(request.url).query),
        mdlQuerystring.parse(data)
      )
    }
    return handlerMetadata
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
      handler[methodName](
        handlerMetadata.requestType,
        handlerMetadata.params,
        response
      )
    }
    else{
      let responseWrapper = new ResponseWrapper(response)
      responseWrapper.error(404)
    }
  }
}
