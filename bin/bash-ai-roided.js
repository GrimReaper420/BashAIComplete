#!/usr/bin/env node

await import('../dist/app.js')
        .then(mod => mod.run());