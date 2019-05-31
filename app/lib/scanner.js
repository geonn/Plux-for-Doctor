// load the Scandit SDK module
var scanditsdk = require("com.mirasense.scanditsdk");
scanditsdk.appKey = "qt/U+huGEeSG62SYxtngPa7xVDA0BLRMw7gQLH8qAB0"; 
scanditsdk.cameraFacingPreference = 0; 

// Sets up the scanner and starts it in a new window.
exports.openScanner = function(scanType) {
	// First set the app key and which direction the camera should face.
	console.log("scanType"+scanType);
	// Only after setting the app key instantiate the Scandit SDK Barcode Picker view
	var picker = scanditsdk.createView({
		width:"100%",
		height:"100%"
	});
	// Before calling any other functions on the picker you have to call init()
	picker.init();

	// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
	picker.showToolBar(true);

	// Create a window to add the picker to and display it. 
	var window = Titanium.UI.createWindow({  
			title:'Scandit SDK',
			navBarHidden:true
	});
	
	// Set callback functions for when scanning succeeds and for when the 
	// scanning is canceled. This callback is called on the scan engine's
	// thread to allow you to synchronously call stopScanning or
	// pauseScanning. Any UI specific calls from within this function 
	// have to be issued through setTimeout to switch to the UI thread
	// first.
	picker.setSuccessCallback(function(e) {
		var time1 = Ti.App.Properties.getString('time1') || ""; 
		var time2 = Ti.App.Properties.getString('time2') || ""; 
		var barcode = e.barcode;
		var barRes = barcode.split('||');
        if(typeof barRes[13] == "undefined"){
            var CryptoJS = require('sha256').CryptoJS;
            var AES = require('aes').CryptoJS;
        //generate private key
            var privateKey =  CryptoJS.SHA256("miku").toString();
            var text = e.barcode;
            var encryptedData = AES.AES.decrypt(text.toString(), privateKey);
            var tmp = encryptedData.toString(CryptoJS.enc.Utf8);
            var barRes2 = JSON.parse(tmp).split("||");
        }
		if(time1 == ""){
		    if(typeof barRes[13] != "undefined"){
		        Ti.App.Properties.setString('time1', barRes[13]); 
		    }else if(typeof barRes2[0] != "undefined"){
		        Ti.App.Properties.setString('time1', barRes2[1]); 
		    }
		}else{
			if(time1 == barRes[13] || time1 == barRes2[1]){
				console.log("Invalid scan. Please scan again with ASP Healthcare APP");
			}else{
			    if(typeof barRes[13] != "undefined"){
                    Ti.App.fireEvent('getCardData', {cardno: barRes[14]});
                }else if(typeof barRes2[1] != "undefined"){
                    Ti.App.fireEvent('getCardData', {cardno: barRes2[0]});
                }
				Ti.App.Properties.setString('time1', '');
				setTimeout(function() {
					window.close();
					window.remove(picker);
				}, 1);
			}
		}
	});
	picker.setCancelCallback(function(e) {
		picker.stopScanning();
		window.close();
		window.remove(picker);
	});

	window.add(picker);
	window.addEventListener('open', function(e) {
		picker.startScanning();		// startScanning() has to be called after the window is opened. 
	});
	window.open();
};
