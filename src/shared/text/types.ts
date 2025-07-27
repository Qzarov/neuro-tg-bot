
export type Translation = {
    lang: Langs,
    confidence: number | undefined,
    text: string,
} 

export enum Langs {
    auto = "auto",
    en = "en",
    ru = "ru"

}