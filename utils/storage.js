import { promises as fs } from 'fs';
import path from 'path';

const locks = new Map();
const wait = (ms)=>new Promise(r=>setTimeout(r,ms));

export async function atomicUpdate(jsonPath, updater){
  const abs = path.resolve(jsonPath);
  while (locks.get(abs)) await wait(5);
  locks.set(abs, true);
  try {
    let data = {};
    try { const raw = await fs.readFile(abs, 'utf8'); data = raw.trim()?JSON.parse(raw):{}; }
    catch(e){ if(e.code!=='ENOENT') throw e; data={}; }
    const updated = await updater(data);
    await fs.mkdir(path.dirname(abs), { recursive:true });
    await fs.writeFile(abs, JSON.stringify(updated, null, 2));
    return updated;
  } finally { locks.delete(abs); }
}

export async function readJson(jsonPath, fallback={}){
  try { const raw = await fs.readFile(path.resolve(jsonPath), 'utf8'); return raw.trim()?JSON.parse(raw):fallback; }
  catch(e){ if(e.code==='ENOENT') return fallback; throw e; }
}