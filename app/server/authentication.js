let mdlDb = require("../data/db/db.js")
let db = new mdlDb().getDb()
module.exports = class Authentication{
  constructor(){ }

  setSessionId(request, response){
    let cookies = new Object()
    let cookie = request.headers.cookie
    if(cookie != null){
      cookie.split(";").forEach(
        el => {
          let arrKvp = el.split("=")
          cookies[arrKvp[0]] = arrKvp[1]
        }
      )
    }
    if(cookies.sessionId == null){
      let sessionId = this.getNewUid();
      response.setHeader("Set-Cookie",`sessionId=${sessionId}; HttpOnly`)
    }
    else{
      let user = db["session"][cookies.sessionId]
      request.user = user
    }
  }
  getNewUid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        let r = Math.random()*16|0
        let v = c == 'x' ? r : (r&0x3|0x8)
        return v.toString(16)
      }
    )
  }

}
