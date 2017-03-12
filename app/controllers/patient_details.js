var args = arguments[0] || {};
var record_id = args.record_id || "";
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var details;
COMMON.construct($); 
COMMON.showLoading();
init();
 
function init(){
 	showList();
}

function showList(){ 
	var param = patient_recordsModel.getById(record_id);
	
	$.receipt_url.image = param.receipt_url;
	$.lblName.text = param.name;
	$.lblMemno.text = param.memno;
	$.lblCorpName.text = param.corpname;
	$.lblVisitDate.text = monthFormat(param.visitdate);
	
	COMMON.hideLoading();
}

function closeWindow(){
	$.win.close();
}

function hideKeyboard(){ 
	$.remark.blur();
}