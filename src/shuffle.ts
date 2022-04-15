
import * as fs from 'node:fs';
import { WordListFile } from './models.js';
import { generateXml, glob, parseXml, shuffleArray } from './utils.js';

export const shuffleDefinitions = [
    { name: 'file', alias: 'f', type: String, multiple: true, defaultOption: true },
    { name: 'replace', alias: 'r', type: Boolean, defaultValue: false }
];

export interface ShuffleOptions {
    file: string[];
    replace: boolean;
}

export default async function shuffle(options: ShuffleOptions) : Promise<void> {
    const files = (await Promise.all(options.file.map(g => glob(g)))).flat();

    console.log('Found ' + files.length + ' files.');

    if (files.length === 0) {
        console.log('No files found. Exiting.');
        return;
    }

    files.forEach(file => {
        console.log('Processing: ' + file);
        const xmlString = fs.readFileSync(file, 'utf8');

        const [prolog, wordList] = parseXml<WordListFile>(xmlString);

        wordList.WordList.Entries.WordEntry = shuffleArray(wordList.WordList.Entries.WordEntry);

        const xmlContent = generateXml(prolog, wordList);

        if (options.replace) {
            fs.writeFileSync(file, xmlContent, 'utf8');
        } else {
            // remove file extension
            const newFile = file.substring(0, file.lastIndexOf('.')) + '.shuffled.xml';
            fs.writeFileSync(newFile, xmlContent, 'utf8');
        }
    });

    console.log('Done.');
}