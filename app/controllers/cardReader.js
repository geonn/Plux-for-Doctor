var args = arguments[0] || {};
var SCANNER = require("scanner"); 
Ti.App.Properties.setString('time1', '');  
var doctor_id = Ti.App.Properties.getString('doctor_id');
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var id;
var terminal_id;
var clinic_name = "";
var diagCategoryArr = [];
var diagCategoryIdArr = [];
var selectedDiag1;
var selectedDiag2;
var cardno = "6000201000113580";


// Create a window to add the picker to and display it. 
var window = SCANNER.createScannerWindow(); 
// create start scanner button
var button = SCANNER.createScannerButton();  
$.scanner.addEventListener('click', function() {
	SCANNER.openScanner("1");
});

SCANNER.init(window); 

function closeWindow(){
	$.win.close();
}

init();

function refresh(){
	setClinicLabel();
	if(!checkTerminateIdExist()){
		$.login.show();
		$.masked.show();
	}
}

function checkTerminateIdExist(){
	var doctor_panel_id = Ti.App.Properties.getString('doctor_panel_id');
	//console.log("terminal_id_"+clinic_name);
	terminal_id = Ti.App.Properties.getString("terminal_id_"+clinic_name);
	 
	if(terminal_id != null){ 
		return true;
	}else{ 
		return false;
	}
}

function clinic_login(){
	API.callByGet({url:"panellogin", params: "LOGINID="+$.login_username.value+"&PASSWORD="+$.login_password.value}, function(responseText){
	  	var res = JSON.parse(responseText);
		if(_.isUndefined(res[0].code)){
			if(res[0].name == clinic_name || true){
				Ti.App.Properties.setString("terminal_id_"+clinic_name, res[0].terminalid);
				$.masked.hide();
				$.login.hide();
				terminal_id = Ti.App.Properties.getString("terminal_id_"+clinic_name);
			}else{
				alert("INCORRECT CLINIC LOGIN");
			}
		}else{
			alert(res[0].message);
		}
	});
}

function doInquiry(){
	API.callByGet({url:"terminalsub", params: "action=INQUIRY&cardno="+cardno+"&terminal="+terminal_id}, function(responseText){
	  	var res = JSON.parse(responseText);
	  	console.log(res);
	  	var msg = res[0].message.split("\n\n\n________________________");
	  	var signature = (_.isUndefined(msg[1]))?false:true;
		Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: res[0].message, signature: signature, appcode: ""});
	});
}

function getDiag(picker){
	API.callByPost({url:"getDiagList"}, function(responseText){
	  	var res = JSON.parse(responseText);
		var data = Array();
	  	for (var i=0; i < res.data.length; i++) {
			data.push($.UI.create("PickerRow", {title: res.data[i].desc, value: res.data[i].code}));
		  };
		picker.add(data);
	});
}

function init(){
	if(Ti.Platform.osname == "android" ){
		getDiag($.diag1);
		getDiag($.diag2);
	}
	$.login.hide();
	$.masked.hide();
	$.inner_pay.hide();
	$.clinic.hide();
	$.remark.blur();
	setClinicLabel();
	getDiagCategory();
	if(!checkTerminateIdExist()){
		$.login.show();
		$.masked.show();
	}
	//setTimeout(function(e){SCANNER.openScanner("1");}, 500);
}
 
function setClinicLabel(){
	var doctor_panel_id = Ti.App.Properties.getString('doctor_panel_id');
	
	var model = Alloy.createCollection("doctor_panel");
	var current_clinic = model.getDataById({doctor_panel_id: doctor_panel_id});
	console.log(doctor_panel_id+" "+current_clinic);
	if(typeof current_clinic != "undefined"){
		clinic_name = current_clinic.clinicName;
		$.clinic_label.text = current_clinic.clinicName;
		$.login_clinic.text = current_clinic.clinicName;
	}
	$.masked.hide();
}
var onfocus = false;
function closeKeyboard(e){
	if(onfocus){
		var all_textfield = e.source.getChildren();
		all_textfield.pop();
		
		for (var i=2; i < all_textfield.length; i++) {
		  all_textfield[i].blur();
		};
		onfocus = false;
	}
}

function inputOnfocus(){
	onfocus = true;
}

function claim_submit(){
	var diag1 = $.diag1.value;
	var tmp= diag1.split("-");
	diag1 = tmp[0] || 0;
	var diag2 = $.diag2.value;
	var tmp2 = diag2.split("-");
	diag2 = tmp2[0] || 0; 
	var mc = $.mc.value || 0;
	var consday = $.consday.value || 0;
	var consnight = $.consnight.value || 0;
	var medication = $.medication.value || 0;
	var injection = $.injection.value || 0;
	var xray = $.xray.value || 0;
	var surgical = $.surgical.value || 0;
	var total = parseInt(consday) + parseInt(consnight) + parseInt(medication) + parseInt(injection) + parseInt(xray) + parseInt(surgical);
	 
	if(diag1 == "0"){
		alert("Please select Diagnosis");
		return false;
	}
	API.callByGet({url:"terminalsub", params: "action=PAY&cardno="+cardno+"&terminal="+terminal_id+"&diag1="+diag1+"&diag2="+diag2+"&mc="+mc+"&consday="+consday+"&consnight="+consnight+"&medication="+medication+"&injection="+injection+"&xray="+xray+"&surgical="+surgical+"&total="+total}, function(responseText){
	  	//console.log(responseText);
	  	var res = JSON.parse(responseText);
	  	
	  	$.diag1.value = "";
	  	$.diag2.value = "";
		$.consday.value ="";
	 	$.consnight.value ="";
	 	$.mc.value ="";
	 	$.medication.value ="";
	 	$.injection.value ="";
	 	$.xray.value ="";
	 	$.surgical.value ="";
	  	
	  	var msg = res[0].message.split("\n          ________________________"); 
	  	var signature = (_.isUndefined(msg[1]))?false:true;
		Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: msg[0], signature: signature, appcode: res[0].appcode});
		$.masked.hide();
		$.inner_pay.hide();
	});
	
}

function cancel_submit(){
	$.masked.hide();
	$.inner_pay.hide();
}

function doPay(){
	
	$.masked.show();
	$.terminal_id.value = terminal_id;
	$.cardno.value =  cardno; // empno
	$.inner_pay.show(); 
	 
}

$.openClinic.addEventListener("click", function(e){
	$.masked.show();
	var model = Alloy.createCollection("doctor_panel");
	var clinic = model.getDataWithClinic(doctor_id);
	$.clinic.show();
	$.clinic_list.removeAllChildren();
	var arr = Array();
	for (var i=0; i < clinic.length; i++) {
		var row = $.UI.create("TableViewRow",{
			title: clinic[i].clinicName,
			clinicName: clinic[i].clinicName,
	  		id: clinic[i].id
		});
	  	arr.push(row);
	};
	$.clinic_list.setData(arr);
});

$.clinic_list.addEventListener("click", function(e){
	 
	var clinicName = e.rowData.clinicName;
	var doctor_panel_id = e.rowData.id;
	Ti.App.Properties.setString('doctor_panel_id', doctor_panel_id);
	//console.log(clinicName+" doctor_panel_id is"+doctor_panel_id);
	$.clinic.hide();
	$.clinic_list.removeAllChildren();
	refresh();
});

function getCardData(e){ 
	var param =e.data; 
	id = patient_recordsModel.addUserData(param);
	$.saveBtn.visible = true;
	$.lblName.text = param.name;
	$.lblIc.text = param.icno;
	$.lblEmp.text = param.empno;
	$.cardnolbl.text = param.cardno;
	cardno = param.cardno; 
	$.lblCorpName.text = param.corpname;  
}	
		
function hideKeyboard(e){
	$.diag1.blur();
	$.diag2.blur();
	$.mc.blur();
	$.consday.blur();
	$.consnight.blur();
	$.medication.blur();
	$.injection.blur();
	$.xray.blur();
	$.surgical.blur(); 
}

function getDiagCategory(){
	API.callByPost({url:"getDiagList"}, function(responseText){ 
		res = JSON.parse(responseText); 
		 
		for (var i=0; i < res.data.length; i++) { 
			diagCategoryIdArr.push(res.data[i].code);
			diagCategoryArr.push( res.data[i].code+"-"+res.data[i].desc); 
		}
		
	 	if(OS_IOS){
			diagCategoryArr.push("Cancel"); 
		}
		 
	}); 
}

function openDiagPicker(tf){
	console.log(tf.source.id+"]]");
	var curSelection = "0";
	var cancelBtn = diagCategoryArr.length -1;
	if(tf.source.id == "diag1"){
		curSelection = selectedDiag1;
	}else{
		curSelection = selectedDiag2;
	}
			
	var dialog = Ti.UI.createOptionDialog({
	 cancel: diagCategoryArr.length -1,
	 options: diagCategoryArr,
	  selectedIndex: parseInt(curSelection),
	  title: 'Choose Diag Type'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		if(cancelBtn != e.index){ 
			//diag1 = diagCategoryIdArr[e.index];
			if(tf.source.id == "diag1"){
				selectedDiag1 = e.index;
			}else{
				selectedDiag2 = e.index;
			}
			tf.source.value = diagCategoryArr[e.index];  
			tf.source.color = "#000000";
		}
	});
}

$.saveBtn.addEventListener('click', function(){ 
	var remark = $.remark.value;
	patient_recordsModel.saveRemark(id,remark);  
});	
		
Ti.App.addEventListener('getCardData', getCardData);
		 
$.win.addEventListener("close", function(){ 
	Ti.App.removeEventListener('getCardData', getCardData);
});