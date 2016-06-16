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
	console.log(message);
	setTimeout(function(e){Ti.App.fireEvent("web:render_message", {message: message, signature: args.signature});}, 500);
}

$.win.addEventListener("close", function(){ 
	//Ti.App.removeEventListener('getCardData', getCardData);
});