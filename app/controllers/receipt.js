var args = arguments[0] || {};
var message = args.message;
var appcode = args.appcode;
function closeWindow(){
	$.win.close();
}

init();

function refresh(){
	
}

function submit_receipt(){
	//submit to server
	var param = { 
		"u_id"	  :  Ti.App.Properties.getString('u_id'),   
		"item_id"	  :  appcode
	};
	var img_param = {  
		"photo" : $.receiptView.toImage(), 
	};
 console.log(param);
	API.callByPostImage({url:"uploadReceiptImageUrl", params: param, img: img_param}, function(responseText){ 
		var res = JSON.parse(responseText);    
		if(res.status == "success"){    
			COMMON.createAlert("Success", "Receipt successfully submitted", function(){ 
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
	setTimeout(function(e){Ti.App.fireEvent("web:render_message", {message: message, signature: args.signature});}, 1000);
}

$.win.addEventListener("close", function(){ 
	//Ti.App.removeEventListener('getCardData', getCardData);
});