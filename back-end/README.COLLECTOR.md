Collector runner

This project exposes a small collector runner that can be started standalone or forked from Electron.

How to run (development):

- From the project root run the backend with node (built files expected in `dist`):

  node ./back-end/dist/src/index.js

- To run collector as a separate process (recommended when using Electron):

  node ./back-end/dist/src/collector/runner.js

IPC messages supported when forked:

- Parent -> child: { type: 'cmd', id, cmd, payload } will execute the registered command (same handlers as WebSocket bridge).
- Parent -> child: { type: 'stop' } will stop the collector runner and exit.

Electron integration:

- The Electron main process exposes `start-fork` to start the backend and `start-collector-fork` to start only the collector as a separate process. Both return the child's PID (and WebSocket port when starting full backend).

