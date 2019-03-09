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
    $.terminal.children[0].value = args.tid || "";
    $.terminal.children[0].text = "Terminal No: "+args.tid || "";
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
    API.callByPost({url:"getDiagList"}, function(responseText){
        res = JSON.parse(responseText);
        var dat = res.data;
        for (var i=0; i < dat.length; i++) {
            diagCategory.push({key: dat[i].code, value: dat[i].code+" - "+dat[i].desc});
        }
        e.source.opacity = 1;
        indicator.hide();
        e.source.remove(indicator);
        singleton_diagcategory = true;
    });
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
  var total = parseFloat($.consday.children[0].value || 0) + parseFloat($.consnight.children[0].value || 0) + parseFloat($.medication.children[0].value || 0) + parseFloat($.injection.children[0].value || 0) + parseFloat($.labtest.children[0].value || 0) + parseFloat($.xray.children[0].value || 0) + parseFloat($.surgical.children[0].value || 0);
  $.cal_total.text = "TOTAL: RM "+total.toFixed(2);
}

function doSubmit(){
    loading.start();
    var childs = $.forms.getChildren();
    var params = "action=PAY";

    for (var i=0; i < childs.length - 1; i++) {
        if(childs[i].nosubmit != "1"){
            checkRequired(childs[i].children[0]);
            if(childs[i].id == "diagnosis"){
              var diag = childs[i].children[0].value.split("*");
              for (var z = 0; z < diag.length; z++) {
                if(diag[z] != ""){
                  params += "&diag"+(z+1)+"="+diag[z];
                }
              }
            }else{
              var default_value = (childs[i].children[0].keyboardType == 8)?0:"NV";
              params += "&"+childs[i].id+"="+(childs[i].children[0].value || default_value);
            }

        }
    };
    if(error_message.length > 0){
        alert(error_message);
        loading.finish();
    }else{
        API.callByGet({url:"terminalsub", params: params}, function(responseText){
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
