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
    Object.defineProperty(this, "appDir", {
        get: () => {
          let arrDir = __dirname.split("\\")
          arrDir.pop()
          arrDir.pop()
          return arrDir.join("/")
        },
        enumerable: false
      }
    )

    this.pipe = (requestType, params) => {
      let dirClient = this.appDir + "/client"
      let filePath = dirClient + "/" + params.relPath
      this.responseWrapper.static(filePath)
    }

    this.include = (requestType, params) =>
    {
      if(requestType != "GET"){
        this.responseWrapper.console.error(403)
        return
      }
      let appDir = this.appDir
      let filePath =  `${appDir}/client/script/apps/${params.app}.json`
      let prmsLoadFile = getPrmsLoadFile(filePath)
      let prmsLoadModules = prmsLoadFile.then(
        (appJson) => {
          let services = appJson.services
          let arrServices = new Array()
          let prmsLoadServices = services.map(serviceName => {
              return getPrmsLoadService(appDir, serviceName, arrServices)
            }
          )

          let components = appJson.components
          let arrObjComponents = new Array()
          let prmsLoadComponents = components.map(componentName => {
              let dirPathComponent = `${appDir}/client/script/components/${componentName}`
              return getPrmsLoadComponents(dirPathComponent, componentName, arrObjComponents)
            }
          )
          let prmsLoaders = prmsLoadServices.concat(prmsLoadComponents)
          return Promise.all(prmsLoaders).then(() => {
                return new Promise((resolve, reject) => {
                  resolve({appJson, arrServices, arrObjComponents})
                }
              )
            }
          )
        }
      )
      prmsLoadModules.then(
        (obj) => {
          let moduleName = `${params.app}Module`
          let strApp = `var ${moduleName} = angular.module('${params.app}',[]);`
          obj.appJson.services.forEach(
            serviceName => {
              let serviceFunctionName = serviceName.charAt(0).toUpperCase() + params.app.slice(1)
              strApp += `\r\n${moduleName}.factory('${serviceName}', ${serviceFunctionName}Service);`
            }
          )
          obj.arrObjComponents.forEach(
            objComponent => {
              strApp += '\r\n' + getComponentDeclaration(moduleName, objComponent)
            }
          )
          obj.arrServices.forEach(service => strApp += `\r\n${service}`)
          obj.arrObjComponents.forEach(objComponent => strApp += `\r\n${objComponent.controller}`)
          //might make sense to cache strApp somewhere...
          this.responseWrapper.dynamic(strApp, "js")
        }
      )
    }
  }
}
function getPrmsLoadFile(filePath){
  return new Promise(
    (resolve, reject) => {
      mdlFs.readFile(
        filePath,
        "utf-8",
        (err, data) => {
          if (err){ throw err}
          let json = JSON.parse(data)
          resolve(json)
        }
      )
    }
  )
}
function getPrmsLoadService(appDir,serviceName, arrServices){
  return new Promise(
    (resolve, reject) => {
      let filePathService = `${appDir}/client/script/services/${serviceName}.js`
      mdlFs.readFile(
        filePathService,
        "utf-8",
        (err, data) => {
          if (err){ throw err}
          arrServices.push(data)
          resolve()
        }
      )
    }
  )
}
function getPrmsLoadComponentBindings(dirPathComponent, objComponent){
  return new Promise(
    (resolve, reject) => {
      let filePathComponentBindings = `${dirPathComponent}/${objComponent.name}Bindings.json`
      mdlFs.readFile(
        filePathComponentBindings,
        "utf-8",
        (err, data) => {
          if (err){ throw err}
          objComponent.bindings = data
          resolve()
        }
      )
    }
  )
}
function getPrmsLoadComponentController(dirPathComponent, objComponent){
  return new Promise(
    (resolve, reject) => {
      let filePathComponentController = `${dirPathComponent}/${objComponent.name}Controller.js`
      mdlFs.readFile(
        filePathComponentController,
        "utf-8",
        (err, data) => {
          if (err){ throw err}
          objComponent.controller = data
          resolve()
        }
      )
    }
  )
}
function getPrmsLoadComponentTemplate(dirPathComponent, objComponent){
  new Promise(
    (resolve, reject) => {
      let filePathComponentTemplate = `${dirPathComponent}/${objComponent.name}Template.html`
      mdlFs.readFile(
        filePathComponentTemplate,
        "utf-8",
        (err, data) => {
          if (err){ throw err}
          objComponent.template = data
          resolve()
        }
      )
    }
  )
}
function getPrmsLoadComponents(dirPathComponent, componentName, arrObjComponents){
  return new Promise(
    (resolve, reject) => {
      let objComponent = {name:componentName}
      arrObjComponents.push(objComponent)
      let prmsLoadComponentBindings = getPrmsLoadComponentBindings(dirPathComponent, objComponent)
      let prmsLoadComponentController = getPrmsLoadComponentController(dirPathComponent, objComponent)
      let prmsLoadComponentTemplate = getPrmsLoadComponentTemplate(dirPathComponent, objComponent )
      Promise.all(
        [
          prmsLoadComponentBindings,
          prmsLoadComponentController,
          prmsLoadComponentTemplate
        ]
      ).then(
        () => {
          resolve()
        }
      )
    }
  )
}
function getComponentDeclaration(moduleName, objComponent){
  let kebabName = objComponent.name.replace(/([A-Z])/g, '-$1')
  let componentFunctionName = objComponent.name.charAt(0).toUpperCase() + objComponent.name.slice(1)
  return `${moduleName}.component('${kebabName}',{
  bindings:${objComponent.bindings},
  controller:${componentFunctionName}Controller,
  template: "${objComponent.template.replace("\"","\\\"")}"
});`
}
