var UI;
function Component(S) {
   UI=S.ui;
}; 
exports.Window = function(S, page) {
	if(page.name=='welcome')
	{
		window = Ti.UI.createWindow({
			fullscreen :false,
		    navBarHidden:true,
		});
		return window;
	}
   window = Ti.UI.createWindow({
		fullscreen :false,
	    navBarHidden:true,
	});	
	var topBar = Titanium.UI.createView({
         height:'40dp',
         backgroundColor:'#233674',
         left:'0',
         top:'0',
         layout:'horizontal',
         zIndex:2,
     });
     var logo=Ti.UI.createImageView({
		image:'/images/topbar/logo-1.png',
		width:'85%',
	});
	var menuImage=Ti.UI.createImageView({
		image:'/images/topbar/menu_icon.png',
		right:5,
	});
	menuImage.addEventListener('click', function(e) {
		S.UI.loader.show();
         S.UI.navigate('cabinet');
     });
	topBar.add(logo);
	topBar.add(menuImage);
	window.add(topBar);
	return window;
};