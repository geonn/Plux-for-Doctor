var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var callback;

function onload(responseText){
	var result = JSON.parse(responseText); 
	if(result.status == "error"){
		Common.createAlert("Error", result.data[0]);
		loading.finish();
		return false;
	}else{
		loading.finish(); 
		var arr = result.data;
		
   		Ti.App.Properties.setString('u_id', arr.id);
   		Ti.App.Properties.setString('name', arr.name);
   		
		$.win.close();
		callback && callback();
	}
}

function do_login(){
	
	var username     = $.username.value;
	var password	 = $.password.value;
	if(username ==""){
		Common.createAlert("Fail","Please fill in your username");
		return false;
	}
	if(password =="" ){
		Common.createAlert("Fail","Please fill in your password");
		return false;
	}
	var params = {
		email: username,  
		password: password
	};
	//API.doLogin(params, $); 
	loading.start();
	API.callByPost({url: "doLoginUrl", params: params}, onload);
}

function init(){
	$.win.open();
	$.win.add(loading.getView());
}

$.checkAuth = function(cb){
	var u_id = Ti.App.Properties.getString('u_id') || 0; 
	if(u_id > 0){
    	console.log("got u_id"+u_id);
		cb && cb();
    }else{
    	console.log("no u_id");
    	callback = cb;
    	init();
    }
};