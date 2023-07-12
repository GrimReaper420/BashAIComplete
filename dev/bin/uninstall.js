#!/usr/bin/env node

import('../dist/setup/uninstall_setup.js')
    .then(mod => mod.run());