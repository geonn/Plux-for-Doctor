exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "memno": "TEXT",
		    "name" : "TEXT",
		    "corpcode" : "TEXT",
		    "corpname" : "TEXT",
		    "visitdate" : "TEXT",
		    "terminal_id": "TEXT",
		    "type": "TEXT",
		    "receipt_url": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "patient_records"
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
			getById : function(id){
				var collection = this; 
				var columns = collection.config.columns;
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }

                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+id+"'";
               
                var res = db.execute(sql);
                var arr = []; 
                
                var eval_column = "";
            	for (var i=0; i < names.length; i++) {
					eval_column = eval_column+names[i]+": res.fieldByName('"+names[i]+"'),";
				};
               
                if (res.isValidRow()){
                	eval("arr = {"+eval_column+"}");
				}  
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getHistoryList : function(searchKey, terminal_id){
				var collection = this;
                var columns = collection.config.columns;
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }
                db = Ti.Database.open(collection.config.adapter.db_name);
                var srh = "";
				if(searchKey != ""){
					srh = " WHERE terminal_id = ? AND (name LIKE '%"+searchKey+"%' OR empno LIKE '%"+searchKey+"%' OR memno LIKE '%"+searchKey+"%' OR icno LIKE '%"+searchKey+"%' OR corpname LIKE '%"+searchKey+"%' OR corpcode LIKE '%"+searchKey+"%') ";
				}
				
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + srh+" WHERE terminal_id = ? ORDER BY visitdate DESC" ;
               
                var res = db.execute(sql, terminal_id);
                var listArr = []; 
                var count = 0;
                
                var eval_column = "";
            	for (var i=0; i < names.length; i++) {
					eval_column = eval_column+names[i]+": res.fieldByName('"+names[i]+"'),";
				};
                while (res.isValidRow()){
                	eval("listArr[count] = {"+eval_column+"}");
                	res.next();
					count++;
                }
                 
				res.close();
                db.close();
                collection.trigger('sync');
                return listArr;
			},
			getUserByMemno : function(){
				var collection = this; 
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE memno='"+Ti.App.Properties.getString('memno')+"' ";
               
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    id: res.fieldByName('id'),
					    asp_id: res.fieldByName('asp_id'),
					    name: res.fieldByName('name'),
					    memno: res.fieldByName('memno'),
					    icno: res.fieldByName('icno'),
					    relation: res.fieldByName('relation'), 
					    empno: res.fieldByName('empno'),
					    corpcode: res.fieldByName('corpcode'),
					    corpname: res.fieldByName('corpname'),
					    costcenter: res.fieldByName('costcenter'),
					    dept: res.fieldByName('dept'),
					    allergy: res.fieldByName('allergy'),
					    isver: res.fieldByName('isver'),
					    verno: res.fieldByName('verno'),
					    remark: res.fieldByName('remark'),
			 			visitdate: res.fieldByName('visitdate')
					  };
				}  
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getUserByEmpNo : function(){
				var collection = this;
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE empno='"+Ti.App.Properties.getString('empno')+"'";
               
                var res = db.execute(sql);
                var arr = []; 
                var count = 0;
                 
                while (res.isValidRow()){ 
					arr[count] = {
					    id: res.fieldByName('id'),
					    asp_id: res.fieldByName('asp_id'),
					    name: res.fieldByName('name'),
					    memno: res.fieldByName('memno'),
					    icno: res.fieldByName('icno'),
					    relation: res.fieldByName('relation'), 
					    empno: res.fieldByName('empno'),
					    corpcode: res.fieldByName('corpcode'),
					    corpname: res.fieldByName('corpname'),
					    costcenter: res.fieldByName('costcenter'),
					    dept: res.fieldByName('dept'),
					    allergy: res.fieldByName('allergy'),
					    isver: res.fieldByName('isver'),
					    verno: res.fieldByName('verno'),
					    remark: res.fieldByName('remark'),
			 			visitdate: res.fieldByName('visitdate')
					  };
					res.next();
					count++;
				}  
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
		 
			getPrincipleData : function(){
				var collection = this; 
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE relation='PRINCIPLE' and memno='"+Ti.App.Properties.getString('memno')+"'";
               
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    id: res.fieldByName('id'),
					    asp_id: res.fieldByName('asp_id'),
					    name: res.fieldByName('name'),
					    memno: res.fieldByName('memno'),
					    icno: res.fieldByName('icno'),
					    relation: res.fieldByName('relation'), 
					    empno: res.fieldByName('empno'),
					    corpcode: res.fieldByName('corpcode'),
					    corpname: res.fieldByName('corpname'),
					    costcenter: res.fieldByName('costcenter'),
					    dept: res.fieldByName('dept'),
					    allergy: res.fieldByName('allergy'),
					    isver: res.fieldByName('isver'),
					    verno: res.fieldByName('verno'),
					    remark: res.fieldByName('remark'),
			 			visitdate: res.fieldByName('visitdate')
					  };
				}  
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			addUserData : function(arr) {
				var collection = this;
				var columns = collection.config.columns;
				var names = [];
				for (var k in columns) {
	                names.push(k);
	            }
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                db.execute("BEGIN");
                arr.forEach(function(entry) {
                	var keys = [];
                	var questionmark = [];
                	var eval_values = [];
                	var update_questionmark = [];
                	var update_value = [];
                	for(var k in entry){
	                	if (entry.hasOwnProperty(k)){
	                		_.find(names, function(name){
	                			if(name == k){
	                				console.log(name+" "+k);
	                				keys.push(k);
			                		questionmark.push("?");
			                		eval_values.push("entry."+k);
			                		update_questionmark.push(k+"=?");
	                			}
	                		});
	                	}
                	}
                	var without_pk_list = _.rest(update_questionmark);
	                var without_pk_value = _.rest(eval_values);
	                var sql_query =  "INSERT OR REPLACE INTO "+collection.config.adapter.collection_name+" (visitdate, "+keys.join()+") VALUES ((DATETIME('now')), "+questionmark.join()+")";
	                eval("db.execute(sql_query, "+eval_values.join()+")");
				});
				db.execute("COMMIT");
				//console.log(db.getRowsAffected()+" affected row");
	            db.close();
	            collection.trigger('sync');
            },
            updateTerminateId : function(terminal_id){
            	var collection = this; 
                var sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET terminal_id= ? ";
		        db = Ti.Database.open(collection.config.adapter.db_name);
		        db.execute(sql_query, terminal_id);
		        
         		db.close();
	            collection.trigger('sync');
            },
            saveRemark : function(id, remark){
				var collection = this; 
                var sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET remark= '"+remark+"' WHERE id = '"+id+"' ";
		        db = Ti.Database.open(collection.config.adapter.db_name);
		        db.execute(sql_query);
		        
         		db.close();
	            collection.trigger('sync');
			}, 
		});

		return Collection;
	}
};