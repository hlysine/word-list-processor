import * as fs from 'node:fs';
import { WordListFile } from './models.js';
import { encodeXml, glob, parseXml } from './utils.js';

export const exportDefinitions = [{ name: 'file', alias: 'f', type: String, multiple: true, defaultOption: true }];

export interface ExportOptions {
  file: string[];
}

export default async function exportCmd(options: ExportOptions): Promise<void> {
  const files = (await Promise.all(options.file.map(g => glob(g)))).flat();

  console.log('Found ' + files.length + ' files.');

  if (files.length === 0) {
    console.log('No files found. Exiting.');
    return;
  }

  files.forEach(file => {
    console.log('Processing: ' + file);
    const xmlString = fs.readFileSync(file, 'utf8');

    const [_, wordList] = parseXml<WordListFile>(xmlString);

    const xmlContent = `<SuperMemoCollection>
  <Count>${wordList.WordList.Entries.WordEntry.length + 1}</Count>
  <SuperMemoElement>
    <ID>1</ID>
    <Title>${wordList.WordList.Name}</Title>
    <Type>Concept</Type>
    ${wordList.WordList.Entries.WordEntry.map(
      (entry, idx) => `<SuperMemoElement>
        <ID>${idx + 2}</ID>
        <Type>Item</Type>
        <Content>
          <Question>&lt;A href="${encodeXml(entry.Url)}"&gt;${encodeXml(entry.Word)}&lt;/A&gt;</Question>
          <Answer>${encodeXml(entry.Description.trim().replace(/^</, '>'))}</Answer>
        </Content>
        <LearningData>
          <Interval>3</Interval>
          <Repetitions>1</Repetitions>
          <Lapses>0</Lapses>
          <LastRepetition>04.12.2022</LastRepetition>
          <AFactor>3.920</AFactor>
          <UFactor>3.000</UFactor>
          <RepHist>Item #${idx + 2}: ${encodeXml(
        entry.Word
      )}&amp;lt;br&amp;gt;ElNo=2 Rep=1 Laps=0 Date=04.12.2022 Hour=10.409 Int=0 Grade=8 Priority=0 expFI=99</RepHist>
        </LearningData>
      </SuperMemoElement>
`
    ).join('')}
  </SuperMemoElement>
</SuperMemoCollection>
`;

    // remove file extension
    const newFile = file.substring(0, file.lastIndexOf('.')) + '.exported.xml';
    fs.writeFileSync(newFile, xmlContent, 'utf8');
  });

  console.log('Done.');
}
