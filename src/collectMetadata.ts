import { Page } from 'puppeteer';

interface MetadataAuthor {
  type: 'artist' | 'author';
  name: string;
}

export interface Metadata {
  year: string;
  creator: MetadataAuthor[];
  chapters: number;
  publisher: string;
  coverUrl: string;
  title: string;
}

type ParseFunc<T> = (side: Element, title: string) => T | undefined;

const collectMetadataEvaluate = async (counterSelector: string) => {
  // TODO: A huge refactor
  const loadedChapters: ParseFunc<number> = (side, title) => {
    if (title === 'Загружено глав') {
      const count = (
        side.querySelector('.media-info-list__value')! as HTMLSpanElement
      ).innerText;

      return count ? +count : 0;
    }
  };

  const yearOfRealize: ParseFunc<string> = (side, title) => {
    if (title === 'Год релиза') {
      const year = (
        side.querySelector('.media-info-list__value')! as HTMLSpanElement
      ).innerText;

      return year;
    }
  };
  const authors: ParseFunc<MetadataAuthor[]> = (side, title) => {
    if (title === 'Автор') {
      const authors = side.querySelectorAll(
        '.media-info-list__value a'
      )! as NodeListOf<HTMLAreaElement>;

      return [...authors].map(author => ({
        name: author.innerText,
        type: 'author'
      }));
    }

    return [];
  };
  const artist: ParseFunc<MetadataAuthor[]> = (side, title) => {
    if (title === 'Художник') {
      const artists = side.querySelectorAll(
        '.media-info-list__value a'
      )! as NodeListOf<HTMLAreaElement>;

      return [...artists].map(artist => ({
        name: artist.innerText,
        type: 'artist'
      }));
    }

    return [];
  };

  const publisher: ParseFunc<string> = (side, title) => {
    if (title === 'Издательство') {
      const publishers = side.querySelectorAll(
        '.media-info-list__value a'
      )! as NodeListOf<HTMLAreaElement>;

      return [...publishers].map(p => p.innerHTML).join(', ');
    }

    return '';
  };

  const sideInfo = document.querySelectorAll(counterSelector);
  // @ts-ignore
  const info: Metadata = {
    creator: [],
    title: (document.querySelector('.media-name__main') as HTMLSpanElement)!
      .innerText,
    coverUrl: (document.querySelector(
      '.media-sidebar__cover.paper img'
    ) as HTMLImageElement)!.src
  };

  for (const side of sideInfo) {
    const titleElement = side.querySelector(
      '.media-info-list__title'
    ) as HTMLSpanElement;

    const title = titleElement.innerText;

    info.chapters ??= await loadedChapters(side, title)!;
    info.year ??= await yearOfRealize(side, title)!;
    info.publisher ??= await publisher(side, title)!;

    for (const data of await Promise.all([
      authors(side, title)!,
      artist(side, title)!
    ])) {
      info.creator.push(...data);
    }
  }

  return info;
};

export const collectMetadata = async (page: Page): Promise<Metadata> => {
  const counterSelector = '.media-info-list.paper .media-info-list__item';
  await page.waitForSelector(counterSelector);

  const info: Metadata = await page.evaluate(
    collectMetadataEvaluate,
    counterSelector
  );

  return info;
};
