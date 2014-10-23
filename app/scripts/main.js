(function() {
  var sw = null,
      viewInfo = null;
  var unregister = function() {
    sw.unregsiter();
  };

  var postViewInfo = function() {
    viewInfo = {
      'width':              window.innerWidth,
      'height':             window.innerHeight,
      'device-pixel-ratio': window.devicePixelRatio
    };
    console.log('postViewInfo', viewInfo);
    navigator.serviceWorker.controller.postMessage({
      command: 'viewInfo',
      viewInfo: viewInfo
    });
  }

  window.addEventListener('resize', postViewInfo);
  window.addEventListener('message', function(e) {
    switch (e.data.command) {
      case 'viewInfo':
        postViewInfo();
        break;

      default:
        break;
    }
  });
  
  navigator.serviceWorker.register('scripts/worker.js', {
    scope: location.pathname
  }).then(function(_reg) {
    sw = _reg;
    postViewInfo();
    console.log(sw);
  }).catch(function(err) {
    console.error(err);
  });

})();
