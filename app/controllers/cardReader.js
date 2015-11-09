var args = arguments[0] || {};

function closeWindow(){
	$.win.close();
}

function init(){
	var SCANNER = require("scanner"); 
	// Create a window to add the picker to and display it. 
	var window = SCANNER.createScannerWindow(); 
	// create start scanner button
	var button = SCANNER.createScannerButton();  
	$.scanner.addEventListener('click', function() {
		SCANNER.openScanner("1");
	});
		 
	SCANNER.init(window); 
	
 	showList();
}

function showList(){
	
} 