const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  KeyE: false,
  KeyQ: false
};

const prevKeys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  KeyE: false,
  KeyQ: false
};

let initialized = false;

export function useWASD() {
  if (!initialized) {
    window.addEventListener('keydown', (e) => {
      if (e.code in keys) keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code in keys) keys[e.code] = false;
    });

    initialized = true;
  }

  const edges = {};
  for (let code in keys) {
    edges[code] = keys[code] && !prevKeys[code];
    prevKeys[code] = keys[code]; 
  }

  return { keys, edges };

}