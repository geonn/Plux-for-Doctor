exports.definition = {
	config: {
		columns: {
		   "id": "INTEGER PRIMARY KEY",
		    "u_id": "TEXT" , 
		    "duration": "INTEGER",
		    "clinic_name": "TEXT",
		    "doctor_name": "TEXT",
		    "specialty_name" : "TEXT",
		    "doctor_panel_id": "INTEGER",
		    "start_date" : "TEXT",
		    "end_date" : "TEXT",
		    "remark" : "TEXT",
		    "status": "INTEGER" ,
		    "created": "TEXT" ,
		    "updated": "TEXT",
		    "date" : "TEXT",
		    "suggested_date" : "TEXT",
		    "patient_name" : "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "appointment",
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
			getAppointmentList: function(ex){
				console.log(ex);
				
				var query_start_date = (typeof ex.start_date != "undefined")?" AND a.start_date >= ? AND a.start_date < ? ":"";
				var collection = this;
                var sql = "SELECT a.* FROM appointment as a, doctor_panel as dp WHERE dp.id = a.doctor_panel_id AND dp.doctor_id = ? "+query_start_date+" AND a.status != 5 ORDER BY a.created DESC";
              	 
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                if(typeof ex.doctor_id != "undefined"){
                	if(typeof ex.start_date != "undefined"){
                		console.log(ex.start_date+" "+ex.end_date); //"2016-04-21 10:00:00"
                		var res = db.execute(sql, ex.doctor_id, ex.start_date, ex.end_date);
                	}else{
                		var res = db.execute(sql, ex.doctor_id);
                	}
                }else{
                	var res = db.execute(sql);
                }
                 
                var listArr = []; 
                var count = 0;
                while (res.isValidRow()){ 
					listArr[count] = { 
						id: res.fieldByName('id'),
						u_id: res.fieldByName('u_id'), 
						clinic_name : res.fieldByName('clinic_name'),
						doctor_panel_id: res.fieldByName('doctor_panel_id'),
						specialty_name: res.fieldByName('specialty_name'),
						status: res.fieldByName('status'), 
						start_date: res.fieldByName('start_date'),
						duration: res.fieldByName('duration'),
						remark: res.fieldByName('remark'),
						created: res.fieldByName('created'),
						updated: res.fieldByName('updated'),
						patient_name: res.fieldByName('patient_name')
					};	 
					res.next();
					count++;
				}
			 
				res.close();
                db.close();
                collection.trigger('sync');
                return listArr;
			},
			saveArray : function(arr){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN"); 
               	arr.forEach(function(entry) {
		           var sql_query =  "INSERT OR IGNORE INTO "+collection.config.adapter.collection_name+" (id, u_id,clinic_name, remark,  status,start_date,end_date, duration,suggested_date, created, updated, specialty_name, patient_name, doctor_panel_id, doctor_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
					db.execute(sql_query, entry.id, entry.u_id,entry.clinic_name, entry.remark,entry.status ,entry.start_date, entry.end_date,entry.duration,entry.suggested_date, entry.created,entry.updated, entry.specialty_name, entry.patient_name, entry.doctor_panel_id, entry.doctor_name);
				 	var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET clinic_name=?,remark=?,status=?,start_date=?,end_date=?, duration=?, suggested_date=?,updated=?, specialty_name=?, patient_name=?, doctor_panel_id=?, doctor_name=? WHERE id=?";
				 	 
					db.execute(sql_query,entry.clinic_name,entry.remark, entry.status,entry.start_date,entry.end_date,entry.duration,entry.suggested_date,entry.updated, entry.specialty, entry.patient_name, entry.doctor_panel_id, entry.doctor_name, entry.id);
				});
				db.execute("COMMIT");
	            db.close();
	            collection.trigger('sync');
			},
			updateAppointmentStatus : function(id, statusCode){
				var collection = this;
				
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
             	
             	var sql_query =  "UPDATE "+collection.config.adapter.collection_name+" SET status=? WHERE id=?";
				db.execute(sql_query, statusCode,  id);
			 
                db.close();
	            collection.trigger('sync');
			},
			getAppointmentById: function(id){ 
                var collection = this;
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name +" WHERE id ='"+id+"'";
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
                if (res.isValidRow()){
					arr = {
					   id: res.fieldByName('id'),
						u_id: res.fieldByName('u_id'), 
						duration: res.fieldByName('duration'), 
						start_date: res.fieldByName('start_date'), 
						end_date: res.fieldByName('end_date'), 
						clinic_id : res.fieldByName('clinic_id'),  
						status: res.fieldByName('status'), 
						date: res.fieldByName('date'),
						remark: res.fieldByName('remark'),
						created: res.fieldByName('created'),
						updated: res.fieldByName('updated'),
						specialty: res.fieldByName('specialty'),
						patient_name: res.fieldByName('patient_name')
					};
					
				} 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			}, 
			  
		});

		return Collection;
	}
};  