/**********************************
CHECKER CONFIG 
ID       type Name
------------------------------------
1		getAppHomepageBackground
2		getDoctorList
************************************/

exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER",
		    "u_id": "INTEGER",
		    "typeName": "TEXT",
		    "updated": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "updateChecker"
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
			getCheckerById : function(id, u_id){
				var collection = this;
				var addon = "";
				if(typeof u_id != "undefined"){
					addon = "AND u_id = "+u_id;
				}
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+ id+ "' "+addon ;
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
                var arr = []; 
               
                if (res.isValidRow()){
					arr = {
					    typeName: res.fieldByName('typeName'),
					    updated: res.fieldByName('updated')
					};
				} 
			 
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			updateModule : function (id, typeName, updateDate, u_id){
				var collection = this;
				var addon = "";
				if(typeof u_id != "undefined"){
					addon = " AND u_id = "+u_id;
				}else{
					u_id = 0;
				}
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id="+ id+addon ;
                var sql_query =  "";
                db = Ti.Database.open(collection.config.adapter.db_name);
                if(Ti.Platform.osname != "android"){
                	db.file.setRemoteBackup(false);
                }
                var res = db.execute(sql);
             
                if (res.isValidRow()){
             		sql_query = "UPDATE " + collection.config.adapter.collection_name + " SET updated='"+updateDate+"' WHERE id='" +id+"'"+addon;
                }else{
                	sql_query = "INSERT INTO " + collection.config.adapter.collection_name + " (id, typeName, updated, u_id) VALUES ('"+id+"','"+typeName+"','"+updateDate+"', "+u_id+")" ;
				}
       			 
	            db.execute(sql_query);
	            db.close();
	            collection.trigger('sync');
			}
		});

		return Collection;
	}
};