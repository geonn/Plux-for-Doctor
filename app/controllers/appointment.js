var args = arguments[0] || {};
var clinic_id = Ti.App.Properties.getString('clinic_id') || 0;
var loading = Alloy.createController("loading");
var appointment = Alloy.createCollection("appointment");
var data;
/**
 * Navigate to Conversation by u_id
 */
function navToConversation(e){
	var f_id = parent({name: "f_id"}, e.source);
	Alloy.Globals.Navigator.open("conversation", {f_id: f_id});
}

/*
 	render friends list
 * */
function render_booking_list(){
	var data_array = [];
	for (var i=0; i < data.length; i++) {
		var tvr = $.UI.create("TableViewRow", {});
		
		var view_container = $.UI.create("View",{
			classes: ['wfill', 'horz'],
			backgroundColor: "#ffffff",
			height: 60,
			f_id: data[i].f_id
		});
		
		var view_indicator = $.UI.create("View",{
			classes: ['indicator_yellow']
		});
		
		var view_horz_div = $.UI.create("View",{
			classes: ['horz_div']
		});
		
		var view_left_column = $.UI.create("View",{
			classes: ['hfill', 'vert', 'padding'],
			width: "80"
		});
		
		var view_right_column = $.UI.create("View",{
			classes: ['hfill', 'vert', 'padding'],
			width: "auto"
		});
		
		var time = data[i].start_date.split(" ");
		
		var label_time = $.UI.create("Label",{
			classes:['h6','wsize','hsize'],
			text: time[1]
		});
		
		var label_duration = $.UI.create("Label",{
			classes:['h5','wsize','hsize'],
			text: data[i].duration
		});
		
		var label_patient_name = $.UI.create("Label",{
			classes:['h5','wfill','hsize'],
			text: data[i].patient_name
		});
		
		view_left_column.add(label_time);
		view_left_column.add(label_duration);
		view_right_column.add(label_patient_name);
		view_container.add(view_indicator);
		view_container.add(view_left_column);
		view_container.add(view_horz_div);
		view_container.add(view_right_column);
		tvr.add(view_container);
		data_array.push(tvr);
		//view_container.addEventListener("click", navToConversation);
	};
	
	$.inner_box.setData(data_array);
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
	var selected_date = new Date();
	var today_start_date = selected_date.getFullYear()+"-"+('0'+(selected_date.getMonth()+1)).slice(-2)+"-"+('0'+selected_date.getDate()).slice(-2)+" 00:00:00";
	var today_end_date = selected_date.getFullYear()+"-"+('0'+(selected_date.getMonth()+1)).slice(-2)+"-"+('0'+selected_date.getDate()).slice(-2)+" 23:59:59";
	var start_date = (typeof e !="undefined")?e.selected_date+" 00:00:00":today_start_date;
	var end_date = (typeof e != "undefined")?e.selected_date+" 23:59:59":today_end_date;
	
	data = appointment.getAppointmentList({clinicId: clinic_id, start_date: start_date, end_date: end_date});
	console.log(data);
	render_booking_list();
	loading.finish();
	return;
	
	var u_id = Ti.App.Properties.getString('user_id') || 0;
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(3, u_id);
	var last_update = isUpdate.updated || "";
	
	API.callByPost({url:"getFriendListUrl", params: {last_updated: last_update, u_id:u_id}}, function(responseText){
		var model = Alloy.createCollection("friends");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		model.saveArray(arr);
		data = model.getData();
		checker.updateModule(3,"friends", Common.now(), u_id);
		render_friends_list();
		$.label_friends.text = "Friends ("+data.length+")";
		loading.finish();
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
	render_calendar();
	refresh();
}

init();

Ti.App.addEventListener('appointment:refresh', refresh);

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('friends:refresh',refresh);
	$.destroy();
	console.log("window close");
});
