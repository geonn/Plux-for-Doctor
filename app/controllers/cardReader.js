var args = arguments[0] || {};
var SCANNER = require("scanner"); 
Ti.App.Properties.setString('time1', '');  
var doctor_id = Ti.App.Properties.getString('doctor_id');
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var id;
var terminal_id;
var clinic_name = "";
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
	$.destroy();
	$.win.close();
}
init();

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
				Alloy.Globals.Navigator.open("claim_submission", {displayHomeAsUp: true,t_id:t_id,c_no:c_no});		
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
			var t_id = Ti.App.Properties.getString("terminal_id");
			var c_no =  cardno; // empno
			Alloy.Globals.Navigator.open("claim_submission", {displayHomeAsUp: true,t_id:t_id,c_no:c_no});			
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
//	$.inner_pay.hide();
//	getDiagCategory();
//	getDrugList();	
	if(!checkTerminateIdExist()){
		
	}
	//setTimeout(function(e){SCANNER.openScanner("1");}, 500);
}

/*var onfocus = false;
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
*/

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


Ti.App.addEventListener('getCardData', getCardData);
Ti.App.addEventListener('cardReader:closeWindow', closeWindow);
		 
$.win.addEventListener("close", function(){ 
	Ti.App.Properties.setString("card_data","");
	Ti.App.removeEventListener('cardReader:closeWindow', closeWindow);
	Ti.App.removeEventListener('getCardData', getCardData);
});