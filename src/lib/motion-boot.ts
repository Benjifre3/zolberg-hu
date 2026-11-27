/**
 * A <head> inline szkriptje (prémium finomítás 6.): a festés előtt teszi fel a mozgás-osztályokat.
 *
 * - `motion`: van mozgás (nincs prefers-reduced-motion: reduce)
 * - `intro`: első látogatás a munkamenetben → teljes hero-belépő (5.1)
 * - `intro-short`: visszatérő látogató → csak a H1 és a ceruza (600 ms)
 *
 * Biztonsági háló: ha a motion.ts nem jelentkezik (`m-ok`) a DOMContentLoaded-ig vagy 1,5 s-ig,
 * minden osztály lekerül, és a tartalom azonnal látszik (5.4: nincs rejtett tartalom).
 *
 * A CSP (`public/_headers`) a szkriptet a sha256-hash-ével engedi. Ha a szöveg változik, a hash is
 * változik: a tests/unit/motion-boot.test.ts ezt ellenőrzi.
 */
import { createHash } from 'node:crypto';

export const MOTION_BOOT =
  "(function(){var d=document.documentElement,c=d.classList;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var s;try{s=sessionStorage.getItem('zb-intro');sessionStorage.setItem('zb-intro','1')}catch(e){}c.add('motion',s?'intro-short':'intro');function f(){c.contains('m-ok')||c.remove('motion','intro','intro-short')}addEventListener('DOMContentLoaded',function(){setTimeout(f)});setTimeout(f,1500)})()";

export const MOTION_BOOT_HASH = `sha256-${createHash('sha256').update(MOTION_BOOT).digest('base64')}`;
