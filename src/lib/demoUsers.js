// 開発・テスト環境用ダミーユーザー（モックデータ）
// Userレコードはプラットフォーム上で作成できないため、フィード表示・
// 公開プロフィール確認用のモック。isDummyフラグで本番と区別。
// import.meta.env.DEV が true（開発・プレビュー）の時のみフィードに表示。

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
    training_purpose: "muscle",
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
    age: 24,
    age_public: false,
    level: "intermediate",
    training_purpose: "health",
    followers_count: 45,
    following_count: 30,
    posts_count: 1
  },
  "demo-kohei": {
    id: "demo-kohei",
    isDummy: true,
    display_name: "コウヘイ",
    email: "kohei@beltva.demo",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=KoheiLift&backgroundColor=3b82f6",
    bio: "30代の会社員です。学生時代からラグビーをやっていて、今はフィットネスが趣味です。\n週3回ジムに通っていて、主に筋力トレーニングと有酸素運動を組み合わせています。\n最近はパワーリフティングに興味があり、スクワットの自己ベスト更新を目指しています。\n同じようにトレーニングしている仲間と情報交換できたら嬉しいです。\nよろしくお願いします！💪",
    country: "JP",
    gender: "male",
    age: 32,
    age_public: true,
    level: "advanced",
    training_purpose: "strength",
    followers_count: 128,
    following_count: 56,
    posts_count: 2
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
    is_anonymous: false
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
    is_anonymous: false
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
    is_anonymous: false
  },
  {
    id: "demo-post-4",
    isDummy: true,
    content: "今日は背中の日！デッドリフトで自己ベスト更新🎯\nフォーム意識したら安定感全然違う。",
    created_date: _hoursAgo(1),
    created_by_id: "demo-kohei",
    created_by: DEMO_USERS["demo-kohei"],
    likes: 15,
    comments_count: 0,
    workout_type: "デッドリフト",
    is_anonymous: false
  },
  {
    id: "demo-post-5",
    isDummy: true,
    content: "ジム仲間募集！一緒にトレーニングできる人いたら気軽に絡んでください🔥\n平日夕方〜夜に通ってます。",
    created_date: _hoursAgo(20),
    created_by_id: "demo-kohei",
    created_by: DEMO_USERS["demo-kohei"],
    likes: 8,
    comments_count: 0,
    is_anonymous: false
  }
];

export function getDemoUser(id) {
  return DEMO_USERS[id] || null;
}

export function getDemoPosts() {
  return DEMO_POSTS;
}