var args = arguments[0] || {};
var doctor_id = Ti.App.Properties.getString('doctor_id') || 0;
var specialty = Ti.App.Properties.getString('specialty') || 0;
var doctor_panel_id = Ti.App.Properties.getString('doctor_panel_id') || 0;
var pWidth = Ti.Platform.displayCaps.platformWidth;
var pHeight = Ti.Platform.displayCaps.platformHeight;
var loading = Alloy.createController("loading");
var appointment = Alloy.createCollection("appointment");
var data;
var detail_box_open = false;
var suggest_box_open = false;
var status_text = ["nothing", "Pending", "Rejected", "Approved", "Suggested date", "Deleted"];
var indicator_color = ["#ffffff", '#fccd03', '#CE1D1C', '#afdb00', '#3f99f9', 'black'];
var font_color = ["#000000", '#ffffff', "#ffffff", '#ffffff', '#ffffff', '#ffffff'];

var selected_id = 0;
var selected_time = [];
var patient_id = 0;
//var doctor_panel_id  = 0;
var selected_date = new Date();
var current_date = "";
var pw = Ti.Platform.displayCaps.platformWidth;
var ldf = Ti.Platform.displayCaps.logicalDensityFactor;
var listed = false;

if(!OS_IOS){
	pWidth = pixelToDp(pw);  
	
}

$.masked.hide();
$.masked2.hide();
// 1 - pending, 2- rejected, 3 - accepted. 4 - suggested date, 5 - delete

function render_appointment_list(){ 
	$.appointment_list.removeAllChildren();
	appointmentList = appointment.getAppointmentListByDoctorId({doctor_id: doctor_id}); 
	console.log(appointmentList);
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
		//all_date = all_date.reverse(); 
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
		
		var status = parent({name: "status"}, e.source);
		var remark_val = parent({name: "remark"}, e.source);
		var patient_name = parent({name: "patient_name"}, e.source);
		var checkin = parent({name: "date_s"}, e.source);
		var duration = parent({name: "duration"}, e.source);
		
		patient_id = parent({name: "patient_id"}, e.source);
		selected_date = parent({name: "selected_date"}, e.source);
		
		$.remake_box.text = remark_val;
		$.patient_name.text = patient_name;
		$.checkin.text = timeFormat(checkin);
		$.duration.text = duration;
		
		if(!detail_box_open){ 
			if( status == 2){//status == 3 ||
				$.action_box.height = 0;
				$.action_box.hide();
				
				
			}else{
				$.action_box.height = Ti.UI.SIZE;
				$.action_box.show();
				if(status == 3){ 
					$.acceptBtn.height = 0;
					$.suggestBtn.height = 0;
					$.acceptBtn.hide();
					$.suggestBtn.hide();
				}
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

function navToList(){
	// Alloy.Globals.Navigator.open('appointment_list');
	if(listed){
		listed = false;
		$.appointment_list.hide();
		$.main.show();
	}else{
		listed = true;
		$.main.hide();
		$.appointment_list.height = Ti.UI.FILL;
		render_appointment_list();
		$.appointment_list.show();
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
	var doctor_panel_id = parent({name: "doctor_panel_id"}, e.source);
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

/*
 	render timeslot
 * */
function render_timeslot(){ 
	var _timeslot = Alloy.createController("_timeslot", {date_click: date_click, doctor_id: doctor_id, doctor_panel_id: doctor_panel_id, appointment_id: args.id, selected_date: args.created}).getView();
	$.inner_box.add(_timeslot);
}

/*
 	Refresh
 * */
function refresh(e){
	loading.start();
	var today_start_date = selected_date.getFullYear()+"-"+('0'+(selected_date.getMonth()+1)).slice(-2)+"-"+('0'+selected_date.getDate()).slice(-2)+" 00:00:00";
	var today_end_date = selected_date.getFullYear()+"-"+('0'+(selected_date.getMonth()+1)).slice(-2)+"-"+('0'+selected_date.getDate()).slice(-2)+" 23:59:59";
	var start_date = (typeof e !="undefined")?e.selected_date+" 00:00:00":today_start_date;
	var end_date = (typeof e != "undefined")?e.selected_date+" 23:59:59":today_end_date;
	
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(4, doctor_id);
	var last_update = isUpdate.updated || ""; 
	API.callByPost({url:"getAppointmentByDoctor", params: {last_updated: last_update, doctor_id:doctor_id}}, function(responseText){
		var model = Alloy.createCollection("appointment");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		model.saveArray(arr);
		checker.updateModule(4,"getAppointmentByDoctor", Common.now(), doctor_id);
		render_appointment_list();
		render_timeslot();
	});
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
	var param = {
		status: 2,
		id: selected_id,
		isDoctor: 1
	};
	updateAppointmentStatus(param, closeDetailBox);
}

function onOk(){
	
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
	  	 
	  });
	};
	
	var param = {
		status: 2,
		id: selected_id,
		isDoctor: 1
	};
	closeSuggestBox();
	updateAppointmentStatus(param, closeDetailBox);
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
		Ti.App.fireEvent('home:refresh');
		_callback && _callback();
	});
}

function loadingOff(){
	loading.finish();
}

function loadingOn(){
	loading.start();
}

/**
 * Closes the Window
 */
function closeWindow(){
	$.win.close();
}

function init(){
	navToList();
	if(OS_ANDROID){
		var activity = $.win.activity;

		activity.onCreateOptionsMenu = function(e){
		  var menu = e.menu;
		  var menuItem = menu.add({
		    title: "List", 
		    icon: "/images/list.png",
		    showAsAction: Ti.Android.SHOW_AS_ACTION_IF_ROOM
		  });
		  menuItem.addEventListener("click", function(e) {
		   navToList();
		  });
		}; 
	}
	
	
	//console.log("doctor_panel_id: "+doctor_panel_id);
	if(doctor_panel_id == ""){
		var dialog = Ti.UI.createAlertDialog({
			cancel: 1,
			buttonNames: ['Cancel','OK'],
			message: "You don't have active panel selected yet. Are you want to select now?",
			title: 'Select Panel'
		});
		dialog.addEventListener('click', function(ex){
			if (ex.index === 0){
				//Do nothing
			}
		
			if (ex.index === 1){
				 Alloy.Globals.Navigator.open('settings');
			}
		});
		dialog.show();  
	}
	$.win.add(loading.getView());
	render_detail_box();
	//render_calendar();
	refresh();
} 
init();

//$.main.addEventListener("scroll", closeDetailBox);
Ti.App.addEventListener('appointment:loadingOn', loadingOn);
Ti.App.addEventListener('appointment:loadingOff', loadingOff);
Ti.App.addEventListener('appointment:refresh', refresh);

$.masked.addEventListener("click", closeDetailBox);
$.masked2.addEventListener("click", closeSuggestBox);  

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('appointment:refresh',refresh);
	Ti.App.removeEventListener('appointment:loadingOff',loadingOff);
	Ti.App.removeEventListener('appointment:loadingOn',loadingOn);
	$.destroy();
});

/*
 private function
 * */

function add_appointment_row(entry){
	var datetime = entry.start_date.split(" ");
	var time = datetime[1];
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
		appointment_id: entry.id,
		patient_id: entry.u_id,
		doctor_panel_id: dpi,
		selected_date: selected_date,
		date_s: entry.start_date
	});
	
	
	var view_date_status_box = $.UI.create("View", {
		classes: ['hfill', 'vert'],
		width: 90,
		backgroundColor: indicator_color[entry.status]
	});
	
	var label_time = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		textAlign: "center",
		color: font_color[entry.status],
		bottom: 0,
		minimumFontSize: 12,
		text: convert_ampm(time)
	});
	
	var label_status = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		textAlign: "center",
		top: 0,
		color: font_color[entry.status],
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
	
	var label_patient = $.UI.create("Label", {
		classes: ['wfill', 'hsize','padding'],
		bottom: 0,
		top: 10,
		font:{
			fontSize: 14
		},
		text: entry.patient_name
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
	view_clinic_specialty_box.add(label_patient);
	view_clinic_specialty_box.add(label_clinic);
	view_clinic_specialty_box.add(label_specialty);
	
	view_row.add(view_date_status_box);
	view_row.add(view_clinic_specialty_box);
	
	view_row.addEventListener("click", openDetailBox);
	return view_row;
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

function convert_ampm(timeStamp){
	var time = timeStamp.split(":");
	var ampm = "am";
	if(time[0] > 12){
		ampm = "pm";
		time[0] = time[0] - 12;
	}
	
	return time[0]+":"+time[1]+ " "+ ampm;
}
