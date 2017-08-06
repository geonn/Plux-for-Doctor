var args = arguments[0] || {};
var clinicType = args.clinicType || "CLINIC";
var library = Alloy.createCollection('panelList');
var corp = "";
var list;
var aspClinicArr = [];
var selectedClinicIndex = 0;
var  selectedLocationIndex = 0;
if(clinicType == "hours24"){
	clinicType = "24 Hours";
}

Ti.App.Properties.setString('clinicTypeSelection', clinicType);  
var clinicLocationSelection = Ti.App.Properties.getString('clinicLocationSelection'); 
var clinicLocationSelection = (clinicLocationSelection != null )? clinicLocationSelection :"All";
common.construct($); 
common.showLoading();

$.clinicTypeSelection.text = clinicType;
$.clinicLocationSelection.text = clinicLocationSelection;

$.win.title = "Locator List";

setTimeout(function(){
	loadData(corp);
}, 1000);

function listing(){   
	var data=[];  
	$.clinicListTv.setData(data);
   		var arr = list;
   		var counter = 0; 
   		 
   		if(arr.length < 1){
   			common.hideLoading();
			var noRecord = Ti.UI.createLabel({ 
			    text: "No clinic found", 
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
			$.clinicListTv.setData(data);
		}else{ 
	   		arr.forEach(function(entry) {
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
					image:"/images/btn-forward.png",
					source: entry.id,
					width:15,
					right:20 
				});
				
				row.add(contentView);
				row.add(rightForwardBtn); 
			 
				data.push(row);
	   		});
	   		
	   		
	   		$.clinicListTv.setData(data);
	   		common.hideLoading();
		}
		
		_.debounce(navClinicDetail, 3000, true);
		$.clinicListTv.removeEventListener('click', navClinicDetail);
		$.clinicListTv.addEventListener('click', navClinicDetail);
}

function navClinicDetail(e){
	
	console.log(e.rowData.source+" pandel_id");
	if(typeof e.rowData.source != "undefined"){
		common.showLoading();
		Alloy.Globals.Navigator.open("clinic/clinicDetails", {panel_id:e.rowData.source, displayHomeAsUp: true});
		common.hideLoading();
	}
	
	return false;
}
	/***SEARCH FUNCTION***/
	function searchResult(){
		$.searchItem.blur(); 
		common.showLoading();
		var str = $.searchItem.getValue(); 
		if(str != ""){
			if(Ti.App.Properties.getString('clinicTypeSelection') == "24 Hours"){  
				list = library.getPanelBy24Hours(str, corp); 
			}else{ 
				list = library.getPanelByClinicType(Ti.App.Properties.getString('clinicTypeSelection'), str, corp);     
			}
			listing();
		}else{
			loadData(corp);
		}	
	}
	
	$.searchItem.addEventListener("return", searchResult);

	$.searchItem.addEventListener('focus', function f(e){
		$.searchItem.removeEventListener('focus', f);
	});
	
	$.searchItem.addEventListener('cancel', function(e){ 
		$.searchItem.blur();
		loadData(corp);
	});
	
	$.searchItem.addEventListener('blur', function(e){
		 
	});
 
function showTypeSelection(){
	var clinicTypeList = library.getCountClinicType(corp); 
	var det24= { 
		clinicType: "24 Hours"
	};
	clinicTypeList.splice(1, 0, det24);
	var clinicArr = [];
	clinicTypeList.forEach(function(entry) { 
		clinicArr.push(ucwords(entry.clinicType));
	}); 
	clinicArr.push("Cancel"); 
	var cancelBtn = clinicArr.length -1;
	var dialog = Ti.UI.createOptionDialog({
		  cancel: clinicArr.length -1,
		  options: clinicArr,
		  selectedIndex: selectedClinicIndex,
		  title: 'Choose Type'
		});
	
		dialog.show();
		dialog.addEventListener("click", function(e){   
			var cancelBtn = clinicArr.length -1;
			if(cancelBtn != e.index){
				selectedClinicIndex = e.index;
				dialog.selectedIndex = e.index;
				$.clinicTypeSelection.text = clinicArr[e.index]; 
				Ti.App.Properties.setString('clinicTypeSelection', clinicArr[e.index]);  
				if(clinicArr[e.index] == "24 Hours"){   
					list = library.getPanelBy24Hours("", corp);   
				}else{
					list = library.getPanelByClinicType(clinicArr[e.index],"", corp);   
				}
				common.showLoading();
				listing();
			}
		});
	 
}
 
function showLocationSelection(){ 
	 
	var stateList = library.getPanelListByState(); 
	var clinicLocationArr = []; 
	clinicLocationArr.push("All"); 
	stateList.forEach(function(entry) {
		if(entry.state != null){
			clinicLocationArr.push(ucwords(entry.state));
		} 
	});
	clinicLocationArr.push("Cancel"); 
	
	var dialog = Ti.UI.createOptionDialog({
		  cancel: clinicLocationArr.length -1,
		  options: clinicLocationArr,
		  selectedIndex: selectedLocationIndex,
		  title: 'Choose Location'
	});
	
	dialog.show();
	dialog.addEventListener("click", function(e){   
		var cancelBtn = clinicLocationArr.length -1;
		if(cancelBtn != e.index){
			selectedLocationIndex  = e.index;
			dialog.selectedIndex = e.index;
			$.clinicLocationSelection.text = clinicLocationArr[e.index];
			
			if(e.index == "0"){
				Ti.App.Properties.setString('clinicLocationSelection', null); 
			}else{
				Ti.App.Properties.setString('clinicLocationSelection', clinicLocationArr[e.index]);  
			}
			
				
			//list = library.getPanelByClinicType(Ti.App.Properties.getString('clinicTypeSelection'),"", corp); 
			if(Ti.App.Properties.getString('clinicTypeSelection') == "24 Hours"){   
				list = library.getPanelBy24Hours("", corp);   
			}else{
				list = library.getPanelByClinicType(Ti.App.Properties.getString('clinicTypeSelection'),"", corp);   
			}
			common.showLoading();
			listing();    
		}
	});
	 
}
 

function loadData(corp){
	if(clinicType == "24 Hours"){ 
		list = library.getPanelBy24Hours("", corp);   
	}else{ 
		list = library.getPanelByClinicType(clinicType,"", corp);   
	} 
	common.showLoading();
	listing();
}

 if(OS_IOS){
	_.debounce(btnSearch, 3000);
	_.debounce(navClinicLcator, 3000);
	$.btnSearch.addEventListener('click', btnSearch);
	$.btnMap.addEventListener('click', navClinicLcator);
 }
	function btnSearch(e){ 
		var isVis=  $.searchItem.getVisible(); 
		if(isVis === true){ 
			$.searchItem.visible = false;
			$.searchItem.height = 0;
			
		}else{ 
			$.searchItem.visible = true;
			$.searchItem.height = 50;
		}
	}
	
	function navClinicLcator(e){
		console.log("clinicTypeSelection:"+Ti.App.Properties.getString('clinicTypeSelection'));
		console.log("clinicLocationSelection:"+Ti.App.Properties.getString('clinicLocationSelection'));
		Alloy.Globals.Navigator.open("clinic/clinicLocator", { clinicType: Ti.App.Properties.getString('clinicTypeSelection'), location: Ti.App.Properties.getString('clinicLocationSelection'), displayHomeAsUp: true });
	}

$.win.addEventListener("close", function(){
	$.destroy(); 
    
});

