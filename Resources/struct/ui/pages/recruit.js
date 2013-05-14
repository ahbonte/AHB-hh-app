/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Previously as Nominate
 */


(function() {

var FCPapi = require('lib/fcp').api;
var Dish = require('lib/models/dish').dish;

var forms = require('/lib/forms');
function createPage(S) {
  
  var ui = S.UI;
  var cfg = S.Cfg;

  var page = {
    
    name: 'recruit', 
    title: 'Recruit',
    
    createView: function(win, events) {
      var mainView=Ti.UI.createView({width:'100%', height:'100%', layout:'horizontal'});
      var view = ui.createFormView({ backgroundImage: '/images/bg/city.png', backgroundColor:'#CCCCCC'}, 0.5);
        
      var fields = [  
              { title: 'Know of a local business that is missing from this app? Recruit them today and we\'ll contact them!', color:'white', fonFamily: cfg.customFont, fontSize:'16sp',type: 'label', height: 60, id: 'label1' }, 
              { title: 'Name of business', type:'text', id:'restaurant' },
             { title: 'Type of business (restaurant, grocer, etc.)', type:'text', id:'citystate' },
              { title: 'Keep Me Updated', type:'checkbox2', id: 'updateme2', value: true},
              { title: 'RECRUIT!', type:'submit', id:'recruit', name: 'recruit' },           
            
      ];
      
      var form = forms.createForm({
              style: forms.STYLE_HINT, // forms.STYLE_LABEL,
              fields: fields           
      });
          
     
     form.addEventListener('nominate', function(e) {
        var errmsg = '';
                
        if (e.values.restaurant === '') errmsg += 'Restaurant Name is required.' + "\n";
                              
        if ('' !== errmsg) {
           alert(errmsg);
          return;
        }
                
        S.UI.loader.show();
        FCPapi.nominate(e.values, function(response) {
        if(response!=null){
          S.UI.loader.hide();
          S.UI.createAlertDialog(response, "Thanks for recruiting. We'll let you know when dishes are available.",  
            function()  { S.Log.print('Alert callback'); w.close(); w=null;}).show() // @todo: need better way to close self
           }
        });
      });
	  
      view.add(form);
      mainView.add(S.UI.titleBarView('Recruit'));
      mainView.add(view);
      return mainView;
    } 
  }   
  return page;    
};

exports.createViewContainer = createPage;
exports.createPage = createPage;

})();


