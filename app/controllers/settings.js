var args = arguments[0] || {}; 
var clinic_id = Ti.App.Properties.getString('clinic_id');
var panelListModel = Alloy.createCollection('panelList'); 
var loading = Alloy.createController("loading");
var u_id = Ti.App.Properties.getString('u_id');
var name = Ti.App.Properties.getString('name');
COMMON.construct($);  
init();
 
function init(){
	$.win.add(loading.getView());
 	showList();
}

function showList(){  
	loadClinic();
	$.lblPName.text = name;
}

function loadClinic(){
	loading.start();
	clinic_id = Ti.App.Properties.getString('clinic_id');
	var doctorPanel = Ti.App.Properties.getString('myClinics') || "";
	var myPanel = doctorPanel.split(",");
	if(myPanel.length > 0){ 
		for(var i=0; i< myPanel.length; i++){
			 
			var panelDetails = panelListModel.getDataByID(myPanel[i]);
			var activeClinic = "#FFFFFF";
			
			if(myPanel[i] == clinic_id){
				activeClinic = "#EBFFDE";
			}
			var clinicView = $.UI.create('View',{ 
				height: 40, 
				classes: ['wfill',  'vert'], 
				id: panelDetails.id, 
				backgroundColor: activeClinic
			}); 
			
			var clinicLabel = $.UI.create('Label',{  
				classes: ['wfill', 'h5','padding-left'],
				height: 39, 
				text: panelDetails.clinicName, 
				id: panelDetails.id, 
			}); 
			 
			var seperateView = $.UI.create('View',{  
				classes: ['gray-line'], 
			}); 
			clinicView.add(clinicLabel);
			clinicView.add(seperateView);
			$.myClinic.add(clinicView);
			
			clinicView.addEventListener('click',selectedPanel);  
		}
	}
	loading.finish();
}

function selectedPanel(e){
	var elbl = JSON.stringify(e.source); 
	var res = JSON.parse(elbl);    
	if(res.id == clinic_id){
		return false;
	}
		 
	var dialog = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['Cancel','Confirm'],
		message: 'Are you sure want to change this as your active clinic?',
		title: 'Change Active Clinic'
	});
	dialog.addEventListener('click', function(e){
		if (e.index === e.source.cancel){ 
		}
		if (e.index === 1){
			Ti.App.Properties.setString('clinic_id', res.id);
			COMMON.removeAllChildren($.myClinic);
			loadClinic();
		}
	});
		
	dialog.show();  
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
		top:25, 
		text : 	"Please enter your current password and new password : ",  
	});
	
	var contentCurPassword = $.UI.create('TextField',{
		classes : ['password','padding'],
		top:10,  
		hintText : "Current Password", 
	});
	
	var contentNewPassword = $.UI.create('TextField',{
		classes : ['password','padding'], 
		top:0,
		hintText : "New Password", 
	});
	
	var contentConfirmPassword = $.UI.create('TextField',{
		classes : ['password','padding'], 
		top:0,
		hintText : "Confirm New Password", 
	});
	
	 
	var okayBtn = $.UI.create('Button',{
		classes: ['button'], 
		height: 35,
		title: "Submit" 
	});
	var cancelBtn = $.UI.create('Button',{
		classes: ['button'],
		title: "Cancel",
		top:10,
		height: 35,
		backgroundColor: "#777777" 
	});
	
	contentView.add(contentLabel);
	contentView.add(contentCurPassword);
	contentView.add(contentNewPassword);
	contentView.add(contentConfirmPassword); 
	contentView.add(okayBtn); 
	contentView.add(cancelBtn);
	confirmView.add(contentView); 
	containerView.add(confirmView);
	
	var config = [];
	config.width = "70%";
	config.height = "60%";
	pop = COMMON.popup(containerView,config,"");
	pop.open({fullscreen:true, navBarHidden: true}); 
	addDoneEvent(okayBtn,pop,contentCurPassword,contentNewPassword,contentConfirmPassword);  
	cancelEvent(cancelBtn,pop);   
});

function addDoneEvent(okayBtn,pop,password, newPassword, confirmPassword){
	okayBtn.addEventListener('click', function(){  
	 	var cp = password.value; 
		var nw = newPassword.value; 
		var cp2 = confirmPassword.value; 
		
		//authentication / checking
		if(cp.trim() == ""){
			COMMON.createAlert("Error", "Current Password cannot be empty");
			return false;
		}
		else if(nw.trim() == ""){
			COMMON.createAlert("Error", "New Password cannot be empty");
			return false;
		}
		else if(cp2.trim() == ""){
			COMMON.createAlert("Error", "Confirm Password cannot be empty");
			return false;
		}else if(nw != cp2){
			COMMON.createAlert("Error", "New Password and Confirm Password must be same");
			return false;
		}
		
		//submit to server
		var param = { 
			"u_id"	  :  u_id,
			"password" : cp.trim(),
			"newPassword" : nw.trim()
		};
	 	loading.start();
		API.callByPost({url:"changePasswordUrl", params: param}, function(responseText){ 
			var res = JSON.parse(responseText);   
			if(res.status == "success"){    
				COMMON.createAlert("Success", "New Password successfully updated", function(){
					pop.close();
				});
			}else{
				COMMON.createAlert("Error", res.data);
				return false;
			}
			loading.finish();
		});
		
	});
}

function cancelEvent(cancelBtn,pop){
	cancelBtn.addEventListener('click', function(){  
		pop.close();
	});
}

$.tvrName.addEventListener('click', function(){
	Alloy.Globals.Navigator.open('profile');
});

function closeWindow(){
	$.win.close();
}