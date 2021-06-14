// const { JSDOM } = require( "jsdom" );
// const { window } = new JSDOM( "" );
// const $ = require( "jquery" )( window );

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


const fabricFunction = (function () {
    'use strict';

    let card;
    let brushWidth= 10,
        brushColor= "255, 255, 0",
        brushOpacity= "0.8";
    let activePage= null;
    let defaultData= {
        "name": "name",
        "totalPage": 80,
        "favoritePage": [0,1,3],
        "pageDetail": {}
    };

    let fabricFunction = {
        imageSize: null,
        imageUrl: null,
        width: 0,
        init: function () {
            let fabricFunctionSection = $('.fabric-canvas');
            if (fabricFunctionSection.length > 0) {
                $.each(fabricFunctionSection, function (index, val) {
                    let currentSection = $(this);
                    fabricFunction.initPlugin(currentSection);
                    fabricFunction.initMasterBtn(currentSection);
                    fabricFunction.initPencelBox(currentSection);

                    $(window).resize(function () {
                    });
                });
            }
        },
        initPlugin: (parentElement) => {
            card = new fabric.Canvas('fabric-canvas',{
                isDrawingMode: false
            });
            //init page
            fabricFunction.initPage(( (activePage)?activePage:'0'), parentElement );
            //init brush
            fabricFunction.setBrush();
            // card.on('object:modified', (e) => {
            //     console.log(e.target) // e.target為當前編輯的Object
            //     // ...旋轉，縮放，移動等編輯圖層的操作都監聽到
            //     // 所以如果有撤銷/恢復的場景，這裡可以保存編輯狀態
            // });
            $(window).resize(function () {
                fabricFunction.resetSize(parentElement);
            });
        },
        initPage: (page, parentElement) =>{
            fabricFunction.initImage(parentElement, `./img/test-${page}.jpg`, true);
            activePage= page;
            let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
            console.log(data.pageDetail[`${page}`])
            var json = '{"objects":[{"type":"rect","originX":"center","originY":"center","left":300,"top":150,"width":150,"height":150,"fill":"#29477F","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":{"color":"rgba(94, 128, 191, 0.5)","blur":5,"offsetX":10,"offsetY":10},"visible":true,"clipTo":null,"rx":0,"ry":0,"x":0,"y":0},{"type":"circle","originX":"center","originY":"center","left":300,"top":400,"width":200,"height":200,"fill":"rgb(166,111,213)","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":{"color":"#5b238A","blur":20,"offsetX":-20,"offsetY":-10},"visible":true,"clipTo":null,"radius":100}],"background":""}'


            // load data
            card.loadFromJSON(data.pageDetail[`${page}`], card.renderAll.bind(card));
            
        },
        initImage: (parentElement, url, isload) => {
            const img = new Image();
            img.onload = function() {
                fabricFunction.imageUrl = url;
                fabricFunction.imageSize = {
                    width: this.width,
                    height: this.height,
                };
                fabricFunction.resetSize(parentElement, url, isload);
            }
            img.src = url;
        },
        resetSize: (parentElement, url, isload) => {
            const imageUrl = (url)?url:fabricFunction.imageUrl;
            const windowW = window.innerWidth;
            const windowH = window.innerHeight-80;
            const imageRatio = fabricFunction.imageSize.width/fabricFunction.imageSize.height;
            const windowRatio = windowW/windowH;
            const finialRatio = ( imageRatio > windowRatio )?windowW/fabricFunction.imageSize.width : windowH/fabricFunction.imageSize.height;
            // parentElement.css({
            //     width: finialRatio*fabricFunction.imageSize.width,
            //     height: finialRatio*fabricFunction.imageSize.height
            // });
            card.setWidth(finialRatio*fabricFunction.imageSize.width);
            card.setHeight(finialRatio*fabricFunction.imageSize.height);
            card.setBackgroundImage(imageUrl, card.renderAll.bind(card), {
                scaleX: finialRatio,
                scaleY: finialRatio,
            });
            if(!isload){
                var objects = card.getObjects();
                var scaleMultiplier = finialRatio*fabricFunction.imageSize.width / fabricFunction.width;
                // console.log(objects)
                for (var i in objects) {
                    objects[i].scaleX = objects[i].scaleX * scaleMultiplier;
                    objects[i].scaleY = objects[i].scaleY * scaleMultiplier;
                    objects[i].left = objects[i].left * scaleMultiplier;
                    objects[i].top = objects[i].top * scaleMultiplier;
                    objects[i].setCoords();
                };
            };
            fabricFunction.width = finialRatio*fabricFunction.imageSize.width;
            // function GetCanvasAtResoution(newWidth){
            //     if (canvas.width != newWidth) {
            //             var scaleMultiplier = newWidth / canvas.width;
            //             var objects = canvas.getObjects();
            //             for (var i in objects) {
            //                 objects[i].scaleX = objects[i].scaleX * scaleMultiplier;
            //                 objects[i].scaleY = objects[i].scaleY * scaleMultiplier;
            //                 objects[i].left = objects[i].left * scaleMultiplier;
            //                 objects[i].top = objects[i].top * scaleMultiplier;
            //                 objects[i].setCoords();
            //             }

            //             canvas.renderAll();
            //             canvas.calcOffset();
            //         }
            //     return canvas.toDataURL();
            // }
        },
        initMasterBtn: (parentElement) => {
            // save
            document.getElementById('btn-save').addEventListener('click', () => {
                
                let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
                const {backgroundImage, ...saveData} = card.toJSON();
                console.log(data)
                data.pageDetail[`${activePage}`]= saveData;
                // console.log(data)
                localStorage.setItem('eBookData', JSON.stringify(data));
            });
            // pencel
            document.getElementById('btn-pencil').addEventListener('click', () => {
                $('.popup-modal-section').toggleClass('active');
                var objects = card.getObjects();
                console.log(objects)
                
            });
            // close popup
            document.getElementById('btn-card-close').addEventListener('click', () => {
                fabricFunction.toDrawMode();
                $('.popup-modal-section').removeClass('active');
            });

            // full screen
            document.getElementById('btn-fullscreen').addEventListener('click', () => {
                let btnFullScreen= document.getElementById('section-master');
                if (screenfull.isEnabled) {
                    screenfull.toggle(btnFullScreen);
                }
            });
            // clear
            document.getElementById('btn-clear').addEventListener('click', () => {
                if(confirm('確定要清除"所有"筆記?')){
                    card.clear();
                    fabricFunction.resetSize(parentElement);
                }
            });
            //select mod
            document.getElementById('btn-select').addEventListener('click', () => {
                fabricFunction.toSelectMode();
            });

            //eraser
            document.getElementById('btn-eraser').addEventListener('click', () => {
                fabricFunction.setEraser();
            });
            window.addEventListener("keydown", function(e) {
                if(e.keyCode === 46){
                    fabricFunction.setEraser();
                };
            }, true);
            
        },
        initPencelBox: (parentElement) => {
            //透明度
            document.getElementById('v-opacity').addEventListener('input', (e) => {
                const val= e.target.value/10;
                e.target.nextElementSibling.getElementsByTagName('span')[0].textContent=val;
                brushOpacity= val;
                fabricFunction.setBrush();
            });
            //粗細
            document.getElementById('v-width').addEventListener('input', (e) => {
                const val= parseInt(e.target.value, 10);
                e.target.nextElementSibling.getElementsByTagName('span')[0].textContent=val;
                brushWidth= val;
                fabricFunction.setBrush();
            });
            //顏色
            [...document.getElementsByClassName('d-color')].forEach( (e) => {
                e.addEventListener('click', (e) => {
                    document.getElementsByClassName('d-color active')[0].classList.remove('active');
                    e.target.classList.add('active');
                    brushColor= e.target.dataset.color;
                    fabricFunction.setBrush();
                });
            });
        },
        setBrush: () => {
            card.freeDrawingBrush.width = brushWidth;
            card.freeDrawingBrush.color = `rgba(${brushColor}, ${brushOpacity})`
        },
        toDrawMode: () => {
            card.isDrawingMode= true;
            $('#btn-pencil').addClass('active').siblings('.active').removeClass('active');
        },
        leaveDrawMode: () => {
            card.isDrawingMode= false;
            $('#btn-pencil').removeClass('active');
        },
        toSelectMode: () => {
            card.isDrawingMode= false;
            $('#btn-select').addClass('active').siblings('.active').removeClass('active');
        },
        setEraser: () => {
            if(confirm('確定要刪除"選取"筆畫?')){
                card.getActiveObjects().forEach((obj) => {
                    card.remove(obj)
                });
                card.discardActiveObject().renderAll();
            };
        }
    }

    return fabricFunction;
}());

$(document).ready(function () {
    fullHeight.init();

    fabricFunction.init();
});
