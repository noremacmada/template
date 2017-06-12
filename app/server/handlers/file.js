const mdlDefault = require("./default.js")
module.exports = class File extends mdlDefault{
  constructor(response){
    super(response)
    Object.defineProperty(this, "isAuthReqd", {
        get: () => false,
        enumerable: false
      }
    )

    this.pipe = (requestType, params) => {
      let arrDir = __dirname.split("\\")
      arrDir.pop()
      arrDir.pop()
      arrDir.push("client")
      let dirClient = arrDir.join("/")
      let filePath = dirClient + "/" + params.relPath
      this.responseWrapper.static(filePath)
    }
  }
}
