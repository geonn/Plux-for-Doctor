var args = arguments[0] || {};
var SCANNER = require("scanner"); 
Ti.App.Properties.setString('time1', '');  
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var id;


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

function init(){ 
	SCANNER.openScanner("1"); 
}
 

function getCardData(e){ 
	var param =e.data;
	id = patient_recordsModel.addUserData(param);
	$.saveBtn.visible = true;
	$.lblName.text = param.name;
	$.lblIc.text = param.icno;
	$.lblEmp.text = param.empno;
	$.lblCorpName.text = param.corpname; 
}	
		
function hideKeyboard(){ 
	$.remark.blur();
}

$.saveBtn.addEventListener('click', function(){ 
	var remark = $.remark.value;
	patient_recordsModel.saveRemark(id,remark);  
});	
		
Ti.App.addEventListener('getCardData', getCardData);
		 
$.win.addEventListener("close", function(){ 
	Ti.App.removeEventListener('getCardData', getCardData);
});