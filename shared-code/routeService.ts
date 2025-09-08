import { loadArcGISJSAPIModules } from 'jimu-arcgis';
import { Config } from './lib/route/config';
import { queryService } from './utils'
import { errorMessages } from './lib/route/errorMessages'
export * from './lib/route/errorMessages';

let config: Config = require('./lib/route/config.json');

export const getPointByRoute = async (roadnum: string, km: number, routeServiceUrl: string): Promise<{ point: __esri.Point, errStr: string }> => {

	const result: { point: __esri.Point, errStr: string } = {
		point: null,
		errStr: ""
	}
	let queryString = config.queryExpressions.queryPointByRoute.replace('{0}', roadnum);
	const res = await queryService(routeServiceUrl, queryString, ['*'], true)//.then(res => {
	if (res?.features?.length > 0) {
		let poly: __esri.Polyline
		for (var i = 0; i < res.features.length; i++) {
			if (res.features[i].geometry.hasM && res.features[i].geometry.type == 'polyline') {
				const { minM, maxM } = getMixMaxMValue(res.features[i].geometry as __esri.Polyline);
				if (km >= minM && km <= maxM) {
					poly = res.features[i].geometry as __esri.Polyline;
					break;
				}
			}
		}

		if (poly) {
			const point = await getPointAtM(poly, km)
			if (point) {
				result.point = point
			}
			else {
				result.errStr = errorMessages.roadKmNotExist;
			}
		}
		else {
			result.errStr = errorMessages.roadKmNotExist;
		}
	}
	else {
		result.errStr = errorMessages.roadNotExist;
	}
	return result;
}

export const getRouteGeometry = async (roadnum: string, fromKm: number, toKm: number, routeServiceUrl: string): Promise<{ polyline: __esri.Polyline, errStr: string }> => {
	let result = {
		polyline: null,
		errStr: ""
	}
	let queryString = config.queryExpressions.queryPointByRoute.replace('{0}', roadnum);
	const res = await queryService(routeServiceUrl, queryString, ['*'], true)
	if (res?.features?.length > 0) {
		//Replace the values if the toKm is smaller than FromKm
		if (toKm < fromKm) {
			let temp = fromKm;
			fromKm = toKm;
			toKm = temp
		}
		const { minMRoad, maxMRoad } = getMixMaxMValueOfRoad(res);
		if (minMRoad > fromKm && maxMRoad < toKm) {
			result.errStr = errorMessages.fromToKmNotExist;
			return result;
		}
		if (minMRoad > fromKm) {
			result.errStr = errorMessages.fromKmNotExist;
			return result;
		}
		if (maxMRoad < toKm) {
			result.errStr = errorMessages.toKmNotExist;
			return result;
		}
		const modules = await loadArcGISJSAPIModules(["esri/geometry/PolyLine", "esri/geometry/Point"]);
		const [Polyline, Point] = modules as [typeof __esri.Polyline, typeof __esri.Point];
		const poly = new Polyline({
			spatialReference: res.features[0].geometry.spatialReference
		});
		let startPoint: __esri.Point;
		let endPoint: __esri.Point;

		for (var i = 0; i < res.features.length; i++) {

			if (res.features[i].geometry.hasM && res.features[i].geometry.type == 'polyline') {

				const geometry = res.features[i].geometry as __esri.Polyline;
				const { minM, maxM } = getMixMaxMValue(geometry);

				if (fromKm <= maxM && toKm >= minM) {

					for (var k = 0; k < geometry.paths.length; k++) {

						let pointArr: __esri.Point[] = [];
						const { minMPath, maxMPath } = getMixMaxMValueOfPath(geometry.paths[k]);

						if (fromKm <= maxMPath && toKm >= minMPath) {

							//Add startPoint if fromKm is in the current path range
							if (fromKm >= minMPath && fromKm <= maxMPath) {
								startPoint = await getPointAtM(geometry, fromKm)
								if (startPoint) { pointArr.push(startPoint); }
							}
							//Add all vertices whose M value is within km range
							for (var j = 0; j < geometry.paths[k].length; j++) {
								const p = {
									x: geometry.paths[k][j][0],
									y: geometry.paths[k][j][1],
									m: geometry.paths[k][j][2],
								}
								if (p.m >= fromKm && p.m <= toKm) {
									let point = new Point({
										x: p.x,
										y: p.y,
										m: p.m,
										spatialReference: geometry.spatialReference
									})
									pointArr.push(point);
								}
							}
							//Add endPoint if Tokm is in the current path range
							if (toKm >= minMPath && toKm <= maxMPath) {
								endPoint = await getPointAtM(geometry, toKm)
								if (endPoint) { pointArr.push(endPoint); }
							}

							poly.addPath(pointArr);
						}
					}
				}
			}
		}

		if (poly.paths.length > 0) {
			poly.paths = poly.paths.sort((a, b) => a[0][2] - b[0][2])
			result.polyline = poly;
			if (!startPoint && !endPoint) {
				result.errStr = errorMessages.fromToKmNotExist;
			}
			else if (!startPoint) {
				result.errStr = errorMessages.fromKmNotExist;
			}
			else if (!endPoint) {
				result.errStr = errorMessages.toKmNotExist;
			}
		}
		else {
			result.errStr = errorMessages.roadSegmentNotExist;
		}
	}
	else {
		result.errStr = errorMessages.roadNotExist;
	}
	return result;
}

export const getDistanceandMvalueOfPointsOnRoad = (point, roadList, minDist) => {
	let resLi = [];
	//  loop over routes
	roadList.forEach(route => {
		for(let i=0; i<route.geometry.paths[0].length - 1; i++){
		//distance of current vertexs
		let currDist = getDistance(point.x, point.y, route.geometry.paths[0][i][0], route.geometry.paths[0][i][1]);
		let currMval = route.geometry.paths[0][i][2]
		//add each vertex m value
		if(currDist && currMval && currDist != NaN && currDist > -1 && currMval != NaN && currMval > -1){
			resLi.push({'roadnum': route.attributes.ROADNUM, 'dist': currDist, 'mval': currMval})
		}
		
		//distance of last vertex
		if(i == route.geometry.paths[0].length - 2){
			let currDist = getDistance(point.x, point.y, route.geometry.paths[0][i+1][0], route.geometry.paths[0][i+1][1]);
			let currMval = route.geometry.paths[0][i+1][2]
			//add each vertex m value
			if(currDist && currMval && currDist != NaN && currDist > -1 && currMval != NaN && currMval > -1){
			resLi.push({'roadnum': route.attributes.ROADNUM, 'dist': currDist, 'mval': currMval})
			}
		}
		
		//distance of trim point
		let myCp = CProd(route.geometry.paths[0][i][0], route.geometry.paths[0][i][1], route.geometry.paths[0][i + 1][0], route.geometry.paths[0][i + 1][1], point.x, point.y);
		let myDp = DProd(route.geometry.paths[0][i][0], route.geometry.paths[0][i][1], route.geometry.paths[0][i + 1][0], route.geometry.paths[0][i + 1][1], point.x, point.y);
		
		let dblLengthAxis = getDistance(route.geometry.paths[0][i][0], route.geometry.paths[0][i][1], route.geometry.paths[0][i + 1][0], route.geometry.paths[0][i + 1][1]);
		let dblRatio = myDp / dblLengthAxis;
		let dx = route.geometry.paths[0][i][0] + (route.geometry.paths[0][i + 1][0] - route.geometry.paths[0][i][0]) * dblRatio / dblLengthAxis;
		let dy = route.geometry.paths[0][i][1] + (route.geometry.paths[0][i + 1][1] - route.geometry.paths[0][i][1]) * dblRatio / dblLengthAxis;        

		// add m value 
		if (((route.geometry.paths[0][i][0] <= dx && route.geometry.paths[0][i + 1][0] >= dx) || 
			(route.geometry.paths[0][i][0] >= dx && route.geometry.paths[0][i + 1][0] <= dx)) &&
			((route.geometry.paths[0][i][1] <= dy && route.geometry.paths[0][i + 1][1] >= dy) || 
			(route.geometry.paths[0][i][1] >= dy && route.geometry.paths[0][i + 1][1] <= dy))) {
			let dist = getDistance(point.x, point.y, dx, dy)
			if (dist <= minDist) {
				minDist = dist; 
				let mValue = getMvalueByRatio(route.geometry.paths[0][i][0],
					route.geometry.paths[0][i][1], route.geometry.paths[0][i][2],
					route.geometry.paths[0][i + 1][0], route.geometry.paths[0][i + 1][1],
					route.geometry.paths[0][i + 1][2], dx, dy)
				if(currDist && currMval && currDist != NaN && currDist > -1 && currMval != NaN && currMval > -1){
					resLi.push({'roadnum': route.attributes.ROADNUM, 'dist': dist, 'mval': mValue})
				}
			}
			}
		};
	});
	return resLi; 
}

const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

const DProd = (x1, y1, x2, y2, x, y) => {
    return ((x2 - x1) * (x - x1) + (y2 - y1) * (y - y1));
  }

const CProd = (x1, y1, x2, y2, x, y) => {
    return ((x2 - x1) * (y - y1) - (x - x1) * (y2 - y1))
  }

const getMvalueByRatio = (x1, y1, m1, x2, y2, m2, x, y) => {
    let dist1 = getDistance(x1, y1, x, y);
    let dist2 = getDistance(x2, y2, x, y);
    return ((m1 * dist2) + (m2 * dist1)) / (dist1 + dist2);
  }

const getMixMaxMValue = (polyline: __esri.Polyline) => {
	let minM: number, maxM: number;
	for (var i = 0; i < polyline.paths.length; i++) {
		for (var j = 0; j < polyline.paths[i].length - 1; j++) {
			maxM = maxM == null || maxM < polyline.paths[i][j][2] ? polyline.paths[i][j][2] : maxM;
			minM = minM == null || minM > polyline.paths[i][j][2] ? polyline.paths[i][j][2] : minM;

		}
	}
	return {
		minM: minM,
		maxM: maxM
	}
}
const getMixMaxMValueOfRoad= (featureSet: __esri.FeatureSet) => {
	let min: number, max: number;
	for (let f of featureSet.features) {
		if (f.geometry.type == "polyline") {
			const { minM, maxM } = getMixMaxMValue(f.geometry as __esri.Polyline);
			min = !min || minM < min ? minM : min;
			max = !max || maxM > max ? maxM : max;
		}
	}
	return {
		minMRoad: min,
		maxMRoad: max
	}
}
const getMixMaxMValueOfPath = (path: number[][]) => {
	let minM: number, maxM: number;
	for (var i = 0; i < path.length; i++) {
		maxM = maxM == null || maxM < path[i][2] ? path[i][2] : maxM;
		minM = minM == null || minM > path[i][2] ? path[i][2] : minM;
	}
	return {
		minMPath: minM,
		maxMPath: maxM
	}
}
const getPointAtM = async (polyline: __esri.Polyline, Mvalue: number): Promise<__esri.Point> => {
	let point: __esri.Point;
	for (var i = 0; i < polyline.paths.length; i++) {
		for (var j = 0; j < polyline.paths[i].length - 1; j++) {
			if (polyline.paths[i][j][2] <= Mvalue && polyline.paths[i][j + 1][2] >= Mvalue) {
				const a = {
					x: polyline.paths[i][j][0],
					y: polyline.paths[i][j][1],
					m: polyline.paths[i][j][2]
				}
				const b = {
					x: polyline.paths[i][j + 1][0],
					y: polyline.paths[i][j + 1][1],
					m: polyline.paths[i][j + 1][2]
				}
				const p = {
					x: 0,
					y: 0,
					m: Mvalue
				}
				const aRatio = p.m - a.m;
				const bRatio = b.m - p.m;
				p.x = ((a.x * bRatio) + (b.x * aRatio)) / (aRatio + bRatio);
				p.y = ((a.y * bRatio) + (b.y * aRatio)) / (aRatio + bRatio);

				const modules = await loadArcGISJSAPIModules(["esri/geometry/Point"]);
				const [Point] = modules as [typeof __esri.Point];
				point = new Point({
					x: p.x,
					y: p.y,
					m: p.m,
					spatialReference: polyline.spatialReference,

				});
				return point;
			}
		}
	}
	return point;
}