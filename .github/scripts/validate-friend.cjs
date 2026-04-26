const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

// -------------------------- 配置项（已改成你的真实信息） --------------------------
const SITE_INFO = {
  name: "fqzlr",
  url: "https://fqzlr.com/",
  avatar: "https://q1.qlogo.cn/g?b=qq&nk=20447289&s=640",
  desc: "坐而言不如起而行."
};

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../../src/config/friendsConfig.ts');
// -------------------------------------------------------------

// 【通用解析器】不依赖固定标题，直接按常见键名匹配
function parseIssueBody(body) {
  const data = {
    site_name: '',
    site_url: '',
    friend_page_url: '',
    site_desc: '',
    site_avatar: '',
    site_tag: 'Blog'
  };

  // 匹配各种可能的键名
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue;

    // 网站名称/站点名称
    if (/名称|标题/.test(trimmed) && /[:：]/.test(trimmed)) {
      const [_, value] = trimmed.split(/[:：]/);
      if (value?.trim()) data.site_name = value.trim();
    }
    // 网站链接/站点链接
    else if (/链接|网址|地址/.test(trimmed) && /[:：]/.test(trimmed)) {
      const [_, value] = trimmed.split(/[:：]/);
      if (value?.trim()) {
        const url = value.trim();
        if (url.startsWith('http')) data.site_url = url;
      }
    }
    // 友链页面
    else if (/友链/.test(trimmed) && /[:：]/.test(trimmed)) {
      const [_, value] = trimmed.split(/[:：]/);
      if (value?.trim()) {
        const url = value.trim();
        if (url.startsWith('http')) data.friend_page_url = url;
      }
    }
    // 描述
    else if (/描述|简介/.test(trimmed) && /[:：]/.test(trimmed)) {
      const [_, value] = trimmed.split(/[:：]/);
      if (value?.trim()) data.site_desc = value.trim();
    }
    // 头像
    else if (/头像|图标/.test(trimmed) && /[:：]/.test(trimmed)) {
      const [_, value] = trimmed.split(/[:：]/);
      if (value?.trim()) {
        const url = value.trim();
        if (url.startsWith('http')) data.site_avatar = url;
      }
    }
    // 标签
    else if (/标签|分类/.test(trimmed) && /[:：]/.test(trimmed)) {
      const [_, value] = trimmed.split(/[:：]/);
      if (value?.trim()) data.site_tag = value.trim();
    }
  }

  console.log("📋 解析结果：", data);
  return data;
}

// 验证友链
async function validateFriendLink(pageUrl) {
  if (!pageUrl) {
    console.error("❌ 友链页面地址为空");
    return false;
  }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(pageUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
    const hasLink = await page.evaluate((site) => {
      return document.body.innerText.includes(site.name) || document.body.innerHTML.includes(site.url);
    }, SITE_INFO);

    await browser.close();
    return hasLink;
  } catch (error) {
    await browser.close();
    console.error('页面访问失败:', error.message);
    return false;
  }
}

// 更新友链配置
function updateFriendsConfig(data, issueId) {
  if (!data.site_name || !data.site_url) {
    console.error("❌ 站点名称或链接不能为空，无法添加");
    return false;
  }

  const configContent = fs.readFileSync(FRIENDS_CONFIG_PATH, 'utf8');
  const newFriend = `  {
    title: "${data.site_name}",
    imgurl: "${data.site_avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.site_name)}`}",
    desc: "${data.site_desc}",
    siteurl: "${data.site_url}",
    tags: ["${data.site_tag}"],
    weight: 5,
    enabled: true,
    issue_id: ${issueId},
  },`;

  const updatedContent = configContent.replace(
    /export const friendsConfig: FriendLink\[\] = \[([\s\S]*?)\];/,
    (_match, list) => {
      return `export const friendsConfig: FriendLink[] = [${list}${newFriend}\n];`;
    }
  );

  fs.writeFileSync(FRIENDS_CONFIG_PATH, updatedContent, 'utf8');
  console.log('✅ 友链配置已更新');
  return true;
}

// 主函数
async function main() {
  const issueId = process.env.ISSUE_ID;
  const issueBody = process.env.GITHUB_EVENT_ISSUE_BODY || '';

  if (!issueBody) {
    console.error('❌ 未获取到 Issue 内容');
    process.exit(1);
  }

  const formData = parseIssueBody(issueBody);

  // 检查必填项
  if (!formData.site_name || !formData.site_url || !formData.friend_page_url) {
    console.error("❌ 表单信息不完整，请确保填写了名称、链接和友链页面地址");
    process.exit(1);
  }

  const isValid = await validateFriendLink(formData.friend_page_url);
  if (!isValid) {
    console.error('❌ 友链验证失败，未找到本站信息');
    process.exit(1);
  }

  const success = updateFriendsConfig(formData, issueId);
  if (!success) process.exit(1);

  console.log("✅ 全部成功");
  process.exit(0);
}

main().catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});