function LoginController($http, $window, validation){
  var ctrl = this;
  this.errorMessage = "";
  this.isCreateUser = false;
  this.email = {
    value:"",
    message:"Please enter a valid email",
    validator:function(){
      if(!validation.email(ctrl.email.value)){
        ctrl.email.validation = "error";
      }
    }
  };
  this.username = {
    value:"",
    message:""
  };
  this.password = {
    value:"",
    message:"Please enter a valid password"
  };
  this.passwordConfirm = {
    value:"",
    message:"Please confirm with a matching password",
    validator: function(){
      if(ctrl.password.value != ctrl.passwordConfirm.value){
        ctrl.passwordConfirm.validation = "error";
      }
    }
  };
}
LoginController.prototype.login = function(){
  var isValid = true;
  if(this.username.value == ''){
    this.username.validation = "error";
    this.username.message = "Please provide a username";
    this.isValid = false;
  }
  if(this.password.value == ''){
    this.username.validation = "error";
    this.username.message = "Please provide a password";
    this.isValid = false;
  }
  if(isValid){
    $http.post(
      '/login/login',
      {
        username: this.username.value,
        password: this.password.vale
      }
    ).then(
      this.handleRedirect.bind(this),
      this.handleError.bind(this)
    )
  }
}
LoginController.prototype.login.create = function(){
  var isValid = true;
  if(this.email.value == ''){
    this.email.validation = "error";
    this.email.message = "Please provide a value";
    isValid = false;
  }
  if(this.username.value == ''){
    this.username.validation = "error";
    this.username.message = "Please provide a username";
    isValid = false;
  }
  if(this.password.value == ''){
    this.password.validation = "error";
    this.password.message = "Please provide a password";
    isValid = false;
  }
  if(this.passwordConfirm.value == ''){
    this.passwordConfirm.validation = "error";
    this.passwordConfirm.message = "Please provide a password confirmation";
    isValid = false;
  }
  if(isValid){
    $http.post(
      '/login/create',
      {
        email: this.email.value,
        username: this.username.value,
        password: this.password.vale
        passwordConfirm: this.passwordConfirm.value,
      }
    ).then(
      this.handleRedirect.bind(this),
      this.handleError.bind(this),
    );
  }
}
LoginController.prototype.handleJavascriptRedirect = function(response){
  if(response.status == "200"){
    $window.location.replace(response.data.location);
  }
  else{
    handleError(response);
  }
}
LoginController.prototype.handleError = function(response){
  if(response.status == null){
    this.errorMessage = "Missing response status";
    return;
  }
  if(response.data == null){
    this.errorMessage = "Response status:" + response.status + ". Response body missing.";
    return;
  }
  if(response.data.error != null){
    var error = response.data.error;
    if(error.email != null){
      this.email.message = error.email.message;
      this.email.validation = "error";
    }
    if(error.username != null){
      this.username.message = error.username.message;
      this.username.validation = "error";
    }
    if(error.password != null){
      this.password.message = error.password.message;
      this.password.validation = "error";
    }
    if(error.passwordConfirm != null){
      this.passwordConfirm.message = error.passwordConfirm.message;
      this.passwordConfirm.validation = "error";
    }
  }
  else{
    this.errorMessage = this.data;
  }
}
