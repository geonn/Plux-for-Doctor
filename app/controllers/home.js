var args = arguments[0] || {};
//var loading = Alloy.createController("loading");
var myClinic = Ti.App.Properties.getString('clinic_id');
var panelListModel = Alloy.createCollection('panelList'); 
var doctor_id = Ti.App.Properties.getString('doctor_id');

var menu_info = [
	{mod: "cardReader", image: "/images/btn/e-card-reader.png"},
	{mod: "patient", image: "/images/btn/patient-record.png"}, 
	{mod: "appointment", image: "/images/btn/appointment.png"},
	{mod: "clinic/listing", image: "/images/btn/clinic-locator.png"},
	{mod: "ida", image: "/images/btn/ida.png"},
	{mod: "hra", image: "/images/btn/health-rish-assessment.png"},
	{mod: "settings", image: "/images/btn/settings.png"},
	//{mod: "receipt", image: "/images/btn/settings.png"},
	//{mod: "askDoctor", image: "/images/btn/settings.png"},
];

function doLogout(){
	Ti.App.Properties.removeProperty('u_id');
	Ti.App.Properties.removeProperty('name');
	Ti.App.Properties.removeProperty('clinic_id');
	Ti.App.Properties.removeProperty('doctor_panel_id');
	var win = Alloy.createController("index").getView();
	win.open();
	$.win.close();
}

/**
 * Navigate by mod
 */
function navToMod(e){
	Alloy.Globals.Navigator.open(e.source.mod, {displayHomeAsUp: true});
}

/*	
 	Render background image	
 * */
function render_background(){
	var home_background = Alloy.createCollection('background');
	var today = new Date();
	var hours = today.getHours();
	if(typeof (bg[0].img_path) != "undefined"){
		var bg = home_background.getData({time: hours}); 
	}
	//$.background.setBackgroundImage(bg[0].img_path);
}
/*
 * Render menu button
 * */
function render_menu_list(){
	//get screen width to calculate button width
	$.menu_scrollview.removeAllChildren();
	var pWidth = (OS_ANDROID)?(Titanium.Platform.displayCaps.platformWidth / (Titanium.Platform.displayCaps.dpi / 160)):Titanium.Platform.displayCaps.platformWidth;
	var button_width = Math.floor((pWidth - 30) / 2);
	console.log(button_width+" button width"+pWidth+" "+Titanium.Platform.displayCaps.dpi+" "+Titanium.Platform.displayCaps.platformWidth);
	$.menu_scrollview.width = "100%";
	if (Ti.Platform.osname == 'ipad'){
		button_width = Math.floor((pWidth - 30) / 4);
		$.menu_scrollview.width = "80%";
	};

	for (var i=0; i < menu_info.length; i++) {
		var topR =10;
		if(i == 0 || i == 1){
			topR = 239;
		}
		var imageView_menu = $.UI.create("ImageView", {
				mod: menu_info[i].mod,
				width: button_width,
				left: 10,
				top: topR,
				image: menu_info[i].image,
			});
			
		if(menu_info[i].mod == "appointment"){
			var appointmentModel = Alloy.createCollection('appointment'); 
			 
			var container = $.UI.create("View", {
				classes: ['wsize','hsize']
			});
			var notification_view = $.UI.create("View", {
				width: 30,
				height: 30,
				borderRadius: 15,
				backgroundColor: "#CE1D1C",
				top: 20,
				right: 15
			});
				
			container.add(imageView_menu);
				
			setTimeout(function(){
				var gotNotification = appointmentModel.getNumberOfPending(doctor_id);
				var label = $.UI.create("Label", {color: "#ffffff", text: gotNotification});
				notification_view.add(label);
				if(gotNotification != "0"){
					container.add(notification_view);
				}
			},500);
			imageView_menu.addEventListener("click", navToMod);
			$.menu_scrollview.add(container);
			 
		}else{
			imageView_menu.addEventListener("click", navToMod);
			$.menu_scrollview.add(imageView_menu);
		}
		
	};
}

/*
 * render header user information 
 * */

function render_header_info(){
	var name = Ti.App.Properties.getString('name');
	
	var logoutBtn = Ti.UI.createButton({
		backgroundImage : "/images/btn/logout.png",
		width: 40,
		height: 40,
		left: 5,
		right: 5,
		zIndex: 20,
	});
	logoutBtn.addEventListener('click', function(){
		var dialog = Ti.UI.createAlertDialog({
			cancel: 1,
			buttonNames: ['Cancel','Confirm'],
			message: 'Would you like to logout?',
			title: 'Logout PLUX'
		});
		dialog.addEventListener('click', function(e){
			if (e.index === e.source.cancel){
			      //Do nothing
			}
			if (e.index === 1){
				doLogout();
			}
		}); 
		dialog.show(); 
	});
	 
	var title_view = $.UI.create("View", {
		width: "auto",
		height: Ti.UI.FILL,
	});
	var welcomeTitle = $.UI.create('Label',{
		text: "Welcome, "+name,
		classes :['welcome_text']
	});
	
	title_view.add(welcomeTitle);
	$.myInfo.add(logoutBtn);
	$.myInfo.add(title_view);
	
	//geo: hijack clinic panel select checking
	var clinic_id = Ti.App.Properties.getString('clinic_id') || ""; 
	if(clinic_id ==""){  
		//load clinic 
		var doctor_panel = Alloy.createCollection('doctor_panel'); 
		var myPanel = doctor_panel.getData(doctor_id);
		if(myPanel.length > 1){ 
			setTimeout(function(e){selectPanel(myPanel);}, 500);
		}else{
			alert("No panel found, please create your clinic panel.");
		}
 
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
			var panelDetails = panelListModel.getDataByID(myPanel[i].clinic_id);
			 
			var tblRowView = $.UI.create('TableViewRow',{ 
				height: 30,
				color: "#000000",
				classes: ['h6'],
				left: 10,
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
		
		var model = Alloy.createCollection('doctor_panel');  
		var doctor_panel = model.getDoctorPanelId(doctor_id ,res.id);
		 
		Ti.App.Properties.setString('doctor_panel_id', doctor_panel.id);
		
		pop.close(); 
	}); 
}


function refresh(){ 
	//loading.start();
	render_header_info();
	render_menu_list();
	//render_background();
	//loading.finish();
}

function init(){
	var deviceToken = Ti.App.Properties.getString('deviceToken');  
	var u_id = Ti.App.Properties.getString('u_id') || "";
	console.log(u_id +" => " + deviceToken);
	console.log( "doctor_panel_id => " + Ti.App.Properties.getString('doctor_panel_id'));
	 
	if(deviceToken != "" && u_id != ""){ 
		API.callByPost({url: "updateDoctorDeviceTokenUrl", params:{u_id: u_id,device_id:deviceToken }}, function(responseText){ 
	      console.log("OK DEVICE TOKEN");
	    });
	}
	//$.win.add(loading.getView());
	refresh();
}
init();

Ti.App.addEventListener('home:refresh',refresh);

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('home:refresh',refresh);
	console.log("home closing from home");
	$.destroy();
});

$.win.addEventListener("open", function(){
	console.log("home window open");
});
