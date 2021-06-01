// const { JSDOM } = require( "jsdom" );
// const { window } = new JSDOM( "" );
// const $ = require( "jquery" )( window );

// import './js-src/lib/drawerJs/dist/drawerJs.standalone';

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

// We listen to the resize event
window.addEventListener('resize', () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});




$(document).ready(function () {
  var drawerPlugins = [
      // Drawing tools
      'Pencil',
      'Eraser',
      'Line',

      // Drawing options
      //'ColorHtml5',
      'Color',
      'ShapeBorder',
      'BrushSize',
      'OpacityOption',

      'LineWidth',
      'StrokeWidth',

      'ShapeContextMenu',
      'OvercanvasPopup',
      'OpenPopupButton',
      'MinimizeButton',
      'ToggleVisibilityButton',
      'MovableFloatingMode',

  ];

  // drawer is created as global property solely for debug purposes.
  // doing  in production is considered as bad practice
  window.drawer = new DrawerJs.Drawer(null, {
      plugins: drawerPlugins,
      corePlugins: [
          'Zoom' // use null here if you want to disable Zoom completely
      ],
      pluginsConfig: {
          Image: {
              scaleDownLargeImage: true,
              maxImageSizeKb: 10240, //1MB
              cropIsActive: true
          },
          BackgroundImage: {
              scaleDownLargeImage: true,
              maxImageSizeKb: 10240, //1MB
              //fixedBackgroundUrl: '/examples/redactor/images/vanGogh.jpg',
              imagePosition: 'center',  // one of  'center', 'stretch', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
              acceptedMIMETypes: ['image/jpeg', 'image/png', 'image/gif'] ,
              dynamicRepositionImage: true,
              dynamicRepositionImageThrottle: 100,
              cropIsActive: false
          },
          Text: {
              editIconMode : false,
              editIconSize : 'large',
              defaultValues : {
                fontSize: 72,
                lineHeight: 2,
                textFontWeight: 'bold'
              },
              predefined: {
                fontSize: [8, 12, 14, 16, 32, 40, 72],
                lineHeight: [1, 2, 3, 4, 6]
              }
          },
          Zoom: {
              enabled: true, 
              showZoomTooltip: true, 
              useWheelEvents: true,
              zoomStep: 1.05, 
              defaultZoom: 1, 
              maxZoom: 32,
              minZoom: 1, 
              smoothnessOfWheel: 0,
              //Moving:
              enableMove: true,
              enableWhenNoActiveTool: true,
              enableButton: true
          }
      },
      toolbars: {
          drawingTools: {
              position: 'top',         
              positionType: 'outside',
              customAnchorSelector: '#custom-toolbar-here',  
              compactType: 'scrollable',   
              hidden: false,     
              toggleVisibilityButton: false
          },
          toolOptions: {
              position: 'bottom', 
              positionType: 'inside',
              compactType: 'popup',
              hidden: false,
              toggleVisibilityButton: false,
              fullscreenMode: {
                  position: 'bottom', 
                  compactType: 'popup',
                  hidden: false,
                  toggleVisibilityButton: false
              }
          },
          settings : {
              position : 'right', 
              positionType: 'inside',					
              compactType : 'scrollable',
              hidden: false,	
              toggleVisibilityButton: false
          }
      },
       defaultImageUrl: '/examples/redactor/images/drawer.jpg',
      defaultActivePlugin : { name : 'Pencil', mode : 'lastUsed'},
      debug: true,
      activeColor: '#a1be13',
      transparentBackground: true,
      align: 'floating',  //one of 'left', 'right', 'center', 'inline', 'floating'
      lineAngleTooltip: { enabled: true, color: 'blue',  fontSize: 15}
  }, 400, 400);

  $('#canvas-editor').append(window.drawer.getHtml());
  window.drawer.onInsert();


    const element = document.getElementById('section-master');
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (screenfull.isEnabled) {
            screenfull.request(element);
        }
    });
});
