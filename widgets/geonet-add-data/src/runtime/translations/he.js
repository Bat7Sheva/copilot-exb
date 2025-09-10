System.register([], function (e) {
    return {
        execute: function () {
            e({
                _widgetLabel: "הוספת נתונים",
                urlType: "סוג",
                arcgisUrl: "שירות אינטרנט של ArcGIS Server",
                csvUrl: "שכבת CSV",
                geojsonUrl: "שכבת GeoJSON",
                kmlUrl: "שכבת KML",
                wfsUrl: "שירות ווב של WFS OGC",
                wmsUrl: "שירות ווב של WMS OGC",
                wmtsUrl: "שירות ווב של WMTS OGC",
                dropOrBrowse: "שחרר או עיין",
                defaultPlaceholderText: "בשלב זה לא נוספו נתונים.",
                // dropOrBrowseToUpload: "שחרר או עיין כדי להעלות", //geonet
                dropOrBrowseToUpload: "גרור ושחרר או עיין כדי להעלות",  //geonet
                upload: "טען",
                notSupportedFileTypeError: "סוג הקובץ {fileName} אינו נתמך.",
                failedToUploadError: "לא ניתן להעלות את הקובץ {fileName} בהצלחה.",
                exceedMaxSizeError: "גודל הקובץ חורג מהגבול המקסימלי.",
                exceedMaxRecordsError: "מספר הרשומות חורג מהסף המרבי.",
                cannotBeAddedError: "לא ניתן להוסיף את {layerName}. אין עדיין תמיכה בהוספה של סוג זה.",
                // supportedTypesHint: "התבניות הנתמכות: Shapefile(zip)‏, CSV‏, KML‏, GeoJSON, DWG.",  //geonet
                // geonet start
                supportedTypesHint: "קבצים נתמכים:",
                supportedTypes: "KML,DWG,GeoJSON,Shapefile(zip),CSV",
                supportedTypeKML: "KML",
                supportedTypeDWG: "DWG",
                supportedTypeGeoJSON: "GeoJSON",
                supportedTypeShapefile: "Shapefile(zip)",
                supportedTypeCSV: "CSV",
                // geonet end
                fileIsUploading: "העלאת {fileName} מתבצעת",
                clickToAddData: "הוספה", // geonet replace from "לחץ כדי להוסיף נתונים"
                closeClickToAddData: "סגירה", //geonet - add
                sampleUrl: "לדוגמא:", //geonet replace from "כתובת URL לדוגמה"
                sampleUrlAddres: "https://livingatlas.arcgis.com/", // geonet - add
                addToMap: "הוסף למפה",
                actions: "פעולות",
                removeFromMap: "הסר מהמפה",
                layerOpacity: "שקיפות",
                notAllowedCharInFileNameError: "שגיאה בטעינת קובץ: שם הקובץ מכיל תווים אסורים."
            })
        }
    }
});
