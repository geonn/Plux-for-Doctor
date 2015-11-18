var args = arguments[0] || {}; 
var data = []; 
var PDF = require('pdf'); 
var details;
var idaModel = Alloy.createCollection("ida");
/**
 * Closes the Window
 */
function closeWindow(){
	$.win.close();
}

function init(){
 	showList();
}

function showList(){
	details = idaModel.getIdaList();
	 
	if(details.length > 0){
 		  
	 	var view4 = $.UI.create('View',{
			classes :['hsize', 'vert' ,'wfill'], 
			backgroundColor : "#ffffff", 
			top:0
		});
		
		var viewBg4 = $.UI.create('View',{
			classes :['wfill', "hsize"],
			backgroundColor : "#f5f5f5", 
		});
	 
		var galleryListingView = Ti.UI.createView({
			left:2,
			layout: "horizontal", 
			height:Ti.UI.SIZE,
			width :"auto" 
		});
	 	var gal_counter = 0;
		details.forEach(function(entry) { 
				  
					var cell = $.UI.create('View', {
						classes: ["cell","tiny_padding","hsize",'vert'],  
						width: "49%", 
						source_id:  entry.id, 
						position: gal_counter});
						
					var imageContainer = $.UI.create('View', { 
						backgroundColor:"#EDF2F5" ,
						width: Ti.UI.FILL, 
						height:150,  
						position: gal_counter,
						source_id:  entry.id
					});
					var pad_cell = $.UI.create('View', { 
						width: Ti.UI.FILL, 
						height:Ti.UI.SIZE, 
						position: gal_counter, 
						source_id:  entry.id
					});
					var leftImg = entry.cover;
					if(leftImg == ""){
						leftImg = "/images/default.png";
					}
					var newsImage = Ti.UI.createImageView({
				   		defaultImage: "/images/loading_image.png",
						image: leftImg,
						width: Ti.UI.FILL,
						height: Ti.UI.SIZE,
						position: gal_counter,
						source_id:  entry.id
					});
					imageContainer.add(pad_cell);
					 
					pad_cell.add(newsImage);
					cell.add(imageContainer);
						 
					//addClickEvent(cell); 
					galleryListingView.add(cell); 
					//image event
					downloadBrochure(newsImage,entry);  
				  
					gal_counter++; 
			 
		});
		
		view4.add(viewBg4);
	 	view4.add(galleryListingView); 
		$.contentView.add(view4); 
	}
}

init();


var isDownloading = "0";
var isDownloadLbl = "0";
//ex.source.id,ex.source.leafLet,ex.source.url,ex.source.downloaded,ex.source.name
//id,content,targetUrl,downloaded, title
function downloadBrochure(adImage,content){ 
	adImage.addEventListener( "click", function(){
		var indView = Ti.UI.createView({
			height : 100,
			layout : "vertical",
			backgroundColor : "#ffffff" ,
			bottom: 5,
			width : Ti.UI.SIZE
		});
		if(isDownloading == "1"){
			var label = Ti.UI.createLabel({
				color: '#CE1D1C',
				font: { fontSize:10, fontWeight:"bold" },
				text: 'Please wait until current downloading is done.',
				bottom: 10,
				width:"100%",
				height:10,
				textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER 
			});
		 	
		 	if(isDownloadLbl == "0"){
		 		$.bigView.add(label);
		 		
		 		setTimeout(function(){
		 			isDownloadLbl = "0";
		 			$.bigView.remove(label);
		 		},3000);
		 	}
			isDownloadLbl = "1";
			return false;
		}
		isDownloading = "1";
		var ind=Titanium.UI.createProgressBar({
			width: "90%",
			height:50,
			min:0,
			max:1,
			value:0,
			top: 5,
			message:'Downloading '+content.title+'...',
			font:{fontSize:12},
			color:'#CE1D1C',
		});
		 
		var label = Ti.UI.createLabel({
			color: '#CE1D1C',
			font: { fontSize:14, fontWeight:"bold" },
			text: '0%',
			top: 0,
			width:"100%",
			height:30,
			textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER 
		});
		
		
	  
		if(content.isDownloaded == "1"){  
			indView.remove(ind);
			indView.remove(label); 
			$.bigView.setVisible(false);
			
		}else{  
			ind.show(); 
			indView.add(ind);
			indView.add(label); 
			$.bigView.add(indView);
			$.bigView.setVisible(true);
		}
							
		PDF.createPdf(content.attachment,true, ind,label,indView,  function (err, file, base, url) {
			if (err){
				alert(err);
			}else{ 
				isDownloading = "0";
				idaModel.updateDownloadedBrochure(content.id);
			    indView.hide();  
			    $.bigView.remove(indView); 
			    
				if(Ti.Platform.osname == "android"){
					console.log("file return : "+file.getNativePath());
					PDF.android_launch(file);
				}else{
					
				var myModal = Ti.UI.createWindow({
					title           : 'iDA',
					backgroundColor : '#ffffff',
					orientationModes : [ Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT ],
					fullscreen		:true
				});
				var leftBtn = Ti.UI.createImageView({
					image: "/images/cross.png",
					width: 15,
					top:10,
					left: 10
				});
				var wrapperView    = Ti.UI.createView({
					//layout:"vertical",
					height: Ti.UI.FILL
				}); 
				// Full screen
				var topView = Ti.UI.createView({  // Also full screen
				    backgroundColor : 'transparent',
				    width: 50,
				    top     : 0,
				    height  : 40
				});
				var containerView  = Ti.UI.createScrollView({  // Set height appropriately
				    height          : Ti.UI.FILL,
				    width			: Ti.UI.FILL,
				    contentWidth     : Ti.UI.FILL,
					contentHeight   :Ti.UI.SIZE,
				    backgroundColor : 'transparent'
				});
				var webview = Ti.UI.createWebView({ 
				   data: file.read(),
				   height: Ti.UI.FILL,
				   width: Ti.UI.FILL,
				   backgroundColor:"#ffffff",
				   bottom:10 
				});
			 
				containerView.add(webview);
				//topView.add(leftBtn);
				
				wrapperView.add(containerView); 
				wrapperView.add(leftBtn);
				myModal.add(wrapperView); 
				myModal.open({
					modal : true
				});
				leftBtn.addEventListener('click',function(ex){
					myModal.close({animated: true});
				});
					
			    }
			   } 
		});
	});
}

 
$.win.addEventListener("close", function(){
	 
	$.destroy();
	console.log("window close");
});
