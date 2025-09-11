geonetConfig file:

	    // cameras Widget
    cameraWidget: {
      layerId: '1236aac52fb14cca884d8d3eb6f21f2e',
	  videoUrlExt: 'https://5d8c50e7b358f.streamlock.net',
	  serviceUrl: 'https://geo-app-d.pwd.comp/arcgis/rest/services/BASKET/MapServer/168',
	  isFirstTime: false
    },

RelatedRecord:
      addDomNode: function(domNode) {
        setTimeout(lang.hitch(this, function() {
			if(domNode == null || this._getRefDomNode() == null) return;
          html.place(domNode, this._getRefDomNode(), "after");
        }), 1);
      },

index.html:
//before link above style

    <script src="https://content.jwplatform.com/libraries/7fGXQztf.js"></script>
