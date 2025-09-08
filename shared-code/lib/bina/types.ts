   
export class BinaMessage {
	func: string
	data: any
}
export class RoadMeasure {
	length: number
	measure: number
	message: string
	road: string
	isBikeLn: boolean = false
	/**
	 *
	 */
	constructor(road?:Partial<RoadMeasure>, isBikeLn:boolean = false) {
		Object.assign(this, road);
		this.isBikeLn = isBikeLn;
		this.measure = Number(this.measure?.toFixed(3))
		this.length = Number(this.length?.toFixed(3))
	}
}

export class RoadSegment {
	from: number
	to: number
	flName: string
	roadnum: string
	ezor: string
	merhav: string
	roadDirection: string
	fromKm: number
	toKm: number
	isBikeLn: boolean = false
	/**
	 *
	 */
	constructor(road?:Partial<RoadSegment>, isBikeLn:boolean = false) {
		Object.assign(this, road);
		this.isBikeLn = isBikeLn;

	}
}

export interface Equipment {
	objectId: number
	equipId: string
	description: string

	from: number
	to: number
	flName: string
	roadnum: string
	ezor: string
	merhav: string
	roadDirection: string
	fromKm: number
	toKm: number

	geometry: __esri.Geometry
	layer: __esri.Layer
	type: string
}

export class PointByRouteResult {
	geometry: PointObj
	message: string
}
export class PointObj {
	hasM: boolean
	points: Array<Array<number>>
	spatialReference: any
}

export class GeometryByRouteResult {
	error: string
	geometry: PolyLineObj
	layerIndex: number
	success: boolean
}

export class PolyLineObj {
	hasM: boolean
	paths: Array<Array<Array<number>>>
	spatialReference: any
}
export class QueryParam {
	fieldId: number
	fieldValue: any
}

export class LayerVisibility {
	id: string
	visible: boolean
}

export class LayerDetails {
	layerId: number;
	layerUrl: string;
	layerName: string;
	fields: string[];
}
export class RoadPoint {
	road: string
	km: number
	geometry: PointObj
	isBikeLn:boolean

}


export type spatialRelationship = "intersects" | "contains" | "crosses" | "disjoint" | "envelope-intersects" | "index-intersects" | "overlaps" | "touches" | "within" | "relation"