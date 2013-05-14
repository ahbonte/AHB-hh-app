/**
* Healthy Hometown
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
*/

(function() {

function createPage(S) {
  
    var page = {
      title: 'Almost Done',
      useBackButton: true,
      useBackArrow: true,
    
    createView: function() {

      var view = S.UI.createTView({backgroundImage:'/images/bg/city.png'});
      
      var l1 = Titanium.UI.createLabel({
        id:'font_label_test',
        text:'On the next screen we will ask you to confidentially tell us which health condition(s) you have.  This will help us find great tasting dishes near you.  Should you need to modify your health conditions at a later time, you can easily do this under your Profile.\n\nNote: Healthy Hometown cannot locate dishes unless there is at least one health condition selected.',
        top:5,
        xheight: 390,
        width: '90%',
        textAlign:'left',
        color: 'black',
        backgroundLeftCap: 10,
        backgroundRightCap: 10,
        backgroundRadius: 5,
        backgroundPaddingLeft: 10,
        backgroundPaddingRight: 10,
        backgroundPaddingTop: 10,
        backgroundPaddingBottom: 10       
      });
    
      var bgview = Ti.UI.createView( { backgroundColor: 'white', opacity: 0.8, top: 10, height: 400, width: '95%', borderRadius: 10 });
      bgview.add(l1);

      view.add(bgview);
      view.add(S.UI.createButton({title: 'Next >', bottom: 30, name: 'next'}, function(e) { S.UI.openCondition() }));
        
      return view;
    }
  }
  
  return page;
}

exports.createViewContainer = createPage;
exports.createPage = createPage;

})();


