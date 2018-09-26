function UI() {
}

UI.prototype.outputRecords = function(cursor) {
    console.log('In output records');
    var entries=cursor.currentPageOrderedEntries;
    console.log('Entries = ' + JSON.stringify(entries, null, 4));
    console.log('Entries length = ' + entries.length);
    if (entries.length>0) {
        ui.outputAllRecords(entries);
    }
    else {
        ui.showBlankRecords();
    }
    mainView.router.load({pageName: "index"});
}

// generates the HTML for all records to the list element on ther home page
UI.prototype.outputAllRecords = function(entries) {
    var recordList=$$("#recordList");
    
    console.log('In outputAllRecords');
    console.log('Entries = ' + JSON.stringify(entries, null, 4));
    console.log('entries length = ' + entries.length);
    var unsynced=false;
    if (entries.length>0) {
        var html='<div class="list-block" id="recordListInner">\n' +
        '<ul>\n';
        for (var idx=0; idx<entries.length; idx++) {
            var record=entries[idx];
            html+='<li><a onclick="ui.navigateToRecord(\'' + record.Id + '\');" href="#record" class="item-link">\n' +
            '  <div class="item-content">\n' +
            '    <div class="item-inner">\n' +
            '      <div class="item-title">' + record.Name + '</div>\n';
            
            if (record.isDirty) {
                html+='<div class="item-after"><i class="f7-icons" style="color: \'#ff0000\'">cloud_upload</i></div>\n';
            }
            html+= '</div>\n' +
                   '</div></a></li>';
        }
        html+='</ul></div>';
        recordList.html(html);
    }
}

// Generates list of placeholders when the records soup is empty
UI.prototype.showBlankRecords = function() {
    var recordList=$$("#recordList");
    var html='<div class="list-block">\n' +
    '  <ul>\n';
    
    for (var idx=0; idx<2; idx++) {
        html+='    <li>\n' +
        '      <a href="#" class="item-link">\n' +
        '        <div class="item-content">\n' +
        '          <div class="item-inner">\n' +
        '            <div class="item-title placeholder">No records in store</div>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      </a>\n' +
        '    </li>';
    }
    
    html+='  </ul>\n' +
    '</div>';
    
    recordList.html(html);
}

UI.prototype.reload = function() {
    var self=this;
    records.clear(function() {
                    records.retrieveRecordsFromServer(ui.reloaded);
                  });
}

UI.prototype.reloaded = function() {
    myApp.hidePreloader();
    ui.showAllRecords();
}

UI.prototype.showAllRecords = function() {
    records.queryAllRecords(ui.outputRecords);
}

UI.prototype.navigateToRecord = function(id) {
    records.queryOneRecord(id, ui.gotRecordForNavigation);
}

// callback when a record has been retrieved because the user wishes to navigate to it
UI.prototype.gotRecordForNavigation = function(cursor) {
    var entries=cursor.currentPageOrderedEntries;
    if (entries.length>0) {
        var record=entries[0];
        ui.outputRecord(record);
    }
}

// generates the HTML for the record
UI.prototype.outputRecord = function(record) {
    $$("#recordName").html(record.Name);
    var html='';
    
    var allFields=config.fields.slice();
    allFields.unshift('Name');
    for (var idx=0; idx<allFields.length; idx++) {
        var value=record[allFields[idx]];
        if (null==value) {
            value='';
        }
        html += '<div class="content-block-title">' + allFields[idx] + '</div>' +
                '  <div class="list-block"> ' +
                '    <ul> ' +
                '      <li> ' +
                '        <div class="item-content"> ' +
                '          <div class="item-inner"> ' +
                '            <div class="item-input"> ' +
                '              <input type="text" class="inp" name="' + allFields[idx] + '" value="' + value + '" /> ' +
                '            </div> ' +
                '          </div> ' +
                '        </div> ' +
                '      </li> ' +
                '    </ul> ' +
                '  </div>';
    }
    html+='<p><a href="#" onclick="ui.saveRecord(\'' + record._soupEntryId + '\', \'' + record.Id + '\');" class="button button-round active">Save</a></p>';

    $$("#recordDetail").html(html);
    mainView.router.load({pageName: "section"});
}

UI.prototype.saveRecord = function(soupId, id) {
    var inputs=$$(".inp");
    var updatedRecord={_soupEntryId: soupId, Id: id, isDirty: true};
    inputs.each(function(idx, ele) {
                    var input=$$(ele);
                    var val=input.val();
                    var name=input.attr('name');
                    console.log('Input ' + name + ' has value ' + val);
                    updatedRecord[name]=(val==''?null:val);
                });
    records.updateRecord(updatedRecord, ui.showAllRecords);
}

