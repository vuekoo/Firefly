const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { context } = require('@actions/github');

const token = process.env.GITHUB_TOKEN;
const repo = context.repo;

// ==============================================
// 👇 你只需要改这里！改成你自己的信息
// ==============================================
const MY_NAME = "你的博客名称";
const MY_URL = "https://你的域名.com";
const FRIEND_FILE = path.resolve(__dirname, "../../src/data/friends.ts");

async function run() {
  const issue = context.payload.issue;
  const body = issue.body;

  const name = body.match(/### 网站名称\s*\n\s*(.+)/)?.[1];
  const url = body.match(/### 网站首页地址\s*\n\s*(.+)/)?.[1];
  const friendPage = body.match(/### 你的友链页面地址\s*\n\s*(.+)/)?.[1];
  const avatar = body.match(/### 网站头像\s*\n\s*(.+)/)?.[1];
  const desc = body.match(/### 网站描述\s*\n\s*(.+)/)?.[1];

  if (!name || !url || !friendPage || !avatar || !desc) {
    await comment("❌ 申请信息不完整，请完整填写表单。");
    await addLabel("needs-update");
    return;
  }

  // 开始校验
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: "Mozilla/5.0" });
  let found = false;

  try {
    await page.goto(friendPage, { timeout: 12000 });
    const content = await page.content();
    found = content.includes(MY_NAME) && content.includes(MY_URL);
  } catch (e) {}

  await browser.close();

  if (!found) {
    await comment(`❌ 未在你的友链页面找到【${MY_NAME}】(${MY_URL})，请添加后重试。`);
    await addLabel("needs-update");
    return;
  }

  // 读取当前友链列表
  let ts = fs.readFileSync(FRIEND_FILE, "utf8");
  const match = ts.match(/id:\s*(\d+)/g);
  const lastId = match ? Math.max(...match.map(m => parseInt(m.match(/\d+/)[0]))) : 1;
  const newId = lastId + 1;

  // 生成新友链
  const newFriend = `
	{
		id: ${newId},
		title: "${name.replace(/"/g, '')}",
		imgurl: "${avatar}",
		desc: "${desc.replace(/"/g, '')}",
		siteurl: "${url}",
		tags: ["Friend"],
		issue_id: ${issue.number},
	},`;

  // 写入文件
  const insertPos = ts.lastIndexOf("// 👇 下面会被 GitHub Actions 自动写入新的友链");
  const endPos = ts.indexOf("\n", insertPos);
  const newTs = ts.slice(0, endPos + 1) + newFriend + ts.slice(endPos + 1);
  fs.writeFileSync(FRIEND_FILE, newTs);

  // 提交代码
  await commitAndPush(`✅ 友链 ${name} 已自动添加`);

  await comment(`✅ 友链校验通过，已自动添加到友链页面！`);
  await closeIssue();
}

// 工具函数
async function comment(msg) {
  await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/issues/${context.payload.issue.number}/comments`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ body: msg })
  });
}

async function addLabel(l) {
  await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/issues/${context.payload.issue.number}/labels`, {
    method: "POST",
    headers: { Authorization: `token ${token}` },
    body: JSON.stringify({ labels: [l] })
  });
}

async function closeIssue() {
  await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/issues/${context.payload.issue.number}`, {
    method: "PATCH",
    headers: { Authorization: `token ${token}` },
    body: JSON.stringify({ state: "closed" })
  });
}

async function commitAndPush(msg) {
  const { execSync } = require("child_process");
  execSync(`git config --global user.name "bot"`);
  execSync(`git config --global user.email "bot@github.com"`);
  execSync(`git add src/data/friends.ts`);
  execSync(`git commit -m "${msg}"`);
  execSync(`git push origin ${process.env.GITHUB_REF}`);
}

run().catch(console.log);