/**
* FoodCare City 
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
**/

(function() {
// A list of all the required views from the /struct/ui/views folder
// the demo needs to be at the end.

var windows = [
  'dishdetail'
]

var pages = [
  'mainView',
  'masterview',
  'restaurant_list',    
  'cabinet', 
  'about',
  'cuisine_types', 
  'cuisinelist',
  'login',
  'condition',
  'subcondition',
  'profile',
  'mapall',
  'faq',
  'createaccount',
  'welcome',
  'grantaccess',
  'personalize',
  'condition_info',
  'profile_location',
  'loading',
  'resources',
  'share_us',
  'news_events',
  'health_resources'
];

Ti.App.Config = require('/config').current;
Ti.App.Util   = require('/lib/util').util;
Ti.App.Logger = require('/lib/logger');
Ti.App.Map    = require('/lib/map').map;

// Ti.App.UI     = require('/ui/ui').UI;
 
var S = require('struct/struct').S; // Main Application

Ti.App.api_url = S.Cfg.url; // global
Ti.App.first_run = true;
Ti.App.signout = 0;
Ti.App.showloader = false;

var User = require('lib/models/user').user; // Load the user model to put listeners in place
S.ui = S.UI; // @deprecated
S.UI.init(S);

Ti.include('ui/windows/dishdetail.js')

Ti.App.Windows = {
  createDishdetail: createDishdetail,  
}


setTimeout(main, 3000); // Show loading screen for at least two seconds
  

function main() {
  if (false && Ti.App.Config.testmode) {
    setInterval(function() { Ti.App.Logger.print('Mem (lies!): ' + Titanium.Platform.availableMemory); }, 2500);
  }
  
  S.UI.loadPages(pages);          
  S.UI.run(); 
  
  
  // Check for location information 
  if (Ti.Geolocation.locationServicesEnabled === false) {
       Ti.UI.createAlertDialog({title:'Healthy Hometown', message:'Your device has geo turned off - Healthy Hometown works best with location enabled.'}).show();      
    } else {
      // Start the location call, this may take a while
      require('lib/location').getLocation();
    }           
}

})();

