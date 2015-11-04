exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "title": "TEXT" ,
		    "url": "TEXT" ,
		    "status": "INTEGER" ,
		    "position": "INTEGER" ,
		    "attachment": "TEXT" ,
		    "cover": "TEXT" ,
		    "isDownloaded" : "TEXT",
		    "created": "TEXT" ,
		    "updated": "TEXT" 
		},
		adapter: {
			type: "sql",
			collection_name: "ida",
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
			getIdaList: function(){
				var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name +" WHERE `status` =1 ORDER BY position ASC";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var listArr = []; 
                var count = 0;
                while (res.isValidRow()){ 
					listArr[count] = { 
						id: res.fieldByName('id'),
						title: res.fieldByName('title'), 
						url: res.fieldByName('url'),
						status: res.fieldByName('status'),
						position: res.fieldByName('position'),
						attachment: res.fieldByName('attachment'),
						isDownloaded: res.fieldByName('isDownloaded'),
						cover: res.fieldByName('cover'),
						created: res.fieldByName('created'),
						updated: res.fieldByName('updated') 
					};	
					 
					res.next();
					count++;
				} 
			 
				res.close();
                db.close();
                collection.trigger('sync');
                return listArr;
			},
			getBrouchureById: function(id){ 
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name +" WHERE id ='"+id+"' ";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    id: res.fieldByName('id'),
						title: res.fieldByName('title'), 
						url: res.fieldByName('url'),
						status: res.fieldByName('status'),
						position: res.fieldByName('position'),
						attachment: res.fieldByName('attachment'),
						isDownloaded: res.fieldByName('isDownloaded'),
						cover: res.fieldByName('cover'),
						created: res.fieldByName('created'),
						updated: res.fieldByName('updated') 
					};
					
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			}, 
			updateDownloadedBrochure : function(b_id) {
            	var collection = this;
                sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET isDownloaded=1 WHERE id='" +b_id+"'";
    	        db = Ti.Database.open(collection.config.adapter.db_name);	
	            db.execute(sql_query);
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
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, title, url, status, position, attachment, cover, isDownloaded ,  created,updated) VALUES (?,?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.b_id, entry.b_title, entry.b_url, entry.b_status, entry.b_position, entry.attachment, entry.cover,0,  entry.b_created, entry.b_updated);
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET title=?, url=?, status=?, position=?, attachment=?, cover=?, updated=? WHERE id=?";
					db.execute(sql_query,   entry.b_title, entry.b_url, entry.b_status, entry.b_position, entry.attachment,  entry.cover,entry.b_updated, entry.b_id);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
			
			resetBrouchure : function(id){
				var collection = this;
                var sql = "DELETE FROM " + collection.config.adapter.collection_name ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute(sql);
                db.close();
                collection.trigger('sync');
			}
		});

		return Collection;
	}
};  