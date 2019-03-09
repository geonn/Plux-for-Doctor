var args = arguments[0] || {};
var serial = args.serial || "";
var corpcode = Ti.App.Properties.getString('corpcode');
var empno = Ti.App.Properties.getString('empno');
var memno = Ti.App.Properties.getString('memno');
var name = Ti.App.Properties.getString('fullname');
var loading = Alloy.createController('loading');
var error_message = "";
var diagCategory = [];

function init(){
	//loading.start();
	$.win.add(loading.getView());
	$.cardno.children[0].value = args.cardno || "";
	$.cardno.children[0].text = "Card No: "+args.cardno || "";
	$.tid.children[0].value = args.tid || "";
	$.tid.children[0].text = "Terminal No: "+args.tid || "";
}
init();

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
var singleton_diagcategory = false;
function getDiagCategory(e){
    if(singleton_diagcategory){
        return;
    }
    e.source.opacity = 0.5;
    var indicator = $.UI.create("ActivityIndicator", {classes:['wsize','hsize'], style: Ti.UI.ActivityIndicatorStyle.DARK,});
    indicator.show();
    e.source.add(indicator);
    API.callByGet({url:"diagList"}, function(responseText){
        res = JSON.parse(responseText);
        for (var i=0; i < res.length; i++) {
            diagCategory.push({key: res[i].code, value: res[i].code+" - "+res[i].desc});
        }
        e.source.opacity = 1;
        indicator.hide();
        e.source.remove(indicator);
        singleton_diagcategory = true;
    });
}


function addDrugRow(){
    var view = $.UI.create("View", {backgroundColor: "#ffffff", value: "", classes:['wfill','hsize','padding','rounded'], top: 0, bottom: 5});
    var label_view = $.UI.create("View", {classes:['wfill','hsize'], backgroundColor: "#ffffff"});
    var label_drug = $.UI.create("Label", {classes:['wfill','hsize','padding','h5'], right: 40, text: "Medication", color: "#000000", required: 0, value: ""});
    var button = $.UI.create("Button", {bublleParent: false, classes:['rounded'], backgroundColor: "#a93955", color: "#702638", width: 40, height: 40, top:0, right: 0, title: "x"});

    label_view.add(label_drug);
    view.add(label_view);
    view.add(button);
    button.addEventListener("click", removeDrugRow);
    label_drug.addEventListener("click", openDrugDetail);
    $.medication.children[0].add(view);
}

function removeDrugRow(e){
     $.medication.children[0].remove(e.source.parent);
     updateDrugArr();
}

function addDiagRow(){
    var view = $.UI.create("View", {backgroundColor: "#ffffff", value: "", classes:['wfill','hsize','padding','rounded'], top: 0});
    var label_view = $.UI.create("View", {classes:['wfill','hsize'], backgroundColor: "#ffffff"});
    var label_diag = $.UI.create("Label", {classes:['wfill','hsize','padding','h5'], right: 40, text: "Diagnosis", color: "#000000", required: 0, value: ""});
    var button = $.UI.create("Button", {bublleParent: false, classes:['rounded'], backgroundColor: "#a93955", color: "#702638", width: 40, height: 40, top:0, right: 0, title: "x"});
    label_view.add(label_diag);
    view.add(label_view);
    view.add(button);
    button.addEventListener("click", removeDiagRow);
    label_diag.addEventListener("click", openDiagPicker);
    $.diagnosis.children[0].add(view);
}

function openDiagPicker(e){
    Alloy.Globals.Navigator.open("parts/search_list", {displayHomeAsUp: true, title: "Diagnosis", listing: diagCategory, callback: function(ex){
        e.source.text = ex.value;
        e.source.parent.parent.value = ex.key;
        updateDiagArr();
    }});
}

function removeDiagRow(e){
     $.diagnosis.children[0].remove(e.source.parent);
     updateDiagArr();
}

function updateDiagArr(){
	var temp_diag_value = [];
	var count = $.diagnosis.children[0].getChildren().length;
	for (var i = 0; i < $.diagnosis.children[0].getChildren().length; i++) {
	    if($.diagnosis.children[0].children[i].value != ""){
	        temp_diag_value.push($.diagnosis.children[0].children[i].value);
	    }
	}
	$.diagnosis.children[0].value = temp_diag_value.join("*");
}

function sumCharges(){
    var total = parseFloat($.dayamt.children[0].value || 0) + parseFloat($.nightamt.children[0].value || 0) + parseFloat($.medamt.children[0].value || 0) + parseFloat($.injectamt.children[0].value || 0) + parseFloat($.labamt.children[0].value || 0) + parseFloat($.labhfee.children[0].value || 0) + parseFloat($.xrayamt.children[0].value || 0) + parseFloat($.suramt.children[0].value || 0);
    $.total.text = "TOTAL: RM "+total.toFixed(2);
}

function updateDrugArr(){
    var medication_subtotal = 0;
    //var arr_drugid = [], arr_name = [], arr_uom = [], arr_qty = [], arr_cost = [];
    var mul_arr = [[],[],[],[],[]];
    for (var i = 0; i < $.medication.children[0].getChildren().length; i++) {
        var med = $.medication.children[0].children[i].value.split("|"); // DrugID|DrugName|Uom|Qty|Cost
        for(var z=0; z < mul_arr.length; z++){
            mul_arr[z].push(med[z] || "NV");
            if(z == 4){
                medication_subtotal += parseFloat(med[z]) || 0;
                $.medication_subtotal.text = "MEDICATION SUBTOTAL: RM "+medication_subtotal.toFixed(2);;
            }
        };
    }
    var temp_drug_value = "";
    for (var i = 0; i < mul_arr.length; i++) {
        var div = ((i+1) == mul_arr.length)?"":"|";
        var temp_var = "";
        for(var j = 0; j < mul_arr[i].length; j++){
            var star = ((j+1) == mul_arr[i].length)?"":"*";
            temp_var += mul_arr[i][j]+star;
        }
        temp_drug_value += temp_var+div;
    }
    $.medication.children[0].value = temp_drug_value;
}

function openDrugDetail(e){
    Alloy.Globals.Navigator.open("parts/claim_submission_drug_detail", {displayHomeAsUp: true, title: "Diagnosis", value: e.source.parent.parent.value, callback: function(ex){
        e.source.text = ex.drugid+" - "+ex.name+"\n Quantity: "+ex.qty+"\n Price: RM "+ex.cost;
        e.source.parent.parent.value = ex.drugid+"|"+ex.name+"|"+ex.uom+"|"+ex.qty+"|"+ex.cost;
		updateDrugArr();
    }});
    return;
}

function doSubmit(){
    loading.start();
    var childs = $.forms.getChildren();
    var params = "action=PAY";

    for (var i=0; i < childs.length - 1; i++) {
		if(childs[i].nosubmit != "1"){
            checkRequired(childs[i].children[0]);
            var default_value = (childs[i].children[0].keyboardType == 8)?0:"NV";
            params += "&"+childs[i].id+"="+(childs[i].children[0].value || default_value);
		}
    };
    if(error_message.length > 0){
        alert(error_message);
        loading.finish();
    }else{
        API.callByGet({url:"terminalsubfull", params: params}, function(responseText){

            var res = JSON.parse(responseText);
            var msg = res[0].message.split("\n          ________________________");
            var signature = (_.isUndefined(msg[1]))?false:true;
            submit = true;
            Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: msg[0], signature: signature, terminal_id: args.tid, record: res[0], appcode: res[0].appcode});
            loading.finish();
        },function(err){
            alert("Please try again later.");
        });
    }
    error_message = "";
}

function datePicker(e){
    var val_date = (typeof e.source.children[0].date != "undefined")?e.source.children[0].date:new Date();
    var view_container = $.UI.create("View", {classes:['wfill', 'hfill'], zIndex: 50,});
    var mask = $.UI.create("View",{
        classes:['wfill','hfill'],
        backgroundColor: "#80000000"
    });
    var view_box = $.UI.create("View", {classes:['wfill','hsize','vert'],
    backgroundGradient:{
        type: 'linear',
        colors: [ { color: '#ffffff', offset: 0.0},{ color: '#67b6e1', offset: 0.4 }, { color: '#67b6e1', offset: 0.6 }, { color: '#ffffff', offset: 1.0 } ],
    }, zIndex: 50});
    var picker = $.UI.create("Picker", {
        type:Ti.UI.PICKER_TYPE_DATE,
        value: val_date,
        backgroundColor: "Transparent",
        dateTimeColor: "#ffffff",
        top: 10,
    });
    var ok_button = $.UI.create("Button", {classes:['wfill'], borderRadius:0, height: 50, title: "Select a Date"});
    view_box.add(picker);
    view_box.add(ok_button);
    view_container.add(view_box);
    view_container.add(mask);
    $.win.add(view_container);

    mask.addEventListener("click", function(){
        $.win.remove(view_container);
    });

    ok_button.addEventListener("click", function(ex){
        var moment = require('/alloy/moment');
        var date = moment(picker.value);
        var dd = picker.value.getDate();
        var mm = picker.value.getMonth()+1;
        var yyyy = picker.value.getFullYear();
        e.source.children[0].value = date.format("MM/DD/YYYY");
        e.source.children[0].date = picker.value;
        e.source.children[0].children[0].text = date.format("MM/DD/YYYY");
        e.source.children[0].children[0].color = "#000000";
        e.source.backgroundColor = "#55a939";
        $.win.remove(view_container);
    });
}

function closeWindow(){
    $.win.close();
}

Ti.App.addEventListener('claim_submit:closeWindow', closeWindow);

$.win.addEventListener("close", function(){
    Ti.App.Properties.setString("card_data","");
    Ti.App.removeEventListener('claim_submit:closeWindow', closeWindow);
});

$.win.addEventListener("android:back",function(){
    COMMON.createAlert("Warning","Are you sure you want to leave this page",function(){
        $.win.close();
    });
});
