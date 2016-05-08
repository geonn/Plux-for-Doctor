var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var panelListModel = Alloy.createCollection('panelList'); 
var callback;
var pop;

function onload(responseText){
	var result = JSON.parse(responseText); 
	console.log("done onload");
	console.log(result);
	if(result.status == "error"){
		Common.createAlert("Error", result.data[0]);
		loading.finish();
		return false;
	}else{
		//loading.start();
		
		setTimeout(function(){
			//loading.finish(); 
			var arr = result.data;
			console.log("login page");
			console.log(arr);
			//Ti.App.Properties.setString('clinic_id', arr.clinic_id);
			//Ti.App.Properties.setString('specialty', arr.specialty);
	   		Ti.App.Properties.setString('u_id', arr.doctor_id);
	   		Ti.App.Properties.setString('doctor_id', arr.doctor_id);
	   		Ti.App.Properties.setString('name', arr.name);
	   		Ti.App.Properties.setString('myClinics', arr.clinic_id);
	   		Ti.App.Properties.setString('clinic_ids', arr.clinic_id);
	   		callback && callback();
	   		$.win.close();
	   		var index_home = Alloy.createController("index_home").getView();
			index_home.open();
		},2000);
			
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
	
	API.callByPost({url: "doLoginUrl", params: params}, onload);
}

function init(){
	$.win.open();
	$.win.add(loading.getView());
}

$.checkAuth = function(cb){
	var u_id = Ti.App.Properties.getString('u_id') || 0; 
	console.log(u_id+" login?");
	if(u_id > 0){
		cb && cb();
    }else{ 
    	callback = cb;
    	init();
    }
};