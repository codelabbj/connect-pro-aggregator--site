import { en } from './en';
import { fr } from './fr';

export const translations = { en, fr };
export type Locale = keyof typeof translations;
export type TranslationKey = typeof en;
export type NestedKey<T> = T extends object 
  ? { [K in keyof T]: `${K & string}${T[K] extends object ? `.${NestedKey<T[K]>}` : ""}` }[keyof T] 
  : "";

export type TKey = NestedKey<TranslationKey>;
