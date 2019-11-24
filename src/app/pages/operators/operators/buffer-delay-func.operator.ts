import {asyncScheduler, BehaviorSubject, MonoTypeOperatorFunction, Observable, Subscription, zip} from 'rxjs';
import {finalize, map, tap} from 'rxjs/operators';

export const bufferDelayFunc = <T>(time: number): MonoTypeOperatorFunction<T> => (source: Observable<T>): Observable<T> => {
  return new Observable<T>(observer => {
    const gate = new BehaviorSubject<void>(null);
    const gateOpen$ = gate.asObservable();
    let currTimeout: Subscription;
    return zip(source, gateOpen$)
      .pipe(
        tap(() => {
          currTimeout = asyncScheduler.schedule(() => gate.next(), time);
        }),
        map(([s]) => s),
        finalize(() => {
          if (currTimeout) {
            // clearTimeout(currTimeout);
            currTimeout.unsubscribe();
          }
        })
      ).subscribe({
        next(x) {
          observer.next(x);
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        }
      });
  });
};
