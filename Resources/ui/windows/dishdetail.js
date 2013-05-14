/**
* FoodCare City - FoodCare City
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
*/


function createDishdetail(S, dish, rest) {
   
    Ti.App.Logger.trace('+createDishdetail');    
    var data = {dish: dish, rest: rest};
//    Ti.App.Logger.print_r(data);
//    Ti.App.Logger.print_r(dish);

    var tpl = require("lib/tpl");
    
    var nutrient_name_override = {
      'CHOCDF': 'Carbs',
      'P': 'Phos.',
      'VITB6A': 'B6',
      'VITB12': 'B12',
      'VITRAE': 'A',
      'FASAT':  'Sat. Fat',
      'FAPU':   'Poly. Fat',
      'FAMS':   'Mono. Fat',
      'CHOLE':  'Cholest.',
      'K'    :  'Potas.'
    };
    
    var win = Ti.UI.createWindow({
     exitOnClose: false,
      orientationModes:[Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
      titleControl:Ti.UI.createImageView({image: '/images/topbar/hh_logo_new.png'}),
      barColor: '#233674', // NLT: Use default barcolor  
      navBarHidden: this.navBarHidden,
      backButtonTitleImage: '/images/topbar/home.png',
    });
  
    Ti.App.Logger.trace('+createDishdetail.1');
     
    var view = Ti.UI.createView();
    var wview = Ti.UI.createWebView({ html: '<html><head></head><body>&nbsp;</body></html>', enableZoomControls: false, disableBounce: true});
    view.add(wview);
    
    var address = rest.address;    
    view.add(S.UI.titleBarCuisine(rest));
    
    Ti.App.Logger.trace('+createDishdetail.2');  
    dish.name = Ti.App.Util.camelcase(dish.name);
    
    if (! dish.matched_guidelines) {
      dish.matched_guidelines = [];
    }
    
    // Legacy data
    if (!dish.nutritional_claims) dish.nutritional_claims = [];        
    if (!dish.passing_guidelines) dish.passing_guidelines = [];     
    
    dish.nutrients_all = [];
    dish_nutrients = [];
    dish.required = [];
    dish.warning = [];
    nutrients = dish.nutritional_facts;
    Ti.App.Logger.trace('+createDishdetail.3');
          
    for (var i=0; i < nutrients.length; i++) { 
        var nutrient = nutrients[i];
        var d = {};
    
        var name = nutrient.nutrient.name;
    
        if (nutrient_name_override[name]) {
          d.label = nutrient_name_override[name];
        } else {
          d.label = nutrient.nutrient.common_name;
        }          
    
        if (nutrient.nutritional_value === null || nutrient.nutritional_value < 0 ) {
          d.value = 'NA';
          if ( (true === nutrient.missing_nutritional_fact) && (false === nutrient.matched_guideline) ) {
            /* matched_guideline = false, guideline_nutritional_fact = true did not match a guideline and it is required to.  
             * We need this in case the dish does not have this nutrient.
             */ 
            dish.required.push(d.label); 
          }
        } else {                    
          d.value = nutrient.nutritional_value_rounded;          
          if (nutrient.daily_value_rounded) {
            // Problem: if the total strlen is 11 or more, depending on font size, the table gets effed up
            // so we don't want to show the % in that case
            var strlen = nutrient.nutritional_value_rounded.length + nutrient.daily_value_rounded.length;   
            if (strlen < 9) {         
              d.value += '<div style="float:right; display=inline">' + nutrient.daily_value_rounded +'</div>';
            }
          }
    
          // munge 
          d.value = d.value.replace('less than', ' < ')
          d.value = d.value.replace('kcal', '');
        }
        
        // If this is important for the guidelines
        // 
        // nutrient.matched_guideline = null / true / false;
        // nutrient.guideline_nutritional_fact = true;
        if (null !== nutrient.matched_guideline) {
          if (nutrient.matched_guideline) {
            d.label = "<div class='color-green'>" + d.label + '</div>';            
          } else {
            d.label = "<div class='color-red'>" + d.label + '</div>';            
            if (('NA' !== d.value) && (null !== nutrient.missing_nutritional_fact)) {            
              // We have this nutrient reported, it is needed, but outside of guidelines
              // we need to create an alert box for this nutrient
              Ti.App.Logger.trace('+ ' + d.label + ' over');
      
              dish.warning.push ({
                'nutrient': d.label,
                'recommended_value': nutrient.recommended_value,
                'dish_nutritial_value': d.value,
                'nutritional_difference': nutrient.nutritional_difference,
                'percent_meal_rv': nutrient.percent_meal_rv,
                'percent_daily_rv': nutrient.percent_daily_rv            
              });
            }
          } // else
        }
       
        
        dish.nutrients_all[i] = d;
    }
    
    Ti.App.Logger.trace('+createDishdetail.4');
    dish.nutrients = dish.nutrients_all.slice(0,12);
    dish.restdata = data.rest;
    dish.restdata.dishes = [];
    
    // Nutritional claims    
    var rounded = Math.round( dish.restdata.address.distance * 10 ) / 10;
    dish.restdata.address.distance = rounded.toFixed(1);
           
    if (Ti.App.Util.isAndroid()) {
      dish.img_base = 'file:///android_asset/Resources';
    } else {
      dish.img_base = ''; 
    }
    
    var ftpl = 'dishdetail.html.txt';

    dish.debug =  JSON.stringify(dish);
    Ti.App.Logger.trace('+createDishdetail.5');
    try {
      var contents = tpl.renderFile(ftpl, dish);
      Ti.App.Logger.trace('+createDishdetail.6');     
      wview.html = contents;
    } catch(e) {
      Ti.App.Logger.print("Error in dish detail");
      Ti.App.Logger.print(e);
    }
    
    win.add(view);
    
    return win;            
}


