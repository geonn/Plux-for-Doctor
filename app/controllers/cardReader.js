var args = arguments[0] || {};
var SCANNER = require("scanner"); 
Ti.App.Properties.setString('time1', '');  
var doctor_id = Ti.App.Properties.getString('doctor_id');
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var id;
var terminal_id;
var clinic_name = "";
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
	console.log("terminal_id_"+clinic_name);
	terminal_id = Ti.App.Properties.getString("terminal_id_"+clinic_name);
	console.log(terminal_id+" anything?");
	if(terminal_id != null){
		console.log('why');
		return true;
	}else{
		console.log('yes');
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
		Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: res[0].message, signature: signature});
	});
}

function init(){
	$.login.hide();
	$.masked.hide();
	$.inner_pay.hide();
	$.clinic.hide();
	setClinicLabel();
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
	diag1 = tmp[1] || 0;
	var diag2 = $.diag2.value;
	var tmp2 = diag2.split("-");
	diag2 = tmp2[1] || 0;
	var mc = $.mc.value || 0;
	var consday = $.consday.value || 0;
	var consnight = $.consnight.value || 0;
	var medication = $.medication.value || 0;
	var injection = $.injection.value || 0;
	var xray = $.xray.value || 0;
	var surgical = $.surgical.value || 0;
	var total = $.total.value || 0;
	
	API.callByGet({url:"terminalsub", params: "action=PAY&cardno="+cardno+"&terminal="+terminal_id+"&diag1="+diag1+"&diag2="+diag2+"&mc="+mc+"&consday="+consday+"&consnight="+consnight+"&medication="+medication+"&injection="+injection+"&xray="+xray+"&surgical="+surgical+"&total="+total}, function(responseText){
	  	console.log(responseText);
	  	var res = JSON.parse(responseText);
	  	var msg = res[0].message.split("\n\n\n________________________");
	  	var signature = (_.isUndefined(msg[1]))?false:true;
		Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: msg[0], signature: signature});
		$.masked.hide();
		$.inner_pay.hide();
	});
	
}

function doPay(){
	$.masked.show();
	$.terminal_id.value = terminal_id;
	$.cardno.value = cardno; // empno
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
	console.log(e.rowData);
	var clinicName = e.rowData.clinicName;
	var doctor_panel_id = e.rowData.id;
	Ti.App.Properties.setString('doctor_panel_id', doctor_panel_id);
	console.log(clinicName+" doctor_panel_id is"+doctor_panel_id);
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
	$.cardno.text = param.cardno;
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
	$.total.blur();
}

function openDiagPicker(tf){
	API.callByPost({url:"getDiagList"}, function(responseText){
	  	var res = JSON.parse(responseText);
	  	var picker = $.UI.create("Picker", {bottom: 0, backgroundColor: "#cccccc"});
		var data = Array();
		var selected_index = 0;
	  	for (var i=0; i < res.data.length; i++) {
	  		if(res.data[i].desc+"-"+res.data[i].code == tf.source.value){
	  			selected_index = i;
	  		}
			data.push($.UI.create("PickerRow", {title: res.data[i].desc, value: res.data[i].code}));
		  };
		picker.add(data);
		picker.setSelectedRow(0, selected_index, false);
		$.inner_pay.add(picker);
		var count = 0;
		picker.addEventListener('change',function(e){
		  tf.source.value = e.row.title+"-"+e.row.value;
		  if(count){
		  	$.inner_pay.remove(picker);
		  }
		  count++;
		});
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