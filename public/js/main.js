/*var tl = new TimelineMax({repeat: -1, yoyo: true, repeatDelay: 0.3});
tl
	.fromTo($('.vignette'), 1, {opacity: 0}, {opacity: 0.8, ease: Power3.easeIn})
	.fromTo($('.vignette'), 0.2, {opacity: 0}, {opacity: 0.8, ease: Power3.easeIn});*/

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

//TweenMax.fromTo($('.brand'), 1, {scaleX: 1.2, scaleY: 1.3}, {scaleX:1, scaleY:1, ease:Elastic.easeOut, repeat:-1, delay: 0.3, repeatDelay:0.6})
//TweenMax.fromTo($('.vignette'), 1, {opacity: 0}, {opacity: 1, ease:Power3.easeOut, repeat:-1, repeatDelay:0.3})


$(".toggle-fullscreen").tap(function() {
  toggleFullScreen();
});