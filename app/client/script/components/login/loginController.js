function loginController(validateService){
  var ctrl = this;
  this.isCreateUser = false;
  this.validateEmail
  this.email = {
    value:"",
    validation:"default",
    message:"Please enter a valid email",
    validator:function(){
      if(!validateService.email(ctrl.email.value)){
        ctrl.email.validation = "error";
      }
  };
  this.username = {
    value:"",
    validation:"default",
    message:""
  };
  this.password = {
    value:"",
    validation:"default",
    message:"Please enter a valid password"
  };
  this.passwordConfirm = {
    value:"",
    validation:"default",
    message:"Please confirm with a matching password",
    validator: function(){
      if(ctrl.password.value != ctrl.passwordConfirm.value){
        ctrl.passwordConfirm.validation = "error";
      }
    }
  };
}
