exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "u_id": "INTEGER",
		    "dr_id": "INTEGER",
		    "room_id": "INTEGER",
		    "message": "TEXT",
		    "read": "INTEGER",
		    "type":"TEXT",
		    "created" : "DATE",
		},
		adapter: {
			type: "sql",
			collection_name: "message",
			idAttribute: "id"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
			getData: function(room_id){
				var collection = this;
                var sql = "SELECT * FROM message WHERE room_id = ? order by id" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                
                var res = db.execute(sql, room_id);
               	var arr = [];
                var count = 0;
                 /**
                 * debug use
                 */
                var row_count = res.fieldCount;
                for(var a = 0; a < row_count; a++){
            		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
            	 }
            	
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('id'),
					    u_id: res.fieldByName('u_id'),
					    to_id: res.fieldByName('to_id'),
					    room_id: res.fieldByName('room_id'),
					    message: res.fieldByName('message'),
					    type: res.fieldByName('type'),
					    created: res.fieldByName('created')
					};
					res.next();
					count++;
				} 
			 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			/*
			 Deprecated function
			 * */
			getData_deprecated : function(f_id){
				var u_id = Ti.App.Properties.getString('user_id') || 0;
				var collection = this;
                var sql = "SELECT message.*, friends.thumb_path FROM message LEFT OUTER JOIN friends on friends.f_id = message.u_id WHERE (message.u_id=? AND message.to_id=?) OR (message.u_id=? AND message.to_id=?) order by message.created DESC" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                
                var res = db.execute(sql, u_id, f_id, f_id, u_id);
               	var arr = [];
                var count = 0;
                /**
                 * debug use
                 
                var row_count = res.fieldCount;
                for(var a = 0; a < row_count; a++){
            		 console.log(a+":"+res.fieldName(a)+":"+res.field(a));
            	 }*/
            	
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('id'),
					    u_id: res.fieldByName('u_id'),
					    to_id: res.fieldByName('to_id'),
					    message: res.fieldByName('message'),
					    thumb_path: res.fieldByName('thumb_path'),
					    type: res.fieldByName('type'),
					    created: res.fieldByName('created')
					};
					res.next();
					count++;
				} 
			 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getDataUnread : function(f_id){
				var u_id = Ti.App.Properties.getString('user_id') || 0;
				var collection = this;
                var sql = "select count(*) as total, u_id from message where to_id = ? AND read is null group by u_id" ;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                
                var res = db.execute(sql, u_id);
               	var arr = [];
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('total'),
					    u_id: res.fieldByName('u_id')
					};
					res.next();
					count++;
				} 
			 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			messageRead : function(entry){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
				var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET read=1 WHERE room_id=?";
				db.execute(sql_query, entry.room_id);
				console.log(db.getRowsAffected()+" "+entry.room_id+" read");
	            db.close();
	            collection.trigger('sync');
			},
			saveArray : function(arr){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (u_id, to_id, message, type,room_id, created) VALUES (?,?,?,?,?,?)";
					db.execute(sql_query, entry.u_id, entry.to_id, entry.message, entry.type, entry.room_id, entry.created);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
	            
			},
			saveRecord: function(entry){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (u_id, to_id, message, type,room_id, read,  created) VALUES (?,?,?,?,?,?,?)";
				db.execute(sql_query, entry.u_id, entry.to_id, entry.message, entry.type, entry.room_id, 1, entry.created);
				
	            db.close();
	            collection.trigger('sync');
			},
			addColumn : function( newFieldName, colSpec) {
				var collection = this;
				var db = Ti.Database.open(collection.config.adapter.db_name);
				if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
				var fieldExists = false;
				resultSet = db.execute('PRAGMA TABLE_INFO(' + collection.config.adapter.collection_name + ')');
				while (resultSet.isValidRow()) {
					if(resultSet.field(1)==newFieldName) {
						fieldExists = true;
					}
					resultSet.next();
				}  
			 	if(!fieldExists) { 
					db.execute('ALTER TABLE ' + collection.config.adapter.collection_name + ' ADD COLUMN '+newFieldName + ' ' + colSpec);
				}
				db.close();
			},
		});

		return Collection;
	}
};