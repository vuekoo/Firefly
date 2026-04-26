const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { context } = require('@actions/github');

const token = process.env.GITHUB_TOKEN;
const repo = context.repo;
const MY_URL = "https://你的域名.com";
const FRIEND_FILE = path.resolve(__dirname, "../../src/data/friends.ts");

async function run() {
  const ts = fs.readFileSync(FRIEND_FILE, "utf8");
  const regex = /issue_id:\s*(\d+).*?siteurl:\s*"(.+?)"/gs;
  let m;

  const browser = await chromium.launch({ headless: true });

  while ((m = regex.exec(ts)) !== null) {
    const issueId = m[1];
    const url = m[2];
    let ok = false;

    try {
      const page = await browser.newPage();
      await page.goto(url, { timeout: 12000 });
      const content = await page.content();
      ok = content.includes(MY_URL);
      await page.close();
    } catch (e) {}

    if (!ok) {
      await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/issues/${issueId}/comments`, {
        method: "POST",
        headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body: "⚠️ 巡检发现你的友链已失效，请检查。" })
      });
    }
  }

  await browser.close();
}

run().catch(console.log);