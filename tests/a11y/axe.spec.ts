import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from '../pages.ts';
import { VIEWPORTS } from '../../playwright.config.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

for (const { path, name } of PAGES) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    test(`axe: ${name} @ ${vpName}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const summary = results.violations.map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} – ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      );
      expect(summary).toEqual([]);
    });
  }
}
