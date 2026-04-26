const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

// -------------------------- 配置项 --------------------------
const SITE_INFO = {
  name: "fqzlr",
  url: "https://fqzlr.com/",
  avatar: "https://q1.qlogo.cn/g?b=qq&nk=20447289&s=640",
  desc: "坐而言不如起而行."
};

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../../src/config/friendsConfig.ts');
// -------------------------------------------------------------

// 从 Issue 中提取表单数据（修复版）
function parseIssueBody(body) {
  const data = {};
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || '';

    if (line.includes('网站名称') || line.includes('站点名称')) {
      data.site_name = lines[i + 1]?.trim() || '';
    }
    else if (line.includes('网站链接') || line.includes('站点链接')) {
      data.site_url = lines[i + 1]?.trim() || '';
    }
    else if (line.includes('友链页面') || line.includes('友链地址')) {
      data.friend_page_url = lines[i + 1]?.trim() || '';
    }
    else if (line.includes('网站描述') || line.includes('站点描述')) {
      data.site_desc = lines[i + 1]?.trim() || '';
    }
    else if (line.includes('头像') || line.includes('图标')) {
      data.site_avatar = lines[i + 1]?.trim() || '';
    }
    else if (line.includes('标签')) {
      data.site_tag = lines[i + 1]?.trim() || 'Blog';
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
    console.error("❌ 表单信息不完整");
    process.exit(1);
  }

  const isValid = await validateFriendLink(formData.friend_page_url);
  if (!isValid) {
    console.error('❌ 友链验证失败');
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