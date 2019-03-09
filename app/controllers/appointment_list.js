var args = arguments[0] || {};
var appointmentModel = Alloy.createCollection('appointment');
var appointmentList;
var doctor_panel_id = Ti.App.Properties.getString('doctor_panel_id') || 0;
var indicator_color = ["#ffffff", '#fccd03', '#CE1D1C', '#afdb00', '#3f99f9', 'black'];
var status_text = ["", "Pending", "Rejected", "Accepted", "Suggestion", "Deleted"];
var current_date = "";
var loading = Alloy.createController("loading");
var selected_date = new Date();

init();

function init(){
	$.win.add(loading.getView());
	loading.start();
	render_appointment_list();
}

function render_appointment_list(){ 
	$.appointment_list.removeAllChildren();
	appointmentList = appointmentModel.getAppointmentList({doctor_panel_id: doctor_panel_id}); 
	var data=[];
	var counter = 0;  
	if(appointmentList.length < 1){
		var view_norecord = $.UI.create("View", {
			top: 10,
			classes: ['wsize', 'hsize', 'box', 'rounded']
		});
		var label_no_record = $.UI.create("Label", {
			classes: ['wsize', 'hsize','padding'],
			text: "No appointment at this moment."
		});
		view_norecord.add(label_no_record);
		$.appointment_list.add(view_norecord);
	}else{
		var all_date = _.sortBy(appointmentList, 'start_date');
		all_date = all_date.reverse();
		for (var i=0; i < all_date.length; i++) {
			var datetime = all_date[i].start_date.split(" ");
			check_update_currentdate(datetime[0]);
		    $.appointment_list.add(add_appointment_row(all_date[i]));
		};
	}
	loading.finish();
}

function openDetailBox(e){
	
	//check appointment exist and initial into detail box
	var id = parent({name: "appointment_id"}, e.source);
	var dp_id = parent({name: "doctor_panel_id"}, e.source);
	if(id){
		
		selected_id = id;
		doctor_panel_id = dp_id;
		selected_date = parent({name: "selected_date"}, e.source);
		var status = parent({name: "status"}, e.source);
		var remark_val = parent({name: "remark"}, e.source);
		var patient_name = parent({name: "patient_name"}, e.source);
		patient_id = parent({name: "patient_id"}, e.source);
		var checkin = parent({name: "date_s"}, e.source);
		var duration = parent({name: "duration"}, e.source);
		
		$.remake_box.text = remark_val;
		$.patient_name.text = patient_name;
		$.checkin.text = checkin;
		$.duration.text = duration;
		
		if(!detail_box_open){
			
			if(status == 3 || status == 2){
				$.action_box.height = 0;
				$.action_box.hide();
			}else{
				$.action_box.height = Ti.UI.SIZE;
				$.action_box.show();
			}
			$.masked.show();
			$.masked.opacity = 0;
			$.masked.animate({opacity: 1, duration: 500});
			
			var a_bounce = Ti.UI.createAnimation({
				left: 30,
				duration: 500
			});
			var b_bounce = Ti.UI.createAnimation({
				left: 0,
				duration: 300
			});
			$.detail_box.animate(a_bounce);
			a_bounce.addEventListener("complete", function(e){
				$.detail_box.animate(b_bounce);
				detail_box_open = true;
			});
		}
	}
}

function closeDetailBox(e){
	if(detail_box_open){
		$.masked.hide();
		detail_box_open = false;
		var a_bounce = Ti.UI.createAnimation({
			left: -pWidth,
			duration: 500
		});
		$.detail_box.animate(a_bounce);
	}
	loading.close();
}

function closeSuggestBox(e){
	if(suggest_box_open){
		$.masked2.hide();
		suggest_box_open = false;
		var a_bounce = Ti.UI.createAnimation({
			top: -pHeight,
			duration: 500
		});
		$.suggested_time.animate(a_bounce);
	}
}

function date_click(e){
	openDetailBox(e);
}

function multiple_select(e){
	var view_time_box = parent({name: "view_time_box", value: 1}, e.source);
	view_time_box.backgroundColor = "#3f99f9";
	var start_date = parent({name: "date_s"}, e.source);
	var duration = parent({name: "duration"}, e.source);
	
	
	var param = { 
		u_id : patient_id,
		start_date : start_date,
		duration : duration,
		doctor_panel_id: doctor_panel_id,
		status: 4,
		remark : "For Suggestion Used",
		created : currentDateTime(),  
		updated : currentDateTime(),
		isDoctor: 1
	};
	
	selected_time.push(param);
	//dateSelect(e);
}

function render_detail_box(){
	
	$.detail_box.width = pWidth;
	$.detail_box.left = -pWidth;
	
}

function render_suggest_box(){
	$.suggested_time_data.removeAllChildren();
	var _suggested_time = Alloy.createController("_timeslot", {date_click: multiple_select, doctor_id: doctor_id, multiple_select: 1, selected_date: selected_date}).getView();
	$.suggested_time_data.add(_suggested_time);
	
	$.suggested_time.top = -pHeight;
	
	if(!suggest_box_open){
		$.suggested_time.show();
		$.masked2.show();
		$.masked2.opacity = 0;
		$.masked2.animate({opacity: 1, duration: 500});
		
		var a_bounce = Ti.UI.createAnimation({
			top: 30,
			duration: 500
		});
		var b_bounce = Ti.UI.createAnimation({
			top: 0,
			duration: 100
		});
		$.suggested_time.animate(a_bounce);
		a_bounce.addEventListener("complete", function(e){
			$.suggested_time.animate(b_bounce);
			suggest_box_open = true;
		});
	}
}

function onAccept(){
	var param = {
		status: 3,
		id: selected_id,
		isDoctor: 1
	};
	updateAppointmentStatus(param, closeDetailBox);
}

function onSuggest(){
	loading.start();
	render_suggest_box();
	loading.finish();
	/*
	var param = {
		status: 4,
		id: selected_id,
		isDoctor: 1,
		suggested_date: [{minute: 11}, {minute: 12}]
	};
	updateAppointmentStatus(param, closeDetailBox);*/
}

function onReject(){
	loading.start();
	var param = {
		status: 2,
		id: selected_id,
		isDoctor: 1
	};
	updateAppointmentStatus(param, closeDetailBox);
}

function onOk(){
	loading.start();
	if(!selected_time.length){
		alert("please select at least one suggested time");
		return ;
	}
	var save_counter = 0;
	for (var i=0; i < selected_time.length; i++) {
	  API.callByPost({url:"addAppointmentUrl", params: selected_time[i]}, function(responseText){
	  	var res = JSON.parse(responseText);
		var arr = res.data || null;
			
	  	appointment.saveArray(res.data);
	  	save_counter++;
	  	if(save_counter == selected_time.length){
	  		var param = {
				status: 2,
				id: selected_id,
				isDoctor: 1
			};
			closeSuggestBox();
			updateAppointmentStatus(param, closeDetailBox);
	  	}
	  });
	};
}

function onCancel(){
	selected_time = [];
	closeSuggestBox();
}

function updateAppointmentStatus(param, _callback){
	loading.start();
	
	API.callByPost({url:"addAppointmentUrl", params: param}, function(responseText){
		var res = JSON.parse(responseText);
		if(res.status == "success"){
			appointment.updateAppointmentStatus(param.id, param.status);
			loading.finish();
			refresh();
		}else{
			alert("appointment update fail. Please contact our support team for further assistance.");
			loading.finish();
		}
		_callback && _callback();
	});
}

function loadingOff(){
	loading.finish();
}

function loadingOn(){
	loading.start();
}

function new_appointment(){ 
	nav.navigateWithArgs("appointment/index",{id : ""});
}

/*
 Private Function
 * */

function add_appointment_row(entry){
	var datetime = entry.start_date.split(" ");
	var time = datetime[1];
	var patient_id = entry.patient_id || "";
	var dpi = entry.doctor_panel_id || 0;
		
	var view_row = $.UI.create("View", {
		classes: ['wfill', 'box', 'horz', 'rounded'],
		height: 70,
		appointment_id: entry.id,
		doctor_panel_id: entry.doctor_panel_id,
		status: entry.status,
		view_row: 1,
		top: 3,
		remark: entry.remark,
		duration: entry.duration,
		patient_name: entry.patient_name,
		appointment_id: entry.appointment_id,
		patient_id: patient_id,
		doctor_panel_id: dpi,
		selected_date: selected_date,
		date_s:  selected_date.getFullYear()+"-"+("0"+(parseInt(selected_date.getMonth())+1)).slice(-2)+"-"+("0"+selected_date.getDate()).slice(-2)+" "+convertMinuteToHour(workingHourArray[key].minute),
		
	});
	
	var view_date_status_box = $.UI.create("View", {
		classes: ['hfill', 'vert'],
		width: 90,
		backgroundColor: indicator_color[entry.status]
	});
	
	var label_time = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		textAlign: "center",
		color: "#ffffff",
		bottom: 0,
		minimumFontSize: 12,
		text: convert_ampm(time)
	});
	
	var label_status = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		textAlign: "center",
		top: 0,
		color: "#ffffff",
		font:{
			fontSize: 12
		},
		text: status_text[entry.status]
	});
	
	view_date_status_box.add(label_time);
	view_date_status_box.add(label_status);
	
	//middle part
	var view_clinic_specialty_box = $.UI.create("View", {
		classes: ['hfill', 'vert'],
		width: "auto",
	});
	
	var label_clinic = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		bottom: 0,
		font:{
			fontSize: 12
		},
		text: entry.clinic_name
	});
	
	var label_specialty = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		bottom: 0,
		top: 0,
		font:{
			fontSize: 12
		},
		text: entry.specialty_name
	});
	
	view_clinic_specialty_box.add(label_clinic);
	view_clinic_specialty_box.add(label_specialty);
	
	view_row.add(view_date_status_box);
	view_row.add(view_clinic_specialty_box);
	
	view_row.addEventListener("click", create_dialog_box);
	return view_row;
}

function create_dialog_box(ex){
	var id = parent({name: "appointment_id"}, ex.source);
	var doctor_panel_id = parent({name: "doctor_panel_id"}, ex.source);
	var status = parent({name: "status"}, ex.source);
	var buttonName = [], message = "";
	//var view_row = parent({name: "view_row", value: 1}, ex.source);
	switch(status){
		case 1:
		case 2:	
			buttonName = ['Cancel Appointment', "Cancel"];
			message = "Are you sure want to cancel this appointment?";
			break;
		case 4:
			buttonName = ['Accept', "Cancel"];
			message = "Please confirm if this appointment time is convenient for you.";
			break;
		case 3:
			return;	
		
	}
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: buttonName,
	    message: message,
	    title: 'Actions'
	  });
	  dialog.addEventListener('click', function(e){
	    if (e.index === 0){
	      if(status == 4){
	      	loading.start();
	      	API.callByPost({url: "suggestedAppointmentUrl", params:{id: id}}, function(responseText){ 
	      		var model = Alloy.createCollection("appointment");
				var res = JSON.parse(responseText);
				var arr = res.data || null;
				model.saveArray(arr);
				model.updateSuggestedAppointmentStatus(doctor_panel_id);
				setTimeout(render_appointment_list, 1000);
				loading.finish();
	      	});
	      }else if(status == 1 || status == 2){
	      	loading.start();
	      	API.callByPost({url: "addAppointmentUrl", params:{id: id, isDoctor:1, status: 5}}, function(responseText){ 
	      		var model = Alloy.createCollection("appointment");
				var res = JSON.parse(responseText);
				var arr = res.data || null;
				model.updateAppointmentStatus(id, 5);
				render_appointment_list();
				loading.finish();
	      	});
	      }
	    }
	  });
	  dialog.show();
}

function check_update_currentdate(date){
	if(current_date != date){
		current_date = date;
		//add date into list
		var view_date = $.UI.create("View", {
			classes: ['wsize', 'hsize' ],
			top: 10
		});
		
		var d = new Date(); 
		var inputDate = new Date(current_date);  
		var bool = (d.toDateString() == inputDate.toDateString()); 
		var dateText = monthFormat(current_date); 
		if(bool === true){
			dateText = "Today";
		}
		var label_date = $.UI.create("Label", {
			classes: ['wsize', 'hsize', 'padding',"themeColor"],
			text: dateText
		});
		
		view_date.add(label_date);
		$.appointment_list.add(view_date);
	}
}

function convert_ampm(timeStamp){
	var time = timeStamp.split(":");
	var ampm = "am";
	if(time[0] > 12){
		ampm = "pm";
		time[0] = time[0] - 12;
	}
	
	return time[0]+":"+time[1]+ " "+ ampm;
}


if(Ti.Platform.osname == "android"){
	$.btnBack.addEventListener('click', function(){ 
		nav.closeWindow($.win); 
	}); 
}

Ti.App.addEventListener('displayRecords', render_appointment_list);
Ti.App.addEventListener('appointment_list:refresh', render_appointment_list);
Ti.App.addEventListener('appointment_list:loadingOn', loadingOn);
Ti.App.addEventListener('appointment_list:loadingOff', loadingOff);

$.masked.addEventListener("click", closeDetailBox);
$.masked2.addEventListener("click", closeSuggestBox);  

/** close all editProfile eventListener when close the page**/
$.win.addEventListener("close", function(){
	$.destroy(); 
    Ti.App.removeEventListener('displayRecords', render_appointment_list);
    Ti.App.removeEventListener('appointment_list:refresh', render_appointment_list);
	Ti.App.removeEventListener('appointment_list:loadingOff',loadingOff);
	Ti.App.removeEventListener('appointment_list:loadingOn',loadingOn);
});

/*
 private function
 * */

function formatDate(date) {
    var d = new Date(date);
    
    var hh = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var dd = "am";
    var h = hh;
    if (h >= 12) {
        h = hh-12;
        dd = "pm";
    }
    if (h == 0) {
        h = 12;
    }
    m = m<10?"0"+m:m;

    s = s<10?"0"+s:s;

    /* if you want 2 digit hours: */
    h = h<10?"0"+h:h;
    return h+":"+m+" "+dd;
}

function convertMinuteToHour(minutes){
	minutes = parseInt(minutes);
	
	var hour = Math.floor(minutes/60);
	var minute = minutes%60;
    return hour+"h "+('0' + minute).slice(-2)+" m";
}
