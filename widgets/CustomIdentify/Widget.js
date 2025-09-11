define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    'dojo/_base/lang',
    'esri/config',
    'esri/InfoTemplate',
    'esri/dijit/Popup',
    'esri/dijit/PopupTemplate',
    'esri/layers/FeatureLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/tasks/GeometryService',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    '../../dynamic-modules/services/Zoom',
    'services/MessageService/toast/ToastMsg',
    'esri/layers/GraphicsLayer',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/parser',
    'esri/Color',
    'dojo/on',
    'dojo/date/locale',
    'dojo/request',
    'esri/dijit/InfoWindow',
    'services/Pointer',
    'dijit/Tooltip',
    'dojo/_base/connect',
    'dojo/topic',
    'services/LayerInfos',
    'dojo/text!./config.json',
    'dojo/domReady!'

], function (
    declare,
    _WidgetsInTemplateMixin,
    BaseWidget,
    lang,
    esriConfig,
    InfoTemplate,
    Popup,
    PopupTemplate,
    FeatureLayer,
    ArcGISTiledMapServiceLayer,
    SimpleFillSymbol,
    SimpleLineSymbol,
    GeometryService,
    Query,
    QueryTask,
    ZoomToFeature,
    ToastMsg,
    GraphicsLayer,
    domConstruct,
    domClass,
    parser,
    Color,
    on,
    locale,
    request,
    InfoWindow,
    Pointer,
    Tooltip,
    connect,
    topic,
    LayerInfos,
    config
) {
    // To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget, _WidgetsInTemplateMixin], {
        // Custom widget code goes here

        myplayer: null,
        nodePlayer: null,
        hoverBool: false,
        featureLayerGlobal: null,
        targetLayer: null,
        _zoomService: null,
        _toastService: null,
        _serviceUrl: '',
        _graphicsLayer: null,
        _searchResult: null,
        LayerInfo: null,
        isActive: false,
        isFirstStart: false,
        camList: [],
        v_file: '',
        v_image: '',
        v_title: '',
        v_id: '',
        divID: 0,
        template: null,
        outfields: ["Description",
            "FeedURL",
            "CameraCode",
            "ROADNUM",
            "OBJECTID",
            "Merhav"],
        _mapClickHandle: null,
        infoWindow: function infoWindow() {
            return new InfoWindow({}, domConstruct.create('div'));
        },
        popup: function popup() {
            return new Popup(
                {
                    fillSymbol: new SimpleFillSymbol(
                        SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2),
                        new Color([255, 255, 0, 0.25])
                    )
                },
                domConstruct.create('div')
            );
        },

        postCreate: function postCreate() {
            this.inherited(arguments);
            esriConfig.defaults.io.corsEnabledServers.push(geonetConfig.cameraWidget.videoUrlExt);
            console.log('CustomIdentify::postCreate');
        },

        startup: function startup() {
            this.inherited(arguments);

            this.stackPanel.onresize = () => {
                console.log("sdfsdfsdf")
            }

            this.widgetManager.loadWidget(geonetConfig.layerList).then(
                lang.hitch(this, widgetLayerList => {

                    // widgetLayerList.startup();

                    this.LayerInfo = new LayerInfos({ map: this.map });

                    this.targetLayer = this.LayerInfo.getLayer(geonetConfig.cameraWidget.layerId);

                    this.changeLayersVisibility();

                    domClass.add(this.popup().domNode, 'myTheme');
                    this.map.infoWindow.resize(750, 550);
                    this.template = new InfoTemplate();

                    if (!this._mapClickHandle) {
                        this._mapClickHandle = Pointer.register(
                            on.pausable(
                                this.map,
                                'click',
                                lang.hitch(this, function (e) {
                                    if (!detectmob()) {
                                        this.map.infoWindow.hide();
                                        this.getTextContent(e, true);
                                    }
                                })
                            )
                        );
                    }

                    /*execute a function when someone clicks in the document:*/
                    document.addEventListener("click", lang.hitch(this, function (e) {
                        this.closeAllLists(null, document.getElementById("searchInputValue"));
                    }));


                    this._graphicsLayer = new GraphicsLayer();

                    this._serviceUrl = geonetConfig.cameraWidget.serviceUrl;

                    let featureLayer = null;

                    const layers = this.map._layers;
                    const layersArr = Object.keys(layers).map(function (srvc) {
                        return layers[srvc];
                    });

                    this.queryTaskService(this._serviceUrl, true, this.outfields, "1=1").then(eventData => {
                        this.camList = eventData;
                    });

                    var srvceurl = this._serviceUrl;
                    layersArr.forEach(function (srvc) {
                        if (srvc.url != null) {
                            if (srvc.url.toLowerCase() === srvceurl.toLowerCase()) featureLayer = srvc;
                        }
                    });

                    if (featureLayer == null) {
                        featureLayer = new FeatureLayer(this._serviceUrl);
                        this.map.addLayers(featureLayer);
                    }

                    featureLayer.setInfoTemplate(this.template);
                    this.featureLayerGlobal = featureLayer;
                
                    this.addMouseMove(this.featureLayerGlobal);
                    this.addMouseOut(this.featureLayerGlobal);

                    if (geonetConfig.cameraWidget.isFirstTime) this.featureLayerGlobal.enableMouseEvents();

                    if (detectmob()) {
                        this.addMobileTap(featureLayer);
                    }

                    //if (!this.maplayer) this.myplayer = this.createPlayer();
                }))



        },


        onClose: function onClose() {
            if (this.map.getLayer("_markerPoint")) this.map.getLayer("_markerPoint").clear();

            this.closeAllLists(null, document.getElementById("searchInputValue"));
            Pointer.unRegister(this._mapClickHandle);
            this.featureLayerGlobal.disableMouseEvents();
            this.changeLayersVisibility();
            geonetConfig.cameraWidget.isFirstTime = true;
        },

        onOpen() {
            this.AddGoogleAnalyticsEvent();
        },

        AddGoogleAnalyticsEvent: function () {
            let params = {
                'widget_name': 'Traffic Cameras',
            };

            function gtag() { dataLayer.push(arguments); }

            gtag('js', new Date());
            gtag('config', measurement_id);
            gtag('event', 'open_widget', params);
        },

        // searchCamera(e){
        // var result = this.camList.features.find(x => x.attributes.Road_search_Merge.includes(e.target.value))
        // console.log(result);
        // },

        closeAllLists(elmnt, inp) {
            /*close all autocompleteCustom lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocompleteCustom-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        },

        onKeyUp(e) {
            try {

                if (e.target.value == "" || e.target.value == " ") {
                    var searchIcon = document.querySelector('.searchIcon');

                    if (searchIcon != null) document.querySelector('.searchIcon').src = 'widgets/CustomIdentify/images/searchempty.png';
                    this.closeAllLists(null, document.getElementById("searchInputValue"));
                    return;
                }
                var searchIcon = document.querySelector('.searchIcon');
                if (searchIcon != null) document.querySelector('.searchIcon').src = 'widgets/CustomIdentify/images/searchfilled.png';


                var searchInputValue = document.getElementById("searchInputValue");
                this.closeAllLists(null, document.getElementById("searchInputValue"));

                var a = document.createElement("DIV");
                a.setAttribute("id", this.id + "autocompleteCustom-list");
                a.setAttribute("class", "autocompleteCustom-items");
                /*append the DIV element as a child of the autocompleteCustom container:*/

                var esriPopupMobileTitle = document.querySelector('.autocompleteCustom');
                esriPopupMobileTitle.appendChild(a);

                if (searchInputValue != null) var val = searchInputValue.value;

                for (i = 0; i < this.camList.features.length; i++) {
                    /*check if the item starts with the same letters as the text field value:*/
                    if (this.camList.features[i].attributes.Description != null)
                        if (this.camList.features[i].attributes.Description.includes(e.target.value)) {
                            /*create a DIV element for each matching element:*/
                            var b = document.createElement("DIV");
                            /*make the matching letters bold:*/

                            var optionVal = this.camList.features[i].attributes.Description;
                            var res = optionVal.replace(val, "<strong>" + val + "</strong>");
                            b.innerHTML += res;
                            //b.innerHTML = "<strong>" + this.camList.features[i].attributes.Road_search_Merge.substr(0, val.length) + "</strong>";
                            //b.innerHTML += this.camList.features[i].attributes.Road_search_Merge.substr(val.length);
                            /*insert a input field that will hold the current array item's value:*/
                            b.innerHTML += "<input type='hidden' value='" + this.camList.features[i].attributes.Description + "'>";
                            /*execute a function when someone clicks on the item value (DIV element):*/

                            var isHovered = false;

                            function keyDown(e) {
                                if (!isHovered) return;
                                var key = e.keyCode;
                                if (key === 13) {
                                    this.closeAllLists(null, document.getElementById("searchInputValue"));
                                    b.click();
                                }
                            }

                            b.addEventListener('keyup', function (e) {
                                if (!isHovered) return;
                                var key = e.keyCode;
                                console.log(key);

                            });
                            b.addEventListener('mouseenter', function () {
                                isHovered = true;
                            });
                            b.addEventListener('mouseleave', function () {
                                isHovered = false;
                            });

                            b.addEventListener("click", lang.hitch(this, function (e) {


                                for (var i = 0; i < this.camList.features.length; i++) {
                                    if (this.camList.features[i].attributes.Description == e.target.getElementsByTagName("input")[0].value) {

                                        var result = this.camList.features[i];


                                        if (!this._zoomService) {
                                            this._zoomService = new ZoomToFeature();
                                        }
                                        if (this.map.getLayer("_markerPoint")) this.map.getLayer("_markerPoint").clear();


                                        var resObject = {
                                            geometry: result.geometry,
                                            geometryType: "esriGeometryPoint"
                                        };

                                        var queryFromUrl = 'OBJECTID = ' + result.attributes.OBJECTID;


                                        const widgetObject = { widget: 'CustomIdentify', isComplete: true };
                                        this._zoomService._zoomToExtentByFeatures(
                                            this.map,
                                            resObject,
                                            this.targetLayer,
                                            queryFromUrl,
                                            widgetObject
                                        );

                                        var resObj = {};
                                        resObj.graphic = result;
                                        this.getTextContent(resObj, false);
                                        searchInputValue.value = "";
                                        var searchIcon = document.querySelector('.searchIcon');
                                        if (searchIcon != null) document.querySelector('.searchIcon').src = 'widgets/CustomIdentify/images/searchempty.png';

                                        break;
                                    }
                                }

                            }));
                            a.appendChild(b);
                        }
                }

            }
            catch (e) {
                console.log(e);
            }

        },

        errorMessage(title, error, type, autoClose) {
            if (!this._toastService) this._toastService = new ToastMsg();
            this._toastService.msgToast(title, error, type, autoClose);
        },

        submitSearch(e) {
            try {
                var searchIcon = document.querySelector('.searchIcon');
                if (searchIcon != null) document.querySelector('.searchIcon').src = 'widgets/CustomIdentify/images/searchempty.png';

                if (this.map.getLayer("_markerPoint")) this.map.getLayer("_markerPoint").clear();

                var searchVal = "";

                var searchInputValue = document.getElementById("searchInputValue");
                if (searchInputValue != null) searchVal = searchInputValue.value;

                if (searchVal === "") {
                    this.errorMessage("שגיאה", "אנא הכנס ערך לחיפוש", 1, true);
                    searchInputValue.value = "";
                    return;
                }

                //var result = this.camList.features.find(x => x.attributes.Road_search_Merge.includes(searchVal));
                var result = null;

                for (var i = 0; i < this.camList.features.length; i++) {
                    if (this.camList.features[i].attributes.Description != null)
                        if (this.camList.features[i].attributes.Description.includes(searchVal)) {
                            result = this.camList.features[i];
                            break;
                        }
                }

                if (result == null) {
                    this.errorMessage("שגיאה", "לא נמצאה מצלמה התואמת ערך זה", 1, true);
                    searchInputValue.value = "";
                    return;
                }

                if (!this._zoomService) {
                    this._zoomService = new ZoomToFeature();
                }

                var resObject = {
                    geometry: result.geometry,
                    geometryType: "esriGeometryPoint"
                };

                var queryFromUrl = 'OBJECTID = ' + result.attributes.OBJECTID;


                const widgetObject = { widget: 'CustomIdentify', isComplete: true };
                this._zoomService._zoomToExtentByFeatures(
                    this.map,
                    resObject,
                    this.targetLayer,
                    queryFromUrl,
                    widgetObject
                );

                var resObj = {};
                resObj.graphic = result;
                this.getTextContent(resObj, false);
                searchInputValue.value = "";
            }
            catch (e) {
                console.log(e);
            }
        },



        onClosePopup() {
            dojo.connect(
                this.map.infoWindow,
                'onHide',
                dojo.hitch(this, function () {
                    this.hoverBool = false;
                })
            );
        },

        addMobileTap(fl) {
            this.featureLayerGlobal.on(
                'click',
                dojo.hitch(this, function (evt) {
                    let isMinimizePanel = document.querySelectorAll('#main-page')[0].classList[0];
                    if (isMinimizePanel!=='alert-is-shown') {
                        this.stackPanel.maximize();
                    }
               
                    const detailsDiv = document.querySelector('.detailsDiv');

                    if (detailsDiv != null) {
                        detailsDiv.remove();
                    }

                    this.getTextContent(evt, true);

                    //this.map.infoWindow.domNode.appendChild(this.getTextContent(evt, true));
                    //const esriPopupMobileTitle = document.querySelector('.esriPopupMobile .sizer .titlePane');
                    //if (esriPopupMobileTitle != null) {
                    //    esriPopupMobileTitle.background = 'white!important';
                    //    const closeButton = document.querySelector(
                    //        '.esriPopupMobile .sizer .titlePane .titleButton.close'
                    //    );

                    //    for (let i = 0; i < esriPopupMobileTitle.childElementCount; i++) {
                    //        if (esriPopupMobileTitle.childNodes[i] !== closeButton) {
                    //            esriPopupMobileTitle.childNodes[i].remove();
                    //        }
                    //    }
                    //}
                })
            );
        },

        addMouseOut(fl) {
            this.featureLayerGlobal.on(
                'mouse-out',
                dojo.hitch(this, function (evt) {
                    this.map.infoWindow.hide();
                })
            );
        },

        addMouseMove(fl) {
            this.featureLayerGlobal.on(
                'mouse-move',
                dojo.hitch(this, function (evt) {

                    let camTitle = "";
                    for (var i = 0; i < this.camList.features.length; i++) {
                        if (evt.graphic.attributes.OBJECTID == this.camList.features[i].attributes.OBJECTID) {
                            camTitle = this.camList.features[i].attributes.Description;
                            break;
                        }
                    }
                    this.map.infoWindow.setTitle(`<b>${camTitle}</b>`);
                    this.map.infoWindow.setContent(`<b>${camTitle}</b>`);
                    this.map.infoWindow.show(
                        evt.screenPoint,
                        this.map.getInfoWindowAnchor(evt.screenPoint)
                    );
                    this.map.infoWindow.resize(100, 80);
                    const popupElement = document.querySelector('.esriPopup .contentPane');
                    if (popupElement != null) {
                        popupElement.style.textAlign = 'center';
                        popupElement.style.backgroundColor = 'black';
                        popupElement.style.color = 'white';
                        popupElement.style.padding = '16px 26px 18px 26px';
                    }
                    const actionPaneElement = document.querySelector('.esriPopup .actionsPane');
                    if (actionPaneElement != null) actionPaneElement.style.backgroundColor = 'black';
                    const popupPointerElement = document.querySelector(
                        '.esriPopup .pointer, .esriPopup .outerPointer'
                    );
                    if (popupPointerElement != null) popupPointerElement.style.backgroundColor = 'black';
                    const popupLeftPointerElement = document.querySelector('.esriPopup .outerPointer.left');
                    if (popupLeftPointerElement != null) popupLeftPointerElement.style.backgroundColor = 'black';
                    const popupCloseButton = document.querySelector('.esriPopup .titlePane');
                    if (popupCloseButton != null) popupCloseButton.style.display = 'none';
                })

            );

        },

        queryTaskService(url, returnGeometry, outfields, _query, countOnly, objectIds) {
            return new Promise((resolve, reject) => {
                const query = new Query();
                const queryTask = new QueryTask(url);
                query.returnGeometry = returnGeometry;
                query.outFields = outfields;
                if (_query) query.where = _query;
                else resolve(null);
                if (objectIds) query.objectIds = objectIds;

                if (countOnly) query.returnCountOnly = countOnly;
                // execute query
                queryTask.execute(query).then(result => {
                    if (result && result.features && result.features.length > 0) {
                        resolve(result);
                    } else if (result && result.features && result.features.length === 0) {
                        resolve(0)
                    }
                });
            });
        },

        getTextContent(graphic, boolDraw) {
            try {

                if (this.map.getLayer("_markerPoint") && boolDraw) this.map.getLayer("_markerPoint").clear();

                var searchInputValue = document.getElementById("searchInputValue");
                if (searchInputValue != null) searchInputValue.value = "";

                var searchIcon = document.querySelector('.searchIcon');
                if (searchIcon != null) document.querySelector('.searchIcon').src = 'widgets/CustomIdentify/images/searchempty.png';



                this.closeAllLists(null, document.getElementById("searchInputValue"));

                if (!graphic.graphic || !graphic.graphic.attributes) return;

                if (!this._zoomService) this._zoomService = new ZoomToFeature();



                var playerNode = document.getElementById("cameraWrapper");
                if (playerNode != null) playerNode.innerHTML = "";

                let camObject;
                for (var i = 0; i < this.camList.features.length; i++) {
                    if (graphic.graphic.attributes.OBJECTID == this.camList.features[i].attributes.OBJECTID) {
                        camObject = this.camList.features[i].attributes;
                        if (boolDraw) this._zoomService.drawSpecialSelectionPoint(this.map, this.camList.features[i].geometry, null, true);
                        break;
                    }
                }
                //this.queryTaskService(graphic.graphic._graphicsLayer.url, false, this.outfields, "OBJECTID = " + graphic.graphic.attributes.OBJECTID).then(evt => { }); 	 

                if (!this.myplayer) {
                    this.myplayer = this.createPlayer();
                }


                this.hoverBool = true;
                this.map.infoWindow.hide();


                const popupCloseButton = document.querySelector('.esriPopup .titlePane');
                if (popupCloseButton != null) popupCloseButton.style.display = 'block';

                var popupElement = document.querySelector('.esriPopup .contentPane');
                if (popupElement != null) {
                    popupElement.style.backgroundColor = 'white';
                    popupElement.style.color = 'black';
                }
                const actionPaneElement = document.querySelector('.esriPopup .actionsPane');
                if (actionPaneElement != null) actionPaneElement.style.backgroundColor = 'white';

                const popupPointerElement = document.querySelector(
                    '.esriPopup .pointer, .esriPopup .outerPointer'
                );
                if (popupPointerElement != null) popupPointerElement.style.backgroundColor = 'white';

                const popupLeftPointerElement = document.querySelector('.esriPopup .outerPointer.left');
                if (popupLeftPointerElement != null)
                    popupLeftPointerElement.style.backgroundColor = 'white';

                this.v_id = 0;
                this.v_file = '';
                this.v_title = '';

                if (
                    camObject.CameraCode === 0 ||
                    camObject.FeedURL === '' ||
                    camObject.FeedURL === ' ' ||
                    camObject.FeedURL == null
                ) {
                    var popupElement = document.getElementById(`iRoadsPlayer${this.divID}`);
                    if (popupElement != null) {
                        popupElement.style.display = 'none';
                    }

                    var detailsDiv = document.querySelector('.detailsDiv');

                    if (detailsDiv != null) {
                        detailsDiv.style.float = 'none';
                        detailsDiv.innerHTML = 'מצלמה לא פעילה';
                    }

                    if (this.map.infoWindow) {
                        this.map.infoWindow.resize(200, 550);
                    }

                    return "<div style='text-align: center;'>מצלמה לא פעילה</div>";
                }

                this.v_id = camObject.CameraCode;
                this.v_title = camObject.Description;

                console.log(graphic);

                const wrapper = document.createElement('div');
                const details = document.createElement('div');
                details.className = 'detailsDiv';
                details.style.float = 'right';
                //details.style.fontSize = '14px';

                if (camObject.Merhav == null) camObject.Merhav = "";
                if (camObject.ROADNUM == null) camObject.ROADNUM = "";
                if (camObject.Description == null) camObject.Description = "";


                details.innerHTML =
                    `<br/><div class='camDeatilsDiv'><div class='detailLable'>אזור</div><div class='detailVal'>${camObject.Merhav}</div></div>
		<div class='camDeatilsDivRoad'><div class='detailLable'>מספר כביש</div><div class='detailValRoad'>${camObject.ROADNUM}</div></div>
		<div class='camDeatilsDiv'><div class='detailLable'>שם מצלמה</div><div class='detailVal'>${camObject.Description}</div></div>
    <img src="${camObject.FeedURL.replace("playlist.m3u8", "image.gif")}" alt="player" width="10" height="10">
    `;

                setTimeout(() => {
                    wrapper.appendChild(this.myplayer.getContainer());
                    wrapper.appendChild(details);

                    this.myplayer.setup({
                        file: camObject.FeedURL,
                        title: this.v_title,
                        autostart: true,
                        displaytitle: true,
                        preload: 'none',
                        width: '80%'
                    });
                }, 100);


                this.myplayer.on(
                    'error',
                    dojo.hitch(this, function (e) {
                        console.log(e);

                        const popupElement = document.getElementById(`iRoadsPlayer${this.divID}`);
                        if (popupElement != null) {
                            popupElement.style.display = 'none';
                        }

                        const detailsDiv = document.querySelector('.detailsDiv');
                        if (detailsDiv != null) {
                            detailsDiv.style.float = 'none';

                            detailsDiv.innerHTML = 'מצלמה לא פעילה';
                        }

                        if (this.map.infoWindow) {
                            this.map.infoWindow.resize(200, 550);
                        }

                        return "<div style='text-align: center;'>מצלמה לא פעילה</div>";
                    })
                );
                var playerNode = document.getElementById("cameraWrapper");
                if (playerNode != null && playerNode.children.length > 0) playerNode.removeChild(playerNode.firstChild);



                playerNode.appendChild(wrapper);

            } catch (e) {
                console.log(e);

                var popupElement = document.getElementById(`iRoadsPlayer${this.divID}`);

                if (popupElement != null) {
                    popupElement.style.display = 'none';
                }

                var detailsDiv = document.querySelector('.detailsDiv');

                if (detailsDiv != null) {
                    detailsDiv.style.float = 'none';
                    detailsDiv.innerHTML = 'מצלמה לא פעילה';
                }

                if (this.map.infoWindow) {
                    this.map.infoWindow.resize(200, 550);
                    this.map.infoWindow.clearFeatures();
                    this.map.infoWindow.hide();
                }
                // //this.popup().hide();

                return "<div style='text-align: center;'>מצלמה לא פעילה</div>";
            }
            //});
        },

        removePlayer: function removePlayer() {
            jwplayer('iRoadsPlayer').remove();
        },

        createPlayer: function createPlayer() {
            const mapDiv = document.getElementById('map');
            const popupElementDiv = document.getElementById(`iRoadsPlayer${this.divID}`);
            let player;
            if (popupElementDiv != null) {
                popupElementDiv.parentNode.removeChild(popupElementDiv);
            }

            this.divID++;
            this.nodePlayer = document.createElement('div');
            this.nodePlayer.id = `iRoadsPlayer${this.divID}`;

            mapDiv.appendChild(this.nodePlayer);
            try {
                player = jwplayer(this.nodePlayer.id).setup({
                    title: this.v_title,
                    autostart: true,
                    displaytitle: true,
                    preload: 'none',
                    width: '80%'
                });
            } catch (err) {
                console.log(err);
            }

            player.on(
                'error',
                dojo.hitch(this, function (e) {
                    console.log(e);

                    const popupElement = document.getElementById(`iRoadsPlayer${this.divID}`);
                    if (popupElement != null) {
                        popupElement.style.display = 'none';
                    }

                    const detailsDiv = document.querySelector('.detailsDiv');

                    if (detailsDiv != null) {
                        detailsDiv.style.float = 'none';
                        detailsDiv.innerHTML = 'מצלמה לא פעילה';
                    }

                    if (this.map.infoWindow) {
                        this.map.infoWindow.resize(200, 550);
                        this.map.infoWindow.clearFeatures();
                        this.map.infoWindow.hide();
                    }
                    // //this.popup().hide();

                    return "<div style='text-align: center;'>מצלמה לא פעילה</div>";
                })
            );

            return player;
        },
        changeLayersVisibility: function changeLayersVisibility() {  //change function name 
            if (this.isActive) {
                this.isActive = false;
                this.deactivateSelect();
                return;
            }
            if (this.targetLayer) {
                this.isActive = true;
                try {
                    this.targetLayer.setVisibility(true);
                } catch (e) {
                    console.warn(e.message);
                }
            }
        },

        deactivateSelect() {
            if (this.targetLayer) {
                try {
                    this.targetLayer.setVisibility(false);
                } catch (e) {
                    console.warn(e.message);
                }
            }
        }
    });
});
// # sourceMappingURL=Widget.js.map
