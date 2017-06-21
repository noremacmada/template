const mdlDefault = require("./default.js")
const mdlDb = require("../../data/db/db.js")
const msTokenValidity = 30 * 60 * 60 * 1000

module.exports = class Login extends mdlDefault {
  constructor(response){
    super(response)
    let db = new mdlDb().getDb()
    Object.defineProperty(
      this,
      "isAuthReqd",
      {
        configurable: true,
        enumerable: false,
        get: () => false
      }
    )
    Object.defineProperty(this, "getUser",
      {
        enumerable: false,
        value: (username) => {
          let searchName = username.toLowerCase();
          let isUserFound = Object.keys(db.data.users).filter(
              findName => findName == searchName
            ).length > 0
          let user = isUserFound ? db.data.users[searchName] : null
          return user
        }
      }
    )
    this.create = (serverData, params) => {
      let user = this.getUser(params.username)
      if(user != null){
        let validationError = {error:{username: "Username already exists."}}
        this.responseWrapper.dynamic(validationError, ".js")
        return
      }
      db.data.users[params.username.toLowerCase()] = {
        password: params.password,
        email: params.email
      }
      this.login(serverData, params)
    }
    this.login = (serverData, params) => {
      let user = this.getUser(params.username)
      if(user == null){
        let validationError = {error:{username: "User not found."}}
        this.responseWrapper.dynamic(validationError, ".js")
        return
      }
      if(user.password != params.password){
        let validationError = {error:{password: "Password incorrect."}}
        this.responseWrapper.dynamic(validationError, ".js")
        return
      }
      let dtNow = new Date()
      user.tokenExpiration = new Date(dtNow + msTokenValidity)
      db.session[serverData.sessionId] = user
      this.responseWrapper.javascriptRedirect("/www/content/content.html")
    }
  }
}
