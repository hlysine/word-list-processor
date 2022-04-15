
import * as fs from 'node:fs';
import { UniversalWord, WordEntry, WordListFile } from './models.js';
import { generateXml, glob, parseXml } from './utils.js';
import * as readline from 'node:readline';

export const mergeDefinitions = [
    { name: 'file', alias: 'f', type: String, multiple: true, defaultOption: true },
    { name: 'name', alias: 'n', type: String, defaultValue: '' }
];

export interface MergeOptions {
    file: string[];
    name: string;
}

export default async function merge(options: MergeOptions) : Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (options.name === '') {
        options.name = await new Promise(resolve => rl.question('Enter a name for the merged word list: ', resolve));
    }

    rl.close();

    const files = (await Promise.all(options.file.map(g => glob(g)))).flat();

    console.log('Found ' + files.length + ' files.');

    if (files.length === 0) {
        console.log('No files found. Exiting.');
        return;
    }

    const words: UniversalWord[] = [];
    let prolog: string | null = null;

    files.forEach(file => {
        console.log('Processing: ' + file);

        const xmlString = fs.readFileSync(file, 'utf8');

        const [pl, wordList] = parseXml<WordListFile>(xmlString);

        prolog ??= pl;

        words.push(...wordList.WordList.Entries.WordEntry.map(w => ({
            ...w,
            WordList: wordList.WordList
        })));
    });

    // group duplicate words into arrays
    const groups: UniversalWord[][] = [];
    words.forEach(w => {
        const group = groups.find(g => g[0].Word.toLowerCase() === w.Word.toLowerCase());

        if (group) {
            group.push(w);
        } else {
            groups.push([w]);
        }
    });

    const newList: WordListFile = {
        WordList: {
            Name: options.name,
            Created: new Date().toISOString(),
            FlashcardMode: false,
            Entries: { WordEntry: [] }
        }
    }

    newList.WordList.Entries.WordEntry = groups.map(group => {
        if (group.length === 1) {
            const { WordList, ...rest } = group[0];
            return rest;
        } else {
            const word: WordEntry = {
                Word: group[0].Word,
                Url: group.find(w => w.Url !== '')?.Url ?? '',
                Created: group[0].Created,
                Description: '',
                LastModified: newList.WordList.Created,
                FlashcardFlipped: false
            };

            let description = '';

            const notes = group.map(w => extractNotes(w.Description));
            description += notes.sort((a, b) => b.length - a.length)[0];
            description += '\r\n\r\n';

            const nonNotes = group.map(w => `**${w.WordList.Name}**\r\n\r\n${extractNonNotes(w.Description)}`);
            description += nonNotes.join('\r\n\r\n-------------------------\r\n\r\n');

            word.Description = description;
            return word;
        }
    });

    const xml = generateXml(prolog ?? '', newList);
    fs.writeFileSync(options.name + '.xml', xml, 'utf8');

    console.log('Done.');
}

function extractNotes(description: string) : string {
    // split description by line
    const lines = description.split(/\r\n|\r|\n/);
    // return lines that start with a <
    return lines.filter(l => l.startsWith('<')).join('\r\n').trim();
}

function extractNonNotes(description: string) : string {
    // split description by line
    const lines = description.split(/\r\n|\r|\n/);
    // return lines that don't start with a <
    return lines.filter(l => !l.startsWith('<')).join('\r\n').trim();
}