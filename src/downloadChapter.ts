import path from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { Page } from 'puppeteer';
import { Chapter } from './getChapters';
import config from './config';

export const downloadChapter = async (
  page: Page,
  referer: string,
  chapter: Chapter,
  folder: string
) => {
  await page.goto(chapter.url, {
    referer
  });
  const contentSelector = '.reader-container.container.container_center p';
  await page.waitForSelector(contentSelector, {
    timeout: 2_147_483_600
  });

  const content = await page.evaluate(contentSelector => {
    const paragraph = document.querySelectorAll(
      contentSelector
    ) as NodeListOf<HTMLParagraphElement>;

    return [...paragraph].map(p => p.outerHTML);
  }, contentSelector);

  const folderPath = path.join(config.chaptersDir, folder);
  mkdirSync(folderPath, { recursive: true });
  writeFileSync(
    path.join(folderPath, chapter.title + '.txt'),
    content.join('\n')
  );
};
