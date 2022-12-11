import { Page } from 'puppeteer';

export interface Chapter {
  url: string;
  title: string;
}

export const collectChapters = async (
  page: Page,
  ranobeUrl: string,
  chaptersCount: number
): Promise<Chapter[]> => {
  await page.goto(ranobeUrl + '?section=chapters');

  const links = new Set<string>();
  console.log('Chapters count: ', chaptersCount);
  console.log('Collecting chapters urls...');

  while ([...links].length !== chaptersCount) {
    const chapters = await page.evaluate(() => {
      const chapterSelector = '.media-chapter__name.text-truncate a';
      const chapters = document.querySelectorAll(
        chapterSelector
      ) as NodeListOf<HTMLAreaElement>;
      const links: Chapter[] = [];

      for (const chapter of chapters) {
        links.push({
          title: chapter.innerText,
          url: chapter.href
        });
      }

      window.scrollBy(0, 5);
      return links;
    });

    chapters.map(v => JSON.stringify(v)).forEach(v => links.add(v));
  }

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });

  return [...links].map(v => JSON.parse(v)).reverse();
};
