import { JimuMapView, zoomToUtils, loadArcGISJSAPIModules } from 'jimu-arcgis';

export class QueryParam {
	fieldId: number
	fieldValue: any
}
export type spatialRelationship = "intersects" | "contains" | "crosses" | "disjoint" | "envelope-intersects" | "index-intersects" | "overlaps" | "touches" | "within" | "relation"
export const queryService = async (queryUrl: string, queryString: string, outFields: string[], returnGeometry: boolean, isDistinctValues: boolean = false, orderByFields: string = ''): Promise<__esri.FeatureSet> => {
	try {
		const modules = await loadArcGISJSAPIModules(["esri/rest/query"]);
		const [query] = modules;
		const result = query.executeQueryJSON(queryUrl, {
			where: queryString,
			outFields: outFields,
			returnGeometry: returnGeometry,
			returnM: returnGeometry,
			returnDistinctValues: isDistinctValues,
			orderByFields: orderByFields,
		})
		return result;
	}
	catch (error) {
		console.error(error.message);
		return null;
	}
}
export async function handleGraphicsLayer(mapView: __esri.MapView, layerName: string): Promise<__esri.GraphicsLayer> {
	// check if graphics layer exists
	// if it does than return the graphics layer else create it

	let glIndx = mapView.map.layers.findIndex(layer => layer["name"] === layerName);
	if (glIndx >= 0) {
		return mapView.map.layers["items"][glIndx];
	}
	else {
		try {
			const modules = await loadArcGISJSAPIModules([
				'esri/layers/GraphicsLayer'
			]);
			const [GraphicsLayer] = modules;

			let newGraphicsLayer = new GraphicsLayer({ name: layerName, listMode: "hide" });
			mapView.map.add(newGraphicsLayer);
			return newGraphicsLayer;
		}
		catch (err) {
			console.error(err);
			return null;
		}

	}
}
export async function createPolylineGraphic(gl: __esri.GraphicsLayer, polyline: __esri.Polyline): Promise<__esri.Polyline | null> {

	try {
		const modules = await loadArcGISJSAPIModules([
			'esri/Color',
			'esri/Graphic'
		])
		const [
			Color,
			Graphic,
		] = modules;
		let lineColor = new Color([3, 209, 164]);
		// let lineColor = new Color([0, 0, 0, 0.8]);
		let graphic = new Graphic({
			geometry: polyline,
			symbol: {
				type: "simple-line",
				style: "solid",
				color: lineColor,
				width: 5
			}
		});

		gl.graphics.add(graphic);
		return graphic;
	}
	catch (err) {
		console.error(err);
		return null;
	}

}
export async function createPolylineGraphicBina(gl: __esri.GraphicsLayer, polyline: __esri.Polyline): Promise<__esri.Polyline | null> {

	try {
		const modules = await loadArcGISJSAPIModules([
			'esri/Color',
			'esri/Graphic'
		])
		const [
			Color,
			Graphic,
		] = modules;
		let lineColor = new Color([0, 0, 0, 0.8]);
		let graphic = new Graphic({
			geometry: polyline,
			symbol: {
				type: "simple-line",
				style: "solid",
				color: lineColor,
				width: 5
			}
		});

		gl.graphics.add(graphic);
		return graphic;
	}
	catch (err) {
		console.error(err);
		return null;
	}

}
export async function createPointGraphic(gl: __esri.GraphicsLayer, point: __esri.Point) {

	const modules = await loadArcGISJSAPIModules([
		'esri/Color',
		'esri/Graphic'
	])
	const [
		Color,
		Graphic
	] = modules;
	let pointColor = new Color([63, 148, 193, 0.8]);
	let graphic = new Graphic({
		geometry: point,
		symbol: {
			type: "simple-marker",
			style: "circle",
			color: pointColor,
			size: 25
		}
	});

	gl.graphics.add(graphic);
	return graphic;
}

export async function createPolygonGraphic(gl: __esri.GraphicsLayer, polygon: __esri.Polygon, fill: boolean) {
	const modules = await loadArcGISJSAPIModules([
		'esri/Color',
		'esri/Graphic'
	])
	const [
		Color,
		Graphic,
	] = modules;
	// let polygonColor = new Color([63, 148, 193, 0.8]);
	let polygonColor = new Color([3, 209, 164]);
	let fillPolygonColor = new Color([178, 178, 178, 0.6]);
	let symbol;
	if (fill) {
		symbol = {
			type: "simple-fill",
			color: fillPolygonColor,
			style: "solid",
			outline: {
				color: polygonColor,
				width: 3
			}
		};
	}
	else {
		symbol = {
			type: "simple-line",
			style: "solid",
			color: polygonColor,
			width: 3
		}
	}

	let graphic = new Graphic({
		geometry: polygon,
		symbol: symbol
	});

	gl.graphics.add(graphic);
	return graphic;
}
export async function createPolygonGraphicBina(gl: __esri.GraphicsLayer, polygon: __esri.Polygon, fill: boolean) {
	const modules = await loadArcGISJSAPIModules([
		'esri/Color',
		'esri/Graphic'
	])
	const [
		Color,
		Graphic,
	] = modules;
	 let polygonColor = new Color([63, 148, 193, 0.8]);
//let polygonColor = new Color([3, 209, 164]);
	let fillPolygonColor = new Color([178, 178, 178, 0.6]);
	let symbol;
	if (fill) {
		symbol = {
			type: "simple-fill",
			color: fillPolygonColor,
			style: "solid",
			outline: {
				color: polygonColor,
				width: 3
			}
		};
	}
	else {
		symbol = {
			type: "simple-line",
			style: "solid",
			color: polygonColor,
			width: 3
		}
	}

	let graphic = new Graphic({
		geometry: polygon,
		symbol: symbol
	});

	gl.graphics.add(graphic);
	return graphic;
}
export async function createMarkerPointGraphic(gl: __esri.GraphicsLayer, point: __esri.Point) {

	try {
		const modules = await loadArcGISJSAPIModules([
			'esri/Graphic'
		])
		const [
			Graphic
		] = modules;
		let graphic = new Graphic({
			geometry: point,
			symbol: {
				type: "picture-marker",
				width: 25,
				height: 35,
				xoffset: 0,
				yoffset: 13,
				url: 'data:image/png;base64,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'
			}
		});

		gl.graphics.add(graphic);
		return graphic;


	} catch (error) {
		console.error(error);
		return null;
	}

}

export async function getGeometriesExtent(geometries: __esri.Geometry[]): Promise<__esri.Extent> {

	if (!geometries || !geometries.length) {
		return null;
	}

	let fullExtent: __esri.Extent = null;
	let index;
	let extent
	const numGeometries = geometries.length;
	try {
		const modules = await loadArcGISJSAPIModules([
			'esri/geometry/Extent'
		]);
		const [Extent] = modules;

		for (index = 0; index < numGeometries; index++) {
			const geometry = geometries[index];
			if (!geometry) {
				continue;
			}
			extent = geometry.extent;

			if (!extent && geometry.type === 'point') {
				const pointGeometry = geometry as any;

				if (pointGeometry.x && pointGeometry.y) {
					extent = new Extent({
						xmax: pointGeometry.x,
						xmin: pointGeometry.x,
						ymax: pointGeometry.y,
						ymin: pointGeometry.y,
						zmax: pointGeometry.z,
						zmin: pointGeometry.z,
						spatialReference: pointGeometry.spatialReference
					});
				}
			}

			if (!extent) {
				continue;
			}

			if (fullExtent) {
				fullExtent = fullExtent.union(extent);
			} else {
				fullExtent = extent;
			}
		}
	}
	catch (err) {
		console.error(err);
		return null;
	}
	if (fullExtent.width < 0 && fullExtent.height < 0) {
		return null;
	}

	return fullExtent;

}
export async function clearGraphicLayers(layersNames: string[], mapView: __esri.MapView) {
	for (let name of layersNames) {
		const graphicLayer = await handleGraphicsLayer(mapView, name);
		if (graphicLayer && graphicLayer.graphics) {
			graphicLayer.graphics.removeAll();
		}
	}
}
export async function clearAllGraphics(mapView: __esri.MapView) {
	const allLayers = getAllLayers(mapView)
	for (let layer of allLayers) {

		if (layer && layer.type === "graphics" && (layer as __esri.GraphicsLayer).graphics) {
			(layer as __esri.GraphicsLayer).graphics.removeAll();
		}
	}
}
export async function createPoint(xCoord: any, yCoord: any, spatialReference: any): Promise<__esri.Point> {
	const x = parseFloat(xCoord);
	const y = parseFloat(yCoord);
	try {
		const modules = await loadArcGISJSAPIModules([
			'esri/geometry/Point'
		]);

		const [Point] = modules;
		return new Point({
			type: 'point',
			x,
			y,
			spatialReference
		});

	} catch (err) {
		console.error(err);
		return null;
	}

}

export async function postRequestService(content: any, url: string): Promise<any> {
	try {
		const modules = await loadArcGISJSAPIModules(["esri/request"]);
		const [esriRequest] = modules;
		content.f = 'pjson';
		const response = await esriRequest(url, {
			responseType: 'json',
			query: content,
			method: "post"
		});

		if (response?.data) {
			return response.data;
		}
	} catch (err) {
		console.error(err);
		return null;
	}

}
export async function queryFeatures(
	queryUrl: string,
	objectIdField: string,
	queryExpression: string,
	outputFields: any,
	objectIds: any,
	returnGeometry: boolean,
	geometryFilter: any,
	spatialRelationship: spatialRelationship | null
): Promise<__esri.FeatureSet | null> {
	try {
		const modules = await loadArcGISJSAPIModules(["esri/rest/support/Query", "esri/rest/query"])
		const [QueryParams, Query] = modules;
		const queryObject = new QueryParams();
		if (!queryExpression) {
			return null;
		}
		queryObject.where = queryExpression;
		queryObject.orderByFields = [objectIdField];
		queryObject.returnGeometry = returnGeometry;
		queryObject.returnM = returnGeometry;
		queryObject.outFields = outputFields || [];

		if (objectIds) queryObject.objectIds = objectIds;

		if (geometryFilter) queryObject.geometry = geometryFilter;

		if (spatialRelationship) queryObject.spatialRelationship = spatialRelationship;

		if (!queryObject.outFields.includes(objectIdField)) {
			queryObject.outFields.push(objectIdField);
		}

		const featureSet = await Query.executeQueryJSON(queryUrl, queryObject);
		return featureSet;
	}
	catch (error) {
		console.error(error.message);
		return null;
	}
} export async function queryFeatureLayer(
	layer: __esri.FeatureLayer,
	objectIdField: string,
	queryExpression: string,
	outputFields: any,
	objectIds: any,
	returnGeometry: boolean,
	geometryFilter: any,
	spatialRelationship: spatialRelationship | null,
	resultRecordCount: number = null
): Promise<__esri.FeatureSet | null> {
	try {
		const modules = await loadArcGISJSAPIModules(["esri/rest/support/Query"])
		const [QueryParams] = modules;
		const queryObject = new QueryParams();
		if (!queryExpression) {
			return null;
		}
		queryObject.where = queryExpression;
		queryObject.orderByFields = [objectIdField];
		queryObject.returnGeometry = returnGeometry;
		queryObject.outFields = outputFields || [];

		if (objectIds) queryObject.objectIds = objectIds;

		if (geometryFilter) queryObject.geometry = geometryFilter;

		if (spatialRelationship) queryObject.spatialRelationship = spatialRelationship;

		if (!queryObject.outFields.includes(objectIdField)) {
			queryObject.outFields.push(objectIdField);
		}
		if (resultRecordCount > 0) {
			queryObject.num = resultRecordCount;
			queryObject.start = 0;

		}
		const featureSet = await layer.queryFeatures(queryObject);
		return featureSet;

	}
	catch (error) {
		console.error(error.message);
		return null;
	}
}
export const drawGraghicOnMapBina = async (geometry: __esri.Geometry, mapView: __esri.MapView, fill: boolean = false) => {
	let layer, graphic;
	if (mapView && geometry) {
		if (geometry.type == "point") {
			layer = await handleGraphicsLayer(mapView, "mapPointSymbol");
			graphic = await createMarkerPointGraphic(layer, geometry as __esri.Point);

		}
		else if (geometry.type == "polyline") {
			layer = await handleGraphicsLayer(mapView as __esri.MapView, "mapLineSymbol");
			graphic = await createPolylineGraphicBina(layer, geometry as __esri.Polyline);
		}
		else if (geometry.type == "polygon") {
			layer = await handleGraphicsLayer(mapView as __esri.MapView, "mapPolygonSymbol");
			graphic = await createPolygonGraphicBina(layer, geometry as __esri.Polygon, fill);
		}
		if (layer && graphic) {
			mapView.map.reorder(layer, mapView.map.layers.length - 1);

			zoomToUtils.zoomTo(mapView, [graphic], {
				padding: {
					left: 100,
					right: 100,
					top: 100,
					bottom: 100
				}
			})

		}
	}
}
export const drawGraghicOnMap = async (geometry: __esri.Geometry, mapView: __esri.MapView, zommLevel: number = -1, fill: boolean = false) => {
	let layer, graphic;
	if (mapView && geometry) {
		if (geometry.type == "point") {
			// layer = await handleGraphicsLayer(mapView, "mapPointSymbol");
			layer = await handleGraphicsLayer(mapView as __esri.MapView, "mapMarkerPoint");
			graphic = await createMarkerPointGraphic(layer, geometry as __esri.Point);

		}
		else if (geometry.type == "polyline") {
			layer = await handleGraphicsLayer(mapView as __esri.MapView, "mapLineSymbol");
			graphic = await createPolylineGraphic(layer, geometry as __esri.Polyline);
		}
		else if (geometry.type == "polygon") {
			layer = await handleGraphicsLayer(mapView as __esri.MapView, "mapPolygonSymbol");
			graphic = await createPolygonGraphic(layer, geometry as __esri.Polygon, fill);
		}
		if (layer && graphic) {
			mapView.map.reorder(layer, mapView.map.layers.length - 1);
			if (zommLevel > -1) {
				const extent = await getGeometriesExtent([geometry]);
				await mapView.goTo(extent);
				// await mapView.goTo({ target: [geometry], zoom: zommLevel });
				// while (!mapView.extent.contains(extent)) {
				// 	mapView.zoom -= 1;
				// }
			} else {
				zoomToUtils.zoomTo(mapView, [graphic], {
					padding: {
						left: 100,
						right: 100,
						top: 100,
						bottom: 100
					}
				})
			}
		}
	}
}

export function removeGraphicsFromTheMap(mapView: __esri.MapView) {
	mapView.graphics.removeAll();
}


export function getAllLayers(mapView: __esri.MapView): __esri.Layer[] | null {
	let allLayersAndSublayers = mapView?.map?.layers?.flatten(function (item) {
		return item["layers"] || item["sublayers"];

	});
	return allLayersAndSublayers.toArray();
}
export function getLayerByLayerUrl(allLayers: __esri.Layer[], layerUrl: string): __esri.FeatureLayer {
	return allLayers?.find((l) => {
		const layer = l as __esri.FeatureLayer
		if (layer && (layer.url === layerUrl || (`${layer.url}/${layer.layerId}` == layerUrl))) {
			return true;
		}

	}
	) as __esri.FeatureLayer || null;

}

export function findField(layer: __esri.FeatureLayer, fldName: string): __esri.Field {
	let fldObj = layer.fields.find(fld => {
		return (`${fld["name"]}` == fldName)
	});
	return fldObj;
}

export function setLayerVisibility(layer: __esri.Layer, visible: boolean) {
	//if (layer.visible != undefined) {
	//	layer.visible = visible;
	//}

	layer.visible = visible;
	//if visible is true visible all parent layers
	if (layer.parent && visible) {
		const parent = layer.parent as __esri.GroupLayer
		if (parent) {
			setLayerVisibility(parent, visible);
		}
	}
	else {
		return;
	}

}
export function buildWhereByParams(fields: string[], params: QueryParam[]): string {
	let whrStr = "";
	for (let i = 0; i < params.length; i++) {
		let filterFldName = fields[params[i].fieldId - 1];

		if (whrStr == "") {
			whrStr = buildWhere(filterFldName, params[i].fieldValue);
		}
		else {
			whrStr += " and " + buildWhere(filterFldName, params[i].fieldValue);
		}
	}
	return whrStr;
}

export function buildWhere(fldName: string, fldValue: any): string {
	if (fldValue instanceof Array) {
		let formattedValues = fldValue.map(value => {
			if (typeof value === 'string') {
				return `'${value}'`;
			} else {
				return value;
			}
		});
		return `${fldName} IN (${formattedValues.join(',')})`
	}
	else if (typeof fldValue == "number") {
		return `${fldName}=${fldValue}`;
	}
	else {
		return `${fldName}='${fldValue}'`;
	}
}


export async function zoomToFeaturesOnMap(mapView: __esri.MapView, featureSet: __esri.FeatureSet): Promise<void> {
	try {
		const geometryArray = featureSet?.features?.map((feature) => feature.geometry);
		if (!geometryArray) {
			return;
		}
		//const extent = await getGeometriesExtent(geometryArray);
		//if (extent) {
		//	await mapView.goTo(extent.expand(1.5));
		//}
		await zoomToGeometriesExtent(geometryArray, 12, mapView);
	}
	catch (error) {
		console.error(error.message);
	}
}

export function getObjectIds(featureSet: __esri.FeatureSet, objectIdField: string): any[] {
	let objectIds = [];
	if (featureSet && featureSet.features && featureSet.features.length > 0) {
		objectIds = featureSet.features.map(f => f.attributes[objectIdField]);
	}
	return objectIds;
}

export function getjimuLayerViewByLayer(jmv: JimuMapView, layer: __esri.FeatureLayer | __esri.Layer) {

	const jimuLayerViewsId = jmv.getJimuLayerViewIdByAPILayer(layer);

	if (jimuLayerViewsId) {
		return jmv.jimuLayerViews[jimuLayerViewsId];
	}
	return null;
}
export function clearSelectedFeatues(jimuMapView: JimuMapView) {
	jimuMapView.clearSelectedFeatures();
}
export async function zoomToGeometriesExtent(geometries: __esri.Geometry[], zoomLevel: number, mapView: __esri.MapView) {
	await mapView.goTo({ target: geometries, zoom: zoomLevel });
	const extent = await getGeometriesExtent(geometries);
	while (!mapView.extent.contains(extent)) {
		mapView.zoom -= 1;
	}
}
export function getLayerVisibility(layer: any): boolean {

	//Check if the layer is visible and its parent is also visible
	if (layer.visible != undefined) {
		if (layer.parent && layer.parent.visible != undefined) {
			let isVisible = layer.visible && getLayerVisibility(layer.parent);
			return isVisible;
		}
		return layer.visible;
	}
	return false;
}


export function removeLayer(layer: __esri.Layer) {

	if (layer?.parent) {
		const parent = layer.parent as __esri.Map | __esri.GroupLayer
		if (parent) {
			parent.remove(layer);
			if (parent.allLayers?.length > 0) {
				return;
			}
			else if (parent["type"] === "group") {
				removeLayer(parent as __esri.GroupLayer);
			}
		}

	}
}
export function isFeatureLayer(layer: __esri.Layer | __esri.FeatureLayer): layer is __esri.FeatureLayer {
	return (layer as __esri.FeatureLayer).layerId !== undefined;
}
export async function pointToExtent(mapView: __esri.MapView, point: __esri.Point, toleranceInPixel: number) {

	const mapWidth = mapView.extent.width;
	const pixelWidth = mapWidth / mapView.width;
	const toleraceInMapCoords = toleranceInPixel * pixelWidth;
	const modules = await loadArcGISJSAPIModules(["esri/geometry/Extent"])
	const [Extent] = modules;


	const extent = new Extent({
		xmin: point.x - toleraceInMapCoords,
		ymin: point.y - toleraceInMapCoords,
		xmax: point.x + toleraceInMapCoords,
		ymax: point.y + toleraceInMapCoords,

		spatialReference: point.spatialReference
	});
	return extent;
}

