var args = arguments[0] || {};
var doctor_panel_id = args.doctor_panel_id;
var loading = Alloy.createController("loading");
var data = [];
var working_hour_arr = [];

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
