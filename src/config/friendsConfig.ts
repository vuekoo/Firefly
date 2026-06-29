import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	title: "",
	description: "",
	showCustomContent: true,
	showComment: true,
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	
	// {
	// 	title: "Sigrika-善良耙耙柑🍊",
	// 	imgurl: "https://avatars.githubusercontent.com/u/172878250",
	// 	desc: "记录我的二次元之旅",
	// 	siteurl: "https://qwq.sigrika.cc/",
	// 	tags: ["Blog"],
	// 	weight: 10, // 权重，数字越大排序越靠前
	// 	enabled: true, // 是否启用
	// 	issue_id: 50,
	// },
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
