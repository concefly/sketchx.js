import type { Clipper2ZFactoryFunction, MainModule } from 'clipper2-wasm/dist/clipper2z';
// @ts-expect-error
import * as _Clipper2ZFactory from 'clipper2-wasm/dist/umd/clipper2z';

export type { Path64, Paths64, PathD, PathsD } from 'clipper2-wasm/dist/clipper2z';

const Clipper2ZFactory: Clipper2ZFactoryFunction = _Clipper2ZFactory;

/**
 * @see https://www.angusj.com/clipper2/Docs/Overview.htm
 */
export let Clipper2!: MainModule;

export const Clipper2ReadyPromise = Clipper2ZFactory({
  locateFile: () => 'https://cdn.jsdelivr.net/npm/clipper2-wasm@0.1.0/dist/umd/clipper2z.wasm',
}).then((m: MainModule) => {
  Clipper2 = m;
});
