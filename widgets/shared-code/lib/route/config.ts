export interface Config {
    queryExpressions: QueryExpressions
}
export interface QueryExpressions {
	queryFullRouteByEnvelope: string
	queryPointByRoute: string
	getRouteGeometry: string
}