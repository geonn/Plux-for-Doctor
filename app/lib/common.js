var mainView = null;

exports.construct = function(mv){
	mainView = mv;
};
exports.deconstruct = function(){  
	mainView = null;
};

function openWindow(win){
	if(Ti.Platform.osname == "android"){
	  	win.open(); //{fullscreen:false, navBarHidden: false}
	}else{ 
		var nav = Alloy.Globals.navMenu;
		nav.openWindow(win,{animated:true});  
	} 
}


exports.hideLoading = function(){
	mainView.activityIndicator.hide();
	mainView.loadingBar.opacity = "0";
	mainView.loadingBar.height = "0";
//	mainView.loadingBar.top = "0"; 
};

exports.showLoading = function(){ 
	mainView.activityIndicator.show();
	mainView.loadingBar.opacity = 1;
	mainView.loadingBar.zIndex = 100;
	mainView.loadingBar.height = 120;
	mainView.activityIndicator.style = Ti.UI.ActivityIndicatorStyle.BIG; 
};

//function closeWindow(win){
exports.closeWindow = function(win){
	if(Ti.Platform.osname == "android"){ 
	  	win.close(); 
	}else{ 
		var nav = Alloy.Globals.navMenu;
		nav.closeWindow(win,{animated:true});  
	} 
};

function removeAllChildren (viewObject){
    //copy array of child object references because view's "children" property is live collection of child object references
    var children = viewObject.children.slice(0);
 
    for (var i = 0; i < children.length; ++i) {
        viewObject.remove(children[i]);
    }
};


exports.noRecord = function(){
	var data = [];
	var row = Titanium.UI.createTableViewRow({
		touchEnabled: false, 
		backgroundColor: 'transparent' 
	});
		 
	var tblView = Ti.UI.createView({
		height: 'auto'//parseInt(Ti.Platform.displayCaps.platformHeight) -100
	}); 

	var noRecord = Ti.UI.createLabel({ 
		text: "No record(s) found", 
		color: '#375540', 
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		 font:{fontSize:14,fontStyle:'italic'},
		top: 15,
		width: "100%"
	});
	tblView.add(noRecord); 
	row.add(tblView); 
	data.push(row);
	return data;
};


function createAlert(tt,msg, callback){
	var box = Titanium.UI.createAlertDialog({
		title: tt,
		ok: 'OK',
		message: msg
	});
	box.show();
	box.addEventListener('click', function(e){
		console.log(e.index+" "+e.source.ok);
	    if (e.index == 0){
	    	console.log(typeof callback);
	    	if(typeof callback == "function"){
	    		callback && callback();
	    	}
	    }
  });
};

exports.openWindow = _.throttle(openWindow, 500, true);
//exports.closeWindow = _.debounce(closeWindow, 0, true);
exports.removeAllChildren = _.debounce(removeAllChildren, 0, true);
exports.createAlert = _.throttle(createAlert, 500, true);

exports.now = function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	var hours = today.getHours();
	var minutes = today.getMinutes();
	var sec = today.getSeconds();
	if (minutes < 10){
		minutes = "0" + minutes;
	} 
	if (sec < 10){
		sec = "0" + sec;
	} 
	if(dd<10) {
	    dd='0'+dd;
	} 
	
	if(mm<10) {
	    mm='0'+mm;
	} 
	
	datetime = yyyy+'-'+mm+'-'+dd + " "+ hours+":"+minutes+":"+sec;
	return datetime ;
};


exports.popup = function(subView,config,canClose){
    //Popup win
	var popupWin = Ti.UI.createWindow({
		backgroundImage : "/images/Transparent.png",
		opacity            : 0, 
		id                : "popupWin"
	});
	
	//View that used to show the msg
	var popupView = Ti.UI.createView({
		width    : config.width,
		height    : config.height,
		backgroundColor : "#000000",
		borderRadius : 10,
		borderColor : "#CE1D1C",
		borderWidth : 1
	}); 
	 
	popupView.add(subView ); 
	popupWin.add(popupView);
 
 	if(canClose == ""){
 		//Event to close the popup window
		popupWin.addEventListener("click", function(e){
			if(e.source.id != null){
				popupWin.close();
			}
		});
 	}
	
		
	var matrix = Ti.UI.create2DMatrix(); 
	matrix = matrix.scale(1.3, 1.3);
	  
	popupWin.addEventListener('open', function(){
	    if (Titanium.Platform.name == 'android') {
    		popupWin.activity.actionBar.hide();
		}
	    
	    var a = Ti.UI.createAnimation({
		    transform : matrix,
		    opacity: 1, 
		    duration : 500, 
		});
		popupWin.animate(a);  
	}); 
	 
	return popupWin;
};


exports.resultPopUp = function(title, msg){
	var mask = Titanium.UI.createView({
		width: "100%",
		height: "100%",
		zIndex: 999,
		backgroundColor: "#000",
		opacity:0.45,
	});
	
	var box = mainView.UI.create('View',{
		classes : ['hsize','vert'],
		width: "90%", 
		opacity:1.0,zIndex: 1999,
	});
	var header = mainView.UI.create('View',{
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		backgroundColor: "#CE1D1C",
	});
	var head_title = mainView.UI.create('Label',{
		text: title,
		classes: ['padding'],
		color: "#ffffff", 
	});
	header.add(head_title);
	var content = mainView.UI.create('View',{
		classes : ['hsize','wfill','vert'], 
		backgroundColor: "#fff", 
	});
	var content_text = mainView.UI.create('Label',{
		classes : ['hsize','wfill','padding'], 
		text: msg 
	});
	
	var btnView = mainView.UI.create('View',{
		classes : ['hsize','wfill'],  
		backgroundColor: "#fff", 
		textAlign: 'center' 
	});
	var okButton = Ti.UI.createButton({ 
		title: "OK",
		width: "30%",
		backgroundColor: "#F1F1F1",
		borderColor: "#CE1D1C",
		color: "#CE1D1C",
		borderRadius: 10,
		height: Ti.UI.SIZE,
		bottom: "20dp",
	});
	 
	btnView.add(okButton); 
	content.add(content_text);
	content.add(btnView);
	box.add(header);
	box.add(content); 
	mainView.win.add(box);
	mainView.win.add(mask);
	okButton.addEventListener("click", function(){
		mainView.win.remove(box);
		mainView.win.remove(mask);
	}); 
};