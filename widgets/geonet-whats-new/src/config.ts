import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  linkForIroads: string
}

export type IMConfig = ImmutableObject<Config>
