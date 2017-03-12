var args = arguments[0] || {}; 
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var details;
COMMON.construct($); 
init(); 

function init(){  
	var terminal_id = Ti.App.Properties.getString("terminal_id");
	//patient_recordsModel.updateTerminateId(terminal_id);
	details = patient_recordsModel.getHistoryList("", terminal_id); 
	console.log(details);
 	showList();
}

function showList(){ 
	
	var data=[]; 
	$.recordTable.setData(data);
	var counter = 0; 
 
	if(details.length < 1){
		COMMON.hideLoading(); 
		$.recordTable.setData(COMMON.noRecord());
	}else{
		details.forEach(function(entry) {
			 
			var row = Titanium.UI.createTableViewRow({
			    touchEnabled: true,
			    height: Ti.UI.SIZE,
			    source: entry.id, 
			    backgroundSelectedColor: "#FFE1E1", 
				color: "transparent", 
			   });
		 
			var contentView = $.UI.create('View',{
				classes: ['vert','hsize','wfill'], 
				source: entry.id,  
				top: 10,
				bottom: 10
			});
			  
			var clinicLbl = $.UI.create('Label',{
				classes : ['themeColor', 'h5'],
				text:entry.name +" ("+entry.memno  + ")",
				font:{fontSize:14},
				source: entry.id, 
				title: entry.memno, 
				textAlign:'left',   
				left:15, 
				width:"80%",
				height:Ti.UI.SIZE
			}); 
			contentView.add(clinicLbl);
			
			 var msgLbl =  $.UI.create('Label',{ 
				classes: ['h6', 'hsize'],
				text:  entry.corpname,
				source: entry.id,   
				textAlign:'left', 
				left:15, 
				width: "85%", 
			}); 
			 
			contentView.add(msgLbl);
			
			var visitdate = entry.visitdate;
			//visitdate = visitdate.replace("  "," ");
			var appLbl =  $.UI.create('Label',{ 
				classes: ['h6'],
				text:  "Visit Updated : "+monthFormat(visitdate), 
				source: entry.id,  
				textAlign:'left', 
				left:15, 
				width: "85%",
				height:Ti.UI.SIZE
			}); 
			contentView.add(appLbl);
			
			var rightForwardBtn =  Titanium.UI.createImageView({
				image:"/images/btn-forward.png",
				source: entry.id,  
				width:15,
				right:20 
			});
		 
			row.add(contentView);
			row.add(rightForwardBtn); 
			if(entry.url != ""){
				row.addEventListener('click', function(e) {
					viewDetails(e.rowData);
				});
			}
		 	
			data.push(row);
		});
	
		
		$.recordTable.setData(data);
	}
	COMMON.hideLoading(); 
}

function viewDetails(e){ 
	Alloy.Globals.Navigator.open('patient_details', {record_id:e.source, displayHomeAsUp: true});
}


/***SEARCH FUNCTION***/
var searchResult = function(){ 
	$.searchBar.blur(); 
	//COMMON.showLoading();
	var str = $.searchBar.getValue(); 
	if(str != ""){
		details = patient_recordsModel.getHistoryList(str); 
	}else{ 
		details = patient_recordsModel.getHistoryList(""); 
	}	
	showList(); 
};

$.searchBar.addEventListener("return", searchResult);

$.searchBar.addEventListener('focus', function f(e){
	$.searchBar.removeEventListener('focus', f);
});

$.searchBar.addEventListener('cancel', function(e){ 
	//listing = educationModel.getSchoolList("all",educationType,""); 
//	createSchoolList(); 
	$.searchBar.blur();
});

$.searchBar.addEventListener('blur', function(e){
	
});

function closeWindow(){
	$.win.close();
}