const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:5173/');
  
  console.log('Page loaded. Waiting for entry button...');
  await page.waitForSelector('.entry-btn', { timeout: 5000 });
  
  console.log('Clicking entry button...');
  await page.click('.entry-btn');
  
  console.log('Waiting 5 seconds...');
  await page.waitForTimeout(5000);
  
  // Check if yt-player exists
  const hasIframe = await page.evaluate(() => {
    return document.querySelector('iframe#yt-player') !== null;
  });
  console.log('Has YouTube iframe?', hasIframe);
  
  // Check player state
  const playerState = await page.evaluate(() => {
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
       if (document.querySelector('.spinner')) return 'Loading (Spinner)';
       return playBtn.innerHTML.includes('Pause') || playBtn.innerHTML.includes('line') ? 'Playing' : 'Paused';
    }
    return 'Play button not found';
  });
  console.log('Player State from UI:', playerState);
  
  await browser.close();
})();
