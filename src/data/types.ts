import type { ImgKey } from './media';

export interface Row {
  kicker: string;
  title: string;
  text: string;
  points?: string[];
  image: ImgKey;
  alt: string;
}
