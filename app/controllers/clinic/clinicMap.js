var args = arguments[0] || {};

				
var maps = args.map_url;
 
$.panelMap.add(Ti.UI.createWebView({
	url: maps,
	width:Ti.UI.FILL,
	height:Ti.UI.FILL, 
	
}));  