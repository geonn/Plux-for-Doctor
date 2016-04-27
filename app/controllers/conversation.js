var args = arguments[0] || {};
var dr_id = args.dr_id;
var room_id = args.id;

var u_id = Ti.App.Properties.getString('user_id') || 0;
//var user_thumb_path = Ti.App.Properties.getString('thumb_path') || "";
//var friend_thumb_path = "";
var loading = Alloy.createController("loading");

//set message as read
var message = Alloy.createCollection("message");
message.messageRead({room_id:room_id});

/**
 * Send message
 */
function SendMessage(){
	if($.message.value == ""){
		return;
	}
	API.callByPost({url: "sendMessageUrl", params:{dr_id: dr_id, room_id: room_id, type: "text", u_id: u_id, message: $.message.value, target: "askDoctor"}}, function(responseText){
		var model = Alloy.createCollection("message");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		//console.log('message sent');
		//console.log(arr);
		model.saveRecord(arr);
		
		$.message.value = "";
		data = message.getData(room_id);
		render_conversation();
		setTimeout(scrollToBottom, 500);
		});
	
	//var params = {u_id: u_id, to_id: to_id, message: $.message.value, type: "text", room_id: room_id};
	//var messager = Alloy.createCollection('message');
	
	//messager.saveRecord(params);
	
}


function render_conversation(){
	$.inner_box.removeAllChildren();
	for (var i=0; i < data.length; i++) {
		var view_container = $.UI.create("View",{
			classes: ['hsize','wfill','horz']
		});
		//console.log("u_id: "+data[i].u_id+" = "+u_id+", message:"+data[i].message+", dr_id:"+data[i].dr_id);
		/*var thumb_path = (data[i].u_id == u_id)?user_thumb_path:friend_thumb_path;
		var imageview_thumb_path = $.UI.create("ImageView", {
			top: 10,
			width: 50,
			height: "auto",
			defaultImage: "/images/default/small_item.png",
			left: 10,
			image: thumb_path
		});
		*/
		var view_text_container = $.UI.create("View", {
			classes:  ['hsize', 'vert', 'box'],
			top:10,
			left: 10,
			width: "75%"
		});
		var label_message = $.UI.create("Label", {
			classes:['h5', 'wfill', 'padding'],
			text: data[i].message
		});
		var label_time = $.UI.create("Label", {
			classes:['h5', 'wfill', 'padding'],
			top:0,
			text: data[i].created,
			textAlign: "right"
		});
		view_text_container.add(label_message);
		view_text_container.add(label_time);
		if(data[i].u_id == u_id){
			view_container.add(view_text_container);
			//view_container.add(imageview_thumb_path);
		}else{
			//view_container.add(imageview_thumb_path);
			view_container.add(view_text_container);
		}
		
		$.inner_box.add(view_container);
	}
	scrollToBottom();
}

function getConversationByRoomId(callback){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(5);
	var last_updated = isUpdate.updated || "";
	
	API.callByPost({url:"getMessageByItem", params: {room_id: room_id, receiver_id: u_id, last_updated: last_updated}}, function(responseText){
		var model = Alloy.createCollection("message");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		//console.log('api get message');
		//console.log(arr);
		model.saveArray(arr, callback);
		checker.updateModule(5, "getMessageByItem", Common.now());
		
		callback && callback();
	});
}

function scrollToBottom(){
	$.chatroom.scrollToBottom();
}

/*
 	Refresh
 * */
function refresh(){
	loading.start();
	getConversationByRoomId(function(){
		data = message.getData(room_id);
		render_conversation();
	});
	loading.finish();
}

/**
 * Closes the Window
 */
function closeWindow(){
	$.win.close();
}

function updateFriendInfo(callback){
	var doctors = Alloy.createCollection("doctors");
	API.callByPost({url:"getFriendListUrl", params: {u_id: u_id}}, function(responseText){
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		doctors.saveArray(arr);
		var doctors_data = doctors.getData(dr_id);
		//friend_thumb_path = doctors_data[0].thumb_path;
		$.f_name.text = doctors_data[0].fullname;
		callback && callback();
	});
}

function init(){
	$.win.add(loading.getView());
	updateFriendInfo(refresh);
}

init();

$.chatroom.addEventListener("postlayout", scrollToBottom);

Ti.App.addEventListener('conversation:refresh', refresh);

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('conversation:refresh',refresh);
	$.destroy();
	//console.log("window close");
});
