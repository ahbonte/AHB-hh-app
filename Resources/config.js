/*
 * Methods to abstract various API calls
 */

// Protect global namespace which gets polluted under iOS

(function() {

  
  var base = "http://m.foodcare.me";  
  var base2 = "http://m.foodcare.me";
  // var base2 = 'http://m.staging.foodcare.me';
  // var base = 'http://staging.foodcare.me';
  var base3 = "https://twitter.com";
   var colors = {
    /* FoodCare City Color Swatch */
    LightGreen:        '#66b132',
    DarkGreen:         '#2b6a54',
    Magenta:           '#cc3399',
    DarkRed:           '#632c39',
    Yellow:            '#ffc431',
    LightBlue:         '#92d7e7',
    DarkBlue:          '#004e7f',
    LightGrey:         '#939598',
    DarkGrey:          '#58595b',
    Black:             '#231f20',
    BrightBlue:        '#0690cf',
    DarkBrightBlue:    '#2b3990',
    Purple:            '#6154a4',
    Brown:             '#7e725b',
    Salmon:            '#e94e3e'
   };
   
   
  //var customFont = 'Basic Gothic Mobi Pro'; // use the friendly-name on iOS
  var customFont = 'MuseoSans 900'
  if(Ti.Platform.osname=='android') {
     // on Android, use the "base name" of the file (name without extension)
     customFont = 'MuseoSans_100'; // also Bold, Italic and BoldItalic
  }  
    
  var config = {    
    color: colors,
    barColor: '#233674', // colors.DarkBlue,
    per_page: 50, // Fill up the page
    showloader: true, // true,    
    /*
     * when I listen to music, it cuts it out and then takes over my headphone clicker so i can't restart it
     */
    Platform: 'Ti',
    testUser: {
      email: 'nickwl@foodcare.me',
      password: 'password',
    },
    guestSignin : {'password':'chetu123', 'email':'shashid@chetu.com'},
        
    fontFamily: customFont,
    access_token: '3e5c3751deec7881f913a412475ec186',
    
    url:        base + '/api/',
    url_tos:    base2 + '/ee/tos/',
    url_news:   base2 + '/ee/news/',
    url_share:  base3 + '/FoodCareLabs/',
    url_social: base2 + '/ee/share/',
    url_about:  base2 + '/ee/about/',
    url_rate:   base2 + '/ee/rate/',
    url_faq:    base2 + '/ee/faq/',
    
    setDev: function() {
      config.url = 'http://m.staging.foodcare.me/api/'; 

      config.testUser = {
       email: 'nickwl@foodcare.me',
       password: 'password'
      }
      
      config.testmode = true;
      Ti.App.api_url = config.url;
    }, 

    setProd: function() {
      config.url =  'http://m.foodcare.me/api/';
      config.testUser = {
        email: 'nickwl@foodcare.me',
        password: 'password',
      }
      Ti.App.api_url = config.url;
    }    
  }
  
  if ('undefined' === typeof Ti) {   config.Platform = 'Node'  }
  
//  config.setDev();
  // config.testmode = true;  
//  config.url =  'http://m.foodcare.me/api/';

  
  exports.current = config;
  
})();
