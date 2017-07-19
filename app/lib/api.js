/*********************
*** SETTING / API ***
**********************/
var API_DOMAIN = "plux.freejini.com.my";
// APP authenticate user and key
var USER  = 'freejini';
var KEY   = '06b53047cf294f7207789ff5293ad2dc';

var doLoginUrl = "http://"+API_DOMAIN+"/api/pluxDoctorLogin?user="+USER+"&key="+KEY;
var doSignUpUrl = "http://"+API_DOMAIN+"/api/pluxDoctorSignup?user="+USER+"&key="+KEY;
var addAppointmentUrl = "http://"+API_DOMAIN+"/api/addAppointment?user="+USER+"&key="+KEY; 

//API when app loading phase
var checkAppVersionUrl 			= "http://"+API_DOMAIN+"/api/checkDoctorAppVersion?user="+USER+"&key="+KEY;
var getAppHomepageBackgroundUrl = "http://"+API_DOMAIN+"/api/getAppHomepageBackground?user="+USER+"&key="+KEY;
var getDoctorListUrl            = "http://"+API_DOMAIN+"/api/getDoctorList?user="+USER+"&key="+KEY;
var getAppointmentByDoctor 		= "http://"+API_DOMAIN+"/api/getAppointmentByDoctor?user="+USER+"&key="+KEY;
var getIdaListUrl               = "http://"+API_DOMAIN+"/api/getIda?user="+USER+"&key="+KEY;
var clinicListUrl 				= "http://"+API_DOMAIN+"/api/getClinicLocator?user="+USER+"&key="+KEY; 
var changePasswordUrl 			= "http://"+API_DOMAIN+"/api/doctorChangePassword?user="+USER+"&key="+KEY; 
var updateDoctorProfileUrl 		= "http://"+API_DOMAIN+"/api/updateDoctorProfile?user="+USER+"&key="+KEY; 
var updateDoctorPanelUrl        = "http://"+API_DOMAIN+"/api/updateDoctorPanel?user="+USER+"&key="+KEY;  
var getDoctorPanelUrl        	= "http://"+API_DOMAIN+"/api/getDoctorPanel?user="+USER+"&key="+KEY; 
var uploadDoctorImageUrl		= "http://"+API_DOMAIN+"/api/uploadDoctorImage?user="+USER+"&key="+KEY; 
var getWorkingHoursByDoctorPanelUrl = "http://"+API_DOMAIN+"/api/getWorkingHoursByDoctorPanel?user="+USER+"&key="+KEY; 
var addUpdateWorkingHoursUrl 	= "http://"+API_DOMAIN+"/api/addUpdateWorkingHours?user="+USER+"&key="+KEY;
var getSpecialtylistUrl         = "http://"+API_DOMAIN+"/api/getSpecialtylist?user="+USER+"&key="+KEY; 
var updateDoctorDeviceTokenUrl  = "http://"+API_DOMAIN+"/api/updateDoctorDeviceToken?user="+USER+"&key="+KEY;
var uploadReceiptImageUrl		= "http://"+API_DOMAIN+"/api/uploadReceiptImageUrl?user="+USER+"&key="+KEY; 
var getDiagList = "http://"+API_DOMAIN+"/api/getDiagList?user="+USER+"&key="+KEY;
var panellogin = "http://appsapi.aspmedic.com/aida/panellogin.aspx";
var terminalsub = "http://appsapi.aspmedic.com/aida/terminalsubfull.aspx";
var terminalsub1 = "http://appsapi.aspmedic.com/aida/terminalsub.aspx";
var diagList = "http://appsapi.aspmedic.com/aida/diagnosis.aspx";
var dateNow = "http://plux.freejini.com.my/main/dateNow";
var validateUserPin = "http://"+API_DOMAIN+"/api/validateUserPin?user="+USER+"&key="+KEY; 
var addUserPin = "http://"+API_DOMAIN+"/api/addUserPin?user="+USER+"&key="+KEY; 
var drugList = "http://appsapi.aspmedic.com/aida/drug.aspx";

//API that call in sequence 
var APILoadingList = [
	{url: getAppHomepageBackgroundUrl, model: "background", checkId: "1"},
	{url: getDoctorListUrl, model: "doctor", checkId: "2"},
	{url: getIdaListUrl, model: "ida", checkId: "3"},
	{url: clinicListUrl, model: "panelList", checkId: "5"},
	{url: getDoctorPanelUrl, model: "doctor_panel", checkId: "6"},
	{url: getSpecialtylistUrl, model: "specialty", checkId: "7"},
];

/*********************
**** API FUNCTION*****
**********************/

// call API by post method
exports.callByPost = function(e, onload, onerror){
	
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	if(deviceToken != ""){  
		var url = eval(e.url);
		 
		var _result = contactServerByPost(url, e.params || {});   
		_result.onload = function(ex) {  
			onload && onload(this.responseText); 
		};
		
		_result.onerror = function(ex) { 
			console.log(ex);
			//API.callByPost(e, onload, onerror); 
		};
	}
};

exports.callByGet  = function(e, onload, onerror){
	var url =  eval(e.url) + "?"+e.params;
	console.log(url);
	var _result = contactServerByGet(encodeURI(url));   
	_result.onload = function(e) {   
		onload && onload(this.responseText); 
	};
		
	_result.onerror = function(e) { 
		onerror && onerror(); 
	};	
};


exports.checkAppVersion = function(callback_download){
	var appVersion = Ti.App.Properties.getString("appVersion");
	var url = checkAppVersionUrl + "&appVersion="+appVersion+"&appPlatform="+Titanium.Platform.osname;
	console.log(url);
	var client = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			var result = JSON.parse(this.responseText); 
			if(result.status == "error"){  
				callback_download && callback_download(result);
			}
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			console.log("error check version");
		},
		timeout : 60000  // in milliseconds
	}); 
	client.open("GET", url); 
	client.send(); 
};


// call API by post method
exports.callByPostWithJson = function(e, onload, onerror){
	
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	if(deviceToken != ""){  
		var url = eval(e.url);
		console.log(url);
		var _result = contactServerByPostWithJson(url, e.params || {});   
		_result.onload = function(ex) { 
			console.log('success callByPost');
			console.log(this.responseText);
			onload && onload(this.responseText); 
		};
		
		_result.onerror = function(ex) {
			console.log('failure callByPost');
			console.log(ex);
			//API.callByPost(e, onload, onerror); 
		};
	}
};

// call API by post method
exports.callByPostImage = function(e, onload, onerror) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 50000
	});
	 
	var url = eval(e.url);
	var item_id = e.params.item_id || "";
	 
	var itemStr = "";
	if(item_id != "" && typeof item_id != 'undefined'){
		itemStr =  "&item_id="+item_id;
	}
	// console.log(url+"&u_id="+e.params.u_id+itemStr);return false;
	var _result = contactServerByPostImage(url+"&u_id="+e.params.u_id+itemStr,e.img);
	_result.onload = function(e) { 
		console.log('success');
		onload && onload(this.responseText); 
	};
	
	_result.onerror = function(ex) { 
		console.log("onerror");
		API.callByPostImage(e, onload);
		//onerror && onerror();
	};
};

// update user device token
exports.updateNotificationToken = function(e){
	
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	if(deviceToken != ""){ 
		var records = {};
		records['version'] =  Ti.Platform.version;
		records['os'] =  Ti.Platform.osname;
		records['model'] =  Ti.Platform.model;
		records['macaddress'] =  Ti.Platform.macaddress;  
		records['token'] =  deviceToken;    
		var url = updateTokenUrl ;
		var _result = contactServerByPost(url,records);   
		_result.onload = function(e) {  
		};
		
		_result.onerror = function(ex) { 
		};
	}
};

// send notification as message to other user
exports.sendNotification = function(e){
	var records = {};
	var u_id = Ti.App.Properties.getString('user_id') || 0;
	records['message'] = e.message;
	records['to_id'] = e.to_id;  
	records['u_id'] = u_id; 
	var url = sendNotificationUrl+"?message="+e.message+"&to_id="+e.to_id+"&u_id="+u_id+"&target="+e.target;
	var _result = contactServerByGet(url);   
	_result.onload = function(ex) {
		console.log(ex);
	};
	
	_result.onerror = function(ex) { 
		console.log(ex);
	};
};

exports.loadAPIBySequence = function (ex, counter){ 
	counter = (typeof counter == "undefined")?0:counter;
	console.log('a - '+ counter +" == " +  APILoadingList.length);
	if(counter >=  APILoadingList.length){
		Ti.App.fireEvent('app:next_loading');
		return false;
	}
	
	var api = APILoadingList[counter];
	var model = Alloy.createCollection(api['model']);
	var checker = Alloy.createCollection('updateChecker'); 
	
	var addon_url = "";
	if(api['model'] == "appointment"){
		var clinic_id = Ti.App.Properties.getString('clinic_id') || 0;
		addon_url = "&clinic_id="+clinic_id;
		var isUpdate = checker.getCheckerById(api['checkId'], clinic_id);
		console.log(clinic_id+":clinic_id");
		var last_updated = isUpdate.updated || "";
		if(!clinic_id){
			counter++;
			API.loadAPIBySequence(ex, counter);
			return;
		}
	}else if(api['model'] == "doctor_panel"){
		var doctor_id = Ti.App.Properties.getString('doctor_id') || 0;
		addon_url = "&doctor_id="+doctor_id;
		console.log(addon_url);
		var isUpdate = checker.getCheckerById(api['checkId'], doctor_id);
		var last_updated = isUpdate.updated || "";
		if(!doctor_id){
			counter++;
			API.loadAPIBySequence(ex, counter);
			return;
		}
	}else{
		var isUpdate = checker.getCheckerById(api['checkId']);
		var last_updated = isUpdate.updated || "";
	}
	 var url = api['url']+"&last_updated="+last_updated+addon_url;
	 console.log(url);
	 var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	       console.log('apisequence');
	       console.log(this.responseText);
	       var res = JSON.parse(this.responseText);
	       if(res.status == "Success" || res.status == "success"){
			/**load new set of category from API**/
	       	var arr = res.data;
	        model.saveArray(arr);
	       }
			Ti.App.fireEvent('app:update_loading_text', {text: APILoadingList[counter]['model']+" loading..."});
			if(api['model'] == "item_response" || api['model'] == "friends"){
				var u_id = Ti.App.Properties.getString('user_id') || 0;
				checker.updateModule(APILoadingList[counter]['checkId'],APILoadingList[counter]['model'], Common.now(), u_id);
			}else{
				checker.updateModule(APILoadingList[counter]['checkId'],APILoadingList[counter]['model'], Common.now());
			}
			counter++;
			API.loadAPIBySequence(ex, counter);
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(err) {
	     	console.log("loadAPIBySequence error");
	     	API.loadAPIBySequence(ex, counter);
	     },
	     timeout : 30000  // in milliseconds
	 });
	 if(Ti.Platform.osname == "android"){
	 	client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	 }
 
	 client.open("POST", url);
	 // Send the request.
	client.send();
};


/*********************
 * Private function***
 *********************/
function contactServerByGet(url) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 5000
	});
	client.open("GET", url);
	client.send(); 
	return client;
};

function contactServerByPost(url,records) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 60000
	});
	if(OS_ANDROID){
	 	client.setRequestHeader('ContentType', 'application/x-www-form-urlencoded'); 
	 }
	console.log(records);
	client.open("POST", url);
	client.send(records);
	return client;
};

function contactServerByPostWithJson(url,records) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 5000
	});
	
	client.setRequestHeader('ContentType', 'application/json');
	//client.setRequestHeader('processData', false);
	console.log(records);
	client.open("POST", url);
	client.send(records);
	return client;
};

function contactServerByPostImage(url, img) { 
 
	var client = Ti.Network.createHTTPClient({
		timeout : 50000
	});
	 
	//client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
	client.open("POST", url);
	client.send({Filedata: img.photo}); 
	return client;
	
};

function onErrorCallback(e) { 
	// Handle your errors in here
	COMMON.createAlert("Error", e);
};
