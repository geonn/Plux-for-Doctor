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
var drugCategoryArr = [];
var drugCategoryArr1 = [];
var selectedDiag1;
var selectedDiag2;
var selectedDrug1;
var cardno, action;// = "6000201000113580";
var loading = Alloy.createController("loading");
var status = "", check_pin="", pin_confirm="";
var pin = [];
var mctotalcharges=0;
var totalcharges=0;
var till;
var from;

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

function addMedication(e){
	
	for(var i = 0;i < $.medication_mother.getChildren().length;i++){
		var value = $.medication_mother.getChildren()[i]._children[1].value;
		if(value == ""){
			alert("Please select medication!!!");
			return;
		}		
	}
	var container = $.UI.create("View",{classes:['wfill','hsize','horz'],top:"10"});
	var title = $.UI.create("Label",{classes:['form_lb_top'],width:"25%",text:"Medication"});
	var tf = $.UI.create("TextField",{classes:['hsize','tf_spacing'],width:"57%",hintText:"Medication",value:"",did:"",dname:"",duom:""});
	var bt = $.UI.create("Button",{classes:['button_delete','wsize'],right:"3",title:"Remove"});
	var lb1 = $.UI.create("Label",{classes:['form_lb_top'], width:"25%", text:"Quantity"});
	var lb2 = $.UI.create("Label",{classes:['form_lb_top'], width:"25%", text:"Cost"});	
	var tf1 = $.UI.create("TextField",{classes:['hsize','tf_spacing'],width:"23%",keyboardType:Titanium.UI.KEYBOARD_TYPE_DECIMAL_PAD,hintText:"Qty"});
	var tf2 = $.UI.create("TextField",{classes:['hsize','tf_spacing'],width:"23%",keyboardType:Titanium.UI.KEYBOARD_TYPE_DECIMAL_PAD,hintText:"Cost"});	
	container.add(title);
	container.add(tf);
	container.add(bt);
	container.add(lb1);
	container.add(tf1);
	container.add(lb2);
	container.add(tf2);
	$.medication_mother.add(container);
	getMcTotalCharges({});	
	getTotalCharges({});
	bt.addEventListener("click",function(e){
		$.medication_mother.remove(container);
		getMcTotalCharges({});
		getTotalCharges({});		
	});
	tf.addEventListener('touchend',function(e){
		openDrugPicker(tf);
	});
}

function closeWindow(){
	$.win.close();
}
function popDatePicker(e){
	hideSoftKeyboard({});
	var source = parent({name: "master", value: "1"}, e.source);
	var mcdate = parent({name: "mcdate", value: "mcfrom"},e.source);
	var val_date = (typeof source.date != "undefined")?source.date:new Date();
	var picker = $.UI.create("Picker", {
	  type:Ti.UI.PICKER_TYPE_DATE,
	  value: val_date,
	  zIndex: 50,
	});
	var view_container = $.UI.create("View", {classes:['wfill', 'hfill'], zIndex: 30,});
	var img_mask = $.UI.create("ImageView", {classes:['wfill','hfill'], image: "/images/warm-grey-bg.png"});
	var ok_button = $.UI.create("Button", {classes:['button'], left: 10, right:10, title: "Done"});
	var cancel_button = $.UI.create("Button", {classes:['button'], left: 10, right:10, title: "Cancel"});
	var view_vert = $.UI.create("View", {classes:['wsize','hsize','vert']});
	cancel_button.addEventListener("click", function(){ 
		$.win.remove(view_container);
	});
	img_mask.addEventListener("click", function(){ 
		$.win.remove(view_container);
	});
	ok_button.addEventListener("click", function(){
		source.value = picker.value;
		var dd = picker.value.getDate();
		var mm = picker.value.getMonth()+1; 
		var yyyy = picker.value.getFullYear();
		console.log(yyyy+'-'+mm+'-'+dd);
		source.value = yyyy+'-'+mm+'-'+dd;
		source.date = picker.value;
		source.children[0].text = mm+'/'+dd+'/'+yyyy;
		source.children[0].color = "#404041";
		$.win.remove(view_container);
		if(source.children[0].mcdate == "from"){
			from = mm+"/"+dd+"/"+yyyy;
		}
		else{
			till = mm+"/"+dd+"/"+yyyy;
		}
	});
	
	view_container.add(img_mask);
	view_vert.add(picker);
	view_vert.add(ok_button);
	view_vert.add(cancel_button);
	view_container.add(view_vert);
	
	$.win.add(view_container);

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
	getDrugList();	
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
	getMcTotalCharges();
	getTotalCharges({});
	var tid = $.terminal_id.value || 0;
	var cardno = $.cardno.value || 0;
	var mcno = $.mc_no.value || "NV";
	var diag="";
	var medication = "";	
	var mcfdate = from || "NV";
	var mctdate = till || "NV";
	console.log("date:"+mcfdate+" "+mctdate);
	var dayamt = ($.day.name == "consday")?$.consday.value : 0;
	var nightamt = ($.day.name == "consnight")?$.consday.value : 0;
	var injection = $.injection_item.value || "NV";
	var injectamt = $.injectamt.value || 0;
	var xray = $.xray_item.value || "NV";
	var xrayamt = $.xrayamt.value || 0;
	var labtest = $.labtest_item.value || "NV";
	var labamt = $.labtestamt.value || 0;
	var labhfee = $.labtestfee.value || 0;
	var surginal = $.surginal_item.value || "NV";
	var suramt = $.surginalamt.value || 0;
	var totalamt = $.totalamt.value || 0;
	var bps = $.bps.value || 0;
	var bpd = $.bpd.value || 0;
	var medamt = $.mc_charges.value || 0;
	var pulse = $.pulse.value || 0;
	var acnote = $.acnote.value || "NV";
	var chnote = $.chnote.value || "NV";
	var appcode = "1234";
	for(var i = 0; i < $.diagnosis_mother.getChildren().length; i++){
		var value = $.diagnosis_mother.getChildren()[i]._children[1].name;
		var count = i + 1;
		console.log($.diagnosis_mother.getChildren()[i]._children[1]);
		if(value == ""){
			alert("Please select diagnosis!!!");
			return;
		}		
		else{
			diag+=value;
			if(count<$.diagnosis_mother.getChildren().length){
				diag+="*";			
			}
		}
	}
	if($.medication_mother.getChildren()[0]._children[1].did != ""){
		var value_1 = "";	
		var value_2 = "";
		var value_3 = "";
		var value_4 = "";
		var value_5 = "";
		var three = 3;
		var five = 5;
		console.log("medication_mother length:"+$.medication_mother.getChildren().length);
		for(var i = 0;i < $.medication_mother.getChildren().length; i++){
			var value1 = $.medication_mother.getChildren()[i]._children[1].did+"";
			var value2 = $.medication_mother.getChildren()[i]._children[1].dname+"";
			var value3 = $.medication_mother.getChildren()[i]._children[1].duom+"";
			var value4 = $.medication_mother.getChildren()[i]._children[three].value+"" || 0;
			var value5 = $.medication_mother.getChildren()[i]._children[five].value+"" || 0;
			var count = i + 1;	
			value_1+=value1;	
			three = 4;
			five = 6;			
			if(count<$.medication_mother.getChildren().length){
				value_1+="*";			
			}	
			value_2+=value2;				
			if(count<$.medication_mother.getChildren().length){
				value_2+="*";			
			}	
			value_3+=value3;				
			if(count<$.medication_mother.getChildren().length){
				value_3+="*";			
			}	
			value_4+=value4;				
			if(count<$.medication_mother.getChildren().length){
				value_4+="*";			
			}	
			value_5+=value5;				
			if(count<$.medication_mother.getChildren().length){
				value_5+="*";			
			}													
		}	
		medication = value_1+"|"+value_2+"|"+value_3+"|"+value_4+"|"+value_5;
	}
	else{
		medication = "NV";
	}
	API.callByGet({url:"terminalsub", params: "action=PAY&tid="+tid+"&cardno="+cardno+"&mcno="+mcno+"&medamt="+medamt+"&diagnosis="+diag+"&medication="+medication+"&mcfdate="+mcfdate+"&mctdate="+mctdate+"&dayamt="+dayamt+"&nightamt="
									+nightamt+"&injection="+injection+"&injectamt="+injectamt+"&xray="+xray+"&xrayamt="+xrayamt+"&labtest="+labtest+"&labamt="+labamt+"&labhfee="+labhfee+"&surgical="+surginal+
									"&suramt="+suramt+"&totalamt="+totalamt+"&bps="+bps+"&bpd="+bpd+"&pulse="+pulse+"&acnote="+acnote+"&chnote="+chnote+"&appcode="+appcode}, function(responseText){
	  	//console.log(responseText);
 
	  	var res = JSON.parse(responseText); 
	  	console.log(res);
		$.terminal_id.value ="";
		$.cardno.value ="";
		$.mc_no.value ="";
		diag="";
		medication = "";	
		$.mc_from.value ="";
		$.mc_till.value = "";
		$.consday.value = "";
		$.injection_item.value = "";
		$.injection_item.value = "";
		$.xray_item.value = "";
		$.xrayamt.value= "";
		$.labtest_item.value= "";
		$.labtestamt.value= "";
		$.labtestfee.value= "";
		$.surginal_item.value= "";
		$.surginalamt.value= "";
		$.totalamt.value= "";
		$.bps.value= "";
		$.bpd.value= "";
		$.pulse.value= "";
		$.acnote.value= "";
		$.chnote.value= "";
		appcode = "";
	  	var msg = res[0].message.split("\n          ________________________"); 
	  	var signature = (_.isUndefined(msg[1]))?false:true;
	  	console.log("signature:"+signature);
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
	API.callByGet({url:"diagList"}, function(responseText){ 
		res = JSON.parse(responseText); 
		console.log(JSON.stringify(res)); 
		for (var i=0; i < res.length; i++) { 
			diagCategoryIdArr.push(res[i].code);
			diagCategoryArr.push( res[i].code+"-"+res[i].desc); 
		}
		
	 	//if(OS_IOS){
			diagCategoryArr.push("Cancel"); 
		//}
		 
	}); 
}
function getDrugList(){
	API.callByGet({url:"drugList",params:""},function(responceText){
		var drugList = JSON.parse(responceText);
		console.log("Drug list length:"+drugList.length);
		for(var i = 0; i < drugList.length; i++){
			drugCategoryArr.push(drugList[i].drugid+"-"+drugList[i].name+"-"+drugList[i].uom);
			drugCategoryArr1.push(drugList[i]);
		}
		drugCategoryArr.push("Cancel");
	});
}

function openDiagPicker(tf){ 
	 if(Ti.Platform.osname === 'android'){
         Ti.UI.Android.hideSoftKeyboard();
    }
    
	var curSelection = "0";
	var cancelBtn = diagCategoryArr.length -1;
	if(typeof tf.source != "undefined"){
		console.log("tf source");
		if(tf.source.id == "diag1"){
			curSelection = selectedDiag1;
		}
	}else{
		console.log("tf position:"+tf.position);
		curSelection = tf.position;
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
			if(typeof tf.source == "undefined"){
				tf.value = diagCategoryArr[e.index];  
				tf.name = diagCategoryIdArr[e.index];				
				tf.color = "#000000";	
				tf.position = e.index; 								
			}
			else{
				tf.source.value = diagCategoryArr[e.index];  
				tf.source.name = diagCategoryIdArr[e.index];								
				tf.source.color = "#000000";		
				selectedDiag1 = e.index;		
			}
		}
	});
}
function openDayPicker(lb){ 
    
	var daynight = ['Consultation Charges (Day)','Consultation Charges (Night)'];
	var day = ['consday','consnight'];
	var curSelection = "0";	 
	var dialog = Ti.UI.createOptionDialog({
	 options: daynight,
	  selectedIndex: parseInt(curSelection),
	  title: 'Choose Diag Type'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		$.day.text = daynight[e.index];  
		$.day.name = day[e.index];								
		$.day.color = "#000000";	
		$.consday.hintText = daynight[e.index];	
		if($.day.text == ""){
			$.day.text = "Consultation Charges (Day)";
			$.day.name = "consday";								
			$.day.color = "#000000";	
			$.consday.hintText = "Consultation Charges (Day)";				
		}	
	});
}
function openDrugPicker(tf){

	if(OS_ANDROID){
		Ti.UI.Android.hideSoftKeyboard();
	} 
	var curSelection = "0";
	var cancelBtn = drugCategoryArr.length -1;
	if(typeof tf.source != "undefined"){
		console.log("tf source");
		if(tf.source.id == "drug1"){
			curSelection = selectedDrug1;
			console.log("CurSelection:"+curSelection);
		}
	}else{
		console.log("tf position:"+tf.position);
		curSelection = tf.position;
	}	 
	var dialog = Ti.UI.createOptionDialog({
	 cancel: drugCategoryArr.length -1,
	 options: drugCategoryArr,
	  selectedIndex: parseInt(curSelection),
	  title: 'Choose Drug Type'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		if(cancelBtn != e.index){ 
			if(typeof tf.source == "undefined"){
				tf.position = e.index;
				tf.value = drugCategoryArr[e.index]; 
				tf.did = drugCategoryArr1[e.index].drugid;
				tf.dname = drugCategoryArr1[e.index].name;
				tf.duom = drugCategoryArr1[e.index].uom;				 
				tf.color = "#000000";				
			}
			else{
				selectedDrug1 = e.index;
				tf.source.value = drugCategoryArr[e.index];  
				tf.source.did = drugCategoryArr1[e.index].drugid;
				tf.source.dname = drugCategoryArr1[e.index].name;
				tf.source.duom = drugCategoryArr1[e.index].uom;					
				tf.source.color = "#000000";				
			}
		}
	});	
}
function hideSoftKeyboard(e){
    if(OS_ANDROID){
         Ti.UI.Android.hideSoftKeyboard();
    } else {
        $.myViewForm.name.blur();
        $.myViewForm.telephone.blur();
    }
}
function addDiagnosis(e){
	
	for(var i = 0; i < $.diagnosis_mother.getChildren().length; i++){
		var value = $.diagnosis_mother.getChildren()[i]._children[1].value;
		if(value == ""){
			alert("Please select diagnosis!!!");
			return;
		}		
	}
	var container = $.UI.create("View",{classes:['wfill','hsize','horz'],top:"10"});
	var title = $.UI.create("Label",{classes:['form_lb_top'], width:"25%", text:"Diagnosis"});
	var tf = $.UI.create("TextField",{classes:['wfill','hsize','tf_spacing'],width:"57%", hintText:"Diagnosis",position:0,id:"diag2",name:""});
	var bt = $.UI.create("Button",{classes:['button_delete','wsize'],right:"3",title:"Remove"});	
	container.add(title);
	container.add(tf);
	container.add(bt);
	bt.addEventListener("click",function(e){
		$.diagnosis_mother.remove(container);
	});	
	tf.addEventListener("touchend",function(e){
		openDiagPicker(tf);
	});	
	$.diagnosis_mother.add(container);
}
function getTotalCharges(e){
	var mc_charges = parseFloat($.mc_charges.value) || 0;
	var consday = parseFloat($.consday.value) || 0;
	var injectamt = parseFloat($.injectamt.value) || 0;
	var xrayamt = parseFloat($.xrayamt.value) || 0;
	var labtestamt = parseFloat($.labtestamt.value) || 0;
	var surginalamt = parseFloat($.surginalamt.value) || 0;
	var labfee = parseFloat($.labtestfee.value)||0;
	totalcharges = mc_charges+consday+injectamt+xrayamt+labtestamt+surginalamt+labfee;
	$.totalamt.value = totalcharges;
}
function getMcTotalCharges(e){
	var mc_charges = 0;
	var open=false;
	var three = 3;
	var five = 5;
	console.log("mc_mother length:"+$.medication_mother.getChildren().length);
	for(var i = 0;i < $.medication_mother.getChildren().length;i++){
		console.log($.medication_mother.getChildren()[i]._children);		
		var qty = parseFloat($.medication_mother.getChildren()[i]._children[three].value || 0);
		var cost = parseFloat($.medication_mother.getChildren()[i]._children[five].value || 0);
		console.log("mc value:"+qty+" "+cost);
		var res = cost * qty;
		mc_charges += res;
		open=true;
		if(open){
			three=4;
			five=6;
		}
	}
	$.mc_charges.value = mc_charges;
	mctotalcharges = mc_charges;
	console.log("mc_charges"+mc_charges);
}
Ti.App.addEventListener('getCardData', getCardData);
Ti.App.addEventListener('cardReader:closeWindow', closeWindow);
		 
$.win.addEventListener("close", function(){ 
	Ti.App.Properties.setString("card_data","");
	Ti.App.removeEventListener('cardReader:closeWindow', closeWindow);
	Ti.App.removeEventListener('getCardData', getCardData);
});