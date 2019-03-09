var args = arguments[0] || {};
var doctorModel = Alloy.createCollection('doctor'); 
var clinic_id = Ti.App.Properties.getString('clinic_id');
var u_id = Ti.App.Properties.getString('u_id');
var name = Ti.App.Properties.getString('name');
COMMON.construct($); 
COMMON.showLoading();
var details;
var blobContainer = [];
init();
 
function init(){
 	showList();
}

function showList(){ 
	details = doctorModel.getById(u_id);
	var avatar = details.img_path || "";
	if(avatar == ""){
		avatar = "/images/avatar.jpg";
	}
	$.name.value = details.name;
	$.code.value = details.dr_code;
	$.email.value = details.email;
	$.mobile.value = details.mobile;
	$.introduction.value = details.introduction;
	$.qualification.value = details.qualification;
	$.specialty.value = details.specialty;
	$.thumbPreview.image = avatar;
	COMMON.hideLoading();
}

function hideKeyboard(){ 
	$.introduction.blur();
	$.qualification.blur();
	$.specialty.blur();
}
 
$.saveBtn.addEventListener('click', function(){ 
	 
	var name = $.name.value;
	var code = $.code.value;
	var email = $.email.value;
	var mobile = $.mobile.value;
	var introduction = $.introduction.value;
	var qualification = $.qualification.value;
	var specialty = $.specialty.value;
	
	//submit to server
	var param = { 
		"u_id"	  :  u_id,
		"code" : code,
		"name" : name,
		"email" : email,
		"mobile" : mobile,
		"introduction" : introduction,
		"qualification" : qualification,
		"specialty" : specialty,
		 
	};
 
	API.callByPost({url:"updateDoctorProfileUrl", params: param}, function(responseText){ 
		var res = JSON.parse(responseText);   
		if(res.status == "success"){    
			COMMON.createAlert("Success", "Profile successfully updated", function(){
				doctorModel.saveRecord(res.data);
			});
		}else{
			COMMON.createAlert("Error", res.data);
			return false;
		}
			
	});
});	

function takePhoto(){ 
	var dialog = Titanium.UI.createOptionDialog({ 
	    title: 'Choose an image source...', 
	    options: ['Camera','Photo Gallery', 'Cancel'], 
	    cancel:2 //index of cancel button
	});
	  
	dialog.addEventListener('click', function(e) { 
	     
	    if(e.index == 0) { //if first option was selected
	        //then we are getting image from camera
	        Titanium.Media.showCamera({ 
	            success:function(event) { 
	                var image = event.media; 
	                
	                if(image.width > image.height){
	        			var newWidth = 640;
	        			var ratio =   640 / image.width;
	        			var newHeight = image.height * ratio;
	        		}else{
	        			var newHeight = 640;
	        			var ratio =   640 / image.height;
	        			var newWidth = image.width * ratio;
	        		}
	        		
	        		image = image.imageAsResized(newWidth, newHeight);

	                if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
	                   //var nativePath = event.media.nativePath; 
		            	$.thumbPreview.image = image;
			            blobContainer = image; 
			            COMMON.showLoading();
			            //submit to server
						var param = { 
							"u_id"	  :  u_id,  
						};
					 	var img_param = {  
							"photo" : blobContainer, 
						};
						
						API.callByPostImage({url:"uploadDoctorImageUrl", params: param, img: img_param}, function(responseText){ 
						 
							var res = JSON.parse(responseText);   
							 
							if(res.status == "success"){    
								COMMON.createAlert("Success", "Profile image successfully updated", function(){ 
									COMMON.hideLoading();
									doctorModel.saveRecord(res.data);
								});
							}else{
								COMMON.createAlert("Error", res.data);
								return false;
							}
								
						});	  
	                }
	            },
	            cancel:function(){
	                //do somehting if user cancels operation
	            },
	            error:function(error) {
	                //error happend, create alert
	                var a = Titanium.UI.createAlertDialog({title:'Camera'});
	                //set message
	                if (error.code == Titanium.Media.NO_CAMERA){
	                    a.setMessage('Device does not have camera');
	                }else{
	                    a.setMessage('Unexpected error: ' + error.code);
	                }
	 
	                // show alert
	                a.show();
	            },
	            allowImageEditing:true,
	            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
	            saveToPhotoGallery:true
	        });
	    } else if(e.index == 1){
	    	 
	    	//obtain an image from the gallery
	        Titanium.Media.openPhotoGallery({
	            success:function(event){
	            	// set image view
	            	var image = event.media;  
	            	if(image.width > image.height){
	        			var newWidth = 640;
	        			var ratio =   640 / image.width;
	        			var newHeight = image.height * ratio;
	        		}else{
	        			var newHeight = 640;
	        			var ratio =   640 / image.height;
	        			var newWidth = image.width * ratio;
	        		}
	        		
					image = image.imageAsResized(newWidth, newHeight);
	            	$.thumbPreview.image = image;
		            blobContainer = image; 
		            COMMON.showLoading();
		            //submit to server
					var param = { 
						"u_id"	  :  u_id,  
					};
				 	var img_param = {  
						"photo" : blobContainer, 
					};
					
					API.callByPostImage({url:"uploadDoctorImageUrl", params: param, img: img_param}, function(responseText){ 
						var res = JSON.parse(responseText);   
						 
						if(res.status == "success"){    
							COMMON.createAlert("Success", "Profile image successfully updated", function(){ 
								COMMON.hideLoading();
								doctorModel.saveRecord(res.data);
							});
						}else{
							COMMON.createAlert("Error", res.data);
							return false;
						}
							
					});	 
	            },
	            cancel:function() {
	               
	            },
	            
	            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
	        });
	    } else {
	        
	    }
	});
	 
	//show dialog
	dialog.show(); 
}
 
function closeWindow(){
	$.win.close();
}