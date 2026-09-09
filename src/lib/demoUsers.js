// 表示確認用のデモユーザー（モックデータ）
// Userレコードはプラットーム上で作成できないため、公開プロフィール画面の
// 他者ビュー（フォロー／チャット表示）確認用に3人分のモックを用意。
// /profile/demo-emma /profile/demo-brock /profile/demo-luna でアクセス可能。

export const DEMO_USERS = {
  "demo-emma": {
    id: "demo-emma",
    display_name: "Emma",
    email: "emmmmu@beltva.demo",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    bio: "Just a girl who loves lifting and becoming a better version of herself. Upper pull day is my favorite. Always pushing for one more rep!",
    country: "US",
    gender: "female",
    age: 21,
    age_public: true,
    level: "intermediate",
    training_purpose: "bodymake"
  },
  "demo-brock": {
    id: "demo-brock",
    display_name: "Brockton",
    email: "crowzzyy@beltva.demo",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    bio: "I'm a guy I just have long hair. Knowledge is not free you have to pay attention. Discipline builds freedom.",
    country: "US",
    gender: "male",
    age: 16,
    age_public: true,
    level: "intermediate",
    training_purpose: "bodymake"
  },
  "demo-luna": {
    id: "demo-luna",
    display_name: "Luna",
    email: "luna_fit@beltva.demo",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    bio: "フィットネス大好きの大学生です🏋️‍♀️\n健康維持とボディメイクを両立中。\n同じ目標の仲間と繋がりたい！\nジャパンフィットネスエキスポ2026目指して頑張ります。\nよろしくお願いします🔥",
    country: "JP",
    gender: "female",
    age: 24,
    age_public: false,
    level: "advanced",
    training_purpose: "health"
  }
};

export function getDemoUser(id) {
  return DEMO_USERS[id] || null;
}