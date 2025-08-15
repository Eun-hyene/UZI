let naverMapsLoadingPromise = null;

export const loadNaverMaps = (clientId) => {
  if (typeof window !== 'undefined' && window.naver && window.naver.maps) {
    return Promise.resolve(window.naver.maps);
  }

  if (naverMapsLoadingPromise) {
    return naverMapsLoadingPromise;
  }

  naverMapsLoadingPromise = new Promise((resolve, reject) => {
    let done = false;
    const finishSuccess = (maps) => {
      if (done) return;
      done = true;
      clearTimeout(timeoutId);
      cleanup();
      resolve(maps);
    };
    const finishError = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timeoutId);
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    const prevAuthFailure = window.navermap_authFailure;
    const authFailureHandler = () => finishError(new Error('NAVER_MAPS_AUTH_FAILED'));
    const installAuthFailure = () => {
      try {
        window.navermap_authFailure = authFailureHandler;
      } catch {}
    };
    const cleanup = () => {
      try {
        // restore previous handler if any
        if (prevAuthFailure) {
          window.navermap_authFailure = prevAuthFailure;
        } else {
          try { delete window.navermap_authFailure; } catch {}
        }
      } catch {}
    };

    const timeoutId = setTimeout(() => finishError(new Error('NAVER_MAPS_LOAD_TIMEOUT')),
      12000);

    const existingScript = document.querySelector('script[data-navermap]');
    if (existingScript) {
      // If already loaded and available
      const maps = window?.naver?.maps;
      if (maps && typeof maps.Map === 'function' && typeof maps.LatLng === 'function') {
        return finishSuccess(maps);
      }
      // If script exists but API not available (e.g., wrong query param), replace it
      try { existingScript.parentNode && existingScript.parentNode.removeChild(existingScript); } catch {}
    }

    installAuthFailure();
    const script = document.createElement('script');
    // Per NAVER tutorial, use ncpKeyId query param for v3
    // Ref: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.defer = true;
    script.dataset.navermap = 'true';
    script.onload = () => {
      try {
        const maps = window?.naver?.maps;
        if (maps && typeof maps.Map === 'function' && typeof maps.LatLng === 'function') {
          finishSuccess(maps);
        } else {
          finishError(new Error('NAVER_MAPS_AUTH_FAILED'));
        }
      } catch (e) {
        finishError(e);
      }
    };
    script.onerror = finishError;
    document.head.appendChild(script);
  });

  return naverMapsLoadingPromise;
};

