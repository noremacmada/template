const url = require("url")
const mdlFs = require("fs")

module.exports = class Routes{
  constructor(){
    this.loadHandlers()
  }

  loadHandlers(){
    let pathHandlers = __dirname + "\\handlers"
    let arrFiles = mdlFs.readdirSync(pathHandlers)
    let arrJsFiles = arrFiles.filter(file => file.match(".+\..js") != null)
    //let fnLogPath = file => console.log(pathHandlers + "\\" + file);
    this.handlers = new Object()
    arrJsFiles.forEach(this.loadHandler)
  }

  loadHandler(fileName){
    let mdl = require("./handlers/" + fileName)
    let inst = new mdl()
    let methods = Object.keys(inst).filter(
      function(key){
        return typeof(inst[key]) === "function"
      }
    )
    this.handlers[inst.className] = {mdlHandler: mdl, methods: methods}
  }

}
