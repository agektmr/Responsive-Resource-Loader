# Responsive Resource Loader
This is a proof of concept implementation of RRL which gives you responsive images for free (almost) using ServiceWorker interception. No more `img[srcset]` and `<picture>` element!

* Using huge images is redundant for mobile devices.
* Assigning `srcset` or `picture` for every single `img` tag is a P.I.T.A.
* Loading images with relevant size for the device is a pain.

## Example
Write your `img` tag as you used to.

    <img src="img/agektmr.jpg">

You might expect to make it responsive using `srcset`. For example:

    <img src="img/agektmr.jpg" srcset="img/agektmr-320.jpg 320w, img/agektmr-640.jpg 640w, img/agektmr-900.jpg 640w 2x">

But you don't want to write this for every single images. You can define a formula such as:

- Append `-900` for all images with `640w 2x`  
ex) `agektmr-900.jpg`, `abstract1-900.jpg`, `abstract2-900.jpg`
- Append `-640` for all images with `640w`  
ex) `agektmr-640.jpg`, `abstract1-640.jpg`, `abstract2-640.jpg`

This will become a manifest file that looks like:

    [
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
        "suffix": "-640"
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
    ]

# How to try this
1. clone this repository
```
    git clone git@github.com:agektmr/Responsive-Resource-Loader.git
```
2. install dependencies
```
    cd Responsive-Resource-Loader
    npm install
    bower install
```
3. run server
```
    grunt server
```
4. access on a browser at [http://localhost:9000/](http://localhost:9000/)

The demo is not publicly available as ServiceWorker requires SSL connection.

# Inspect in DevTools
1. access chrome://serviceworker-internals
2. click "Inspect" of registered ServiceWorker
3. using the device mode should help you try this easier. click on phone
icon next to magnifier icon at top left of devtools. learn more: [DevBytes: Chrome DevTools Device Mode](https://www.youtube.com/watch?v=FrAZWiMWRa4)

