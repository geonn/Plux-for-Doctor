var args = arguments[0] || {};
var clinic_id = Ti.App.Properties.getString('clinic_id') || 0;
var specialty = Ti.App.Properties.getString('specialty') || 0;
var pWidth = Ti.Platform.displayCaps.platformWidth;
var pHeight = Ti.Platform.displayCaps.platformHeight;
var loading = Alloy.createController("loading");
var appointment = Alloy.createCollection("appointment");
var data;
var detail_box_open = false;
var suggest_box_open = false;
var status_text = ["nothing", "Pending", "Rejected", "Approved", "Suggested date", "Deleted"];
var indicator_color = ["#ffffff", '#00ee90', 'red', 'green', 'orange', 'black'];
var selected_id = 0;
var selected_time = [];
var patient_id = 0;
var selected_date = new Date();

$.masked.hide();
$.masked2.hide();
// 1 - pending, 2- rejected, 3 - accepted. 4 - suggested date, 5 - delete
/**
 * Navigate to Conversation by u_id
 */
function openDetailBox(e){
	
	//check appointment exist and initial into detail box
	var id = parent({name: "appointment_id"}, e.source);
	if(id){
		console.log(id+" appointment id");
		selected_id = id;
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
			if(status == 3 && status == 2){
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
		clinic_id  : clinic_id,
		specialty: specialty,
		status: 4,
		remark : "Suggestion Used",
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
	var _suggested_time = Alloy.createController("_timeslot", {date_click: multiple_select, clinic_id: clinic_id, specialty: specialty, multiple_select: 1, selected_date: selected_date}).getView();
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
	var _timeslot = Alloy.createController("_timeslot", {date_click: date_click, clinic_id: clinic_id, specialty: specialty}).getView();
	$.inner_box.add(_timeslot);
}

/*
 Render Calendar
 * */
function render_calendar(){
	var calendar = CAL.getCalendar();
	$.calendar.add(calendar);
}

/*
 	Refresh
 * */
function refresh(e){
	loading.start();
	console.log(selected_date);
	var today_start_date = selected_date.getFullYear()+"-"+('0'+(selected_date.getMonth()+1)).slice(-2)+"-"+('0'+selected_date.getDate()).slice(-2)+" 00:00:00";
	var today_end_date = selected_date.getFullYear()+"-"+('0'+(selected_date.getMonth()+1)).slice(-2)+"-"+('0'+selected_date.getDate()).slice(-2)+" 23:59:59";
	var start_date = (typeof e !="undefined")?e.selected_date+" 00:00:00":today_start_date;
	var end_date = (typeof e != "undefined")?e.selected_date+" 23:59:59":today_end_date;
	
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(4, clinic_id);
	var last_update = isUpdate.updated || "";
	
	API.callByPost({url:"getAppointmentByClinic", params: {last_updated: last_update, clinic_id:clinic_id}}, function(responseText){
		var model = Alloy.createCollection("appointment");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		model.saveArray(arr);
		checker.updateModule(4,"friends", Common.now(), clinic_id);
		render_timeslot();
		loading.finish();
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
	console.log(selected_time);
	if(!selected_time.length){
		alert("please select at least one suggested time");
		return ;
	}
	var save_counter = 0;
	for (var i=0; i < selected_time.length; i++) {
	  API.callByPost({url:"addAppointmentUrl", params: selected_time[i]}, function(responseText){
	  	var res = JSON.parse(responseText);
		var arr = res.data || null;
		console.log(res.data);		
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
	console.log(param);
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

/**
 * Closes the Window
 */
function closeWindow(){
	$.win.close();
}

function init(){
	$.win.add(loading.getView());
	render_detail_box();
	//render_calendar();
	refresh();
} 
init();

//$.main.addEventListener("scroll", closeDetailBox);

Ti.App.addEventListener('appointment:refresh', refresh);

$.masked.addEventListener("click", closeDetailBox);
$.masked2.addEventListener("click", closeSuggestBox);

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('friends:refresh',refresh);
	$.destroy();
	console.log("window close");
});

/*
 private function
 * */

function formatDate(date) {
    var d = new Date(date);
    console.log(d);
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
	console.log(minutes);
	var hour = Math.floor(minutes/60);
	var minute = minutes%60;
    return hour+"h "+('0' + minute).slice(-2)+" m";
}