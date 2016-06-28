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
	$.lblVisitId.text = param.id;
	$.lblName.text = param.name;
	$.lblIc.text = param.icno;
	$.lblEmp.text = param.empno;
	$.lblCorpName.text = param.corpname; 
	$.lblAllergy.text = param.allergy;
	$.lblVisitDate.text = monthFormat(param.visitdate);
	$.remark.value = param.remark; 
	
	COMMON.hideLoading();
}

$.saveBtn.addEventListener('click', function(){ 
	var remark = $.remark.value;
	patient_recordsModel.saveRemark(record_id,remark);  
});	

function closeWindow(){
	$.win.close();
}

function hideKeyboard(){ 
	$.remark.blur();
}