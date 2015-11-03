/*
 * exposed function to finish the loading animation. Animates the rocket off the screen.
 */
function navToLoading(){
	var loader = Alloy.createController("loader").getView();
	loader.open();
}

function init(){
	var login = Alloy.createController("auth/login");
	login.checkAuth(navToLoading);
}

init();
