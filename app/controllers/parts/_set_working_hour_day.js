var args = arguments[0] || {};
var days = parseInt(args.days) || 0;
var time_start = args.time_start;
var time_end = args.time_end;
var duration = parseInt(args.duration) || 0;
var status = parseInt(args.status) || 0;
var clinic_id = parseInt(args.clinic_id) || 0;
var doctor_id = Ti.App.Properties.getString('doctor_id');

var day_text = ["","MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function changeDuty(e){
	if(e.value){
		$.extra.show();
		$.extra.height = Ti.UI.SIZE;
	}else{
		$.extra.hide();
		$.extra.height = 0;
	}
	updateWorkingHour();
}

function render_day(){ 
	$.extra.height = 0;
	$.extra.hide();
	$.day.text = day_text[days];
	 
	var st = false;
	if(status == 1){
		st = true;
	}
	$.status.value = st;// parseInt(status);
	$.time_start.value = time_start;
	$.time_end.value = time_end;
	$.duration.value = duration;
	
	if(status){
		$.extra.show();
		$.extra.height = Ti.UI.SIZE;
	}
}

function timepicker(e){
	var t = e.source.value.split(":");
	var picker = Ti.UI.createPicker({
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		bottom: 0,
		value: new Date(2016,parseInt(10), 11, t[0], t[1]),
		type: Ti.UI.PICKER_TYPE_TIME
	});
	
	var view = $.UI.create("View",{
		classes: ['wfill','hfill'],
		backgroundImage: "/images/Transparent.png"
	});
	view.add(picker);
	args.win.add(view);
	
	view.addEventListener("click", function(ex){
		var time_update = picker.getValue();
		var hour = time_update.getHours(); 
    		hour = hour.toString();
    	var minute = time_update.getMinutes();
    	if (minute < 10) {
	        minute = '0' + minute;
	    } 
		e.source.value = hour+":"+minute;
		args.win.remove(view);
		updateWorkingHour();
	});
}

function updateWorkingHour(){
	Ti.App.fireEvent("set_working_hours:collectData", {days: args.days, time_start: $.time_start.value, time_end: $.time_end.value, duration: $.duration.value, status:$.status.value});
}

$.time_start.addEventListener("click", timepicker);
$.time_end.addEventListener("click", timepicker);
$.duration.addEventListener("blur", updateWorkingHour);

function init(){
	render_day();
}

init();
