export interface WordListFile {
    WordList: WordList;
}

export interface WordList {
    Name: string;
    Created: string;
    FlashcardMode: boolean;
    Entries: { WordEntry: WordEntry[] };
}

export interface WordEntry {
    Word: string;
    Url: string;
    Description: string;
    Created: string;
    LastModified: string;
    FlashcardFlipped: boolean;
}

export interface UniversalWord extends WordEntry {
    WordList: WordList;
}