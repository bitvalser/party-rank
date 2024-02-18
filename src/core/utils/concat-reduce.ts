import { Observable, ObservableInputTuple, concat } from 'rxjs';
import { map, reduce } from 'rxjs/operators';

export const concatReduce = <T extends readonly unknown[]>(
  ...inputs: [...ObservableInputTuple<T>]
): Observable<T[number][]> => concat(...inputs).pipe(reduce((acc, data) => acc.concat(data), []));
