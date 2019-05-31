var args = arguments[0] || {};
var data = (args.value == "")?[]:args.value.split("|"); // DrugID|DrugName|Uom|Qty|Cost
var drugList = [];
$.qty.children[0].value = (data.length > 0)?data[3]:"";
$.cost.children[0].value = (data.length > 0)?data[4]:"";

function doSave(){
    var params = _.extend($.medication.children[0].drug, {qty: $.qty.children[0].value, cost:$.cost.children[0].value});
    console.log(params);
    args.callback(params);
    $.win.close();
}

function getDrugList(){
  if(drugList.length > 0)
    return;
	API.callByGet({url:"drugList",params:""},function(responceText){
		var res = JSON.parse(responceText);
		for(var i = 0; i < res.length; i++){
            drugList.push({key: res[i].drugid, value: res[i].drugid+"-"+res[i].name+"-"+res[i].uom, drugid: res[i].drugid, name: res[i].name, uom: res[i].uom});
		}
	});
}

function textFieldOnBlur(e){
    checkRequired(e.source);
}

function checkRequired(obj){
    if(obj.required && obj.value == ""){
        error_message += obj.hintText+" cannot be empty\n";
        obj.parent.backgroundColor = "#e8534c";
    }else{
        obj.parent.backgroundColor = "#55a939";
    }
}

function openMedicationPicker(e){
    Alloy.Globals.Navigator.open("parts/search_list", {displayHomeAsUp: true, title: "Medication", listing: drugList, callback: function(ex){
        e.source.parent.drug = ex;
        e.source.value = ex.value;
    }});
    return;
}
