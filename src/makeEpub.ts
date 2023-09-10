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
import { generateEpubMetadata } from './generateEpubMetadata';
import fetch from 'node-fetch';
import { chaptersPath } from './consts';

const generateFullFile = async (chapterDir: string) => {
  const chapterRegExp = /Глава\s*([\d.]+).+/;
  const volumeRegExp = /Том\s*([\d.]+).+/i;
  const volumes: string[][] = [];

  for (const file of readdirSync(chapterDir).filter(
    f => f.endsWith('.txt') && f !== 'result.txt'
  )) {
    const volume = +file.match(volumeRegExp)![1];

    volumes[volume] ||= [];
    volumes[volume].push(file);
  }

  for (let i = 0; i < volumes.length; i++) {
    if (!volumes[i]) continue;

    volumes[i].sort((a, b) => {
      const aChapter = +a.match(chapterRegExp)![1];
      const bChapter = +b.match(chapterRegExp)![1];

      return aChapter - bChapter;
    });
  }

  let result = '';

  for (const volume of volumes) {
    if (!volume) continue;

    for (const chapter of volume) {
      const page = readFileSync(path.join(chapterDir, chapter), 'utf-8');

      result += `\n\n# ${chapter.replace('.txt', '')} {epub:type=keywords}\n\n`;
      result += page;
    }
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
  const ranobePath = path.join(chaptersPath, createFolderName(metadata.title));
  const coverPath = path.join(ranobePath, 'cover.jpg');

  const epubMeta = generateEpubMetadata(metadata, coverPath);
  const file = await generateFullFile(ranobePath);
  const filePath = path.join(ranobePath, 'result.txt');

  writeFileSync(filePath, epubMeta + '\n' + file);
  console.log('Downloading cover...');
  await downloadCover(metadata.coverUrl, coverPath);
  await generateEpub(filePath, path.join(ranobePath, metadata.title + '.epub'));
};
