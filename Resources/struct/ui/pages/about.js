/**
* FoodCare City Views 
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
* A view is an associative array (object) with name, title and createView function
* that returns a Titanium view for the page, which will be later attached to a window.
* 
**/

var cfg = require('/config').current;

exports.createViewContainer = function(S, ui) {
  return {
    name: 'about', 
    title: 'About Healthy Hometown',
      
    createView: function() {    
      var view = ui.createWebView({url: cfg.url_about });
      return view;
    }
  } 
}
