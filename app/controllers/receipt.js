var args = arguments[0] || {};
var message = args.message;
var appcode = args.appcode;
var screenShotBlob;
function closeWindow(){
	$.win.close();
}

init();

function refresh(){
	
}

function convertViewToBlob(){  
	 Ti.App.fireEvent("web:screenshot");
}

function screenshot(e){
	var blob = e.blob; 
	 var index = blob.indexOf('base64,');
	blob = blob.substring(index + 'base64,'.length); 
	screenShotBlob =Ti.Utils.base64decode(blob);
	submit_receipt();
}

function resetSignature(){
	Ti.App.fireEvent("web:resetSignature");
}
	
function submit_receipt(){
	 
	//submit to server
	var param = { 
		"u_id"	  :  Ti.App.Properties.getString('u_id'),   
		"item_id"	  :  appcode
	};
	var img_param = {  
		"photo" : screenShotBlob, 
	};
 console.log(param);
	API.callByPostImage({url:"uploadReceiptImageUrl", params: param, img: img_param}, function(responseText){ 
		var res = JSON.parse(responseText);    
		if(res.status == "success"){    
			COMMON.createAlert("Success", "Receipt successfully submitted", function(){
				var patient_recordsModel = Alloy.createCollection('patient_records'); 
				var string_card_data = Ti.App.Properties.getString("card_data");
				var patient_param = JSON.parse(string_card_data);
				_.extend(patient_param, {type: "paid", receipt_url: res.data.receipt_url});
				patient_recordsModel.addUserData(patient_param);
				closeWindow();
			});
		}else{
			COMMON.createAlert("Error", res.data);
			return false;
		}
			
	});	
}

function init(){
	//Ti.App.fireEvent("web:render_message", {message: message});
	console.log("geo resit:");
	console.log(appcode);
	console.log(message);
	setTimeout(function(e){
		$.receiptView.url = "/html/receipt.html";
	}, 500);
	setTimeout(function(e){Ti.App.fireEvent("web:render_message", {message: message, signature: args.signature});}, 1000);
}

Ti.App.addEventListener("app:screenshot", screenshot);

$.win.addEventListener("close", function(){ 
	Ti.App.removeEventListener('app:screenshot', screenshot);
});