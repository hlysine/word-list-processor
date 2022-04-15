// @ts-ignore
import commandLineArgs from 'command-line-args';
import merge, { mergeDefinitions } from './merge.js';
import shuffle, { shuffleDefinitions } from './shuffle.js';

console.log('word-list-processor');

const mainDefinitions = [
  { name: 'command', defaultOption: true }
]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || []

if (mainOptions.command === 'shuffle') {
  const shuffleOptions = commandLineArgs(shuffleDefinitions, { argv })

  console.log('Shuffling: ', shuffleOptions.file);

  await shuffle(shuffleOptions);
} else if (mainOptions.command === 'merge') {
  const mergeOptions = commandLineArgs(mergeDefinitions, { argv })

  console.log('Merging: ', mergeOptions.file);

  await merge(mergeOptions);
}