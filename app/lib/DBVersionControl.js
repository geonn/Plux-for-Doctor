/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.1
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion") || "1.0";
	
	if (dbVersion == '1.0') {
	  /*
	   version 1.1 upgrade
	   * */
	  var appointment_model = Alloy.createCollection('appointment'); 
	  appointment_model.addColumn("patient_name", "TEXT");
	  dbVersion = '1.1';
	}
	
	if (dbVersion == '1.1') {
	  /*
	   version 1.1 upgrade
	   * */
	  var pr = Alloy.createCollection('patient_records'); 
	  pr.addColumn("type", "TEXT");
	  pr.addColumn("receipt_url", "TEXT");
	  
	  dbVersion = '1.2';
	}
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

