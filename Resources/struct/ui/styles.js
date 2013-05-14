/**
* FoodCare City - FoodCare City
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
*/

(function() {

var cfg = Ti.App.Config;

var gradient = {
  type:'linear',
//  colors:['#000001','#666666'],
  colors:[cfg.color.BrightBlue, cfg.color.DarkBrightBlue],
  startPoint:{x:0,y:0},
  endPoint:{x:2,y:50},
  backFillStart:false
};
//MuseoSans 900
var fontFamily = Ti.App.Util.os({
      //iphone:  'Basic Gothic Mobi Pro',
      iphone:  'Museo Sans 900',
      android: 'BasicGothicMobiPro' // also Bold, Italic and BoldItalic
    })

var theme = {
  textColor:'#eee',
  grayTextColor:'#888888',
  headerColor:'#333333',
  lightBlue:'#006cb1',
  darkBlue:'#93caed',
  font: { fontFamily: fontFamily },
  fontFamily: fontFamily
};

//All shared property sets are declared here.
var properties = {

  //grab platform dimensions only once to save a trip over the bridge
  platformWidth: Ti.Platform.displayCaps.platformWidth,
  platformHeight: Ti.Platform.displayCaps.platformHeight,
  animationDuration: 300,

  //we use these for default components
  Button: {
    height:40,
    width:200,      
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        style: Titanium.UI.PLAIN,
        // backgroundRepeat: true,
        backgroundImage: 'none', // '/images/buttons/button_bg.png',
        backgroundColor: cfg.color.DarkBlue,
        borderRadius: 8,
 //       backgroundGradient: gradient,
 //       borderColor: cfg.color.DarkBrightBlue, // '#7ac454',
        verticalAlignment: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        //backgroundColor: '#004e7f',
        backgroundFocusedColor: cfg.color.LightBlue, 
        opacity: 0.8,
        color: '#ffffff',       
    font: {       
      fontSize:16,
      fontWeight:'bold',
      fontFamily: theme.font.fontFamily
    }
  },
  appView: {
    backgroundColor: 'white',
  },
  tView: {
    backgroundColor: 'transparent',
  },

  webView: {
      backgroundColor: '#ddd',
  },  

  tableView: Ti.App.Util.os({
    'iphone': {
      backgroundColor: 'transparent',
      rowBackgroundColor:'black',
      opacity:'0.9',
      font: { fontFamily: theme.fontFamily },
    },
    'ipad': {
      backgroundColor: '#ddd',//'#8dc63f',
      rowBackgroundColor:'black',
      opacity:'0.9',
      font: { fontFamily: theme.fontFamily }                      
    },
    'android': {
      backgroundColor: 'black',
      rowBackgroundColor:'black',
      opacity:'0.9',
    },
  }),   
  Label: {
    color: theme.textColor,
    font: {
      fontFamily: theme.fontFamily,
      fontSize:15,
      fontWeight:'bold',
    },
    textAlign: "center",
    height:'auto'
  },
  TextField: {
    height:55,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
    color:'#000000',
    clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ALWAYS
  },

};

exports.properties = properties;
exports.theme = theme;

})();

