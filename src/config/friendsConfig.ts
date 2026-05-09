// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

export const friendsData: FriendItem[] = [

	{
		id: 1,
		title: "番茄主理人",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=20447289&s=640",
		desc: "坐而言不如起而行.",
		siteurl: "https://fqzlr.com/",
		tags: ["Blog"],
	},
	{
		id: 2,
		title: "椰汁の主页",
		imgurl: "https://free.picui.cn/free/2026/03/23/69c12fe83f7a4.jpg",
		desc: "关关难过关关过,前路漫漫亦灿灿.",
		siteurl: "https://home.132614.xyz/",
		tags: ["Blog"],
	},
	{
		id: 3,
		title: "UpXuu",
		imgurl: "https://upxuu.com/images/20260214145619.jpg",
		desc: "逐光而上！",
		siteurl: "https://upxuu.com",
		tags: ["Blog"],
	},
	{
		id: 4,
		title: "Re.Y.Ju.hao | 个人主页",
		imgurl: "https://img.cdn1.vip/i/69f03a1c79908_1777351196.webp",
		desc: "先活着吧，其他的再想想",
		siteurl: "http://irehao.42web.io/",
		tags: ["Blog"],
	},
	{
		id: 5,
		title: "大熊",
		imgurl: "https://halo.aizaibao.cn/upload/%E5%A4%B4%E5%83%8F.jpg",
		desc: "日常随笔与灵感收集小角落",
		siteurl: "https://halo.aizaibao.cn/",
		tags: ["Blog"],
	},
	{
		id: 6,
		title: "年华",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=1323860289&s=640",
		desc: "分享生活和记术。",
		siteurl: "https://love-firefly.ccwu.cc/",
		tags: ["Blog"],
	},
	{
		id: 7,
		title: "xf_blog",
		imgurl: "https://github.com/lm-xiao-fen/lm-xiao-fen.github.io/blob/main/image/MEITU_20260128_220225596.jpg?raw=true",
		desc: "立志用 cloudflare workers，GitHub pages 和 vercel 做出整个互联网的up（虽然不会成功",
		siteurl: "https://lm-xiao-fen.github.io/",
		tags: ["Blog"],
	},
	{
		id: 8,
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		desc: "The web framework for content-driven websites",
		siteurl: "https://github.com/withastro/astro",
		tags: ["Framework"],
	},
	{
		id: 9,
		title: "Mizuki Docs",
		imgurl: "https://q.qlogo.cn/headimg_dl?dst_uin=3231515355&spec=640&img_type=jpg",
		desc: "Mizuki User Manual",
		siteurl: "https://docs.mizuki.mysqil.com",
		tags: ["Docs"],
	},
	{
		id: 10,
		title: "Vercel",
		imgurl: "https://avatars.githubusercontent.com/u/14985020?v=4&s=640",
		desc: "Develop. Preview. Ship.",
		siteurl: "https://vercel.com",
		tags: ["Hosting", "Cloud"],
	},
	{
		id: 11,
		title: "Tailwind CSS",
		imgurl: "https://avatars.githubusercontent.com/u/67109815?v=4&s=640",
		desc: "A utility-first CSS framework for rapidly building custom designs",
		siteurl: "https://tailwindcss.com",
		tags: ["CSS", "Framework"],
	},
	{
		id: 12,
		title: "TypeScript",
		imgurl: "https://avatars.githubusercontent.com/u/6154722?v=4&s=640",
		desc: "TypeScript is JavaScript with syntax for types",
		siteurl: "https://www.typescriptlang.org",
		tags: ["Language", "JavaScript"],
	},
	{
		id: 13,
		title: "React",
		imgurl: "https://avatars.githubusercontent.com/u/6412038?v=4&s=640",
		desc: "A JavaScript library for building user interfaces",
		siteurl: "https://reactjs.org",
		tags: ["Framework", "JavaScript"],
	},
	{
		id: 14,
		title: "GitHub",
		imgurl: "https://avatars.githubusercontent.com/u/9919?v=4&s=640",
		desc: "Where the world builds software",
		siteurl: "https://github.com",
		tags: ["Development", "Platform"],
	},
	{
		id: 15,
		title: "MDN Web Docs",
		imgurl: "https://avatars.githubusercontent.com/u/7565578?v=4&s=640",
		desc: "The web's most comprehensive resource for web developers",
		siteurl: "https://developer.mozilla.org",
		tags: ["Docs", "Reference"],
	},
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// 👇 ========== 我新增的兼容脚本代码（只在最后，不动原有） ==========
// 以下代码仅用于自动化脚本（友链申请/巡检）兼容，不影响页面
export type FriendLink = FriendItem & {
  weight?: number;
  enabled?: boolean;
  issue_id?: number;
};

export const friendsConfig: FriendLink[] = friendsData.map(item => ({
  ...item,
  weight: 10,
  enabled: true,
  issue_id: 0
}));

export const friendsPageConfig = {
  title: "",
  description: "",
  showCustomContent: true,
  showComment: true,
  randomizeSort: false
};

export const getEnabledFriends = () => friendsConfig;
// 👆 ========== 我新增的部分结束 ==========