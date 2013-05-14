/**
* FoodCare City - FoodCare City
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
*/

var cfg = require('config').current;


exports.NavigationController = function() {
  this.windowStack = [];
  this.first = null;
};

exports.NavigationController.prototype.init = function(/*Ti.UI.Window*/windowToOpen) {
  
  //hack - setting this property ensures the window is "heavyweight" (associated with an Android activity)
  windowToOpen.navBarHidden = windowToOpen.navBarHidden || false;
  windowToOpen.exitOnClose = true;
  windowToOpen.barColor = cfg.barColor;  

  //This is the first window
  this.first = windowToOpen;    
  if(Ti.Platform.osname === 'android') {      
    windowToOpen.open({animated: false});
    return windowToOpen;
  } else {          
    this.navGroup = Ti.UI.iPhone.createNavigationGroup({
      window : windowToOpen,
      barColor: cfg.barColor
    });
    
    var containerWindow = Ti.UI.createWindow({barColor: '#272424', backgroundColor: '#272424' });
    containerWindow.add(this.navGroup);
    containerWindow.open();
    return containerWindow;
  }   
}

exports.NavigationController.prototype.open = function(/*Ti.UI.Window*/windowToOpen) {
  //add the window to the stack of windows managed by the controller
  //All subsequent windows
    windowToOpen.barColor = cfg.barColor;
    this.windowStack.push(windowToOpen);
    Ti.API.info('+Window Stack Size: ' + this.windowStack.length);

  //grab a copy of the current nav controller for use in the callback
  var that = this;
  var listener =  function() {  that.windowStack.pop(); Ti.API.info('(pop) Window Stack Size: ' + that.windowStack.length);   }
  windowToOpen.addEventListener('close', listener);
  windowToOpen.listener = listener;
  
  // setting this property ensures the window is "heavyweight" (associated with an Android activity)
  // Seems to adffect stability .. leave alone for now. TEST
//  windowToOpen.navBarHidden = windowToOpen.navBarHidden || false;
//  windowToOpen.exitOnClose = false;

  if(Ti.Platform.osname === 'android') {
    windowToOpen.open();
  } else {
    this.navGroup.open(windowToOpen);
  }
}

//go back to the initial window of the NavigationController
exports.NavigationController.prototype.home = function() {
  //store a copy of all the current windows on the stack
  Ti.API.info('Home (Stack Size): ' + this.windowStack.length);
  
  var windows = this.windowStack.concat([]);
  
  for(var i = 0, l = (windows.length); i < l; i++) {
    
    if (windows[i]) {   
      windows[i].removeEventListener('close', windows[i].listener);   
      if (this.navGroup) { 
        this.navGroup.close(windows[i]); 
      } else {
        windows[i].close();     
      }
      Ti.API.info('Closing Window: ' + i + ' *Size: ' + this.windowStack.length);
      windows[i] = null;        
    } else {
      Ti.API.info('Closing Window NULL: ' + i + ' *Size: ' + this.windowStack.length);
    }
  }
    
  // Bug. Stack is reset by the event listener when the window is closed
  this.windowStack = [this.windowStack[0]]; //reset stack
};

exports.NavigationController.prototype.closeController = function() { } 
exports.NavigationController.prototype.openController = function() { }


