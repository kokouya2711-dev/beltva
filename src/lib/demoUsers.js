// 開発・テスト環境用ダミーユーザー（モックデータ）
// Userレコードはプラットフォーム上で作成できないため、フィード表示・
// 公開プロフィール確認用のモック。isDummyフラグで本番と区別。
// 当アプリの未成年許可範囲（13〜17歳）のみで作成。

export function isDevMode() {
  return import.meta.env.DEV === true;
}

export const DEMO_USERS = {
  "demo-taro": {
    id: "demo-taro",
    isDummy: true,
    display_name: "タロ",
    email: "taro@beltva.demo",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=TaroFit&backgroundColor=84cc16",
    bio: "高校生で筋トレ始めて1年。ベンチプレス大好き！",
    country: "JP",
    gender: "male",
    age: 16,
    age_public: true,
    level: "beginner",
    training_purpose: "bodymake",
    followers_count: 12,
    following_count: 8,
    posts_count: 2
  },
  "demo-mina": {
    id: "demo-mina",
    isDummy: true,
    display_name: "ミナ",
    email: "mina@beltva.demo",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinaYoga&backgroundColor=ec4899",
    bio: "ヨガとランニングを楽しんでいます🌿 心身ともに健康に！",
    country: "JP",
    gender: "female",
    age: 15,
    age_public: false,
    level: "beginner",
    training_purpose: "health",
    followers_count: 45,
    following_count: 30,
    posts_count: 1
  }
};

// ダミー投稿（各ユーザー1〜2件）
const _now = Date.now();
const _hoursAgo = (h) => new Date(_now - h * 3600000).toISOString();

export const DEMO_POSTS = [
  {
    id: "demo-post-1",
    isDummy: true,
    content: "今日は胸筋の日！ベンチプレス60kg×3セット完了💪\n少しずつ重量上がてきて嬉しい。",
    created_date: _hoursAgo(2),
    created_by_id: "demo-taro",
    created_by: DEMO_USERS["demo-taro"],
    likes: 3,
    comments_count: 0,
    workout_type: "ベンチプレス",
    is_anonymous: false,
    languageCode: "ja"
  },
  {
    id: "demo-post-2",
    isDummy: true,
    content: "プロテインのおすすめ味教えてください！\n今チョコ味使ってるけど飽きてきた😂",
    created_date: _hoursAgo(8),
    created_by_id: "demo-taro",
    created_by: DEMO_USERS["demo-taro"],
    likes: 1,
    comments_count: 0,
    is_anonymous: false,
    languageCode: "ja"
  },
  {
    id: "demo-post-3",
    isDummy: true,
    content: "朝ランニング5km完了！今日は風が気持ちよかった🌅\n走り終わった後の達成感が好き。",
    created_date: _hoursAgo(5),
    created_by_id: "demo-mina",
    created_by: DEMO_USERS["demo-mina"],
    likes: 7,
    comments_count: 0,
    workout_type: "ランニング",
    is_anonymous: false,
    languageCode: "ja"
  }
];

export function getDemoUser(id) {
  return DEMO_USERS[id] || null;
}

export function getDemoPosts() {
  return DEMO_POSTS;
}