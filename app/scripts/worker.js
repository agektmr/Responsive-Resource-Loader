var ResponsiveResourceLoader = (function() {
  var DEFAULT_MANIFEST = [
    {
      "media-query": {
        "max-width": 320,
        "min-device-pixel-ratio": 1
      },
      "extensions": [
        "png", "jpg"
      ],
      "suffix": "-320"
    }, {
      "media-query": {
        "max-width": 640,
        "min-device-pixel-ratio": 1
      },
      "extensions": [
        "png", "jpg"
      ],
      "suffix": ""
    }, {
      "media-query": {
        "max-width": 900,
        "min-device-pixel-ratio": 1
      },
      "extensions": [
        "png", "jpg"
      ],
      "suffix": "-900"
    }, {
      "media-query": {
        "min-width": 900,
        "min-device-pixel-ratio": 2
      },
      "extensions": [
        "png", "jpg"
      ],
      "suffix": "-900"
    }
  ];

  var rrl = function() {
    var that = this;
    this.manifest = null;
    this.viewInfo = null;
    this.suffix = '';

    self.addEventListener('install', function(event) {
      console.log('install');
      fetch('/responsive-manifest.json').then(function(response) {
        return response.text();
      }, function(err) {
        console.error('Manifest couldn\'t be loaded:', err.message);
        that.manifest = DEFAULT_MANIFEST;
      }).then(function(txt) {
        console.log('response: ', txt);
        that.manifest = JSON.parse(txt);
      }).catch(function(err) {
        console.error('Invalid manifest:', err.message);
        console.info('Using default manifest instead.');
        that.manifest = DEFAULT_MANIFEST;
      });
    });

    self.addEventListener('activate', function(event) {
      console.log('activation');
    });

    var viewInfoLoadedPromise = new Promise(function(resolve, reject) {
      self.addEventListener('message', function(event) {
        switch (event.data.command) {
          case 'viewInfo':
            that.viewInfo = event.data.viewInfo;
console.log('viewInfo: ', that.viewInfo);
            resolve();
            break;

          default:
            break;
        }
      });
    });

    self.addEventListener('fetch', function(event) {
      viewInfoLoadedPromise.then(function() {
        event.respondWith(
          that.convert(event.request.url)
        );
      });
    });
  };
  rrl.prototype.convert = function(url) {
    // TODO: change architecture of manifest and apply suffix depending on extension
    var suffix = this.getSuffix(url)
    // suffix is `null` if no match found
    if (suffix) {
      var url = url.replace(/\.(.{3,5}?)$/, suffix+'.$1')
console.log('fetching: ', url);
    }
    return fetch(url);
  };
  rrl.prototype.getSuffix = function(url) {
    if (!this.manifest) {
      console.info('manifest not loaded yet.');
      return '';
    }
    console.log('window width: %s, height: %s, dpr: %s',
      this.viewInfo.width, this.viewInfo.height, this.viewInfo['device-pixel-ratio']);
    var last_match = null;
    for (var i = 0; i < this.manifest.length; i++) {
      var v = this.manifest[i];
      if (v.extensions !== '') {
        var regex = new RegExp('\.('+v.extensions.join('|')+')$');

        // if extension doesn't match, continue
        if (!regex.test(url)) continue;
      }
      var mq = v['media-query'];
      if (mq['min-width']) {
        if (this.viewInfo.width < mq['min-width']) continue;
        last_match = v;
        console.log('min-width: %s matched', mq['min-width']);
      }
      if (mq['max-width']) {
        if (this.viewInfo.width > mq['max-width']) continue;
        last_match = v;
        console.log('max-width: %s matched', mq['max-width']);
      }
      if (mq['min-height']) {
        if (this.viewInfo.height < mq['min-height']) continue;
        last_match = v;
        console.log('min-height: %s matched', mq['min-height']);
      }
      if (mq['max-height']) {
        if (this.viewInfo.height > mq['min-height']) continue;
        last_match = v;
        console.log('max-height: %s matched', mq['max-height']);
      }
      if (mq['min-device-pixel-ratio']) {
        if (this.viewInfo['device-pixel-ratio'] < mq['min-device-pixel-ratio']) continue;
        last_match = v;
        console.log('device-pixel-ratio: %s matched', mq['min-device-pixel-ratio']);
      }

      console.log('match found', v);
      return last_match['suffix'] || '';
    }
    return last_match && last_match['suffix'] || '';
  };
  return new rrl();
})();
