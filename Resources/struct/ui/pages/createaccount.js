/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

function createPage(S) {
  
  var user = require('lib/models/user').user;  
  var FCPapi = require('lib/fcp').api;
      
  var page =  {
    name: 'createaccount', 
    title: 'About You',
    useBackButton: true,
    useBackArrow: true,
  
      
    createView: function(win) {
	  var mainView=Ti.UI.createView({width:'100%', height:'100%', layout:'horizontal'});
      var view = S.UI.createScrollableFormView({ backgroundImage: '/images/bg/city.png', backgroundColor:'#CCCCCC'}, 0.5);
      var forms = require('lib/forms');
      
      var showTerms = function()
      {
        var w = Titanium.UI.createWindow({
          title:'Terms of Use',
          barColor: S.Cfg.barColor, 
        });
        
        w.add(Ti.UI.createWebView({url: S.Cfg.url_tos }));

        var b = Titanium.UI.createButton({
          title:'Close',
          style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
        });
        w.setLeftNavButton(b);
        b.addEventListener('click',function()
        {
          w.close();
        });
        
        w.open({modal:true});
      } 

      
      var fields = [              
              { title:'First Name', type:'text', id:'first_name', required: true },
              { title:'Last Name', type:'text', id:'last_name', required: true },
              { title:'Email Address(will be your username)', type:'email', id:'email', required: true },
              { title:'Home Zip Code', type:'number', id: 'zipcode', required: false },
              { title:'Password', type:'password', id:'password', required: true },
              { title:'Verify Password', type:'password', id:'password_confirmation',required: true },
              { title:'Accept Terms of Service', type:'checkbox1', id: 'accept_terms', value: false, required: true, terms_callback: showTerms },
              { title:"Sign Up", type:'submit', id:'registerUser',  name: 'sign_up'},             
      ];
/*      
      if (S.Cfg.testmode) {
        fields.push({ title:'Test', type:'submit', id:'test' });
        fields.push({ title:'Info', type:'submit', id:'info' });
      }
*/      
      
      var form = forms.createForm({
              style: forms.STYLE_HINT, // forms.STYLE_LABEL,
              fields: fields
      });
      
      form.addEventListener('info', function(e) {
        S.UI.navigate('condition_info');
      });
      
      form.addEventListener('test', function(e) {
        FCPapi.signin({ email: S.Cfg.testUser.email, password: S.Cfg.testUser.password}, function(e) {
          if (e.success) {
            // S.UI.openTabController();
            S.UI.navigate('personalize');
           } else {
             S.Log.print_r(e);
             alert('Error:' + e.data.message);
           }
        });       
      }),
      
      form.addEventListener('registerUser', function(e) {
                        
          S.Log.print_r(form);
          S.Log.debug(e.values);
          
          var errmsg = '';
          for(var i = 0; i < fields.length; i++) {
            if (fields[i].required) {
              if (e.values[fields[i].id] === '') errmsg += fields[i].title + ' is required.' + "\n";
              break;
            }
          }
                    
          if (! Ti.App.Util.validateEmail(e.values.email)) errmsg += 'Please enter a valid email address' + "\n";
   
          var zip = Ti.App.Util.validateZipCode(e.values.zipcode);                      
          if (!zip) {
            errmsg += 'Please enter your 5-digit zipcode so that we can present restaurants when your location is not available.' + "\n";
          } 
                    
          if (true !== e.values['accept_terms']) {
            errmsg += 'Acceptance of Terms is required to continue.' + "\n";  
          } 
          
          if (e.values.password != e.values.password_confirmation) {
            errmsg += 'Password does not match confirmation' + "\n";
          }

          if ('' !== errmsg) {
            alert(errmsg);
            return;
          }
          
          user.setZipcode(zip);
          
          /* @todo: refactor to user model */
          var userRecord = e.values;

          delete userRecord.accept_terms; // can't have additional data in call    
          delete userRecord.zipcode;
          
          userRecord.preferences = { "geolocate": "Use Current Location", "zipcode": zip, "distance": "5 Miles"};

          FCPapi.createAccount(userRecord, createaccount_result);
      });
      
      form.addEventListener('terms', showTerms);                  
      view.add(form);     
      mainView.add(ui.titleBarView('Create an Account', page.name));
      mainView.add(view);
      return mainView;
      
      
      function createaccount_result(response) {
        S.Log.trace('+createAccount: response');
        S.UI.loader.hide();
              
        try {
          var userData = JSON.parse(response.params.user);
        } catch(err) {
          response.success = false; // we could not parse the response!
          S.Log.print('ERR: could not parse response');
          S.Log.print_r(response);
          response.success = false;
        }
                    
        if (! response.success) {   
          S.UI.createAlertDialog( response, 'There was a problem creating your account. Please try again.').show();
          return;
        }
                                                                  
        FCPapi.signin({ email: response.data.email, password: userData.password }, function(response) {
          S.Log.trace("+create account, next step");
                  
          if (response.success) {                  
               user.getUserDataFromServer(function(response) {
                 if (response.success) {
                   S.UI.navigate('personalize');
//                   setTimeout(function() { win.close({animate: false}); }, 2000);          // causes flicker       
                 } else {
                   S.UI.createAlertDialog( response, 'There was an error signing into your account. Please try again.', function() { win.close(); }).show();                 
                 }               
               });
          } else {
              S.UI.createAlertDialog( response, 'There was a problem signing into your account. Please try again.', function() { win.close(); }).show();
          }       
        });
      }


    }
  }
    
    
  return page;
}

exports.createPage = createPage;
exports.createViewContainer = createPage;

})();


