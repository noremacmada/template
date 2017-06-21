let objDb = {"session": new Object(), "data": {"users": new Object()}}
module.exports = class Db{
  constructor(){}
  getDb(){
    return objDb
  }
}
