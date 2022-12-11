import { Page } from 'puppeteer';
import { generateEpubMetadata } from '../src/generateEpubMetadata';
import { collectMetadata, Metadata } from './../src/collectMetadata';

describe('Info collecting', () => {
  let page: Page;
  let metadata: Metadata;

  beforeAll(async () => {
    // @ts-ignore
    page = await globalThis.__BROWSER_GLOBAL__.newPage();
    await page.setViewport({
      width: 1200,
      height: 800
    });
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);
    await page.setCacheEnabled(true);
    await page.goto(
      'https://ranobelib.me/omniscient-readers-viewpoint-novel?section=chapters'
    );
  }, 100_000);

  it('should have right data', async () => {
    const coverUrl =
      'https://ranobelib.me/uploads/cover/omniscient-readers-viewpoint-novel/cover/N5x2PI83zwtG_250x350.jpg';
    const chapterCount = 550;
    const year = '2018';
    const title = 'Точка зрения Всеведущего читателя (Новелла)';

    const info = await collectMetadata(page);

    expect(info.coverUrl).toBe(coverUrl);
    expect(info.chapters).toBe(chapterCount);
    expect(info.year).toBe(year);
    expect(info.title).toBe(title);
    expect(info.creator[0]).toEqual({
      name: 'Sing-Shong',
      type: 'author'
    });
    expect(info.creator[1]).toEqual({
      name: 'BLACK BOX',
      type: 'artist'
    });
    expect(info.publisher).toContain('Munpia');
    expect(info.publisher).toContain('Webnovel');
    metadata = info;
  }, 500000);

  it('should generate right metadata for pandoc', () => {
    const string = generateEpubMetadata(
      {
        chapters: 550,
        coverUrl: 'https://cataas.com/cat/cute',
        creator: [],
        publisher: [],
        title: 'Cat Book',
        year: '2022'
      },
      'https://cataas.com/cat/cute'
    );

    expect(string).toBe(`
---
title:
  - type: main
    text: Cat Book
lang: ru
cover-image: https://cataas.com/cat/cute

---`);
  });
});
