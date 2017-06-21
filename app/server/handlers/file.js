const mdlDefault = require("./default.js")
const mdlFs = require("fs")
const newLine = require("os").EOL

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

    this.pipe = (serverData, params) => {
      let dirPublic = this.appDir + "/client/public"
      let filePath = dirPublic + "/" + params.relPath
      this.responseWrapper.static(filePath)
    }

    this.include = (serverData, params) =>
    {
      if(serverData.requestType != "GET"){
        this.responseWrapper.console.error(403)
        return
      }
      let appDir = this.appDir
      let filePath =  `${appDir}/client/ngapp/apps/${params.app}.json`
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
              let dirPathComponent = `${appDir}/client/ngapp/components/${componentName}`
              return getPrmsLoadComponents(dirPathComponent, componentName, arrObjComponents)
            }
          )
          let prmsLoaders = prmsLoadServices.concat(prmsLoadComponents)
          return Promise.all(prmsLoaders).then(() => {
                return new Promise((resolve, reject) => {
                  resolve({appJson, arrServices, arrObjComponents})
                }
              ).catch(err => this.responseWrapper.error(500, "Error loading modules"))
            }
          )
        }
      )
      prmsLoadModules.then(
        (obj) => {
          let moduleName = `${params.app}Module`
          let strApp = getStrApp(moduleName, params, obj)
          //might make sense to cache strApp somewhere...
          this.responseWrapper.dynamic(strApp, "js")
        }
      ).catch(err => this.responseWrapper.error(500, "Error building app"))
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
function getPrmsLoadService(appDir, serviceName, arrServices){
  return new Promise(
    (resolve, reject) => {
      let filePathService = `${appDir}/client/ngapp/services/${serviceName}.js`
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
  return new Promise(
    (resolve, reject) => {
      let filePathComponentTemplate = `${dirPathComponent}/${objComponent.name}Template.html`
      mdlFs.readFile(
        filePathComponentTemplate,
        "utf-8",
        (err, data) => {
          if (err){ throw err}
          let template = data.split(newLine).join(" ")
          objComponent.template = template
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
  //let kebabName = objComponent.name.replace(/([A-Z])/g,"-$1").toLowerCase()
  let componentFunctionName = objComponent.name.charAt(0).toUpperCase() + objComponent.name.slice(1)
  return `${moduleName}.component('${objComponent.name}', {
  bindings: ${objComponent.bindings},
  controller: ${componentFunctionName}Controller,
  template: "${objComponent.template.replace(/\"/g, "\\\"")}"
});`
//  template: \`${objComponent.template}\`
//  template: \`${objComponent.template.replace(/\{/g,"\\{").replace(/\}/g,"\\}")}\`

}

function getStrApp(moduleName, params, obj){
  let strApp = `var ${moduleName} = angular.module('${params.app}',[]);`
  obj.appJson.services.forEach(
    serviceName => {
      let factoryName = serviceName.replace("Service","")
      let serviceFunctionName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
      strApp += `\r\n${moduleName}.factory('${factoryName}', ${serviceFunctionName});`
    }
  )
  obj.arrObjComponents.forEach(
    objComponent => {
      strApp += '\r\n' + getComponentDeclaration(moduleName, objComponent)
    }
  )
  obj.arrServices.forEach(service => strApp += `\r\n${service}`)
  obj.arrObjComponents.forEach(objComponent => strApp += `\r\n${objComponent.controller}`)
  return strApp
}
