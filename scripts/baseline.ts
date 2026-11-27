/**
 * A jóváhagyott állapot (v1-approved címke) tesztadatos buildje az őrtesztekhez (POLISH_PLAN 1.).
 * Egy leválasztott git worktree-be építi, és a kimenetet a .baseline/dist mappába
 * teszi (git, lint, formázás és típusellenőrzés kihagyja). Ha a címke commitja nem
 * változott, nem épít újra.
 *
 *   pnpm baseline            → .baseline/dist
 *   pnpm baseline --force    → újraépítés
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync, cpSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const TAG = process.env['BASELINE_REF'] ?? 'v1-approved';
const ROOT = resolve('.baseline');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
const STAMP = join(DIST, '.ref');
const force = process.argv.includes('--force');
const win = process.platform === 'win32';

function run(cmd: string, args: string[], cwd = process.cwd()): string {
  const shell = win && cmd === 'pnpm';
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', shell, stdio: 'pipe' });
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    throw new Error(`${cmd} ${args.join(' ')} → ${r.status}`);
  }
  return r.stdout.trim();
}

const sha = run('git', ['rev-parse', `${TAG}^{commit}`]);
if (!force && existsSync(STAMP) && readFileSync(STAMP, 'utf8').trim() === sha) {
  console.log(`Baseline (${TAG} @ ${sha.slice(0, 7)}) naprakész: ${DIST}`);
  process.exit(0);
}

mkdirSync(ROOT, { recursive: true });
if (existsSync(SRC)) {
  spawnSync('git', ['worktree', 'remove', '--force', SRC]);
  rmSync(SRC, { recursive: true, force: true });
}
spawnSync('git', ['worktree', 'prune']);
run('git', ['worktree', 'add', '--detach', SRC, sha]);
console.log(`Worktree: ${SRC} (${TAG} @ ${sha.slice(0, 7)})`);

run('pnpm', ['install', '--frozen-lockfile', '--prefer-offline'], SRC);
run('pnpm', ['build:fixture'], SRC);

rmSync(DIST, { recursive: true, force: true });
cpSync(join(SRC, 'dist'), DIST, { recursive: true });
writeFileSync(STAMP, `${sha}\n`);
spawnSync('git', ['worktree', 'remove', '--force', SRC]);
console.log(`Baseline kész: ${DIST}`);
