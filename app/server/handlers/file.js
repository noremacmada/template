const mdlDefault = require("./default.js")
const mdlFs = require("fs")
module.exports = class File extends mdlDefault{
  constructor(response){
    super(response)
    Object.defineProperty(this, "isAuthReqd", {
        get: () => false,
        enumerable: false
      }
    )
    this.getAppDir(){
      let arrDir = __dirname.split("\\")
      arrDir.pop()
      arrDir.pop()
      return arrDir.join("/")
    }
    this.pipe = (requestType, params) => {
      let dirClient = this.getAppDir() + "/client"
      let filePath = dirClient + "/" + params.relPath
      this.responseWrapper.static(filePath)
    }
    this.include(requestType, params)
    {
      if(requestType != "GET"){
        this.responseWrapper.console.error(403)
        return
      }
      let appDir = this.getAppDir()
      let filePath =  `${appDir}/client/script/apps/${params.app}.json`
      let prmsLoadFile = new Promise(
        (resolve, reject) => {
          fs.readFile(
            filePath,
            (err, data) => {
              if (err){ throw err}
              let json = JSON.parse(data)
              resolve(json)
            }
          )
        }
      )
      let appJson = prmsLoadFile()
      let services = appJson.services
      let prmsLoadServices = services.map(
        serviceName => {
          return new Promise(
            (resolve, reject) =>
            {
              let filePathService = `${appDir}/client/script/services/${serviceName}.js`
              fs.readFile(
                filePathService,
                (err, data) => {
                  if (err){ throw err}
                  resolve(data)
                }
              )
            }
          )
        }
      )
      let arrServices = new Array()
      Promise.all(prmsLoadServices).then(data => arrServices.push(data))

      let components = appJson.components
      let prmsLoadComponents = components.map(
        componentName => {
          let dirPathComponent = `${appDir}/client/script/components/${componentName}`
          return new Promise(
            (resolve, reject) => {
              let objComponent = {name:componentName}
              let prmsLoadBindings = new Promise((resolve, reject) => {
                let filePathComponentBindings = `${dirPathComponent}/${componentName}Bindings.json`
                fs.readFile(
                  filePathComponentBindings,
                  (err, data) => {
                    if (err){ throw err}
                    objComponent.bindings = data
                    resolve()

                  }
                )
              })
              let prmsLoadController = new Promise((resolve, reject) => {
                let filePathComponentController = `${dirPathComponent}/${componentName}Controller.js`
                fs.readFile(
                  filePathComponentController,
                  (err, data) => {
                    if (err){ throw err}
                    objComponent.controller = data
                    resolve()
                  }
                )
              })
              let prmsLoadTemplate = new Promise((resolve, reject) => {
                let filePathComponentTemplate = `${dirPathComponent}/${componentName}Template.html`
                fs.readFile(
                  filePathComponentTemplate,
                  (err, data) => {
                    if (err){ throw err}
                    objComponent.template = data
                    resolve()
                  }
                )
              })
              Promise.all([prmsLoadBindings, prmsLoadController, prmsLoadTemplate])
              .then(
                () => {
                  resolve(objComponent)
                }
              )
            }
          )
        }
      )
      let arrObjComponents = new Array()
      Promise.all(prmsLoadComponents).then(obj => arrObjComponents.push(obj))
      let moduleName = `${params.app}Module`
      let strApp = `var ${moduleName} = angular.module('${params.app}',[]);`
      services.forEach(
        serviceName =>
          let serviceFunctionName = serviceName.charAt(0).toUpperCase() + params.app.slice(1)
          strApp += `\r\n${moduleName}.factory('${serviceName}', ${serviceFunctionName}Service);`
      )
      arrObjComponents.forEach(
        objComponent => {
          let componentName = objComponent.name.replace(/([A-Z])/g, '-$1')
          let componentFunctionName = componentName.charAt(0).toUpperCase() + params.app.slice(1)
          strApp += `\r\n${moduleName}.component('${kebabName}',{
  bindings:${objComponent.bindings},
  controller:${componentFunctionName}Controller,
  template: "${objComponent.template.replace("\"","\\\"")}"
});`
        }
      )
      arrServices.forEach(service => strApp += `\r\n${service}`)
      arrObjComponents.forEach(objComponent => strApp += `\r\n${objComponent.controller}`)
      //might make sense to cache this somewhere...
      this.responseWrapper.dynamic(strApp, "js")
    }
  }
}
