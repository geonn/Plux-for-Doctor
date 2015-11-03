var args = arguments[0] || {};
Common.construct($);

function onload(responseText){
	var result = JSON.parse(responseText);
	if(result.status == "error"){
		Common.createAlert("Error", result.data);
		return false;
	}else{
		var userModel = Alloy.createCollection('user'); 
		var arr = result.data; 
		userModel.saveArray(arr);
   	
		Common.createAlert("Success", "Gosco account registration successful!");
		Alloy.Globals.navWin.closeWindow($.signUpWin); 
	}
}

function doRegister(){
	var fullname     = $.fullname.value;
	var mobile       = $.mobile.value;
	var email  	  	 = $.email.value;
	var username     = $.username.value;
	var password	 = $.password.value;
	var confirm 	 = $.confirm.value;
	if(fullname ==""){
		Common.createAlert("Fail","Please fill in your full name");
		return false;
	}
	if(mobile ==""){
		Common.createAlert("Fail","Please fill in your contact number");
		return false;
	}
	if(email ==""){
		Common.createAlert("Fail","Please fill in your email address");
		return false;
	}
	if(username ==""){
		Common.createAlert("Fail","Please fill in your username");
		return false;
	}
	if(password =="" || confirm ==""){
		Common.createAlert("Fail","Please fill in your password");
		return false;
	}
	if(password != confirm){
		Common.createAlert("Fail","Both password must be same");
		return false;
	}
	if(password.length < 6){
		Common.createAlert("Fail","Password must at least 6 alphanumberic");
		return false;
	}
	
	var params = { 
		fullname: fullname,
		mobile: mobile,
		email: email,
		username: username,  
		password: password
	};
	API.callByPost({url: "doSignUpUrl", params: params}, onload);
}
