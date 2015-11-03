exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		   	"img_path": "TEXT",
		   	"time":"INTEGER",
		    "status": "INTEGER",
		    "updated": "TEXT",
		    "created": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "background",
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
			getData : function(entry){
				var collection = this;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name +" WHERE time <= ? order by time desc";
                var res = db.execute(sql, entry.time);
                //var sql = "SELECT * FROM " + collection.config.adapter.collection_name +" order by time desc";
                //var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('id'),
					    img_path: res.fieldByName('img_path'),
					    time: res.fieldByName('time'),
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
				console.log("model background - save array");
				var collection = this;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
               
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, img_path, time, status, updated, created) VALUES (?,?,?,?,?,?)";
					db.execute(sql_query, entry.id, entry.img_path, entry.time, entry.status, Common.now(), Common.now());
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET img_path=?, time=?, status=?, updated=? WHERE id=?";
					db.execute(sql_query, entry.img_path, entry.time, entry.status, Common.now(), entry.id);
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
                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, img_path, time, status, updated, created) VALUES (?,?,?,?,?,?)";
				db.execute(sql_query, entry.id, entry.img_path, entry.time, entry.status, Common.now(), Common.now());
				var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET img_path=?, time=?, status=?, updated=? WHERE id=?";
				db.execute(sql_query, entry.img_path, entry.time, entry.status, Common.now(), entry.id);
				
	            db.close();
	            collection.trigger('sync');
			}
		});

		return Collection;
	}
};