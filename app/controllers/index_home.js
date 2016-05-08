/**
 * Global Navigation Handler
 */

_.debounce(navTo, 3000, true);

Alloy.Globals.Navigator = {
	/**
	 * Handle to the Navigation Controller
	 */
	navGroup: $.nav,
	open: navTo
};

function navTo(controller, payload){
	console.log(controller);
	var win = Alloy.createController(controller, payload || {}).getView();
	
	if(OS_IOS){
		Alloy.Globals.Navigator.navGroup.openWindow(win);
	}else if(OS_MOBILEWEB){
		Alloy.Globals.Navigator.navGroup.open(win);
	}else{
		
		// added this property to the payload to know if the window is a child
		console.log(typeof payload.displayHomeAsUp+" action bar");
		if (typeof payload.displayHomeAsUp !="undefined"){
			
			win.addEventListener('open',function(evt){
				var activity=win.activity;
				activity.actionBar.displayHomeAsUp=payload.displayHomeAsUp;
				activity.actionBar.onHomeIconItemSelected=function(){
					evt.source.close();
				};
			});
		} 
		win.open();
	}
}

function init(){
	if(OS_IOS){
		Alloy.Globals.Navigator.navGroup = $.nav;
	}else{
		Alloy.Globals.Navigator.navGroup = $.index.getView();
	}
	Alloy.Globals.Navigator.navGroup.open({navBarHidden: true, fullscreen: true});
}

init();