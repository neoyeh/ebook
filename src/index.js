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
        brushOpacity= "1",
        canvasSize= {
            width: 0,
            height: 0
        },
        activePage= null,
        isReadMode= true,
        isEraserMode= false;
    let defaultData= {
        "name": "name",
        "totalPage": 80,
        "favoritePage": [0,1],
        "pageDetail": {},
        "pageLinkList": [
            "./img/page01.jpg",
            "./img/page02.jpg",
            "./img/page03.jpg",
            "./img/page04.jpg",
            "./img/page05.jpg",
            "./img/page06.jpg",
            "./img/page07.jpg",
            "./img/page08.jpg",
            "./img/page09.jpg",
            "./img/page10.jpg"
        ],
        "pageVideoList": {
            "6":[
                {
                    "title": "第7頁 病歷1 X-ray",
                    "vid": "zXj5XKw4F0A"
                },
                {
                    "title": "第7頁 病歷2 X-ray",
                    "vid": "fCxJStlRtvU"
                }

            ]
        },
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
                isDrawingMode: true
            });
            //init page
            fabricFunction.initPage(( (activePage)?activePage:'0'), parentElement );
            //init favorite
            fabricFunction.initFavorite();
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
        initFavorite: () =>{
            let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
            let html= '';
            console.log(data)
            data.favoritePage.map((item, i)=>{
                html+=`
                <div class="catalog-item" data-page="${item}">
                    第 ${item+1}頁
                    <div class="btn-remove--favorite">刪除書籤</div>
                </div>
                `;
            });
            $('.popup-modal-section--favorite').find('.catalog-content').html(html);
        },
        initPage: (page, parentElement) =>{
            card.clear();
            activePage= page;
            let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
            console.log('initPage');
            if(data.pageVideoList[page]){
                let html= '';
                for(let i=0; i<data.pageVideoList[page].length; i++){
                    console.log(data.pageVideoList[page][i])
                    html+=`
                        <div class="list-item play-modal-video-btn" data-vid="${data.pageVideoList[page][i].vid}" data-vtype="youtube">${data.pageVideoList[page][i].title}</div>
                    `;
                }
                $('.video-list').show();
                $('.video-list .list-content').html(html);
            }else{
                $('.video-list').hide();
            };
            card.setViewportTransform([1,0,0,1,0,0]); 
            $('#page').text(Number(page)+1)
            fabricFunction.initImage(parentElement, data.pageLinkList[page], true, data, page);
            
        },
        initImage: (parentElement, url, isload, data, page) => {
            const img = new Image();
            img.onload = function() {
                // load data
                console.log(data)
                fabricFunction.imageUrl = url;
                console.log(this)
                console.log(this.width)
                console.log(this.height)
                fabricFunction.imageSize = {
                    width: this.width,
                    height: this.height,
                };
                if(data.pageDetail[`${page}`]){
                    card.loadFromJSON(data.pageDetail[`${page}`].objects, card.renderAll.bind(card));
                    fabricFunction.resetSize(parentElement, url, isload, data, page);
                }else{
                    fabricFunction.resetSize(parentElement, url, false, data, page);
                };
                if(isReadMode){
                    fabricFunction.toReadmode();
                };
            }
            img.src = url;
        },
        resetSize: (parentElement, url, isload, data, page) => {
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
            canvasSize.width= finialRatio*fabricFunction.imageSize.width;
            canvasSize.height= finialRatio*fabricFunction.imageSize.height;

            let scaleMultiplier= (!isload)?finialRatio*fabricFunction.imageSize.width / fabricFunction.width:
            finialRatio*fabricFunction.imageSize.width / data.pageDetail[`${page}`].windowScreen.width;

            let objects = card.getObjects();
            // console.log(objects)
            for (var i in objects) {
                objects[i].scaleX = objects[i].scaleX * scaleMultiplier;
                objects[i].scaleY = objects[i].scaleY * scaleMultiplier;
                objects[i].left = objects[i].left * scaleMultiplier;
                objects[i].top = objects[i].top * scaleMultiplier;
                objects[i].setCoords();
            };
            fabricFunction.width = finialRatio*fabricFunction.imageSize.width;
        },
        initMasterBtn: (parentElement) => {
            // favorite
            document.getElementById('btn-favorite').addEventListener('click', () => {
                $('.popup-modal-section--favorite').toggleClass('active');
            });
            // favorite remove
            document.addEventListener('click',function(e){
                if(e.target && e.target.classList.contains('btn-remove--favorite')){
                    if( confirm('確定要刪除書籤?') ){
                        let page= $(e.target).closest('.catalog-item').data('page');
                        let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
                        console.log(data.favoritePage)
                        data.favoritePage= data.favoritePage.filter(item => {
                            console.log('===')
                            console.log(page)
                            console.log(item)
                            return item !== page;
                        });
                        console.log(data)
                        localStorage.setItem('eBookData', JSON.stringify(data));
                        fabricFunction.initFavorite();
                    }
                }
            });
            // add favorite
            document.getElementsByClassName('btn-add--favorite')[0].addEventListener('click', () => {
                let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
                const {backgroundImage, ...saveData} = card.toJSON();
                if(data.favoritePage.length>=10){
                    alert('已超過書籤最大數量10');
                }else if(data.favoritePage.indexOf(Number(activePage))>=0){
                    alert('本頁已加入書籤');
                }else{
                    data.favoritePage.push(Number(activePage));
                    data.favoritePage.sort()
                    localStorage.setItem('eBookData', JSON.stringify(data));
                    fabricFunction.initFavorite();
                    console.log(data)
                };
            });
            // close favorite
            document.getElementsByClassName('popup-modal-section--favorite')[0].getElementsByClassName('btn-card-close')[0].addEventListener('click', () => {
                $('.popup-modal-section--favorite').removeClass('active');
            });
            // catalog
            document.getElementById('btn-catalog').addEventListener('click', () => {
                $('.popup-modal-section--catalog').toggleClass('active');
            });
            // catalog click
            document.addEventListener('click',function(e){
                if(e.target && e.target.classList.contains('catalog-item')){
                    let page= (e.target.dataset.page).toString();
                    fabricFunction.initPage(page, parentElement );
                    $('.popup-modal-section--catalog').removeClass('active');
                }
            });
            // close catalog
            document.getElementsByClassName('popup-modal-section--catalog')[0].getElementsByClassName('btn-card-close')[0].addEventListener('click', () => {
                $('.popup-modal-section--catalog').removeClass('active');
            });
            // read
            document.getElementById('btn-read').addEventListener('click', () => {
                fabricFunction.toReadmode();
            });
            // save
            document.getElementById('btn-save').addEventListener('click', () => {
                let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
                const {backgroundImage, ...saveData} = card.toJSON();
                console.log(data)
                data.pageDetail[`${activePage}`]= {};
                data.pageDetail[`${activePage}`]['objects']= saveData;
                data.pageDetail[`${activePage}`]['windowScreen']= canvasSize;
                // console.log(data)
                localStorage.setItem('eBookData', JSON.stringify(data));
            });
            // pencel
            document.getElementById('btn-pencil').addEventListener('click', () => {
                $('.popup-modal-section--pencil').toggleClass('active');
            });
            // close pencel
            document.getElementsByClassName('popup-modal-section--pencil')[0].getElementsByClassName('btn-card-close')[0].addEventListener('click', () => {
                if(isEraserMode===false){
                    fabricFunction.toDrawMode();
                }else{
                    $('#btn-pencil').addClass('active').siblings('.active').removeClass('active');
                };
                $('.popup-modal-section--pencil').removeClass('active');
            });
            // full screen
            document.getElementById('btn-fullscreen').addEventListener('click', () => {
                let btnFullScreen= document.getElementById('section-master');
                if (screenfull.isEnabled) {
                    screenfull.toggle(btnFullScreen);
                }
            });
            // resize
            document.getElementById('btn-resize').addEventListener('click', () => {
                card.setViewportTransform([1,0,0,1,0,0]); 
            });
            // info
            document.getElementById('btn-info').addEventListener('click', () => {
                $('.popup-modal-section--info').toggleClass('active');
            });
            // close info
            document.getElementsByClassName('popup-modal-section--info')[0].getElementsByClassName('btn-card-close')[0].addEventListener('click', () => {
                $('.popup-modal-section--info').removeClass('active');
            });
            // clear
            document.getElementById('btn-clear').addEventListener('click', () => {
                if(confirm('確定要清除本頁筆記?')){
                    card.clear();
                    fabricFunction.resetSize(parentElement);
                }
            });
            // scale
            card.on('mouse:wheel', function(opt) { 
                opt.e.preventDefault(); 
                opt.e.stopPropagation(); 
                console.log(opt)
                let delta = opt.e.deltaY; 
                let zoom = card.getZoom(); 
                zoom *= 0.999 ** delta; 
                if (zoom > 2) zoom = 2 ; 
                if (zoom < 0.8) zoom = 0.8; 
                console.log(opt.e.offsetX)
                card.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

                // card.setZoom(zoom); 
            });

            //video
            const youtubeVideo = {
                init(vid) {
                    let playerIgnored;

                    function onPlayerReady(event) {
                        event.target.playVideo();
                        modalVideo.showModal();
                        modalVideo.setupCloseModalBtn();
                    }
                    function onPlayerStateChange(event) {
                        if (event.data === 0) {
                            modalVideo.hideModal();
                        }
                    }
                    function onYouTubePlayerAPIReady() {
                        playerIgnored = new YT.Player('player', {
                            height: '390',
                            width: '640',
                            videoId: vid,
                            events: {
                            onReady: onPlayerReady,
                            onStateChange: onPlayerStateChange,
                            },
                        });
                    }
                    onYouTubePlayerAPIReady();
                },
            };
            const modalVideo = {
                init() {
                  const modalVideoBlock = document.querySelectorAll('.play-modal-video-btn');
                  if (modalVideoBlock) {
                    $(document).on('click','.play-modal-video-btn', (e)=>{
                      e.preventDefault();
                      const videoType = $(e.currentTarget).data('vtype');
                      const videoId = $(e.currentTarget).data('vid');
                      /* Act on the event */
                      if (videoType === 'youtube') {
                        // Youtube
                        youtubeVideo.init(videoId);
                      } else {
                        // modalVideo.showModal();
                        // modalVideo.setupCloseModalBtn();
                      }
                    });
                  }
                },
                setupCloseModalBtn() {
                  const closeBtn = document.querySelector('.modal-overlap-container .btn-close');
                  closeBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    modalVideo.hideModal();
                  });
                },
                showModal() {
                  const modalContainer = document.querySelector('.modal-overlap-container');
                  const htmlTag = document.getElementsByTagName('html')[0];
                  const bodyTag = document.body;
                  modalContainer.classList.add('show');
                  htmlTag.classList.add('fixed');
                  bodyTag.classList.add('fixed');
                },
                hideModal() {
                  const modalContainer = document.querySelector('.modal-overlap-container');
                  const htmlTag = document.getElementsByTagName('html')[0];
                  const bodyTag = document.body;
                  modalContainer.classList.remove('show');
                  htmlTag.classList.remove('fixed');
                  bodyTag.classList.remove('fixed');
              
                  const playArea = document.querySelector('.modal-overlap-container .align-center');
                  playArea.innerHTML = '<div id=\'player\'></div>';
                },
            };
            modalVideo.init();
            //video list
            $('.video-list .list-title').click(function(){
                const open = $(this).find('span').data('open');
                const close = $(this).find('span').data('close');
                if($(this).siblings('.list-content').hasClass('active')){
                    $(this).find('span').text(open);
                }else{
                    $(this).find('span').text(close);
                };
                $(this).siblings('.list-content').toggleClass('active');
            });



            card.on('mouse:down', function(opt) {
                let evt = opt.e;
                if (evt.altKey === true) {
                  this.isDragging = true;
                  this.selection = false;
                  this.lastPosX = evt.clientX;
                  this.lastPosY = evt.clientY;
                }
            });
            card.on('mouse:move', function(opt) {
                if (this.isDragging) {
                    let e = opt.e;
                    let vpt = this.viewportTransform;
                    vpt[4] += e.clientX - this.lastPosX;
                    vpt[5] += e.clientY - this.lastPosY;
                    this.requestRenderAll();
                    this.lastPosX = e.clientX;
                    this.lastPosY = e.clientY;
                }
            });
            card.on('mouse:up', function(opt) {
                // on mouse up we want to recalculate new interaction
                // for all objects, so we call setViewportTransform
                this.setViewportTransform(this.viewportTransform);
                this.isDragging = false;
                this.selection = true;
            });
            
            function funcPrev(){
                if( Number(activePage)-1 >= 0 ){
                    fabricFunction.initPage(  (Number(activePage)-1).toString(), parentElement );
                }else{
                    console.log('no prev')
                };
            };
            function funcNext(){
                let data = JSON.parse(localStorage.getItem('eBookData'))||defaultData;
                let total = data.pageLinkList.length;
                if( Number(activePage)+1 < total ){
                    fabricFunction.initPage( (Number(activePage)+1).toString(), parentElement );
                }else{
                    console.log('no next');
                };
            };
            //prev page
            document.getElementById('prev-page').addEventListener('click', () => {
                funcPrev();
            });
            //next page
            document.getElementById('next-page').addEventListener('click', () => {
                funcNext();
            });
            window.addEventListener("keydown", function(e) {
                switch (e.keyCode) {
                case 37:
                    funcPrev();
                    break;
                case 39:
                    funcNext();
                    break;
                default:
                }
            }, true);

            
        },
        initPencelBox: (parentElement) => {
            //透明度
            const vRadios = document.getElementsByName('v-opacity');
            Array.prototype.forEach.call(vRadios, (radio) => {
                radio.addEventListener('change', changeHandler);
            });
            function changeHandler(event) {
                brushOpacity= this.value;
                fabricFunction.setBrush();
            }
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
            //橡皮擦
            const vEraser = document.getElementById('v-eraser');
            vEraser.addEventListener('change', (e) => {
                if(e.target.checked){
                    fabricFunction.toEraserMode();
                }else{
                    isEraserMode= false;
                };
            });
        },
        setBrush: () => {
            card.freeDrawingBrush.width = brushWidth;
            card.freeDrawingBrush.color = `rgba(${brushColor}, ${brushOpacity})`
        },
        toReadmode: () => {
            console.log('toReadmode')
            isReadMode= true;
            isEraserMode= false;
            card.isDrawingMode= false;
            card.forEachObject(function(object){ 
                object.selectable = false; 
                object.hoverCursor= "normal";
                object.off('mousedown');
            });
            card.off('selection:created');
            card.discardActiveObject().renderAll();
            $('#btn-read').addClass('active').siblings('.active').removeClass('active');
        },
        toDrawMode: () => {
            console.log('toDrawMode')
            isReadMode= false;
            card.isDrawingMode= true;
            card.forEachObject(function(object){ 
                object.selectable = false; 
                object.hoverCursor= "normal";
                object.off('mousedown');
            });
            card.off('selection:created');
            card.discardActiveObject().renderAll();
            $('#btn-pencil').addClass('active').siblings('.active').removeClass('active');
        },
        toEraserMode: () => {
            console.log('toEraserMode')
            isReadMode= true;
            isEraserMode= true;
            card.isDrawingMode= false;
            card.forEachObject(function(object){ 
                object.hasControls = false;
                object.selectable = true;
                object.hoverCursor= 'url("../lib/img/eraser.png") 5 10, auto';
                object.off('mousedown').on('mousedown', (options) => {
                    card.remove(options.target)
                    card.discardActiveObject().renderAll();
                });
            });
            card.on('selection:created', () => {
                card.discardActiveObject();
                card.requestRenderAll();
            });
        }
    }

    return fabricFunction;
}());

$(document).ready(function () {
    fullHeight.init();

    fabricFunction.init();
});
