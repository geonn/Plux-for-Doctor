var args = arguments[0] || {}; 
var panelListModel = Alloy.createCollection('panelList'); 
common.construct($); 

init();

function init(){
	common.showLoading();
	showList("0"); 
}

function doEdit(){
	$.editLbl.visible = false;
	$.doneLbl.visible = true;
	showList("1");
}

function doDone(){
	$.editLbl.visible = true;
	$.doneLbl.visible = false;
	showList("0"); 
}

function showList(showEdit){
	var doctorPanel = Ti.App.Properties.getString('myClinics');
	//console.log("doctorPanel : "+doctorPanel);
	var myPanel = doctorPanel.split(",");
	
	if(myPanel.length > 1){ 
		var data = []; 
		var clinicListTv = Titanium.UI.createTableView({
			layout: "vertical",
			height: Ti.UI.FILL,
			top: 0,
			contentWidth: Ti.UI.FILL,
			contentHeight :  Ti.UI.SIZE,
			width: Ti.UI.FILL
		});
		for(var i=0; i< myPanel.length; i++){
			var entry = panelListModel.getDataByID(myPanel[i]);
	   			var row = Titanium.UI.createTableViewRow({
				    touchEnabled: true,
				    height: Ti.UI.SIZE,
				    source: entry.id,
				    backgroundSelectedColor: "#FFE1E1",
					//title :  entry.clinicName,
					color: "transparent"
				   });
				
				var contentView = Ti.UI.createView({
					layout: "vertical",
					height: Ti.UI.SIZE,
					width: Ti.UI.FILL
				});
				
				var cn = entry.clinicName.replace("[quot]", "'");
				var clinicLbl = Titanium.UI.createLabel({
					text:cn,
					font:{fontSize:14,fontWeight: 'bold'},
					source: entry.id,
					color: "#CE1D1C", 
					textAlign:'left',  
					top:5,
					left:15, 
					width:"80%",
					height:Ti.UI.SIZE
				}); 
				contentView.add(clinicLbl);
				
				var mobileLbl = Titanium.UI.createLabel({
					text:"Tel: " +entry.tel,
					font:{fontSize:12},
					source: entry.id,
					color: "#848484", 
					textAlign:'left', 
					left:15,
					height:Ti.UI.SIZE
				}); 
				contentView.add(mobileLbl);
			  	
			  	if(entry.city != "" ){
			  		entry.city = ", " + entry.city;
			  	}
			  	if(entry.state != "" ){
			  		entry.state = ", " + entry.state;
			  	}
				var distLbl = Titanium.UI.createLabel({
					text:  entry.postcode +  entry.city + entry.state,
					font:{fontSize:12},
					source: entry.id,
					color: "#848484", 
					textAlign:'left', 
					left:15,
					bottom:5,
					width: "85%",
					height:Ti.UI.SIZE
				}); 
				contentView.add(distLbl);
				
				var rightForwardBtn =  Titanium.UI.createImageView({
					image:"/images/knob_remove_red.png",
					source: entry.id,
					width:15,
					right:20 
				});
				
				row.add(contentView);
				
				if(showEdit == "1"){
					row.add(rightForwardBtn); 
				}
				 
				data.push(row); 
	   		
	   		
		}
		clinicListTv.setData(data);
		
		clinicListTv.addEventListener('click', function(e) { 
			var dialog = Ti.UI.createAlertDialog({
				cancel: 1,
				buttonNames: ['Cancel','Confirm'],
				message: 'Would you like to remove this panel?',
				title: 'Remove Panel'
			});
			dialog.addEventListener('click', function(ex){
				if (ex.index === ex.source.cancel){
				      //Do nothing
				}
				if (ex.index === 1){
					//submit to server
					var param = { 
						"u_id"	  :  Ti.App.Properties.getString('u_id'), 
						"action" : "remove",
						"clinic_id" : e.rowData.source
					};
				 
					API.callByPost({url:"updateDoctorPanelUrl", params: param}, function(responseText){ 
						var res = JSON.parse(responseText);   
						if(res.status == "success"){    
							COMMON.createAlert("Success", "Panel successfully removed", function(){
								$.editLbl.visible = true;
								$.doneLbl.visible = false;
								Ti.App.Properties.setString('myClinics',res.data);
								showList("0");
							});
						}else{
							COMMON.createAlert("Error", res.data);
							return false;
						}
							
					});
				}
			}); 
			dialog.show();  
		});
		common.removeAllChildren($.containerView);
		$.containerView.add(clinicListTv);
	   	common.hideLoading();
	}
}
