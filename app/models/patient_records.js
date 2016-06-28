exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
		    "asp_id": "INTEGER",
		    "memno": "TEXT",
		    "icno": "TEXT",
		    "name" : "TEXT",
		    "relation" : "TEXT", 
		    "empno" : "TEXT",
		    "corpcode" : "TEXT",
		    "corpname" : "TEXT",
		    "costcenter" : "TEXT",
		    "dept" : "TEXT",
		    "allergy" : "TEXT",
		   	"isver" : "TEXT",
		    "verno" : "TEXT",
		    "remark" : "TEXT",
		    "visitdate" : "TEXT",
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
                db = Ti.Database.open(collection.config.adapter.db_name);
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + " WHERE id='"+id+"'";
               
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
			 			visitdate: res.fieldByName('visitdate'),
			 			type: res.fieldByName('type'),
			 			receipt_url: res.fieldByName('receipt_url'),
					  };
				}  
				res.close();
                db.close();
                collection.trigger('sync');
                return arr;
			},
			getHistoryList : function(searchKey){
				var collection = this;
                
                db = Ti.Database.open(collection.config.adapter.db_name);
                var srh = "";
				if(searchKey != ""){
					srh = " WHERE (name LIKE '%"+searchKey+"%' OR empno LIKE '%"+searchKey+"%' OR memno LIKE '%"+searchKey+"%' OR icno LIKE '%"+searchKey+"%' OR corpname LIKE '%"+searchKey+"%' OR corpcode LIKE '%"+searchKey+"%') ";
				}
				
                var sql = "SELECT * FROM " + collection.config.adapter.collection_name + srh+" ORDER BY visitdate DESC" ;
               
                var res = db.execute(sql);
                var listArr = []; 
                var count = 0;
                 
                while (res.isValidRow()){ 
					listArr[count] = {
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
			 			visitdate: res.fieldByName('visitdate'),
			 			type: res.fieldByName('type'),
			 			receipt_url: res.fieldByName('receipt_url'),
					};
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
			addUserData : function(entry) {
				var collection = this; 
	            var sql = "INSERT INTO "+ collection.config.adapter.collection_name + " (name, memno, icno, relation, empno,corpcode,corpname,costcenter,dept, allergy, isver, verno, visitdate, receipt_url, type) VALUES ('"+entry.name+"', '"+entry.memno +"','"+entry.icno+"','"+entry.relation+"', '"+ entry.empno +"',  '"+ entry.corpcode +"',  '"+ entry.corpname +"',  '"+ entry.costcenter +"',  '"+ entry.dept +"', '"+ entry.allergy +"', '"+ entry.isver +"', '"+ entry.verno +"', '"+ COMMON.now()+"', '"+ entry.receipt_url+"', '"+ entry.type+"')";
	            db = Ti.Database.open(collection.config.adapter.db_name);
	            db.execute(sql);
	            
	           	collection.trigger('sync'); 
	           	
	           	var sql1 = "SELECT id FROM "+ collection.config.adapter.collection_name + "  ORDER BY id DESC LIMIT 1";
	            
	            var res = db.execute(sql1);
	            var insertId = res.fieldByName('id');
	            db.close();
	            return insertId;
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