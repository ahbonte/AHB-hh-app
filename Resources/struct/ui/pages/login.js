/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

var FCPapi = require('lib/fcp').api;
var User = require('lib/models/user').user;

function createPage(S) {
  
  var L = S.Log;
  var ui = S.UI;
  var forms = require('/lib/forms');
  var form = null;
  
  var createView = function(win, data) {
  	var mainView=Ti.UI.createView({width:'100%', height:'100%', layout:'horizontal'});
    var view = S.UI.createFormView({ backgroundImage: '/images/bg/city.png', backgroundColor:'#CCCCCC' }, 0.5);
      
  
    var fields = [
      { title:'Username', type:'text_image', id:'email', backgroundImage:'/images/bg/avatar.png'},
      { title:'Password', type:'password_image', id:'password', backgroundImage:'/images/bg/password.png' },
      { title:'Sign In', type:'submit', id:'loginUser', name: 'sign-in' },
    ];

    if (S.Cfg.testmode) {
          fields.push({ title:'Dev Sign In', type:'submit', id:'dloginUser' });
        }
    
    
    form = forms.createForm({
      style: forms.STYLE_HINT, // forms.STYLE_LABEL,
      fields: fields
    });
        
  
    form.addEventListener('loginUser', function(e) {
      var errmsg = null;
      
        if (e.values.email === '') errmsg = 'Please enter your email address.';
    
        if (errmsg) {
          alert(errmsg);
          return;
        }        
        FCPapi.signin(e.values, login_result);
    }),
    
    form.addEventListener('dloginUser', function(e) {            
          FCPapi.signin({ email: S.Cfg.testUser.email, password: S.Cfg.testUser.password}, login_result);
    }),
    
    view.add(form);
    mainView.add(ui.titleBarView('Sign In', page.name));
    mainView.add(view);
    return mainView;
  
  
    function login_result(response) {
      var message = 'Your email and password did not match. Please try again or reset your password.';
      
      // The API has given us an id & key, that has already been stored in the setings
      S.Log.print('login_result');
      
      if (response.success) {  
        User.getUserDataFromServer(function(response2) {
          if (response2.success) {
              // ***********************
              S.UI.openDashboard();
              win.close({animate: false});
              // ************************
            } else {
              S.UI.createAlertDialog(response2, 'There was a problem signing in. Please try again.').show();
            } 
        });   
      } else {
        
        message = S.UI.getAlertMessage(response, message);
        
        var alert = Ti.UI.createAlertDialog({
          title: 'Authentication Error',
          message: message,
          buttonNames: ['Try Again', 'Forgot Password?']        
        });
        
        alert.addEventListener('click', function(e) {
          L.print('click');
          L.print_r(e);
          if (e.index === 1) {
            var userData = JSON.parse(response.params.user);
              L.print_r(userData);
            
            FCPapi.passwordReset(userData, function(response) {
              var message = S.UI.getAlertMessage(response, 'Please check your email for password reset instructions.');
              
              Ti.UI.createAlertDialog({
                title: 'Password Reset',
                message: message,
              }).show();
            });
          }
        });
        alert.show();       
      }         
    }
  }
      
  var page = {
    name: 'login', 
    title: 'Sign In',
    useBackArrow: true,
    createView: createView,
  }
  
  return page;
}

exports.createViewContainer = createPage;
exports.createPage = createPage;

})();

