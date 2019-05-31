var args = arguments[0] || {};
var message = args.message;
var appcode = args.appcode;
var screenShotBlob;
var loading = Alloy.createController("loading");
var arr = args.arr;
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
	$.receiptView.hide();
	var blob = e.blob;


	var index = blob.indexOf('base64,');
	blob = blob.substring(index + 'base64,'.length);
	screenShotBlob = Ti.Utils.base64decode(blob);
	if(screenShotBlob.width > screenShotBlob.height){
		var newWidth = 1024;
		var ratio =   1024 / screenShotBlob.width;
		var newHeight = screenShotBlob.height * ratio;
	}else{
		var newHeight = 1024;
		var ratio =   1024 / screenShotBlob.height;
		var newWidth = screenShotBlob.width * ratio;
	}
  console.log(newWidth+", "+newHeight);
	screenShotBlob = screenShotBlob.imageAsResized(newWidth, newHeight);
	submit_receipt();
}

function resetSignature(){
	Ti.App.fireEvent("web:resetSignature");
}

function submit_receipt(){
	loading.start();
	//submit to server
	var param = {
		u_id	  :  Ti.App.Properties.getString('terminal_id')||0,
		item_id	  :  appcode
	};
	var img_param = {
		"photo" : screenShotBlob,
	};
	API.callByPostImage({url:"uploadReceiptImageUrl", params: param, img: img_param}, function(responseText){
		var res = JSON.parse(responseText);
		if(res.status == "success"){
			COMMON.createAlert("Success", "Receipt successfully submitted", function(){
				var patient_recordsModel = Alloy.createCollection('patient_records');
		 		//var model = Alloy.createCollection("terminalsub");
		 		//model.saveArray(arr);
				var string_card_data = Ti.App.Properties.getString("card_data");
				var datenow = COMMON.now();
				var patient_param = {
					memno:args.record.memno,
					name:args.record.name,
					corpcode:args.record.corpcode,
					corpname:args.record.corpname,
					visitdate:datenow
				};
				_.extend(patient_param, {terminal_id: args.terminal_id,type: "paid", receipt_url: res.data.receipt_url});
				patient_recordsModel.addUserData([patient_param]);
				closeWindow();
				Ti.App.fireEvent("claim_submit:closeWindow");
			});
		}else{
			COMMON.createAlert("Error", res.data);
			return false;
		}
		loading.finish();
	});
}

function web_receipt_loaded(){
	Ti.App.fireEvent("web:render_message", {message: message, signature: args.signature});
	loading.finish();
}

function init(){
	loading.start();
	if(!args.signature){
		$.button_panel.hide();
	}
	$.win.add(loading.getView());
	$.receiptView.url = "/html/receipt.html";
}

Ti.App.addEventListener("app:screenshot", screenshot);
Ti.App.addEventListener("web_receipt_loaded", web_receipt_loaded);

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('app:screenshot', screenshot);
	Ti.App.removeEventListener("web_receipt_loaded", web_receipt_loaded);
});
$.win.addEventListener("android:back", function(){
	Ti.App.removeEventListener('app:screenshot', screenshot);
	Ti.App.removeEventListener("web_receipt_loaded", web_receipt_loaded);
});
