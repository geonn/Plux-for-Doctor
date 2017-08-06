var args = arguments[0] || {};
var clinicType = args.clinicType || "CLINIC";
var library = Alloy.createCollection('panelList');
var corp = Ti.App.Properties.getString('corpcode') || "";
var location = args.location || "";
var details;
common.construct($);

initialized(); 
function initialized(){ 
	common.showLoading();
	if(clinicType == "24 Hours"){  	
		details = library.getPanelBy24Hours("", corp); 
	}else{ 
		details = library.getPanelByClinicType(clinicType, "", corp);     
	} 
	triggerPosition();
	
}
//console.log("clinicType: " +clinicType);


function triggerPosition(){
	if (Ti.Geolocation.locationServicesEnabled) {
	    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
	    //Ti.Geolocation.addEventListener('location', setCurLoc);
	    Ti.Geolocation.getCurrentPosition(init);
	} else {
	    //alert('Please enable location services');
	    setTimeout(alerts, 1000);
	} 
}
 
function alerts(){
	common.createAlert("Error", "Please enable location services", function(){nav.closeWindow($.clinicLocator);});
}
 
var longitude;
var latitude;   
function init(e){   
	_.debounce(navToclinicDetails, 3000);
	longitude = e.coords.longitude;
    latitude = e.coords.latitude;
    var altitude = e.coords.altitude;
    var heading = e.coords.heading;
    var accuracy = e.coords.accuracy;
    var speed = e.coords.speed;
    var timestamp = e.coords.timestamp;
    var altitudeAccuracy = e.coords.altitudeAccuracy;
    
	var Map = require('ti.map');
	var mapview = Map.createView({
        mapType: Map.NORMAL_TYPE,
        region: {latitude: latitude, longitude: longitude, latitudeDelta:0.01, longitudeDelta:0.01},
        animate:true,
        regionFit:true,
        userLocation:true
    });
    
    if(details != ""){ 
		details.forEach(function(entry) {
			var detBtn =Ti.UI.createButton({
			    backgroundImage: '/images/btn-forward.png',
			    color: "red",
			    height: 20,
				width: 20,
				panel_id: entry.id
			});
			var viewRight = Ti.UI.createView({
			    width: Ti.UI.SIZE,
			    height: Ti.UI.SIZE
			});
	
			detBtn.addEventListener('click', navToclinicDetails);
			viewRight.add(detBtn);
			if(entry.latitude != "" && entry.longitude != ""){
				var merchantLoc = Map.createAnnotation({
				    latitude: entry.latitude,
				    longitude: entry.longitude, 
				    title: entry.clinicName,
				    image: '/images/marker.png',
				    animate : true, 
				    subtitle: entry.add1 + ", "+entry.add2 + ", "+entry.city+ ", "+entry.postcode+ ", "+entry.state,
				    pincolor:Map.ANNOTATION_RED,
				    rightView: detBtn,
				    panel_id: entry.id
				    
				}); 
				mapview.addAnnotation(merchantLoc); 
				//if(Ti.Platform.osname == "android"){
				 
				//}
			}
		});
	}
	common.hideLoading();
	//mapview.addAnnotation(mountainView);
	$.clinicLocator.add(mapview);
	// Handle click events on any annotations on this map.
	if(Ti.Platform.osname == "android"){
		mapview.addEventListener('click', navToclinicDetails);
	}
}

function navToclinicDetails(e){
	Alloy.Globals.Navigator.open("clinic/clinicDetails", {panel_id:e.annotation.panel_id, isplayHomeAsUp: true});
}

function setCurLoc(e){
    var region = {
        latitude: e.coords.latitude, longitude: e.coords.longitude,
        latitudeDelta:0.01, longitudeDelta:0.01
    };
    mapview.setLocation(region);
}
_.debounce(navToclinicNearby, 3000);
$.btnList.addEventListener('click', navToclinicNearby); 
 
function navToclinicNearby(e){
	Alloy.Globals.Navigator.open("clinic/clinicNearby", {longitude:longitude, latitude:latitude, clinicType: clinicType, displayHomeAsUp: true });
}