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
      let dirClient = string.join(arr, "/") + "/" + client
      let filePath = dirClient + "/" + params.relPath
      this.responseWrapper.static(filePath)
    }
  }
}
