var args = arguments[0] || {};
var doctor_panel_id = args.doctor_panel_id;
var loading = Alloy.createController("loading");
var data = [];

var d = new Date();
d.setHours = 0;
d.setMinutes = 0;
d.setSeconds = 0;
d.setMilliseconds = 0;
var lastday = d;
var working_hour_arr = [];
var selected_date = d;

var days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

Date.prototype.addDays = function(days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
};

function render_date_bar(){
	$.date_bar.height = 80;
	
	var dateArray = getDates(lastday, (lastday).addDays(10));
	for (i = 0; i < dateArray.length; i ++ ) {
		var day = days[dateArray[i].getDay()];
	    var month = months[dateArray[i].getMonth()];
	    var date = dateArray[i].getDate();
	    
		var active_view = (selected_date.getDate() == date)?"active_view":"";
		var active_label = (selected_date.getDate() == date)?"active_label":"";
	   	//console.log(selected_date.getDate()+" = "+date);
	    var view_date_box = $.UI.create("View",{
	    	width: 80,
	    	height: 80,
	    	view_element: "view_date_box",
	    	date_s: dateArray[i],
	    	classes:['gap', active_view]
	    });
	    var label_day_month = $.UI.create("Label", {
	    	classes: ['wsize', 'hsize', 'h6', active_label],
	    	text: day+", "+month,
	    	top: 10
	    });
	    var label_date = $.UI.create("Label",{
	    	text: date,
	    	classes: ['wsize', 'hsize', 'h5', 'bold', active_label]
	    });
	    view_date_box.add(label_day_month);
	    view_date_box.add(label_date);
	    $.date_bar.add(view_date_box);
	    //view_date_box.addEventListener("click", changeDate);
	}
}

function getDates(startDate, stopDate) {
	var dateArray = new Array();
	var currentDate = startDate;
		while (currentDate <= stopDate) {
			dateArray.push(currentDate);
			currentDate = currentDate.addDays(1);
		}
	lastday = currentDate;
	return dateArray;
}

function render_working_hour(){
	for (var i=1; i <= 7; i++) {
		
		var args = {doctor_panel_id:doctor_panel_id, days:i, time_start:"08:00", time_end:"17:00",duration:"30", status: 0};
		for (var a=0; a < data.length; a++) {
		 	if(data[a].days == i){
		 		args = data[a];
		 	}
		};
		
		var _part_day = Alloy.createController("parts/_set_working_hour_day", {days: args.days, time_start:args.time_start, time_end:args.time_end, duration:args.duration, status:args.status, win: $.win}).getView();
		$.working_list.add(_part_day);
	};
}

function refresh(){
	loading.start();
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(6);
	var last_update = isUpdate.updated || ""; 
	API.callByPost({url:"getWorkingHoursByDoctorPanelUrl", params: {last_updated: last_update, doctor_panel_id:doctor_panel_id}}, function(responseText){
		var model = Alloy.createCollection("working_hours");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		model.saveArray(arr);
		checker.updateModule(6, "getWorkingHoursByDoctorPanel", Common.now());
		data = model.getData(doctor_panel_id);
		render_working_hour();
		loading.finish();
	});
	
}

function closeWindow(){
	$.win.close();
}

function init(){
	$.win.add(loading.getView());
	render_date_bar();
	refresh();
}

init();

function updateWokingHour(){ 
	API.callByPostWithJson({url:"addUpdateWorkingHoursUrl", params: {working_hours: JSON.stringify(working_hour_arr)}}, function(responseText){
		var res = JSON.parse(responseText);
		var arr = res.data || null;
	});
}

function collectData(e){
	var obj = {doctor_panel_id:doctor_panel_id, days:e.days, time_start: e.time_start, time_end: e.time_end, duration: e.duration, status: e.status};
	var match = _.find(working_hour_arr, function(item) { return item.days === e.days; });
	if (match) {
	    match = obj;
	}else{
		working_hour_arr.push(obj);
	}
	console.log(working_hour_arr);
}

Ti.App.addEventListener('set_working_hours:refresh', refresh);
Ti.App.addEventListener('set_working_hours:collectData', collectData);

$.win.addEventListener("close", function(){
	//
	updateWokingHour();
	Ti.App.removeEventListener('set_working_hours:refresh',refresh);
	Ti.App.removeEventListener('set_working_hours:collectData', collectData);
	$.destroy();
	console.log("window close");
});
