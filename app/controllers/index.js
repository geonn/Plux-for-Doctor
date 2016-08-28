/*
 * exposed function to finish the loading animation. Animates the rocket off the screen.
 */
function navToLoading(){
	var loader = Alloy.createController("loader").getView();
	loader.open();
}

function init(){
	var doctorModel = Alloy.createCollection('doctor'); 
	doctorModel.addColumn("img_path", "TEXT"); 
	var login = Alloy.createController("auth/login");  
	login.checkAuth(navToLoading);
	console.log("index init");
	setTimeout(function(e){$.win.close();}, 500);
}

API.callByPost({url: "dateNow"}, function(responseText){
	var res = JSON.parse(responseText);
	
	if(res.status != "error"){
		common.sync_time(res.data);
	}
	
});

init();

$.win.addEventListener("close", function(e){
	console.log("close index");
});
