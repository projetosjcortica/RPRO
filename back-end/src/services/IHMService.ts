import { Client, FileType as FTPFileType } from 'basic-ftp';
import * as path from 'path';
import * as fs from 'fs';
import backupService from './backupService';
import { computeHashSync } from '../utils/hash';
