import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  wazeLayers: wazeLayer[]
}

export type IMConfig = ImmutableObject<Config>

export interface wazeLayer {
  name: string;
  label: string;
  url: string;
}