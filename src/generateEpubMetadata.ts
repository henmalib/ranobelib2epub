import { Metadata } from './collectMetadata';
import { stringify } from 'yaml';

export const generateEpubMetadata = (metadata: Metadata, coverPath: string) => {
  const obj = {
    title: [
      {
        type: 'main',
        text: metadata.title
      }
    ],
    creator: metadata.creator.length
      ? metadata.creator.map(creator => ({
          role: creator.type,
          text: creator.name
        }))
      : undefined,
    publisher: metadata.publisher.length ? metadata.publisher : undefined,
    lang: 'ru',
    'cover-image': coverPath
  };

  return `
---
${stringify(obj)}
---`;
};
