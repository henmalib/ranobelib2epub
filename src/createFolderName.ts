export const createFolderName = (title: string) => {
  let result = title;

  result = result.replaceAll(/\s/g, '');
  for (const symbol of '()[]-"\'`*'.split('')) {
    result = result.replaceAll(symbol, '');
  }

  return result;
};
