/**
 * FoodCare City Views
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 **/

(function() {

var FCPapi = require('lib/fcp').api;
var Dish = require('lib/models/dish').dish;


function createPage(S) {
  
  var ui = S.UI;

  var page = {
    
    name: 'hometown_events', 
    title: 'Events',
    
    createView: function(win) {
      Ti.App.Logger.trace('+events_list');
            
		FCPapi.getHometownEvents(function(response) {
		var tableData = [];
		var events=response.data;
			for(i = 0; i < events.hometown_events.length; i++) {
				var events_type = events.hometown_events[i];
				if (events_type.name && events_type.id) {  // protect against null data
					tableData.push(page.buildRow(events_type.name, '', events_type.id, { hasChild:true, events_type_id: events_type.id}));           
				}
			}
			S.UI.loader.hide();  
			views.tableView.setData(tableData);
		});
		
		var views = S.UI.createBGTableView('', function(e) {  
			FCPapi.abort(); // Kill any pending requests
			S.UI.hometownEventsList(e.rowData.events_type_id);
		});
		return views.mainView;
    },
    buildRow: function(title, published_at, news_type_id, rowData) {

        if (Ti.App.Util.isAndroid()) {
          height = 'auto';
        } else {
          height = '60dp';
        }
        
        var rowView = Titanium.UI.createView({
          height: height,
          width: '100%',
          top: 0,
          left: 0,
        });
        
        rowView.add(
          Titanium.UI.createLabel({
            text: title,
            font: { fontSize: '15sp', fontWeight:'bold'},
            width: 'auto',
            textAlign: 'left',
            top: '10dp',
            height: '18dp',
            left: '5dp',
            color: 'white',
          }));
        
        rowView.add(  
          Titanium.UI.createLabel({
            text: published_at,
            font: { fontSize: '12sp' },
            width: 'auto',
            textAlign: 'left',
            top: '30dp',
            left: '5dp',
            color: 'white',
          }));
  
        return S.UI.createTableViewRow(rowData, rowView);
             
    },

  }   
  return page;    
};

exports.createViewContainer = createPage;
exports.createPage = createPage;

})();


