import { Clipper2ReadyPromise } from './extension/clipper2';
import { OCCReadyPromise } from './extension/occ';

export async function loadExtension() {
  await Promise.all([Clipper2ReadyPromise, OCCReadyPromise]);
}
