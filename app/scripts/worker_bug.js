var ResponsiveResourceLoader = (function() {
  var DEFAULT_MANIFEST = [
    {
      "media-query": {
        "max-width": "900px",
        "device-pixel-ratio": 2
      },
      "extension": [
        "png"
      ],
      "suffix": "-900"
    }, {
      "media-query": {
        "max-width": "640px",
        "device-pixel-ratio": 2
      },
      "extension": [
        "png"
      ],
      "suffix": "-900"
    }, {
      "media-query": {
        "max-width": "640px",
        "device-pixel-ratio": 1
      },
      "extension": [
        "png"
      ],
      "suffix": "-640"
    }, {
      "media-query": {
        "max-width": "320px",
        "device-pixel-ratio": 1
      },
      "extension": [
        "png",
      ],
      "suffix": "-320"
    }
  ];

  var rrl = function() {
    this.viewInfo = null;
    this.viewInfoResolve = null;
    this.viewInfoPromise = null;
    this.manifest = [];

    var that = this;
    self.addEventListener('install', function(event) {
      fetch('/responsive-manifest.json').then(function(response) {
console.log(response);
        response.text().then(function(txt) {
          that.manifest = JSON.parse(txt);
console.log('manifest', that.manifest);
        });
      }).catch(function(err) {
        that.manifest = DEFAULT_MANIFEST;
console.log('manifest', that.manifest);
      });
console.log(event);
    });

    self.addEventListener('activate', function(event) {
      console.log('activation');
    });

    self.addEventListener('fetch', function(event) {
      event.respondWith(
        new Promise(function(resolve, reject) {
          var promise = null;
          if (!that.viewInfo) {
            if (!that.viewInfoPromise) {
              // Initial request for viewport
              that.viewInfoPromise = self.clients.getAll().then(function(clients) {
                return new Promise(function(res, rej) {
                  that.viewInfoResolve = res;
                  // Temporarily request the first client only
                  clients[0].postMessage({
                    command: 'viewInfo'
                  });
        console.log('request viewInfo');
                });
              });
            }
            promise = that.viewInfoPromise;
          } else {
            promise = Promise.resolve();
          }
          promise.then(function() {
  console.log('fetch', event.request);
            var suffix = that.query(event.request.url)
            // suffix is `null` if no match found
            if (suffix) {
  console.log('fetch', event.request);
              var url = that.appendSuffix(event.request.url, suffix);
              fetch(url).then(resolve);
            } else {
              resolve();
            }
          });
        })
      );
    });

    self.addEventListener('message', function(event) {
      switch (event.data.command) {
        case 'viewInfo':
          that.viewInfo = event.data.viewInfo;
          if (that.viewInfoPromise) {
            that.viewInfoResolve();
            that.viewInfoResolve = null;
            that.viewInfoPromise = null;
console.log('viewInfo received');
          }
console.log('message', event);
          break;

        default:
          break;
      }
    });
  };
  rrl.prototype.appendSuffix = function(url, suffix) {
    return url.replace(/\.(.{3,5}?)$/, suffix+'.$1')
  };
  rrl.prototype.query = function(url) {
    for (var i = 0; i < this.manifest.length; i++) {
      var v = this.manifest[i];
      if (v.extension !== '') {
        var regex = new RegExp('\.('+v.extension.join('|')+')$');

        // if extension doesn't match, continue
        if (!regex.test(url)) continue;
      }
      var mq = v['media-query'];
      if (mq['min-width']) {
        if (this.viewInfo.width < mq['min-width']) continue;
      }
      if (mq['max-width']) {
        if (this.viewInfo.width > mq['max-width']) continue;
      }
      if (mq['min-height']) {
        if (this.viewInfo.height < mq['min-height']) continue;
      }
      if (mq['max-height']) {
        if (this.viewInfo.height > mq['min-height']) continue;
      }
      if (mq['device-pixel-ratio']) {
        if (this.viewInfo['device-pixel-ratio'] !== mq['min-width']) continue;
      }

      console.log('match found', v);
      return v['suffix'] || '';
    }
    return '';
  };
  return new rrl();
})();
