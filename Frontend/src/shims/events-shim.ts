// Lightweight shim to provide a browser-friendly `events` replacement
// Some third-party CJS bundles expect `require('events').EventEmitter`.
// This shim re-exports EventEmitter from `eventemitter3` so Vite/Rollup
// will bundle a browser-compatible implementation instead of leaving
// `require('events')` calls in the final bundle.

import EventEmitter3 from 'eventemitter3';

// Named export used by modern imports: `import { EventEmitter } from 'events'`
export const EventEmitter = EventEmitter3;

// Default export provides `.EventEmitter` property similar to Node's `events` CJS API
export default { EventEmitter } as { EventEmitter: typeof EventEmitter3 };
