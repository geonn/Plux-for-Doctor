exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		   	"doctor_panel_id": "INTEGER",
		   	"days":"INTEGER",
		   	"time_start":"TEXT",
		   	"time_end":"TEXT",
		   	"duration":"INTEGER",
		   	"status":"INTEGER",			// 0 - off, 1 - on
		   	"created":"DATE",
		   	"updated":"DATE"
		},
		adapter: {
			type: "sql",
			collection_name: "working_hours",
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
			getData : function(doctor_panel_id){
				var collection = this;
                var sql = "SELECT * FROM "+collection.config.adapter.collection_name+" where doctor_panel_id = ?";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql, doctor_panel_id);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('id'),
					    doctor_panel_id: res.fieldByName('doctor_panel_id'),
					    days: res.fieldByName('days'),
					    time_start: res.fieldByName('time_start'),
					    time_end: res.fieldByName('time_end'),
					    duration: res.fieldByName('duration'),
					    status: res.fieldByName('status'),
					    created: res.fieldByName('created'),
					    updated: res.fieldByName('updated'),
					};
					res.next();
					count++;
				}
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			saveArray : function(arr){
				var collection = this;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, doctor_panel_id, days, time_start, time_end, duration, status, created, updated) VALUES (?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.id, entry.doctor_panel_id, entry.days, entry.time_start, entry.time_end, entry.duration, entry.status, entry.created, entry.updated);
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET doctor_panel_id=?, days=?, time_start=?, time_end=?, duration=?, status=?, created=?, updated=? WHERE id=?";
					db.execute(sql_query, entry.doctor_panel_id, entry.days, entry.time_start, entry.time_end, entry.duration, entry.status, entry.created, entry.updated, entry.id);
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
                
                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, doctor_panel_id, days, time_start, time_end, duration, status, created, updated) VALUES (?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.id, entry.doctor_panel_id, entry.days, entry.time_start, entry.time_end, entry.duration, entry.status, entry.created, entry.updated);
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET doctor_panel_id=?, days=?, time_start=?, time_end=?, duration=?, status=?, created=?, updated=? WHERE id=?";
					db.execute(sql_query, entry.doctor_panel_id, entry.days, entry.time_start, entry.time_end, entry.duration, entry.status, entry.created, entry.updated, entry.id);
			
	            db.close(); 
	            collection.trigger('sync');
			}
		});

		return Collection;
	}
};