const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../../src/config/friendsConfig.ts');
const TIMEOUT_MS = 15000;

function parseFriendsConfig(content) {
  const start = content.indexOf('export const friendsConfig');
  const arrayStart = content.indexOf('[', start);
  const arrayEnd = content.lastIndexOf(']');
  if (arrayStart === -1 || arrayEnd === -1) return [];

  const arrayBody = content.slice(arrayStart + 1, arrayEnd);
  const friendBlocks = [...arrayBody.matchAll(/{([\s\S]*?)}\s*,?/g)].map((match) => match[1]);
  const friends = [];

  for (const block of friendBlocks) {
    const friend = {};
    const lines = block.split(/\n|,/).map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      const pairMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.+)$/);
      if (!pairMatch) continue;
      const key = pairMatch[1];
      let value = pairMatch[2].trim();
      if (value.endsWith(',')) value = value.slice(0, -1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"');
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else if (/^\d+$/.test(value)) {
        value = Number(value);
      }
      friend[key] = value;
    }

    if (friend.title && friend.siteurl) {
      friends.push(friend);
    }
  }

  return friends;
}

async function pingSite(url) {
  try {
    new URL(url);
  } catch {
    return { ok: false, error: `Invalid URL: ${url}` };
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Upgrade-Insecure-Requests': '1',
  };

  async function fetchWithTimeout() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  try {
    let response = await fetchWithTimeout();
    if ([403, 502, 503, 504].includes(response.status)) {
      response = await fetchWithTimeout();
    }
    return { ok: response.ok, status: response.status, url };
  } catch (error) {
    return { ok: false, error: error.message, url };
  }
}

async function main() {
  if (!fs.existsSync(FRIENDS_CONFIG_PATH)) {
    console.error(`❌ 无法找到友链配置文件：${FRIENDS_CONFIG_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(FRIENDS_CONFIG_PATH, 'utf8');
  const friends = parseFriendsConfig(content);
  if (!friends.length) {
    console.log('✅ 未发现有效友链配置，无需巡检');
    return;
  }

  const enabledFriends = friends.filter((item) => item.enabled !== false);
  if (!enabledFriends.length) {
    console.log('✅ 所有友链均已禁用，无需巡检');
    return;
  }

  console.log(`开始巡检 ${enabledFriends.length} 条友链...`);
  const results = await Promise.all(enabledFriends.map((friend) => pingSite(friend.siteurl)));

  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    console.error('❌ 以下友链检查失败：');
    for (const item of failed) {
      console.error(`- ${item.url} ${item.status ? `(HTTP ${item.status})` : ''} ${item.error || ''}`);
    }
    process.exit(1);
  }

  console.log('✅ 友链巡检通过，所有启用友链站点可访问');
}

main().catch((error) => {
  console.error('❌ 巡检脚本执行失败：', error);
  process.exit(1);
});
