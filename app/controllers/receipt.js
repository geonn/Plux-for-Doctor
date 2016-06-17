var args = arguments[0] || {};
var message = args.message;

function closeWindow(){
	$.win.close();
}

init();

function refresh(){
	
}
 

function init(){
	//Ti.App.fireEvent("web:render_message", {message: message});
	console.log("geo resit:");
	console.log(message);
	setTimeout(function(e){Ti.App.fireEvent("web:render_message", {message: message, signature: args.signature});}, 1000);
}

$.win.addEventListener("close", function(){ 
	//Ti.App.removeEventListener('getCardData', getCardData);
});