import { Point } from "esri/geometry";
import { clearGraphicLayers, createMarkerPointGraphic, drawGraghicOnMap, getAllLayers, getLayerByLayerUrl, handleGraphicsLayer, postRequestService, queryFeatureLayer, queryService, setLayerVisibility } from "widgets/shared-code/utils";
import { IMConfig, SearchField, SearchType } from "../../config";

export const focusOnMapPoint = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    await searchBy(mapView, config, searchOption, inputValues, setShowNoResultsMsg, setMessage);
}

export const areAllRequiredFieldsFilled = (searchOption: SearchType, inputValues: {}) => {
    return searchOption.fields.every((field, index) => {
        if (!field.required) return true;

        const fieldKey = field.key;
        const value = inputValues[fieldKey];
        return value !== undefined && value !== null && value.toString().trim() !== "";
    });
};

export const searchBy = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    switch (searchOption.key) {
        case 'freeSearch':
            freeSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg, setMessage);
            break;
        case 'roadPointSearch':
            await roadPointSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg, setMessage);
            break;
        case 'gushHelkaSearch':
            await gushHelkaSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg, setMessage);
            break;
        case 'addressSearch':
            await addressSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg);
            break;
        case 'roadITMSearch':
            await roadITMSearch(mapView, searchOption, inputValues, setShowNoResultsMsg);
            break;
        case 'roadWGSSearch':
            await roadWGSSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg);
            break;
        case 'roadSegmentSearch':
            await roadSegmentSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg);
            break;

        default:
            break;
    }
}

export const freeSearch = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {

    const item = inputValues[searchOption.fields[0].key];

    if (item.serviceURL == config.gushHelkaSearch.gushURL || item.serviceURL == config.gushHelkaSearch.helkaURL) {
        await gushHelkaSearch(mapView, config, searchOption, inputValues, setShowNoResultsMsg, setMessage);
        return;
    } else {
        const serviceUrl = item.serviceURL || config.freeSerch.apiUrl + config.freeSerch.free_searchRef;
        const content = { "f": "json" };
        let result = await postRequestService(content, serviceUrl);

        if (result) {

            const field = result.fields.find(x => x.type === "esriFieldTypeOID");
            const queryFiled = field.name;
            const query = `${queryFiled} = ${item.fetureID}`;

            const queryServiceResult = await queryService(serviceUrl, query, ['*'], true);

            if (queryServiceResult && queryServiceResult.features && queryServiceResult.features[0].geometry && queryServiceResult.geometryType) {

                const geometry = queryServiceResult.features[0].geometry;

                await drawGraghicOnMap(geometry, mapView, -1, true)
            }
        } else {
            setShowNoResultsMsg(true);
        }
    }
}

export const roadPointSearch = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    var serviceUrl = config.roadPointSearch.queryPointByRoutURL;

    var content = {
        "roadNumber": "'" + inputValues[searchOption.fields[0].key] + "'",
        "km": +inputValues[searchOption.fields[1].key],
        "f": "json"
    };

    let res = await postRequestService(content, serviceUrl);
    if (res) {
        if (res.message && res.message !== "") {
            setShowNoResultsMsg(true);
            setMessage(res.message);
            return;
        }
        const x = res.geometry.points[0][0];
        const y = res.geometry.points[0][1];

        await zoomToPoint(mapView, x, y);
    } else {
        setShowNoResultsMsg(true);
    }
}

export const gushHelkaSearch = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {

    var gushVal = inputValues[searchOption.fields[0].key];
    var helkaVal = inputValues[searchOption.fields[1].key] ? inputValues[searchOption.fields[1].key] : null;

    if (gushVal === '') return;

    const serviceUrl = helkaVal ? config.gushHelkaSearch.helkaURL : config.gushHelkaSearch.gushURL;
    const query = gushVal && helkaVal
        ? config.gushHelkaSearch.gushHelkaQuery.replace('{0}', inputValues[searchOption.fields[0].key]).replace('{1}', inputValues[searchOption.fields[1].key])
        : config.gushHelkaSearch.gushQuery.replace('{0}', inputValues[searchOption.fields[0].key]);

    const allLayers = getAllLayers(mapView);
    if (!allLayers || allLayers.length <= 0) {
        setShowNoResultsMsg(true);
        setMessage("No layes in the map.");
    }
    const targetLayer = getLayerByLayerUrl(allLayers, serviceUrl);
    const gushOrHelkaLayerUrl = helkaVal ? config.gushHelkaSearch.gushURL : config.gushHelkaSearch.helkaURL;
    const gushOrHelkaLayer = getLayerByLayerUrl(allLayers, gushOrHelkaLayerUrl);

    if (!targetLayer) {
        setShowNoResultsMsg(true);
        setMessage(`layer ${serviceUrl} not found.`);
    }
    if (!gushOrHelkaLayer) {
        setShowNoResultsMsg(true);
        setMessage(`layer ${gushOrHelkaLayerUrl} not found.`);
    }

    const featureSetResult = await queryFeatureLayer(targetLayer, targetLayer.objectIdField, query, [targetLayer.objectIdField], null, true, null, null);
    const geometry = featureSetResult.features[0]?.geometry;

    if (featureSetResult?.features?.length > 0 && geometry) {
        await drawGraghicOnMap(geometry, mapView, -1, true)
        setLayerVisibility(targetLayer, true);
        setLayerVisibility(gushOrHelkaLayer, true);
    }
    else {
        setShowNoResultsMsg(true);
    }
}

export const addressSearch = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void) => {
    const query_SOE_Url = config.addressSearch.queryAddressLocatorURL;

    const city = inputValues[searchOption.fields[0].key]?.trim() || "";
    const street = inputValues[searchOption.fields[1].key]?.trim() || "";
    const estNum = inputValues[searchOption.fields[2].key]?.trim() || "";

    const content = {
        SingleLine: `${street} ${estNum}${street && city ? ',' : ''} ${city}`,
        f: 'json'
    };

    const result = await postRequestService(content, query_SOE_Url);

    if (result && result.candidates.length > 0) {

        if (!result?.candidates?.length) return;

        let candidates = removeDuplicateCandidates(result.candidates);

        if (result.candidates.length === 1) {
            result.candidates = [candidates[0]];
        } else {
            const filteredByCity = filterByCity(candidates, city);
            const exactMatches = filterByStreetAndNumber(filteredByCity, street, estNum);
            if (exactMatches.length > 0) {
                result.candidates = exactMatches;
            } else {
                const closest = findClosestCandidate(filteredByCity, estNum);
                if (closest) {
                    result.candidates = [closest];
                } else {
                    result.candidates = [];
                }
            }
        }
        if (result.candidates.length > 0) {
            const loc = result.candidates[0].location;
            const zoomSize = !street ? 5 : 12;
            await zoomToPoint(mapView, loc.x, loc.y, zoomSize);

        } else {
            setShowNoResultsMsg(true);
        }
    } else {
        setShowNoResultsMsg(true);
    }
}

const removeDuplicateCandidates = (candidates: []) => {
    const seen = new Set<string>();
    return candidates.filter((entry: any) => {
        if (seen.has(entry.address)) return false;
        seen.add(entry.address);
        return true;
    });
};

const filterByCity = (candidates: any[], city: string) => {
    return candidates.filter((c) => c.address.includes(city));
};

const filterByStreetAndNumber = (candidates: any[], street: string, estNum: string) => {
    return candidates.filter((c) =>
        c.address.includes(street) && c.address.includes(estNum)
    );
};

const findClosestCandidate = (candidates: any[], estNum: string) => {
    const targetNum = parseInt(estNum);
    if (isNaN(targetNum)) return null;

    let closest = null;
    let minDistance = Number.MAX_VALUE;

    candidates.forEach((candidate) => {
        const match = candidate.address.match(/\d+/);
        if (!match) return;

        const candidateNum = parseInt(match[0]);
        if (isNaN(candidateNum)) return;

        const distance = Math.abs(targetNum - candidateNum);
        if (distance < minDistance) {
            minDistance = distance;
            closest = candidate;
        }
    });

    return closest;
};

export const roadITMSearch = async (mapView: __esri.MapView, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void) => {
    const x = inputValues[searchOption.fields[1].key];
    const y = inputValues[searchOption.fields[0].key];

    await zoomToPoint(mapView, x, y);
}

export const roadWGSSearch = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void) => {
    var content = {
        "Lat": parseFloat(inputValues[searchOption.fields[1].key]), // 32.7461
        "Long": parseFloat(inputValues[searchOption.fields[0].key]), // 35.0258
        "f": "json"
    };

    let res = await postRequestService(content, config.roadWGSSearch.WGS84Url);
    if (res) {
        await zoomToPoint(mapView, res.x, res.y);
    } else {
        setShowNoResultsMsg(true);
    }
}

export const zoomToPoint = async (mapView: __esri.MapView, x: string, y: string, zoomSize?: number) => {
    const point = new Point({
        x: parseFloat(x),
        y: parseFloat(y),
        spatialReference: { wkid: 2039 }
    });
    await drawGraghicOnMap(point, mapView, -1, true)
}

export const roadSegmentSearch = async (mapView: __esri.MapView, config: IMConfig, searchOption: SearchType, inputValues: {}, setShowNoResultsMsg: (show: boolean) => void) => {
    let content, query_SOE_Url;

    if (inputValues[searchOption.fields[1].key]/* kmFrom */ === inputValues[searchOption.fields[2].key]/* kmTo */) {
        query_SOE_Url = config.roadSegmentSearch.queryPointByRoutURL;
        content = {
            "roadNumber": "'" + inputValues[searchOption.fields[0].key] + "'"/* road */,
            "km": +inputValues[searchOption.fields[1].key]/* kmFrom */
        };
    } else {
        query_SOE_Url = config.roadSegmentSearch.queryRoutGeometryUrl;
        content = {
            "roadNumber": "'" + inputValues[searchOption.fields[0].key] + "'"/* road */,
            "kmFrom": +inputValues[searchOption.fields[1].key]/* kmFrom */,
            "kmTo": +inputValues[searchOption.fields[2].key]/* kmTo */
        };
    }

    content['f'] = 'json';

    let result = await postRequestService(content, query_SOE_Url);
    if (result && result.geometry) {

        if (result.geometry.paths && result.geometry.paths.length > 0) {
            const newGeometryObj = Object.assign({}, result.geometry, { type: "polyline" })
            await drawGraghicOnMap(newGeometryObj, mapView, -1, true)

        } else if (result.geometry.points && result.geometry.points.length > 0) {

            const x = result.geometry.points[0][0];
            const y = result.geometry.points[0][1];
            await zoomToPoint(mapView, x, y);
        }
    } else {
        setShowNoResultsMsg(true);
    }
}

export const handleFieldAutocomplete = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    let query = null;

    if (field.parentKey === 'freeSearch') {
        query = await freeSearchQuery(e, field, inputValues, mapView, config);
    }
    else if (field.parentKey === 'gushHelkaSearch') {
        if (field.key === 'gush') {
            query = await gushAutocompleteQuery(e, field, inputValues, mapView, config, setShowNoResultsMsg, setMessage);
        }
        else if (field.key === 'helka') {
            query = await helkaAutocompleteQuery(e, field, inputValues, mapView, config, setShowNoResultsMsg, setMessage);
        }
    }
    else if (field.parentKey === 'roadPointSearch' || field.parentKey === 'roadSegmentSearch') {
        if (field.key === 'road') {
            query = await roadQuery(e, field, inputValues, mapView, config, setShowNoResultsMsg, setMessage);
        }
    }
    else if (field.parentKey === 'addressSearch') {
        if (field.key === 'city') {
            query = await cityQuery(e, field, inputValues, mapView, config);
        }
        else if (field.key === 'street') {
            query = await streetQuery(e, field, inputValues, mapView, config);
        }
    }
    return query;
}


export const freeSearchQuery = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig) => {
    const value = typeof (e) !== 'object' ? e
        : e.attributes[field.displayField] ? e.attributes[field.displayField]
            : e.target?.value;

    var serviceUrl = config.freeSerch.apiUrl + config.freeSerch.free_searchRef;

    var content = {
        "value": value,
        "f": "json"
    };

    let res = await postRequestService(content, serviceUrl);
    if (res) {
        return res;
    }
}

export const gushAutocompleteQuery = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    return await gushHelkaAurocompleteQuery(true, e, field, inputValues, mapView, config, setShowNoResultsMsg, setMessage);
}

export const helkaAutocompleteQuery = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    return await gushHelkaAurocompleteQuery(false, e, field, inputValues, mapView, config, setShowNoResultsMsg, setMessage);
}

export const gushHelkaAurocompleteQuery = async (isGush: boolean, e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {

    const value = typeof (e) !== 'object' ? e
        : e.attributes[field.displayField] ? e.attributes[field.displayField]
            : e.target?.value;


    const gushVal = inputValues['gush'];
    if (!gushVal) return;

    const serviceUrl = config.gushHelkaSearch.helkaURL;

    if (value == "") {
        return;
    }

    const query = isGush ? field.autocompleteQuery.replace('{0}', value) : field.autocompleteQuery.replace('{0}', gushVal).replace('{1}', value);
    const outFields = isGush ? config.gushHelkaSearch.gushField : config.gushHelkaSearch.helkaField;

    const allLayers = getAllLayers(mapView);

    if (!allLayers || allLayers.length <= 0) {
        setShowNoResultsMsg(true);
        setMessage("No layes in the map.");
    }

    const targetLayer = getLayerByLayerUrl(allLayers, serviceUrl);

    if (!targetLayer) {
        setShowNoResultsMsg(true);
        setMessage(`layer ${serviceUrl} not found.`);
    }

    const result = await queryService(serviceUrl, query, [outFields], false, true, outFields);

    return result?.features ?? [];
}

export const roadQuery = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig, setShowNoResultsMsg: (show: boolean) => void, setMessage: (msg: string) => void) => {
    const value = typeof (e) !== 'object' ? e
        : e.attributes[field.displayField] ? e.attributes[field.displayField]
            : e.target?.value;

    const serviceUrl = config.roadPointSearch.routLayerURL;

    if (value == "") {
        return;
    }

    const query = field.autocompleteQuery.replace('{0}', value);
    const outFields = config.roadPointSearch.roadField;

    const allLayers = getAllLayers(mapView);

    if (!allLayers || allLayers.length <= 0) {
        setShowNoResultsMsg(true);
        setMessage("No layes in the map.");
    }

    const targetLayer = getLayerByLayerUrl(allLayers, serviceUrl);

    if (!targetLayer) {
        setShowNoResultsMsg(true);
        setMessage(`layer ${serviceUrl} not found.`);
    }

    const result = await queryService(serviceUrl, query, [outFields], false, true, outFields);

    return result?.features ?? [];
}

export const cityQuery = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig) => {
    const value = typeof (e) !== 'object' ? e
        : e.attributes[field.displayField] ? e.attributes[field.displayField]
            : e.target?.value;

    if (!value) return;

    const baseUrl = config.addressSearch.querySettlementsURL;

    const content = {
        'Text': value,
        'Max Suggestions': 10,
        'f': 'json'
    };

    const result = await postRequestService(content, baseUrl);

    return result?.suggestions ?? [];
}

export const streetQuery = async (e, field: SearchField, inputValues: {}, mapView: __esri.MapView, config: IMConfig) => {
    const value = typeof (e) !== 'object' ? e
        : e.attributes[field.displayField] ? e.attributes[field.displayField]
            : e.target?.value;

    if (!value) return;

    const baseUrl = config.addressSearch.queryStreetsURL;
    const searchText = inputValues['city'] ? `${inputValues['city']} , ${value}` : value
    const content = {
        'Text': searchText,
        'Max Suggestions': 10,
        'f': 'json'
    };

    const result = await postRequestService(content, baseUrl);

    if (!result?.suggestions?.length) return [];

    const cleanedSuggestions = result.suggestions
        .filter((suggestion: { text: string }) => {
            const parts = suggestion.text.split(',');
            if (parts.length < 2) return false;

            const [streetPart, cityPart] = parts.map(p => p.trim());
            return cityPart === inputValues['city']
            //  && streetPart.includes(inputValues['street']);
        })
        .map((suggestion: { text: string }) => {
            const streetPart = suggestion.text.split(',')[0].trim();
            return {
                ...suggestion,
                text: streetPart,
            };
        });

    return cleanedSuggestions ?? [];
}
