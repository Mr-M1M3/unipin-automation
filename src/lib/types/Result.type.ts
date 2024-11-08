export type Result<T, E> = Ok<T> | Err<E>;
type Ok<T> = {
  result: "success";
  data: T;
};
type Err<E> = {
  result: "error";
  cause: string;
  original: E;
};