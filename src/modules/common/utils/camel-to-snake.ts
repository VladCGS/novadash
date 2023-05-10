export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const nameOfConstToString = (obj: any) =>
  Object.keys({obj})[0]
