import {fakeAsync, tick} from "@angular/core/testing";
import {marbles} from "rxjs-marbles/jasmine";
import {asyncScheduler, from, interval} from "rxjs";
import {take} from 'rxjs/operators';
import {customMap1} from './custom-map1.operator';
import createSpy = jasmine.createSpy;

describe('testing existing operators', () => {
  // fit('maps values to power two', () => {
  it('should test with done callback customMap1 (v) => v*v', (done: DoneFn) => {
    const source$ = from([1, 2, 3, 4, 5], asyncScheduler);
    const result$ = source$.pipe(customMap1(v => v * v));
    const expectedValues = [1, 4, 9, 16, 25];

    const spy = createSpy('mapSpy');

    result$.subscribe({
      next: spy,
      complete: () => {
        expect(spy).toHaveBeenCalledTimes(5);
        expectedValues.forEach(v => {
          expect(spy).toHaveBeenCalledWith(v);
        });
        done();
      },
      error: () => {
        done.fail();
      }
    });

    done();
  });

  it('should work with fakeAsync', fakeAsync(() => {
    // GIVEN (ARRANGE)
    const source$ = interval(1000).pipe(take(5));
    const expectedValues = [0, 1, 4, 9, 16];
    const spy = createSpy('mapSpy');

    // WHEN (ACT)
    const result$ = source$.pipe(customMap1(v => v * v));
    result$.subscribe(spy);

    // THEN (ASSERT)
    expect(spy).toHaveBeenCalledTimes(0);
    for (let i = 0; i < 5; i ++ ) {
      tick(1000);
      expect(spy).toHaveBeenCalledTimes(i + 1);
      expect(spy).toHaveBeenCalledWith(expectedValues[i]);
    }
  }));
  //
  it('should work with marbles', marbles((m) => {
    const s = '-1--2--3--4--5|';
    const e = '-x--y--z--w--q|';

    const source$ = m.cold(s);
    const result$ = source$.pipe(customMap1(v => v * v));
    const expected$ = m.cold(e, {x: 1, y: 4, z: 9, w: 16, q: 25});

    m.expect(result$).toBeObservable(expected$);
  }));
  // });
});
