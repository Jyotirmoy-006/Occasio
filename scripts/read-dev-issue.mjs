import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  const issueText = await page.evaluate(async () => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return { error: 'No portal' };
    const btn = portal.shadowRoot.querySelector('[data-issues-open]');
    if (btn) {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    await new Promise(r => setTimeout(r, 600));
    const root = portal.shadowRoot;
    const items = [];
    for (const child of root.querySelectorAll('*')) {
      if (child.tagName !== 'STYLE' && child.children.length === 0 && child.textContent.trim()) {
        items.push({
          tag: child.tagName,
          text: child.textContent.trim(),
          classes: child.className,
          id: child.id
        });
      }
    }
    return items;
  });

  console.log('Issue output:\n', issueText);
  await browser.close();
}

main().catch(console.error);
