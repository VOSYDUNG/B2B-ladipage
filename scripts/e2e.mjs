import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server = spawn('npm', ['run', 'preview'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

const baseUrl = 'http://127.0.0.1:4173';

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Preview server did not start.');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 390, height: 844, name: 'mobile' },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      heroHeight: document.querySelector('main > section')?.getBoundingClientRect().height ?? 0,
    }));

    if (metrics.documentWidth > metrics.viewportWidth + 1) {
      throw new Error(`${viewport.name}: horizontal overflow ${metrics.documentWidth} > ${metrics.viewportWidth}`);
    }
    if (viewport.name === 'desktop' && metrics.heroHeight > 800) {
      throw new Error(`desktop: hero is too tall (${metrics.heroHeight}px)`);
    }

    await page.getByRole('button', { name: /ĐĂNG KÝ MỞ LƯỢT QUAY/i }).click();
    await page.getByRole('dialog').waitFor();
    await page.getByLabel('Họ và tên').fill('UAT Tester');
    await page.getByLabel('Số điện thoại').fill('020 9999 9999');
    await page.getByLabel('Tên cơ sở').fill('Nhà thuốc UAT');
    await page.getByText('Tôi đồng ý để NNC liên hệ về chương trình này.').click();
    await page.getByRole('button', { name: /TIẾP TỤC XEM CHÍNH SÁCH/i }).click();
    await page.getByRole('heading', { name: /Chọn bậc doanh số mục tiêu/i }).waitFor();
    await page.close();
  }

  console.log('E2E smoke checks passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
