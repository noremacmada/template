const mdlResponseWrapper = require("../response-wrapper")
const mdlDb = require("../../data/db/db.js")

module.exports = class Default{
  constructor(response, session, db){
    Object.defineProperty(this, "responseWrapper",
      {
        enumerable: false,
        value: new mdlResponseWrapper(response)
      }
    )

    Object.defineProperty(this, "db",
      {
        enumerable: false,
        value: new mdlDb().getDb()
      }
    )

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

    this.default = (serverData, params) => {
      this.responseWrapper.redirect("/www/content/login.html")
    }
  }
}
