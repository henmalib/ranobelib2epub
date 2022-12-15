## Build
* clone repo using `git` or download .zip
* `npm install`
* `npm run build`

## Start
### ! You should have [pandoc](https://pandoc.org/installing.html) installed and added to your PATH
* npm run start *Link to ranobe*
  * Example: npm run start https://ranobelib.me/omniscient-readers-viewpoint-novel?section=info

## Result
#### All files you can find inside `chapters` folder
##### `chapters/ranobeName/ranobeName.epub` <- You'r book
##### `chapters/ranobeName/cover.jpg` <- Book cover 
##### `chapters/ranobeName/result.txt` <- Book without formatting 
##### `chapters/ranobeName/anything.txt` <- Chapter 


## Config
### `headless` - true if you DON'T want to see chromium window while working
### `executablePath` - Path to [chromium](https://download-chromium.appspot.com/) executable file