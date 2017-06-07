module.exports = class Default{
  constructor(){
    Object.defineProperty(this, "className", {
        get: function(){
          return this.constructor.name
        },
        enumerable: false
      }
    )

    this.default = (requestType, params, response) => {
      response.writeHead(200, {"Content-Type":"text/plain"});
      response.write("Default");
      response.end();
    }
  }
}
