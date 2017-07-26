var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var panelListModel = Alloy.createCollection('panelList'); 
var callback;
var pop;

function onload(responseText){
	var result = JSON.parse(responseText);  
	if(result.status == "error"){
		Common.createAlert("Error", result.data );
		loading.finish();
		return false;
	}else{
		//
		
		setTimeout(function(){
			loading.finish(); 
			var arr = result.data; 
			//Ti.App.Properties.setString('clinic_id', arr.clinic_id);
			//Ti.App.Properties.setString('specialty', arr.specialty);
	   		Ti.App.Properties.setString('u_id', arr.doctor_id);
	   		Ti.App.Properties.setString('doctor_id', arr.doctor_id);
	   		Ti.App.Properties.setString('name', arr.name);
	   		Ti.App.Properties.setString('myClinics', arr.clinic_id);
	   		Ti.App.Properties.setString('clinic_ids', arr.clinic_id);
	   		callback && callback();
	   		$.win.close();
		},2000);
			
	}
}

function clinic_login(){
	var username     = $.username.value;
	var password	 = $.password.value;
	API.callByGet({url:"panellogin", params: "LOGINID="+username+"&PASSWORD="+password}, function(responseText){
	  	var res = JSON.parse(responseText);
	  	console.log("return_data:"+JSON.stringify(res));
		if(_.isUndefined(res[0].code)){
			console.log("undef");
			Ti.App.Properties.setString("terminal_id", res[0].terminalid);
			Ti.App.Properties.setString('clinic_name', res[0].name);
			Ti.App.Properties.setString('clinic_code', res[0].ccode);
			callback && callback();
			$.win.close();
		}else{
			alert(res[0].message);
		}
	});
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
	Ti.App.Properties.setString('remember_username', username);
	API.callByPost({url: "doLoginUrl", params: params}, onload);
}

function init(){ 
	$.username.value = Ti.App.Properties.getString('remember_username');
	$.win.open(); 
	$.win.add(loading.getView()); 
}

$.checkAuth = function(cb){
	var u_id = Ti.App.Properties.getString('terminal_id') || 0;  
	if(u_id > 0){
		cb && cb();
    }else{ 
    	callback = cb;
    	init();
    }
};