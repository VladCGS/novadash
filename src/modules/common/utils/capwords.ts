export const capwords = (str: string) =>
  str.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
