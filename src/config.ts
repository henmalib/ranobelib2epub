import { mkdirSync, readFileSync } from 'fs';
import path from 'path';

const chaptersDir = path.join(__dirname, '..', 'chapters');

mkdirSync(chaptersDir, {
  recursive: true
});

const defaultConfig = {
  chaptersDir,
  executablePath: '/usr/bin/chromium',
  headless: true
};

const generateConfig = (): typeof defaultConfig => {
  try {
    const config = readFileSync(
      path.join(__dirname, '..', 'config.json'),
      'utf8'
    );

    return {
      ...defaultConfig,
      ...JSON.parse(config)
    };
  } catch {
    console.error("config.json doesn't exist. Using default values");
    return defaultConfig;
  }
};

export default generateConfig();
