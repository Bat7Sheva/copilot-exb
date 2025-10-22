import { type ImmutableObject } from 'seamless-immutable'

export interface SlidesData {
    title: string;
    desc: string;
    img: string;
}

export interface Config {
    slidesData: SlidesData[];
    startDate: string;
    durationDays: number;
}

export type IMConfig = ImmutableObject<Config>
