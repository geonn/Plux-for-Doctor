/*********************
*** APP VERSION CONTROL ***
* 
* Latest Version 1.1.4
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
<<<<<<< HEAD
	Ti.App.Properties.setString("appVersion", "1.0.2");
=======
	Ti.App.Properties.setString("appVersion", "1.0.4");
>>>>>>> origin/master
	API.checkAppVersion(callback_download);
};

function callback_download(e){
	var urlToUpdate = e.data;
 
	var dialog = Ti.UI.createAlertDialog({
	  cancel: 1,
	  buttonNames: ['Download', 'Cancel'],
	  title: "Latest version download",
	  message: 'Latest version found : '+e.currentVersion
	});
	
	dialog.show(); 
	dialog.addEventListener("click", function(ex){
		if(ex.index == 0){
			try {
			
				Ti.Platform.openURL(urlToUpdate);/*
				var intent = Ti.Android.createIntent({
				    action: Ti.Android.ACTION_VIEW,
				    data: "http://bit.ly/1U7Qmd8",
				    type: "application/vnd.android.package-archive",
				  });
				  Ti.Android.currentActivity.startActivity(intent);*/
			} catch(e) {
			    Ti.API.info("e ==> " + JSON.stringify(e));
			}
		}
	});
	
}
