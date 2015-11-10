var args = arguments[0] || {};

/**
$.menu.addEventListener('itemclick', function(e){
	var item = e.section.getItemAt(e.itemIndex); 
	nav.navigateWithArgs("hra_detail", {mod: item.properties.mod});
});
**/

$.menu.addEventListener('click', function(e){ 
	var elbl = JSON.stringify(e.rowData); 
	var res = JSON.parse(elbl); 
	Alloy.Globals.Navigator.open("hra_detail", {mod: res.mod}); 
});

if(OS_ANDROID){
	$.btnBack.addEventListener('click', function(){  
		$.win.close();
	}); 
}