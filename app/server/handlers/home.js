const mdlDefault = require("./default.js")
module.exports = class Home extends mdlDefault{
  constructor(response){
    super(response)
    this.home = (serverData, params) => {
      this.responseWrapper.dynamic("Home")
    }
  }
}
