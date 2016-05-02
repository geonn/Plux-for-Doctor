// Arguments passed into this controller can be accessed off of the `$.args` object directly or:
var args = $.args; 
var panel_id = args.panel_id || ""; 
var specialtyModel = Alloy.createCollection('specialty');
var doctorPanelModel = Alloy.createCollection('doctor_panel');
var u_id = Ti.App.Properties.getString('u_id');
common.construct($); 

init();

function init(){ 
	common.showLoading(); 
	var list = specialtyModel.getData();
	var dp = doctorPanelModel.getDoctorPanelSpecialty(u_id,panel_id);
	
	var dplist = [];
	if(dp.length >= 1){
		dp.forEach(function(dpentry) {
			dplist.push(dpentry.specialty_id);
		});
	}
	 console.log(dplist);
	var data=[];  
	$.specialtyListTv.setData(data);
	$.specialtyListTv.removeEventListener('click', doAddRemoveSpecialty);
   		var arr = list;
   		var counter = 0; 
   		 
   		if(arr.length < 1){
   			common.hideLoading();
			var noRecord = Ti.UI.createLabel({ 
			    text: "No specialty found", 
			    color: '#CE1D1C', 
			    textAlign: 'center',
			    font:{fontSize:14,fontStyle:'italic'},
			    top: 15,
			    width: Ti.UI.SIZE 
			 });
			var row = Titanium.UI.createTableViewRow({
			    touchEnabled: true,
			    height: Ti.UI.SIZE,
			    backgroundSelectedColor: "#FFE1E1",
				color: "transparent"
			   });
			row.add(noRecord);
			data.push(row);
			$.specialtyListTv.setData(data);
		}else{ 
	   		arr.forEach(function(entry) {
	   			var isExists = dplist.indexOf(entry.id);
	   			var isCheck =false;
	   			if(isExists != "-1"){
	   				isCheck =true;
	   			}
	   			
	   			var row = Titanium.UI.createTableViewRow({
				    touchEnabled: true,
				    height: Ti.UI.SIZE,
				    source: entry.id,
				    backgroundSelectedColor: "#FFE1E1",
				    isCheck: isCheck,
					//title :  entry.clinicName,
					color: "transparent"
				   });
				
				var contentView = Ti.UI.createView({
					layout: "vertical",
					height: Ti.UI.SIZE,
					width: Ti.UI.FILL
				});
				
				var cn = entry.title.replace("[quot]", "'");
				var clinicLbl = Titanium.UI.createLabel({
					text:cn,
					font:{fontSize:14,fontWeight: 'bold'},
					source: entry.id,
					isCheck: isCheck,
					color: "#8A8A8A", 
					textAlign:'left',  
					top:10,
					bottom:10,
					left:15, 
					width:"80%",
					height:Ti.UI.SIZE
				}); 
				contentView.add(clinicLbl);
				
				row.add(contentView);
				
				var rightForwardBtn =  Titanium.UI.createImageView({
						image:"/images/tick.png",
						source: entry.id,
						isCheck: isCheck,
						width:15,
						right:20 
				});
				if(!isCheck){
					rightForwardBtn.visible =false;
				}
				row.add(rightForwardBtn);  
				data.push(row);
	   		});
	   		
	   		
	   		$.specialtyListTv.setData(data);
	   		common.hideLoading();
		}
		
		$.specialtyListTv.addEventListener('click', doAddRemoveSpecialty);
}

function doAddRemoveSpecialty(e){
	 
	var action = "add";
	if(e.rowData.isCheck){
		action = "delete";
	}
	//submit to server
	var param = { 
		"doctor_id"	  :  u_id,
		"clinic_id" : panel_id,
		"specialty_id" : e.rowData.source,  
		"action" : action,
	};
 	console.log(param);
	API.callByPost({url:"updateDoctorPanelUrl", params: param}, function(responseText){ 
		var res = JSON.parse(responseText);    
		 
		if(res.status == "success"){    
			var param2 = { 
				"doctor_id"	  :  u_id 
			}; 
			API.callByPost({url:"getDoctorPanelUrl", params: param2}, function(responseText){ 
				var resDp = JSON.parse(responseText);   
				var arrDp = resDp.data; 
				doctorPanelModel.resetRecordByDoctor(u_id);
	        	doctorPanelModel.saveArray(arrDp);
	        	init();
			});


		}else{
			COMMON.createAlert("Error", res.data);
			return false;
		}
			
	});
}
