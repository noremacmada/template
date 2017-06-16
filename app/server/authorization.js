const mdlDb = require("../data/db/db.js")
const db = new mdlDb().getDb()
const msTokenValidity = 30 * 60 * 60 * 1000
module.exports = class Authorization{
  constructor(){ }
  isAuthorized(request, handlerMetadata){
    let isAuthorized = request.user != null
    let dtNow = new Date()
    isAuthorized = isAuthorized && request.user.tokenExpiration > dtNow
    if(isAuthorized){
      request.user.tokenExpiration = new Date(dtNow + msTokenValidity)
    }
    return isAuthorized
  }
}
