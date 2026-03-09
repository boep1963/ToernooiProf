const BASE_PATH = process.env.__NEXT_ROUTER_BASEPATH || '/toernooiprof';

/** Navigeer via window.location met basePath prefix */
export function navigateTo(path: string) {
  window.location.href = `${BASE_PATH}${path}`;
}
