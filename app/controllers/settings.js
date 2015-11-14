var args = arguments[0] || {};
var doctorModel = Alloy.createCollection('doctor'); 
var clinic_id = Ti.App.Properties.getString('clinic_id');
var u_id = Ti.App.Properties.getString('u_id');
var name = Ti.App.Properties.getString('name');
var details;
init();
 
function init(){
 	showList();
}

function showList(){ 
	details = doctorModel.getById(u_id);
	console.log(details);
	$.lblPName.text = name;
}

$.tvrPassword.addEventListener('click', function(){
	 
	var containerView = Ti.UI.createView({ 
		height:"100%",
		width:"100%",
		backgroundColor: "#FFFFFF"
	}); 

	var confirmView = Ti.UI.createView({
		layout: "vertical",
		height:"100%",
		width:"100%"
	});
	  
	var contentView = Ti.UI.createScrollView({
		layout: "vertical",
		height:Ti.UI.FILL,
		backgroundColor:"#FFFFFF", 
		width:"95%" 
	});
	
	var contentLabel = $.UI.create('Label',{
		classes :['description'],
		top:20, 
		text : 	"Please enter your current password and new password : ",  
	});
	
	var contentCurPassword = $.UI.create('TextField',{
		classes : ['password','padding'],
		top:10, 
		height:25,
		hintText : "Current Password", 
	});
	
	var contentNewPassword = $.UI.create('TextField',{
		classes : ['password','padding'],
		top:10, 
		height:25,
		top:10,
		hintText : "New Password", 
	});
	
	var contentConfirmPassword = $.UI.create('TextField',{
		classes : ['password','padding'],
		top:10, 
		height:25,
		top:10,
		hintText : "Confirm New Password", 
	});
	
	var centerImageView = Ti.UI.createView({ 
		height:"20", 
		width: "100%",
		backgroundColor:"#ffffff", 
	});
	var okayBtn = Ti.UI.createButton({
		title: "OK",
		height: "20",
		color :"#60BACA" 
	});
	contentView.add(contentLabel);
	contentView.add(contentCurPassword);
	contentView.add(contentNewPassword);
	contentView.add(contentConfirmPassword); 
	centerImageView.add(okayBtn); 
	confirmView.add(contentView);
	confirmView.add(centerImageView);
	containerView.add(confirmView);
	var config = [];
	config.width = "70%";
	config.height = "60%";
	pop = COMMON.popup(containerView,config);
	pop.open({fullscreen:true, navBarHidden: true}); 
	addDoneEvent(okayBtn,pop,contentCurPassword,contentNewPassword,contentConfirmPassword);   
});

function addDoneEvent(okayBtn,pop,password, newPassword, confirmPassword){
	okayBtn.addEventListener('click', function(){ 
		var curPassword = password.value; 
		var newPassword = newPassword.value; 
		var confirmPassword = confirmPassword.value; 
		console.log(curPassword+"=="+newPassword+"=="+confirmPassword);
		pop.close();
	});
}

function closeWindow(){
	$.win.close();
}