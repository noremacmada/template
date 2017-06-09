const mdlResponseWrapper = require("../response-wrapper")
module.exports = class Default{
  constructor(response){
    super(response)
    this.responseWrapper = new mdlResponseWrapper(response)
    Object.defineProperty(this, "className", {
        get: function(){
          return this.constructor.name
        },
        enumerable: false
      }
    )

    this.default = (requestType, params) => {
      this.responseWrapper.dynamic("Default")
    }
  }
}
