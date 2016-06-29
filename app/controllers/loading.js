var args = arguments[0] || {};
$.main.hide();
$.loadingBar.hide();
$.activityIndicator.hide();
$.mask.hide();

/**
 * function to start the loading animation
 */
$.start = function() {
	$.main.show();
	$.mask.show();
	$.loadingBar.show();
	console.log("loading show");
	$.activityIndicator.show();
};

/*
 * exposed function to finish the loading animation. Animates the rocket off the screen.
 */
$.finish = function(_callback) {
	$.main.hide();
	$.mask.hide();
	$.loadingBar.hide();
	$.activityIndicator.hide();
	_callback && _callback();
};

