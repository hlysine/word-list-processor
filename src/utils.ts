// @ts-ignore
import lib_glob from 'glob';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export const _ = {};

export async function glob(pattern: string, options?: any): Promise<string[]> {
    return new Promise((resolve, reject) => {
        lib_glob(pattern, options, (err: Error, files: string[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

export function shuffleArray<T>(arr: T[]) : T[] {
    const shuffled = arr.slice(0);
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Parse an XML document and separate the prolog and the body.
 * @param xml The XML document to parse.
 * @returns An object containing the prolog and body.
 */
export function parseXml<T>(xml: string) : [string, T] {
    const prolog = xml.match(/^\s*<\?xml[^>]*\?>/);
    if (prolog) {
        xml = xml.substring(prolog[0].length);
    }

    const parser = new XMLParser();
    const obj: T = parser.parse(xml);

    return [prolog ? prolog[0] : '', obj];
}

export function generateXml<T>(prolog: string, obj: T) : string {
    const builder = new XMLBuilder({
        format: true
    });
    const xmlContent = builder.build(obj);

    return prolog + '\r\n' + xmlContent;
}