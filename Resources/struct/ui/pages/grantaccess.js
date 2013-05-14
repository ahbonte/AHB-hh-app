/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

var FCPapi = require('lib/fcp').api;
var Util = require('lib/util').util;

function createPage(S) {
  
  var L = S.Log;
  var ui = S.UI;
  var Cfg = S.Cfg;
  
  var forms = require('/lib/forms');
    
  var page = {
    name: 'grantaccess', 
    title: 'Dietitian Connect',
    win: null,
    
    
    getGrantView: function(form, thiswindow) {
    
      var mainview = ui.createFormView({ backgroundImage: '/images/bg/city.png' }, 0.0);

      mainview.add(form);     
      return mainview;
    },    
      
    createView: function() {    
      var mainview = ui.createFormView({ backgroundImage: '/images/bg/city.png' }, 0.0);

      view = Ti.UI.createView();
        
      var fields = [  
          { title: "With FoodCare, you can grant your Registered Dietitian access to your account in order to help you manage your diet. Don't have an RD? Let us help you find a qualified dietitian in your area.", type: 'label', height: 130, id: 'label1' },
          { title: 'Get A FoodCare Dietitian', type:'submit', id:'find', name: 'get_fc_dietitian' }, 
          { title: 'Grant My Dietitian Access', type:'submit', id:'grant', name: 'dietitian_access' },            
      ];
      
      var form = forms.createForm({
              style: forms.STYLE_HINT, // forms.STYLE_LABEL,
              fields: fields           
      });
          
      form.addEventListener('grant', function(e) {
        var w = Titanium.UI.createWindow({  title: 'Grant Access',    barColor: S.Cfg.barColor });
        
        var grantfields = [  
          { title: "Enter your dietitian's contact information in order for us to grant them access to your account, allowing them to set dietary guidelines.", type: 'label', height: 130, id: 'label1' }, 
          { title: "Enter Your dietitian's name", type:'text', id:'dietitian' },
          { title: "Enter Your dietitian's email", type:'text', id:'email' },
//          { title: 'Verify Your Password', type:'password', id: 'password'},
          { title: 'Grant Access', type:'submit', id:'grant', name: 'grant_access' },           
        ];

        var form = forms.createForm({
                style: forms.STYLE_HINT, // forms.STYLE_LABEL,
                fields: grantfields           
        });
            
        form.addEventListener('grant', function(e) {
           var errmsg = '';
                  
           if (e.values.dietitian === '') errmsg += 'Name is required.' + "\n";
           if ((e.values.email === '') || (! Util.validateEmail(e.values.email)) ) errmsg += 'Please enter a valid email address.' + "\n";
           if (e.values.password === '') errmsg += 'Password is required.'  + "\n";
                                
           if ('' !== errmsg) {
             alert(errmsg);
             return;
           }
                
            S.UI.loader.show();
            FCPapi.grantaccess(e.values, function(response) {
              S.UI.loader.hide();
              S.UI.createAlertDialog(response, 'Thank You. If your dietitian agrees, they will be given access to your account.', 
                function()  { w.close(); }).show() // @todo: need better way to close self
            });
        });
                             
        w.add(page.getGrantView(form, w));
      
        if (Ti.Platform.name !== 'android') {
            var b = Titanium.UI.createButton({ title:'Close',  style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN  });
            w.setLeftNavButton(b);
            b.addEventListener('click',function()  { w.close(); });
        }
        
        w.open({modal:true});
        return true;
      });
      
      form.addEventListener('find', function(e) {
        var w = Titanium.UI.createWindow({  title: 'Find A Dietitian',    barColor: S.Cfg.barColor });

        var findfields = [  
          { title: "Enter your contact information, and we'll let you know of dietitians within your area that are part of the FoodCare RD Network.", type: 'label', height: 110, id: 'label1' },
          { title: "Zip Code", type:'text', id:'zipcode' },
          { title: "Insurance Provider", type:'text', id: 'insurance' },
          { title: "No Insurance", type:'checkbox', id: 'no_insurance' },
          { title: 'How much are you willing to pay for an RD consultation?', type:'picker', id:'price', data: ['$0', '$50 - $75', '$80 - $150', '$150+'], required: true  }, 
          { title: 'Get A FoodCare Dietitian', type:'submit', id:'get_fc_dietitian', name: 'get_fc_dietitian' },           
        ];

        var form = forms.createForm({
                style: forms.STYLE_HINT, // forms.STYLE_LABEL,
                fields: findfields           
        });
            
        form.addEventListener('get_fc_dietitian', function(e) {
           var errmsg = '';
                  
           if (false === Ti.App.Util.validateZipCode(e.values.zipcode)) errmsg += 'Invalid Zip Code.' + "\n";
                                
           if ('' !== errmsg) {
             alert(errmsg);
             return;
           }
           e.values.subject = 'Get A Dietitian';     
           S.UI.loader.show();
           FCPapi.log(e.values, function(response) {
              S.UI.loader.hide();
              S.UI.createAlertDialog(response, 'Thank you, we will contact you shortly.', 
                function()  { w.close(); }).show() // @todo: need better way to close self
           });
        });
                             
        w.add(page.getGrantView(form, w));
      
        if (Ti.Platform.name !== 'android') {
            var b = Titanium.UI.createButton({ title:'Close',  style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN  });
            w.setLeftNavButton(b);
            b.addEventListener('click',function(e)  {
              w.close(); 
            });
        }
        
        w.open({modal:true});
        return true;
      });

      mainview.add(form);     
      return mainview;
                        
    },
        
  }
  
  return page;
}

exports.createViewContainer = createPage;
exports.createPage = createPage;

})();

