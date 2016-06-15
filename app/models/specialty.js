exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		   	"title": "TEXT",
		   	"status":"INTEGER",
		    "updated": "TEXT",
		    "created": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "specialty",
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
			getData : function(){
				var collection = this;
                var sql = "SELECT * FROM "+collection.config.adapter.collection_name+" where status = 1";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                while (res.isValidRow()){
					arr[count] = {
					    id: res.fieldByName('id'),
					    title: res.fieldByName('title') 
					};
					res.next();
					count++;
				}
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getById : function(id){
				var collection = this; 
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+id+"'";
               
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					   	id: res.fieldByName('id'),
					    title: res.fieldByName('title'), 
				  		updated: res.fieldByName('updated'),
					  };
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
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, title, status, updated, created) VALUES (?,?,?,?,?)";
					db.execute(sql_query, entry.id, entry.title, entry.status, entry.created, entry.updated);
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET title=?, status=?, updated=? WHERE id=?";
					db.execute(sql_query, entry.title, entry.status,  entry.updated, entry.id);
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
                
                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, title, status, updated, created) VALUES (?,?,?,?,?)";
				db.execute(sql_query, entry.id, entry.name, entry.dr_code, entry.email, entry.mobile, entry.specialty, entry.qualification,entry.img_path, entry.introduction,  entry.status, Common.now(), Common.now());
				var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET title=?, status=?, updated=? WHERE id=?";
				db.execute(sql_query, entry.title,    entry.status,entry.updated, entry.id);
			
	            db.close();
	            collection.trigger('sync');
			}
		});

		return Collection;
	}
};