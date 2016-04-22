var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var panelListModel = Alloy.createCollection('panelList'); 
var callback;
var pop;

function onload(responseText){
	var result = JSON.parse(responseText); 
	if(result.status == "error"){
		Common.createAlert("Error", result.data[0]);
		loading.finish();
		return false;
	}else{
		loading.finish(); 
		var arr = result.data;
		//Ti.App.Properties.setString('clinic_id', arr.clinic_id);
		//Ti.App.Properties.setString('specialty', arr.specialty);
   		Ti.App.Properties.setString('u_id', arr.doctor_id);
   		Ti.App.Properties.setString('doctor_id', arr.doctor_id);
   		Ti.App.Properties.setString('name', arr.name);
   		Ti.App.Properties.setString('myClinics', arr.clinic_id);
   		var clinic_id = Ti.App.Properties.getString('clinic_id') || "";
   	 
   		if(clinic_id ==""){
   			//load clinic
			var doctorPanel = arr.clinic_id;
			if(doctorPanel != ""){ 
				panelListModel.updatePanelList(doctorPanel);
				
				var myPanel = doctorPanel.split(",");
				 
				if(myPanel.length > 1){
					selectPanel(myPanel);
				}else{
					Ti.App.Properties.setString('clinic_id', doctorPanel);
					$.win.close();
					var index_home = Alloy.createController("index_home").getView();
					index_home.open();
				}
			} 	
   		}else{
   			$.win.close();
   		}
   		
		
		//callback && callback();
	}
}
 
function selectPanel(myPanel){
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
	});
	
	var contentLabel = $.UI.create('Label',{
		classes :['description','padding'],
		top:25, 
		bottom:10,
		text : 	"Please select your panel ",  
	});
	
	if(myPanel.length > 0){
		var curTable = $.UI.create('TableView',{
			classes : ['wfill','hsize' ], 
			backgroundColor: "#ffffff",
			bottom:5,
			top:0 
		}); 
		var data = []; 	
		for(var i=0; i< myPanel.length; i++){
			 
			var panelDetails = panelListModel.getDataByID(myPanel[i]);
			var tblRowView = $.UI.create('TableViewRow',{ 
				height: 30, 
				classes: ['h6'],
				title: panelDetails.clinicName,
				id: panelDetails.id, 
			}); 
			data.push(tblRowView);
			//tblRowView.addEventListener('click',selectedPanel);  
		}
		curTable.setData(data); 
	} 
	
	contentView.add(contentLabel);
 	contentView.add(curTable);
	confirmView.add(contentView); 
	containerView.add(confirmView);
	
	var config = [];
	config.width = "70%";
	config.height = "40%"; 
	pop = COMMON.popup(containerView,config, 1);
	pop.open({fullscreen:true, navBarHidden: true}); 
	selectedPanelEvent(curTable,pop); 
	
}

function selectedPanelEvent(ctable,pop){
	ctable.addEventListener('click',function(e){
		var elbl = JSON.stringify(e.source); 
		var res = JSON.parse(elbl);     
		Ti.App.Properties.setString('clinic_id', res.id);
		
		var doctor_id = Ti.App.Properties.getString('doctor_id');
		var model = Alloy.createCollection('doctor_panel');  
		var doctor_panel = model.getDoctorPanelId(doctor_id ,res.id);
		console.log("doctor_panel");
		console.log(doctor_panel);
		Ti.App.Properties.setString('doctor_panel_id', doctor_panel.id);
		
		pop.close();
		$.win.close();
		callback && callback();
		//var index_home = Alloy.createController("index_home").getView();
		//index_home.open();
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
	API.callByPost({url: "doLoginUrl", params: params}, onload);
}

function init(){
	$.win.open();
	$.win.add(loading.getView());
}

$.checkAuth = function(cb){
	var u_id = Ti.App.Properties.getString('u_id') || 0; 
	if(u_id > 0){
    	 
		cb && cb();
    }else{ 
    	callback = cb;
    	init();
    }
};