import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "welcome",

	// 公告内容
	content: "每一个人的幸福、每一个人的生存都得自己亲手去创造，别人赐予的，就不是幸福，不是生存。重要的不是为自己的生活向任何人感恩，也不要自以为对别人、对后代有恩，重要的是，人如何在自己面前给自己的生活赐予意义，如何扮演好自己所设计的角色。不要要取悦于你的观众。这就是一个真正艺术家的秘诀，也是一个人生表演者的秘诀。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "了解更多",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};
