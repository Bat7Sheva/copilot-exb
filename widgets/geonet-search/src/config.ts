import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  freeSerch: FreeSerch;
  roadPointSearch: RoadPointSearch;
  gushHelkaSearch: GushHelkaSearch;
  addressSearch: AddressSearch;
  roadWGSSearch: RoadWGSSearch;
  roadSegmentSearch: RoadSegmentSearch;
  searchOptions: SearchType[];
}

export type IMConfig = ImmutableObject<Config>


export interface FreeSerch {
  apiUrl: string;
  free_searchRef: string;
}

export interface RoadPointSearch {
  queryPointByRoutURL: string,
  routLayerURL: string,
  roadField: string
}

export interface GushHelkaSearch {
  gushField: string,
  helkaField: string,
  gushHelkaQuery: string,
  gushQuery: string,
  gushURL: string,
  helkaURL: string
}

export interface AddressSearch {
  queryAddressLocatorURL: string,
  querySettlementsURL: string,
  queryStreetsURL: string
}

export interface RoadWGSSearch {
  WGS84Url: string;
}

export interface RoadSegmentSearch {
  queryPointByRoutURL: string;
  queryRoutGeometryUrl: string;
}

export interface SearchType {
  key: string;
  label: string;
  fields: SearchField[];
}

export interface SearchField {
  parentKey: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'autocomplete';
  required?: boolean;
  titleDisplayField?: string;
  displayField?: string;
  autocompleteQuery?: string;
}