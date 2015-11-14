var args = arguments[0] || {}; 
var patient_recordsModel = Alloy.createCollection('patient_records'); 
var details;
COMMON.construct($); 
init();


function init(){
 	showList();
}

function showList(){ 
	details = patient_recordsModel.getHistoryList(); 
	var data=[]; 
	$.recordTable.setData(data);
	var counter = 0; 
 
	if(details.length < 1){
		COMMON.hideLoading(); 
		$.recordTable.setData(common.noRecord());
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
				title: entry.name,
				top: 10,
				bottom: 10
			});
			  
			var clinicLbl = $.UI.create('Label',{
				classes : ['themeColor', 'h5', 'bold'],
				text:entry.memno || "",
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
			visitdate = visitdate.replace("  "," ");
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
	Alloy.Globals.Navigator.open('patient_details', {record_id:e.source});
}

function closeWindow(){
	$.win.close();
}