import { createFolderName } from './createFolderName';
import {
  createWriteStream,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { Metadata } from './collectMetadata';
import config from './config';
import { generateEpubMetadata } from './generateEpubMetadata';
import fetch from 'node-fetch';

const generateFullFile = async (chapterDir: string) => {
  const regexp = /Глава\s*([\d.]+).+/;
  const chapters = readdirSync(chapterDir)
    .filter(v => regexp.test(v))
    .sort((a, b) => {
      const aNum = +a.match(regexp)![1];
      const bNum = +b.match(regexp)![1];

      return aNum - bNum;
    });

  let result = '';

  for (const chapter of chapters) {
    const page = readFileSync(path.join(chapterDir, chapter), 'utf-8');

    result += `\n\n# ${chapter.replace('.txt', '')} {epub:type=keywords}\n\n`;
    result += page;
  }

  return result;
};

const generateEpub = async (inputName: string, outputName: string) => {
  return await new Promise((resolve, reject) => {
    const pandoc = spawn('pandoc', ['-o', outputName, inputName]);

    pandoc.stdout.on('data', data => console.log('Data: ', data.toString()));
    pandoc.stderr.on('data', error => reject(error.toString()));

    pandoc.on('close', resolve);
  });
};

const downloadCover = async (coverUrl: string, pathToSave: string) => {
  return await new Promise(async (resolve, reject) => {
    const data = await fetch(coverUrl);
    const fileStream = createWriteStream(pathToSave);
    data.body?.pipe(fileStream);

    data.body!.on('error', err => {
      reject(err);
    });
    fileStream.on('finish', () => {
      resolve('');
    });
  });
};

export const makeEpub = async (metadata: Metadata) => {
  const ranobePath = path.join(
    config.chaptersDir,
    createFolderName(metadata.title)
  );
  const coverPath = path.join(ranobePath, 'cover.jpg');

  const epubMeta = generateEpubMetadata(metadata, coverPath);
  const file = await generateFullFile(ranobePath);
  const filePath = path.join(ranobePath, 'result.txt');

  writeFileSync(filePath, epubMeta + '\n' + file);
  console.log('Downloading cover...');
  await downloadCover(metadata.coverUrl, coverPath);
  await generateEpub(filePath, path.join(ranobePath, metadata.title + '.epub'));
};
