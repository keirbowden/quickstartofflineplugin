// constructor
function Records(){
}

// clears the records soup
Records.prototype.clear = function(callback) {
    var self=this;
    
    navigator.smartstore.clearSoup('records', callback, self.error);
}

Records.prototype.error = function(err) {
    alert('Error occurred processing record request ' + err);
}

// Queries all records in the smart store - limit 100, sorted by name ascending
// so starting with A
Records.prototype.queryAllRecords=function(callback) {
    var self=this;
    var querySpec=navigator.smartstore.buildAllQuerySpec('Name', 'ascending', 100);
    navigator.smartstore.querySoup('records', querySpec, function(cursor) {callback(cursor);}, self.error);
}

// queries a record from the soup based on its Salesforce id
Records.prototype.queryOneRecord=function(id, callback) {
    var self=this;
    var querySpec = navigator.smartstore.buildExactQuerySpec("Id", id);
    
    navigator.smartstore.querySoup('records', querySpec, callback, self.error);
}

// executes a SOQL query on the Salesforce server to retrieve the secions
Records.prototype.retrieveRecordsFromServer = function(callback) {
    myApp.showPreloader('Downloading records');
    var soql = 'SELECT Id, Name';
    for (var idx=0; idx<config.fields.length; idx++) {
        soql+=', ' + config.fields[idx];

    }
    soql+=' FROM ' + config.sobjectType + ' ORDER BY Name ASC LIMIT 10';
    var self=this;
    force.query(soql, function(result) {self.processRecordsFromServer(result, callback);}, self.error);
}

// Callback executed when the SOQL query has completed
Records.prototype.processRecordsFromServer=function(result, callback) {
    var recs=result.records;
    for (var idx=0; idx<recs.length; idx++) {
        recs[idx].isDirty=false;
    }
    navigator.smartstore.upsertSoupEntries('records', recs,
                                           callback,
                                           records.error);
    callback();
}

Records.prototype.updateRecord=function(record, callback) {
    var recs=[];
    recs.push(record);
    navigator.smartstore.upsertSoupEntries('records', recs, callback, records.error);
}

Records.prototype.updateOnServer = function (cursor) {
    console.log('In queried for sync');
    myApp.showPreloader('Synchronising');
    var entries=cursor.currentPageOrderedEntries;
    var sendToServer=false;
    
    var recs=[];
    for (var idx=0; idx<entries.length; idx++) {
        var record=entries[idx];
        if (record.isDirty) {
            sendToServer=true;
            var sobject={"attributes" : {"type": config.sobjectType},
                         "id": record.Id};
            for (var fldIdx=0; fldIdx<config.fields.length; fldIdx++) {
                var fieldName=config.fields[fldIdx];
                sobject[fieldName]=record[fieldName];
            }
            recs.push(sobject);
        }
    }
    if (sendToServer) {
        console.log('Updating records on server');
        var request={
        method: 'PATCH',
        contentType: 'application/json',
        path: '/services/data/v43.0/composite/sobjects',
        data: {
            "allOrNone" : true,
            "records" : recs
            }
        };
        console.log('Request = ' + JSON.stringify(request, null, 4));
        force.request(request, ui.reload, records.error);
    }
    else {
        ui.reload();
    }
}

