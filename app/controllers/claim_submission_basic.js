var args = arguments[0] || {};
var t_id = args.t_id || undefined;
var c_no = args.c_no || undefined;
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
var mctotalcharges=0;
var totalcharges=0;
var till;
var from;
checkingID(t_id,c_no);
function checkingID(t_id1,c_no1){
	if(typeof t_id1 == "undefined"){
		setTimeout(function(){
			COMMON.createAlert("Warning", "Terminal ID not found !!!", function(){
				closeWindow();				
			});
			console.log("t_id:"+t_id);				
		},1000);		
	}else{
		$.terminal_id.value = t_id1;
	}
	if(typeof c_no1 == "undefined"){
		setTimeout(function(){
			COMMON.createAlert("Warning", "Card No. not found!!!", function(){
				closeWindow();
			});
		},1000);
	}else{
		$.cardno.value = c_no1;
	}
}

function closeWindow(){
	COMMON.openWindow(Alloy.createController("cardReader").getView());
	setTimeout(function(){
		$.win.close();
		$.destroy();	
	},1000);
}
init();


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


function init(){
	$.win.add(loading.getView());
	if(Ti.Platform.osname == "android" ){
		//getDiag($.diag1);
	//	getDiag($.diag2);
	}
	getDiagCategory();
	//setTimeout(function(e){SCANNER.openScanner("1");}, 500);
}

var submit = true;
function claim_submit(){
	if(submit){
		submit=false;
		loading.start();
		var tid = $.terminal_id.value || 0;
		var cardno = $.cardno.value || 0;	
		var dayamt1 = ($.day.name == "consday")?$.consday.value : 0;
		var nightamt1 = ($.day.name == "consnight")?$.consday.value : 0;
		var dayamt = dayamt1 || 0;
		var nightamt = nightamt1 || 0;
		var diag1 = $.diag1.name || 0;
		var diag2 = $.diag2.name || 0; 
		var mc = $.mc_charges.value || 0;
		var injectamt = $.injectamt.value || 0;
		var xrayamt = $.xrayamt.value || 0;
		var labamt = $.labtestamt.value || 0;
		var suramt = $.surginalamt.value || 0;
		var totalamt = $.totalamt.value || 0;
		var medamt = $.mc_charges.value || 0;
		var mcday = $.mcday.value || 0;
		var appcode = "1234";
		var total = $.totalamt.value ||0;
		API.callByGet({url:"terminalsub1", params: "action=PAY&terminal="+tid+"&cardno="+cardno+"&diag1="+diag1+"&diag2="+diag2+"&mc="+mc+"&consday="+dayamt1+"&consnight="+nightamt1+"&medication="+medamt+"&injection="+injectamt
		+"&xray="+xrayamt+"&labtest="+labamt+"&surgical="+suramt+"&total="+total+"&appcode="+appcode}, function(responseText){
		  	//console.log(responseText);
	 
		  	var res = JSON.parse(responseText); 
			console.log(res);
			appcode = "";
		  	var msg = res[0].message.split("\n          ________________________"); 
		  	var signature = (_.isUndefined(msg[1]))?false:true;
		  	console.log("signature:"+signature);
		  	submit = true;
			Alloy.Globals.Navigator.open("receipt", {displayHomeAsUp: true, message: msg[0], signature: signature, terminal_id: terminal_id, record: res[0], appcode: res[0].appcode});
			loading.finish();
		});
	}
}	
		

function getDiagCategory(){
	API.callByPost({url:"getDiagList"}, function(responseText){ 
		res = JSON.parse(responseText); 
		console.log(JSON.stringify(res)); 
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
function hideSoftKeyboard(e){
    if(OS_ANDROID){
         Ti.UI.Android.hideSoftKeyboard();
    } else {
        $.mc_charges.blur();
    }
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
		if(e.index > -1){
			$.day.text = daynight[e.index];  
			$.day.name = day[e.index];								
			$.day.color = "#000000";	
			$.consday.hintText = daynight[e.index];				
		}	
	});
}
Ti.App.addEventListener('cardReader:closeWindow', closeWindow);
		 
$.win.addEventListener("close", function(){ 
	Ti.App.Properties.setString("card_data","");
	Ti.App.removeEventListener('cardReader:closeWindow', closeWindow);
});