exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		   	"name": "TEXT",
		   	"dr_code":"INTEGER",
		    "email": "INTEGER",
		    "mobile": "INTEGER",
		    "specialty": "TEXT",
		    "qualification": "TEXT",
		    "introduction": "TEXT",
		    "status": "INTEGER",
		    "updated": "TEXT",
		    "created": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "doctor",
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
			getById : function(id){
				var collection = this; 
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+id+"'";
               
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    id: res.fieldByName('id'), 
					    name: res.fieldByName('name'),
					    dr_code: res.fieldByName('dr_code'),
					    email: res.fieldByName('email'),
					    mobile: res.fieldByName('mobile'), 
					    specialty: res.fieldByName('specialty'),
					    qualification: res.fieldByName('qualification'),
					    introduction: res.fieldByName('introduction'),
				  		updated: res.fieldByName('updated'),
					  };
				}  
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			saveArray : function(arr){
				console.log("model doctor - save array");
				var collection = this;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
	                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, name, dr_code, email, mobile, specialty, qualification, introduction, status, updated, created) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.id, entry.name, entry.dr_code, entry.email, entry.mobile, entry.specialty, entry.qualification, entry.introduction,  entry.status, Common.now(), Common.now());
					var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET name=?, dr_code=?, email=?, mobile=?, specialty=?, qualification=?, introduction=?, status=?, updated=? WHERE id=?";
					db.execute(sql_query, entry.name, entry.dr_code, entry.email, entry.mobile, entry.specialty, entry.qualification, entry.introduction,  entry.status, Common.now(), entry.id);
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
                
                var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, name, dr_code, email, mobile, specialty, qualification, introduction, status, updated, created) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
				db.execute(sql_query, entry.id, entry.name, entry.dr_code, entry.email, entry.mobile, entry.specialty, entry.qualification, entry.introduction,  entry.status, Common.now(), Common.now());
				var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET name=?, dr_code=?, email=?, mobile=?, specialty=?, qualification=?, introduction=?, status=?, updated=? WHERE id=?";
				db.execute(sql_query, entry.name, entry.dr_code, entry.email, entry.mobile, entry.specialty, entry.qualification, entry.introduction,  entry.status, Common.now(), entry.id);
			
	            db.close();
	            collection.trigger('sync');
			}
		});

		return Collection;
	}
};