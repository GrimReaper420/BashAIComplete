#!/usr/bin/env node

import process from 'node:process';

const current_working_directory = process.cwd();

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '../dist/logger.js';

const logger = new Logger(path.basename(import.meta.url));

// HANDLE PROCESS EVENTS

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
  unhandledRejections.delete(promise);
});

// process.on('beforeExit', (code) => {
//     logger.log('Process beforeExit event with code: ' + code);
//   });
  
process.on('exit', (code) => {
    logger.log('Process exit event with code: ' + code);

    if(unhandledRejections.size > 0) {
        logger.log('Unhandled Rejections Found!');
    }
});

// WORK ON INSTALLATION

const source_dir = path.join(current_working_directory, 'src/config');
const dest_dir = path.join(current_working_directory, 'dist/config');

copyDirectory(source_dir, dest_dir);

const install_setup_path = path.join(current_working_directory, 'dist/setup/install_setup.js')
await import(install_setup_path)
    .then(module => module.run())
    .catch(err => {
        logger.error('An error occured! Could not complete installation.');
        throw new Error(err);
    });

// FUNCTIONS

function copyDirectory(source_dir, dest_dir)
{
    if(!fs.existsSync(dest_dir))
        fs.mkdirSync(dest_dir, { recursive: false });
    
    const files = fs.readdirSync(source_dir);
    
    files.forEach(file => {
        const source_path = path.join(source_dir, file);
        const destination_path = path.join(dest_dir, file);
    
        if(fs.statSync(source_path).isDirectory())
            copyDirectory(source_path, destination_path);
        else
            fs.copyFileSync(source_path, destination_path);
    });

}