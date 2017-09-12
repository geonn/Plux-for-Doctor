/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.1
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion") || "1.3";
	dbVersion="1.2";
	if (dbVersion == '1.2') {
	  /*
	   version 1.1 upgrade
	   * */
	  var model = Alloy.createCollection('patient_records'); 
	  model.addColumn("terminal_id", "TEXT");
	  dbVersion = '1.3';
	}
	
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

