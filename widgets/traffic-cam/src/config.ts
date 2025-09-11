import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  cameraLayerUrl: string;
  descriptionQuery: string;
  objectIdQuery: string;
}

export type IMConfig = ImmutableObject<Config>
