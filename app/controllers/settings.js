var args = arguments[0] || {}; 
var clinic_id = Ti.App.Properties.getString('clinic_id');
var panelListModel = Alloy.createCollection('panelList');
var doctor_panelModel = Alloy.createCollection('doctor_panel'); 
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
	doctor_id = Ti.App.Properties.getString('doctor_id');
	console.log(doctor_id+" doctor_id");
	var panel_data = doctor_panelModel.getDataWithClinic(doctor_id);
	console.log(panel_data);
	var doctorPanel = Ti.App.Properties.getString('myClinics') || "";
	var myPanel = doctorPanel.split(",");
	if(panel_data.length > 0){ 
		for(var i=0; i< panel_data.length; i++){
			 
			var activeClinic = "#FFFFFF";
			
			if(panel_data[i].clinic_id == clinic_id){
				activeClinic = "#EBFFDE";
			}
			var clinicView = $.UI.create('View',{ 
				height: 40, 
				classes: ['wfill',  'vert'], 
				clinicName: panel_data[i].clinicName, 
				doctor_panel_id:  panel_data[i].id, 
				clinic_id: panel_data[i].clinic_id,
				backgroundColor: activeClinic
			}); 
			
			var clinicLabel = $.UI.create('Label',{  
				classes: ['wfill', 'h5','padding-left'],
				height: 39, 
				clinicName: panel_data[i].clinicName, 
				doctor_panel_id:  panel_data[i].id, 
				clinic_id: panel_data[i].clinic_id,
				text: panel_data[i].clinicName,
			}); 
			 
			var seperateView = $.UI.create('View',{  
				classes: ['gray-line'], 
			}); 
			clinicView.add(clinicLabel);
			clinicView.add(seperateView);
			$.myClinic.add(clinicView);
			
			clinicView.addEventListener('click', function(e){
				console.log(e);
				var dialog = Ti.UI.createOptionDialog({
					cancel: 2,
					options: ['Select Panel', 'Set Working Hours', 'Cancel'],
					selectedIndex: 2,
					clinic_id: e.source.clinic_id,
					doctor_panel_id: e.source.doctor_panel_id,
  					title: e.source.clinicName
				});
				dialog.show();
				dialog.addEventListener("click", function(ex){
					console.log(ex.source);
					if(ex.index == 0){
						selectedPanel(ex.source.clinic_id);
					}else if(ex.index == 1){
						setWorkingHours(ex.source.doctor_panel_id);
					}
				});
			});
		}
	}
	loading.finish();
}

function setWorkingHours(doctor_panel_id){
	Alloy.Globals.Navigator.open('set_working_hour', {doctor_panel_id: doctor_panel_id, displayHomeAsUp: true});
}

function selectedPanel(id){
	//var elbl = JSON.stringify(e.source); 
	//var res = JSON.parse(elbl);  
	  
	if(id == clinic_id){
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
			Ti.App.Properties.setString('clinic_id', id);
			var doctor_id = Ti.App.Properties.getString('doctor_id');
			var model = Alloy.createCollection('doctor_panel');  
			var doctor_panel = model.getDoctorPanelId(doctor_id, id);
			console.log("setting doctor_panel");
			console.log(doctor_panel);
			Ti.App.Properties.setString('doctor_panel_id', doctor_panel.id);
		
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

$.addPanel.addEventListener('click', function(){
	Alloy.Globals.Navigator.open('clinic/listing', {displayHomeAsUp: true});
});

$.tvrName.addEventListener('click', function(){
	Alloy.Globals.Navigator.open('profile', {displayHomeAsUp: true});
});

function closeWindow(){
	$.win.close();
}