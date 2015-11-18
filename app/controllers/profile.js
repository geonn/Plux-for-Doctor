var args = arguments[0] || {};
var doctorModel = Alloy.createCollection('doctor'); 
var clinic_id = Ti.App.Properties.getString('clinic_id');
var u_id = Ti.App.Properties.getString('u_id');
var name = Ti.App.Properties.getString('name');
COMMON.construct($); 
COMMON.showLoading();
var details;
init();
 
function init(){
 	showList();
}

function showList(){ 
	details = doctorModel.getById(u_id);
	$.name.value = details.name;
	$.code.value = details.dr_code;
	$.email.value = details.email;
	$.mobile.value = details.mobile;
	$.introduction.value = details.introduction;
	$.qualification.value = details.qualification;
	$.specialty.value = details.specialty;
	COMMON.hideLoading();
}

function hideKeyboard(){ 
	$.introduction.blur();
	$.qualification.blur();
	$.specialty.blur();
}
 
$.saveBtn.addEventListener('click', function(){ 
	 
	var name = $.name.value;
	var code = $.code.value;
	var email = $.email.value;
	var mobile = $.mobile.value;
	var introduction = $.introduction.value;
	var qualification = $.qualification.value;
	var specialty = $.specialty.value;
	
	//submit to server
	var param = { 
		"u_id"	  :  u_id,
		"code" : code,
		"name" : name,
		"email" : email,
		"mobile" : mobile,
		"introduction" : introduction,
		"qualification" : qualification,
		"specialty" : specialty
	};
 
	API.callByPost({url:"updateDoctorProfileUrl", params: param}, function(responseText){ 
		var res = JSON.parse(responseText);   
		if(res.status == "success"){    
			COMMON.createAlert("Success", "Profile successfully updated", function(){
				doctorModel.saveRecord(res.data);
			});
		}else{
			COMMON.createAlert("Error", res.data);
			return false;
		}
			
	});
});	

function closeWindow(){
	$.win.close();
}