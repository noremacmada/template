const mdlResponseWrapper = require("../response-wrapper")
module.exports = class Default{
  constructor(response){
    this.responseWrapper = new mdlResponseWrapper(response)
    Object.defineProperty(this, "className", {
        get: function(){
          return this.constructor.name
        },
        enumerable: false
      }
    )
    Object.defineProperty(
      this,
      "isAuthReqd",
      {
        configurable: true,
        enumerable: false,
        get: () => true
      }
    )

    this.default = (requestType, params) => {
      this.responseWrapper.dynamic("Default")
    }
  }
}
