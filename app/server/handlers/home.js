const mdlDefault = require("./Default.js")
module.exports = class Home extends mdlDefault{
  constructor(){
    super()
    this.home = (requestType, params, response) => {
      response.writeHead(200, {"Content-Type":"text/plain"});
      response.write("Home");
      response.end();
    }
  }
}
