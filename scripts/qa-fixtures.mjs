// Temporary deliberately corrupt files for tests/browser-check.html. Never publish.
import {mkdirSync,writeFileSync,unlinkSync,existsSync,rmdirSync} from 'node:fs';
import {resolve,sep} from 'node:path';
const root=resolve('public/assets'),dir=resolve(root,'qa-local');
if(!dir.startsWith(root+sep))throw Error('Fixture path outside assets');
const files=['corrupt.png','corrupt.wav'].map(name=>resolve(dir,name));
if(process.argv[2]==='clean'){
 for(const file of files)if(existsSync(file))unlinkSync(file);
 if(existsSync(dir))rmdirSync(dir); // Only an empty directory; never recursively delete.
}else{
 mkdirSync(dir,{recursive:true});for(const file of files)writeFileSync(file,'Deliberately invalid QA fixture');
}
