export interface IId {
  id: string;
}

export interface IToken {
  token: string;
}

export interface IListResult<T> {
  result: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  page: number;
  size: number;
  total: number;
  pages: number;
}
