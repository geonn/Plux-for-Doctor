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
var cardno, action;// = "6000201000113580";
var loading = Alloy.createController("loading");
var status = "", check_pin="", pin_confirm="";
var pin = [];

function RunLayout(){
	var pin_circle = $.pin_circle.getChildren();
	var keyinPin_1 = $.keyinPin_1.getChildren();
	var keyinPin_2 = $.keyinPin_2.getChildren();
	var keyinPin_3 = $.keyinPin_3.getChildren();
	var keyinPin_4 = $.keyinPin_4.getChildren();
	var dp = Ti.Platform.displayCaps.platformWidth / (Titanium.Platform.displayCaps.dpi / 160);
	var pin_dp = dp * 3 / 100;
	var pin_radius = pin_dp * 2;
	var keyinPin_dp = dp * 18 / 100;
	var keyinPin_radius = keyinPin_dp * 2;
	var fsize = keyinPin_dp * 40 / 100;
	var i1 = 1, i2 = 4, i3 = 7;

	for(var i = 0; i < pin_circle.length; i++) {
		pin_circle[i].width = pin_dp;
		pin_circle[i].height = pin_dp;
		pin_circle[i].borderRadius = pin_radius;
	}
	
	for(var i = 0; i < keyinPin_1.length; i++) {
		keyinPin_1[i].width = keyinPin_dp;
		keyinPin_1[i].height = keyinPin_dp;
		keyinPin_1[i].borderRadius = keyinPin_radius;
		keyinPin_2[i].width = keyinPin_dp;
		keyinPin_2[i].height = keyinPin_dp;
		keyinPin_2[i].borderRadius = keyinPin_radius;
		keyinPin_3[i].width = keyinPin_dp;
		keyinPin_3[i].height = keyinPin_dp;
		keyinPin_3[i].borderRadius = keyinPin_radius;
		keyinPin_1[i].add($.UI.create("Label", {text: i1, classes: ['white'], font:{fontSize:fsize}}));
		i1++;
		keyinPin_2[i].add($.UI.create("Label", {text: i2, classes: ['white'], font:{fontSize:fsize}}));
		i2++;
		keyinPin_3[i].add($.UI.create("Label", {text: i3, classes: ['white'], font:{fontSize:fsize}}));
		i3++;
	}
	keyinPin_4[0].width = keyinPin_dp;
	keyinPin_4[0].height = keyinPin_dp;
	keyinPin_4[0].borderRadius = keyinPin_radius;
	keyinPin_4[0].add($.UI.create("Label", {text: 0, classes: ['white'], font:{fontSize:fsize}}));
}

function closeWindow(){
	$.win.close();
}

init();

function refresh(){
	
}

function checkTerminateIdExist(){
	terminal_id = Ti.App.Properties.getString("terminal_id");
	 
	if(terminal_id != null){ 
		return true;
	}else{ 
		return false;
	}
}

function doInquiry(){
	if(!cardno){
		COMMON.createAlert("Warning", "Card No not found, please scan the patient card.", function(){
			
		});
		return;
	}
	loading.start();
	API.callByGet({url:"terminalsub", params: "action=INQUIRY&cardno="+cardno+"&terminal="+terminal_id}, function(responseText){
	  	var res = JSON.parse(responseText);
	  	//console.log(res);
	  	var msg = res[0].message.split("\n\n\n________________________");
	  	var signature = (_.isUndefined(msg[1]))?false:true;
		Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: res[0].message, terminal_id: terminal_id, signature: signature, record: res[0]});
		loading.finish();
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

function qrscan(){
	SCANNER.openScanner("1");
}

function popInsertCardNo(e){
	action = parent({name: "action"}, e.source);
	var dialog = Ti.UI.createOptionDialog({
	  cancel: 2,
	  options: ['QR Scanner','Card Number','Cancel'],
	  title: 'Insert Patient CardNo'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		if(e.index == 0){
			qrscan();
		}else if(e.index == 1){
			$.masked.show();
			$.cardnumber.show();
		}else if(e.index == 2){
			
		}
	});
}

function hideCardNumber(){
	$.cardnumber.hide();
	$.masked.hide();
}

function validateUserPinViaServer(cardno){
	loading.start();
	API.callByPost({url:"validateUserPin", new:true, params:{mem_no: cardno}}, function(responseText){ 
		res = JSON.parse(responseText); 
		console.log(res);
		loading.finish();
		status = res.status;
		check_pin = res.data;
		if(status == "new"){
			$.pin_title.text = "Create a new PIN for your account";
		}else{
			$.pin_title.text = "Enter PIN";
		}
		RunLayout();
		$.pin_panel.show();
		$.masked.show();
	}); 
}

function cardnoAssign(){
	cardno = $.cardno_input.value;
	$.cardnumber.hide();
	$.masked.hide();
	$.cardno_input.blur();
	if(action == "doPay"){
		validateUserPinViaServer(cardno);
	}else{
		eval(action+"()");
	}
	$.cardno_input.value = "";
}

function keyinPin(e){
	console.log(e.source);
	var number = parent({name: "number"}, e.source);
	console.log(number);
	pin.push(number);
	render_pin_circle();
}

function remove_pin(){
	if(pin.length <= 0){
		$.pin_panel.hide();
		$.masked.hide();
		pin = [];
		pin_confirm = "";
	}
	pin.pop();
	render_pin_circle();
}

function submitPin(){
	var p = pin.join("");
	console.log(status+" status");
	if(status == "new"){
		pin_confirm = p;
		status = "confirm";
		$.pin_title.text = "Confirm PIN";
		
	}else if(status == "confirm"){
		if(pin_confirm == p){
			loading.start();
			API.callByPost({url:"addUserPin", new:true, params:{mem_no: cardno, pin: pin_confirm}}, function(responseText){ 
				res = JSON.parse(responseText); 
				console.log(res);
				loading.finish();
				$.pin_panel.hide();
				$.masked.hide();
				eval(action+"()");
			}); 
			pin_confirm = "";
		}else{
			alert("Confirm PIN is not match.");
		}
	}else if(status == "success"){
		if(check_pin == p){
			$.pin_panel.hide();
			$.masked.hide();
			eval(action+"()");
		}else{
			alert("Incorrect PIN");
		}
	}
	pin = [];
	var child = $.pin_circle.getChildren();
	for (var i=0; i < child.length; i++) {
		child[i].backgroundColor = "transparent";
	};
}

function render_pin_circle(){
	console.log(pin.length+" pin.length");
	var child = $.pin_circle.getChildren();
	if(pin.length == 4 ){
		child[pin.length-1].backgroundColor = "#ffffff";
		submitPin();
	}else if(pin.length > 0){
		child[pin.length-1].backgroundColor = "#ffffff";
		$.cancel_pin.text = "Delete";
		child[pin.length].backgroundColor = "transparent";
	}else if(pin.length == 0){
		child[pin.length].backgroundColor = "transparent";
		$.cancel_pin.text = "Cancel";
	}
}

function init(){
	$.win.add(loading.getView());
	if(Ti.Platform.osname == "android" ){
		//getDiag($.diag1);
	//	getDiag($.diag2);
	}
	$.cardnumber.hide();
	$.pin_panel.hide();
	$.masked.hide();
	$.inner_pay.hide();
	getDiagCategory();
	if(!checkTerminateIdExist()){
		
	}
	//setTimeout(function(e){SCANNER.openScanner("1");}, 500);
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
	loading.start();
	var diag1 = $.diag1.value;
	var tmp= diag1.split("-");
	diag1 = tmp[0] || 0;
	var diag2 = $.diag2.value;
	var tmp2 = diag2.split("-");
	diag2 = tmp2[0] || 0; 
	var mc = $.mc.value || 0;
	var consday = $.consday.value || 0;
	var labtest = $.labtest.value || 0;
	var consnight = $.consnight.value || 0;
	var medication = $.medication.value || 0;
	var injection = $.injection.value || 0;
	var xray = $.xray.value || 0;
	var surgical = $.surgical.value || 0;
	var total = parseInt(consday) + parseInt(consnight) + parseInt(medication) + parseInt(injection) + parseInt(xray) + parseInt(surgical) + parseInt(labtest);
	 
	if(diag1 == "0"){
		alert("Please select Diagnosis");
		loading.finish();
		return false;
	}
	//cardno = "6000201000113580";
	API.callByGet({url:"terminalsub", params: "action=PAY&cardno="+cardno+"&labtest="+labtest+"&terminal="+terminal_id+"&diag1="+diag1+"&diag2="+diag2+"&mc="+mc+"&consday="+consday+"&consnight="+consnight+"&medication="+medication+"&injection="+injection+"&xray="+xray+"&surgical="+surgical+"&total="+total}, function(responseText){
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
		 	$.labtest.value ="";
		 	$.surgical.value =""; 
	  	var msg = res[0].message.split("\n          ________________________"); 
	  	var signature = (_.isUndefined(msg[1]))?false:true;
		Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: msg[0], signature: signature, terminal_id: terminal_id, record: res[0], appcode: res[0].appcode});
		$.masked.hide();
		$.inner_pay.hide();
		loading.finish();
	});
	
}

function cancel_submit(){
	$.masked.hide();
	$.inner_pay.hide();
}

function doPay(){
	console.log(typeof cardno);
	if(!cardno){
		COMMON.createAlert("Warning", "Card No not found, please scan the patient card.", function(){
			
		});
		return;
	}
	$.masked.show();
	$.terminal_id.value = Ti.App.Properties.getString("terminal_id");
	$.cardno.value =  cardno; // empno
	$.inner_pay.show(); 
	 
}

function getCardData(e){ 
	var param =e.data;
	cardno = param.cardno;
	eval(action+"()");
	//validateUserPinViaServer(cardno);
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
		
	 	//if(OS_IOS){
			diagCategoryArr.push("Cancel"); 
		//}
		 
	}); 
}

function openDiagPicker(tf){ 
	 if(Ti.Platform.osname === 'android'){
         Ti.UI.Android.hideSoftKeyboard();
    }
    
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

Ti.App.addEventListener('getCardData', getCardData);
Ti.App.addEventListener('cardReader:closeWindow', closeWindow);
		 
$.win.addEventListener("close", function(){ 
	Ti.App.Properties.setString("card_data","");
	Ti.App.removeEventListener('cardReader:closeWindow', closeWindow);
	Ti.App.removeEventListener('getCardData', getCardData);
});