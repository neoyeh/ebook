// const { JSDOM } = require( "jsdom" );
// const { window } = new JSDOM( "" );
// const $ = require( "jquery" )( window );

// import './js-src/lib/drawerJs/dist/drawerJs.standalone';
import { fabric } from "fabric";


const fullHeight = {
    init() {
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
    }
};

const drawerFunction = (function () {
    'use strict';

    let drawerFunction = {
        imageSize: null,
        imageUrl: null,
        init: function () {
            let drawerFunctionSection = $('.canvas-editor');
            if (drawerFunctionSection.length > 0) {
                $.each(drawerFunctionSection, function (index, val) {
                    let currentSection = $(this);
                    drawerFunction.initPlugin(currentSection);
                    $(window).resize(function () {
                    });
                });
            }
        },
        initPlugin: function (parentElement) {
            let drawerPlugins = [
                // Drawing tools
                'Pencil',
                'Eraser',
                'Line',
                'BackgroundImage',

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
            
            let localizedTexts  = {
                'Pencil': '螢光筆',
                'Eraser': '橡皮擦',
            }

            // drawer is created as global property solely for debug purposes.
            // doing  in production is considered as bad practice
            window.drawer = new DrawerJs.Drawer(null, {
                plugins: drawerPlugins,
                texts: localizedTexts,
                corePlugins: [
                    'Zoom' // use null here if you want to disable Zoom completely
                ],
                pluginsConfig: {
                    BackgroundImage: {
                        scaleDownLargeImage: true,
                        maxImageSizeKb: 30720, //3MB
                        //fixedBackgroundUrl: '/examples/redactor/images/vanGogh.jpg',
                        imagePosition: 'stretch',  // one of  'center', 'stretch', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
                        acceptedMIMETypes: ['image/jpeg', 'image/png', 'image/gif'],
                        dynamicRepositionImage: true,
                        dynamicRepositionImageThrottle: 0,
                        cropIsActive: false
                    },
                    'Pencil': {
                        cursorUrl: 'pencil',
                        brushSize: 10,
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
                toolbarSize: 55,
                toolbars: {
                    drawingTools: {
                        position: 'bottom',
                        positionType: 'inside',
                        customAnchorSelector: '#custom-toolbar-here',
                        compactType: 'scrollable',
                        hidden: false,
                        toggleVisibilityButton: false
                    },
                    toolOptions: {
                        position: 'top',
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
                    settings: {
                        position: 'right',
                        positionType: 'inside',
                        compactType: 'scrollable',
                        hidden: false,
                        toggleVisibilityButton: false
                    }
                },
                defaultActivePlugin: { name: 'Pencil', mode: 'lastUsed' },
                borderCss: 'none',
                borderCssEditMode: 'none',
                debug: true,
                activeColor: '#a1be13',
                transparentBackground: true,
                lineAngleTooltip: { enabled: true, color: 'blue', fontSize: 15 }
            }, 400, 400);

            parentElement.append(window.drawer.getHtml());
            window.drawer.onInsert();

            drawerFunction.initImage(parentElement, '../img/test.jpg');

            $(window).resize(function () {
                drawerFunction.resetSize(parentElement);
            });


        },
        initImage: function(parentElement, url){
             // initbackground
            drawerFunction.imageUrl = url;
            const img = new Image();
            img.onload = function() {
                console.log(this.width + 'x' + this.height);
                drawerFunction.imageSize = {
                    width: this.width,
                    height: this.height,
                }
                drawerFunction.resetSize(parentElement);
            }
            img.src = url;
        },
        resetSize: function(parentElement, url){
            const imageUrl = url?url:drawerFunction.imageUrl;
            if(drawerFunction.imageSize !== null){
                // drawer.api.setSize(drawerFunction.imageSize.width, drawerFunction.imageSize.height);
                const windowW = window.innerWidth;
                const windowH = window.innerHeight-80;
                const imageRatio = drawerFunction.imageSize.width/drawerFunction.imageSize.height;
                const windowRatio = windowW/windowH;
                const finialRatio = ( imageRatio > windowRatio )?windowW/drawerFunction.imageSize.width : windowH/drawerFunction.imageSize.height;
                // drawer.api.startEditing();
                // drawer.api.setSize(finialRatio*drawerFunction.imageSize.width, finialRatio*drawerFunction.imageSize.height);
                // drawer.api.setBackgroundImageFromUrl(imageUrl);
                parentElement.css({
                    width: finialRatio*drawerFunction.imageSize.width,
                    height: finialRatio*drawerFunction.imageSize.height
                })
                new Promise((resolve, reject) => {
                    drawer.api.startEditing();
                    resolve()
                }).then(data => {
                    drawer.api.setSize(finialRatio*drawerFunction.imageSize.width, finialRatio*drawerFunction.imageSize.height);
                    drawer.api.setBackgroundImageFromUrl(imageUrl);
                    parentElement.find('.editable-canvas-image').attr('src', imageUrl);
                });
            }
        }
    }

    return drawerFunction;
}());






const LCFunction = (function () {
    'use strict';
    let lc;
    let LCFunction = {
        imageSize: null,
        imageUrl: null,
        init: function () {
            let LCFunctionSection = $('.canvas-editor');
            if (LCFunctionSection.length > 0) {
                $.each(LCFunctionSection, function (index, val) {
                    let currentSection = $(this);
                    LCFunction.initPlugin(currentSection);
                    $(window).resize(function () {
                    });
                });
            }
        },
        initPlugin: function (parentElement) {
            $(window).resize(function () {
            });
        },
        initImage: function(parentElement, url){
            const img = new Image();
            img.onload = function() {
                LCFunction.imageSize = {
                    width: this.width,
                    height: this.height,
                };
            }
            img.src = url;

            
        },
        resetSize: function(parentElement, url){
            
        }
    }

    return LCFunction;
}());

window.onload = () => {
    fullHeight.init();

    // drawerFunction.init();
    // LCFunction.init();


};



$(document).ready(function () {

// 122
    const element = document.getElementById('section-master');
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (screenfull.isEnabled) {
            screenfull.request(element);
        }
    });
});
