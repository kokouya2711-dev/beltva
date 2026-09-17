// Emoji data + "frequently used" tracking for the reaction picker.

export const EMOJI_CATEGORIES = [
  { id: "smileys", icon: "Smile", label: {
    ja: "顔と感情", en: "Smileys & People", zh: "表情与人物", "zh-TW": "表情與人物", ko: "표정과 사람", es: "Emojis y personas", fr: "Smileys et personnes", de: "Smileys & Personen", pt: "Emojis e pessoas", it: "Faccine e persone", ru: "Смайлы и люди", vi: "Biểu tượng cảm xúc", id: "Emoji & orang", th: "สีหน้าและผู้คน", hi: "स्माइली और लोग", ar: "رموز تعبيرية وأشخاص", tr: "Suratlar ve kişiler"
  } },
  { id: "animals", icon: "Leaf", label: {
    ja: "動物と自然", en: "Animals & Nature", zh: "动物与自然", "zh-TW": "動物與自然", ko: "동물과 자연", es: "Animales y naturaleza", fr: "Animaux et nature", de: "Tiere & Natur", pt: "Animais e natureza", it: "Animali e natura", ru: "Животные и природа", vi: "Động vật và thiên nhiên", id: "Hewan dan alam", th: "สัตว์และธรรมชาติ", hi: "जानवर और प्रकृति", ar: "حيوانات وطبيعة", tr: "Hayvanlar ve doğa"
  } },
  { id: "food", icon: "Coffee", label: {
    ja: "食べ物と飲み物", en: "Food & Drink", zh: "美食与饮品", "zh-TW": "美食與飲品", ko: "음식과 음료", es: "Comida y bebida", fr: "Nourriture et boisson", de: "Essen & Trinken", pt: "Comida e bebida", it: "Cibo e bevande", ru: "Еда и напитки", vi: "Đồ ăn và thức uống", id: "Makanan dan minuman", th: "อาหารและเครื่องดื่ม", hi: "खाना और पेय", ar: "طعام وشراب", tr: "Yemek ve içecek"
  } },
  { id: "activities", icon: "Trophy", label: {
    ja: "アクティビティ", en: "Activities", zh: "活动", "zh-TW": "活動", ko: "액티비티", es: "Actividades", fr: "Activités", de: "Aktivitäten", pt: "Atividades", it: "Attività", ru: "Активность", vi: "Hoạt động", id: "Aktivitas", th: "กิจกรรม", hi: "गतिविधियाँ", ar: "أنشطة", tr: "Etkinlikler"
  } },
  { id: "travel", icon: "Plane", label: {
    ja: "旅行と場所", en: "Travel & Places", zh: "旅行与地点", "zh-TW": "旅行與地點", ko: "여행과 장소", es: "Viajes y lugares", fr: "Voyage et lieux", de: "Reisen & Orte", pt: "Viagens e lugares", it: "Viaggi e luoghi", ru: "Путешествия и места", vi: "Du lịch và địa điểm", id: "Perjalanan dan tempat", th: "การเดินทางและสถานที่", hi: "यात्रा और स्थान", ar: "سفر وأماكن", tr: "Seyahat ve yerler"
  } },
  { id: "objects", icon: "Lightbulb", label: {
    ja: "もの", en: "Objects", zh: "物品", "zh-TW": "物品", ko: "사물", es: "Objetos", fr: "Objets", de: "Objekte", pt: "Objetos", it: "Oggetti", ru: "Предметы", vi: "Đồ vật", id: "Benda", th: "สิ่งของ", hi: "वस्तुएँ", ar: "أشياء", tr: "Nesneler"
  } },
  { id: "symbols", icon: "Hash", label: {
    ja: "記号", en: "Symbols", zh: "符号", "zh-TW": "符號", ko: "기호", es: "Símbolos", fr: "Symboles", de: "Symbole", pt: "Símbolos", it: "Simboli", ru: "Символы", vi: "Ký hiệu", id: "Simbol", th: "สัญลักษณ์", hi: "प्रतीक", ar: "رموز", tr: "Semboller"
  } },
  { id: "flags", icon: "Flag", label: {
    ja: "旗", en: "Flags", zh: "旗帜", "zh-TW": "旗幟", ko: "깃발", es: "Banderas", fr: "Drapeaux", de: "Flaggen", pt: "Bandeiras", it: "Bandiere", ru: "Флаги", vi: "Cờ", id: "Bendera", th: "ธง", hi: "झंडे", ar: "أعلام", tr: "Bayraklar"
  } },
];

// c: char, cat: category id, n: name (ja), kw: keywords (ja/en)
export const EMOJIS = [
  // smileys & people
  { c: "😀", cat: "smileys", n: "にっこり", kw: "smile happy 笑 顔 嬉しい" },
  { c: "😁", cat: "smileys", n: "にっこり2", kw: "grin beam" },
  { c: "😂", cat: "smileys", n: "うけ", kw: "joy laugh 笑い 涙" },
  { c: "🤣", cat: "smileys", n: "爆笑", kw: "rofl rolling 笑い" },
  { c: "😊", cat: "smileys", n: "ほほえみ", kw: "blush smile 照れ" },
  { c: "😍", cat: "smileys", n: "目がハート", kw: "heart eyes love 恋" },
  { c: "😘", cat: "smileys", n: "キス", kw: "kiss heart" },
  { c: "😜", cat: "smileys", n: "べろ", kw: "wink tongue べー" },
  { c: "😎", cat: "smileys", n: "サングラス", kw: "cool sunglasses かっこいい" },
  { c: "🤔", cat: "smileys", n: "かんがえ中", kw: "think 考える" },
  { c: "🙄", cat: "smileys", n: "呆れ", kw: "roll eyes 呆れる" },
  { c: "😴", cat: "smileys", n: "寝ている", kw: "sleep 寝る" },
  { c: "😭", cat: "smileys", n: "号泣", kw: "cry sob 泣く 涙" },
  { c: "😡", cat: "smileys", n: "怒り", kw: "angry rage 怒る" },
  { c: "🥳", cat: "smileys", n: "お祝い", kw: "party celebrate お祝い" },
  { c: "🤩", cat: "smileys", n: "きらきら目", kw: "star struck きらきら" },
  { c: "🥺", cat: "smileys", n: "懇願", kw: "pleading おねがい" },
  { c: "😢", cat: "smileys", n: "泣き顔", kw: "cry sad 悲しい" },
  { c: "😞", cat: "smileys", n: "がっかり", kw: "disappointed 残念" },
  { c: "😱", cat: "smileys", n: "悲鳴", kw: "scream 驚き" },
  { c: "🥶", cat: "smileys", n: "寒い", kw: "cold freezing 寒い" },
  { c: "🤯", cat: "smileys", n: "爆発", kw: "exploding mind 驚き" },
  { c: "👍", cat: "smileys", n: "いいね", kw: "thumbs up like いいね" },
  { c: "👎", cat: "smileys", n: "だめ", kw: "thumbs down bad だめ" },
  { c: "👌", cat: "smileys", n: "ok", kw: "ok good" },
  { c: "🤝", cat: "smileys", n: "握手", kw: "handshake 握手" },
  { c: "🙏", cat: "smileys", n: "お願い", kw: "pray thanks ありがとう" },
  { c: "👏", cat: "smileys", n: "拍手", kw: "clap 拍手" },
  { c: "👋", cat: "smileys", n: "手を振る", kw: "wave hello やあ" },
  { c: "💪", cat: "smileys", n: "筋肉", kw: "muscle flex 筋トレ 力" },
  { c: "🤙", cat: "smileys", n: "コールミー", kw: "call me 電話" },
  { c: "✌️", cat: "smileys", n: "ピース", kw: "peace victory ピープ" },
  { c: "🤞", cat: "smileys", n: "願い", kw: "fingers crossed 願い" },
  { c: "🙌", cat: "smileys", n: "バンザイ", kw: "raise hands バンザイ" },

  // animals & nature
  { c: "🐶", cat: "animals", n: "犬", kw: "dog 犬 わんこ" },
  { c: "🐱", cat: "animals", n: "猫", kw: "cat 猫 ねこ" },
  { c: "🐭", cat: "animals", n: "ネズミ", kw: "mouse mouse" },
  { c: "🐹", cat: "animals", n: "ハムスター", kw: "hamster ハムスター" },
  { c: "🐰", cat: "animals", n: "ウサギ", kw: "rabbit うさぎ" },
  { c: "🦊", cat: "animals", n: "キツネ", kw: "fox きつね" },
  { c: "🐻", cat: "animals", n: "クマ", kw: "bear くま" },
  { c: "🐼", cat: "animals", n: "パンダ", kw: "panda ぱんだ" },
  { c: "🐨", cat: "animals", n: "コアラ", kw: "koala こあら" },
  { c: "🐯", cat: "animals", n: "トラ", kw: "tiger とら" },
  { c: "🦁", cat: "animals", n: "ライオン", kw: "lion らいおん" },
  { c: "🐮", cat: "animals", n: "牛", kw: "cow 牛" },
  { c: "🐷", cat: "animals", n: "豚", kw: "pig 豚" },
  { c: "🐸", cat: "animals", n: "カエル", kw: "frog かえる" },
  { c: "🐵", cat: "animals", n: "サル", kw: "monkey さる" },
  { c: "🐔", cat: "animals", n: "鶏", kw: "chicken 鶏" },
  { c: "🐧", cat: "animals", n: "ペンギン", kw: "penguin ぺんぎん" },
  { c: "🐦", cat: "animals", n: "鳥", kw: "bird 鳥" },
  { c: "🦆", cat: "animals", n: "アヒル", kw: "duck あひる" },
  { c: "🦅", cat: "animals", n: "鷲", kw: "eagle わし" },
  { c: "🦉", cat: "animals", n: "フクロウ", kw: "owl ふくろう" },
  { c: "🐴", cat: "animals", n: "馬", kw: "horse 馬" },
  { c: "🦄", cat: "animals", n: "ユニコーン", kw: "unicorn ゆにこーん" },
  { c: "🐝", cat: "animals", n: "蜂", kw: "bee 蜂" },
  { c: "🦋", cat: "animals", n: "蝶", kw: "butterfly ちょう" },
  { c: "🐢", cat: "animals", n: "亀", kw: "turtle かめ" },
  { c: "🐍", cat: "animals", n: "蛇", kw: "snake 蛇" },
  { c: "🐠", cat: "animals", n: "魚", kw: "fish 魚" },
  { c: "🐬", cat: "animals", n: "イルカ", kw: "dolphin いるか" },
  { c: "🐳", cat: "animals", n: "クジラ", kw: "whale くじら" },
  { c: "🌸", cat: "animals", n: "桜", kw: "cherry blossom 桜 さくら" },
  { c: "🌹", cat: "animals", n: "バラ", kw: "rose ばら" },
  { c: "🌻", cat: "animals", n: "ひまわり", kw: "sunflower ひまわり" },
  { c: "🌳", cat: "animals", n: "木", kw: "tree 木" },
  { c: "🔥", cat: "animals", n: "炎", kw: "fire flame 炎 火" },

  // food & drink
  { c: "🍎", cat: "food", n: "りんご", kw: "apple りんご" },
  { c: "🍊", cat: "food", n: "オレンジ", kw: "orange オレンジ みかん" },
  { c: "🍌", cat: "food", n: "バナナ", kw: "banana ばなな" },
  { c: "🍉", cat: "food", n: "スイカ", kw: "watermelon すいか" },
  { c: "🍇", cat: "food", n: "ぶどう", kw: "grapes ぶどう" },
  { c: "🍓", cat: "food", n: "いちご", kw: "strawberry いちご" },
  { c: "🍒", cat: "food", n: "さくらんぼ", kw: "cherries さくらんぼ" },
  { c: "🍑", cat: "food", n: "桃", kw: "peach 桃" },
  { c: "🥭", cat: "food", n: "マンゴー", kw: "mango まんごー" },
  { c: "🍍", cat: "food", n: "パイナップル", kw: "pineapple ぱいなっぷる" },
  { c: "🥝", cat: "food", n: "キウイ", kw: "kiwi きうい" },
  { c: "🍅", cat: "food", n: "トマト", kw: "tomato とまと" },
  { c: "🥑", cat: "food", n: "アボカド", kw: "avocado あぼかど" },
  { c: "🌽", cat: "food", n: "とうもろこし", kw: "corn とうもろこし" },
  { c: "🥕", cat: "food", n: "にんじん", kw: "carrot にんじん" },
  { c: "🍔", cat: "food", n: "ハンバーガー", kw: "burger ハンバーガー" },
  { c: "🍟", cat: "food", n: "フライドポテト", kw: "fries ポテト" },
  { c: "🍕", cat: "food", n: "ピザ", kw: "pizza ピザ" },
  { c: "🌭", cat: "food", n: "ホットドッグ", kw: "hotdog ホットドッグ" },
  { c: "🌮", cat: "food", n: "タコス", kw: "taco タコス" },
  { c: "🍣", cat: "food", n: "寿司", kw: "sushi 寿司 すし" },
  { c: "🍙", cat: "food", n: "おにぎり", kw: "rice ball おにぎり" },
  { c: "🍚", cat: "food", n: "ご飯", kw: "rice ご飯" },
  { c: "🍜", cat: "food", n: "ラーメン", kw: "ramen noodles ラーメン" },
  { c: "🍦", cat: "food", n: "アイス", kw: "ice cream アイス" },
  { c: "🍩", cat: "food", n: "ドーナツ", kw: "donut ドーナツ" },
  { c: "🍪", cat: "food", n: "クッキー", kw: "cookie クッキー" },
  { c: "🎂", cat: "food", n: "ケーキ", kw: "cake birthday ケーキ 誕生日" },
  { c: "☕", cat: "food", n: "コーヒー", kw: "coffee コーヒー" },
  { c: "🍵", cat: "food", n: "お茶", kw: "tea お茶" },
  { c: "🍺", cat: "food", n: "ビール", kw: "beer ビール" },
  { c: "🍷", cat: "food", n: "ワイン", kw: "wine ワイン" },
  { c: "🥂", cat: "food", n: "乾杯", kw: "cheers 乾杯" },

  // activities
  { c: "⚽", cat: "activities", n: "サッカー", kw: "soccer サッカー" },
  { c: "🏀", cat: "activities", n: "バスケ", kw: "basketball バスケ" },
  { c: "🏈", cat: "activities", n: "アメフト", kw: "football アメフト" },
  { c: "⚾", cat: "activities", n: "野球", kw: "baseball 野球" },
  { c: "🎾", cat: "activities", n: "テニス", kw: "tennis テニス" },
  { c: "🏐", cat: "activities", n: "バレーボール", kw: "volleyball バレー" },
  { c: "🏉", cat: "activities", n: "ラグビー", kw: "rugby ラグビー" },
  { c: "🎱", cat: "activities", n: "ビリヤード", kw: "pool billiards ビリヤード" },
  { c: "🏓", cat: "activities", n: "卓球", kw: "ping pong 卓球" },
  { c: "🏸", cat: "activities", n: "バドミントン", kw: "badminton バドミントン" },
  { c: "🥅", cat: "activities", n: "ゴール", kw: "goal ゴール" },
  { c: "🏒", cat: "activities", n: "アイスホッケー", kw: "hockey ホッケー" },
  { c: "🎯", cat: "activities", n: "的", kw: "dart target 的" },
  { c: "🎮", cat: "activities", n: "ゲーム", kw: "game controller ゲーム" },
  { c: "🎲", cat: "activities", n: "サイコロ", kw: "dice サイコロ" },
  { c: "🎸", cat: "activities", n: "ギター", kw: "guitar ギター" },
  { c: "🎺", cat: "activities", n: "トランペット", kw: "trumpet トランペット" },
  { c: "🎹", cat: "activities", n: "ピアノ", kw: "piano ピアノ" },
  { c: "🥁", cat: "activities", n: "ドラム", kw: "drum ドラム" },
  { c: "🎤", cat: "activities", n: "マイク", kw: "mic karaoke マイク カラオケ" },
  { c: "🎧", cat: "activities", n: "ヘッドホン", kw: "headphone 音楽" },
  { c: "🎬", cat: "activities", n: "映画", kw: "movie clapper 映画" },
  { c: "🏆", cat: "activities", n: "トロフィー", kw: "trophy 優勝" },
  { c: "🥇", cat: "activities", n: "金メダル", kw: "gold medal 1位" },
  { c: "🥈", cat: "activities", n: "銀メダル", kw: "silver medal 2位" },
  { c: "🥉", cat: "activities", n: "銅メダル", kw: "bronze medal 3位" },
  { c: "🏃", cat: "activities", n: "走る", kw: "run ランニング" },
  { c: "🤸", cat: "activities", n: "側転", kw: "cartwheel 体操" },
  { c: "🚴", cat: "activities", n: "サイクリング", kw: "bike cycling サイクル" },
  { c: "🏊", cat: "activities", n: "水泳", kw: "swim 水泳" },

  // travel & places
  { c: "🚗", cat: "travel", n: "車", kw: "car 車" },
  { c: "🚕", cat: "travel", n: "タクシー", kw: "taxi タクシー" },
  { c: "🚙", cat: "travel", n: "SUV", kw: "suv car" },
  { c: "🚌", cat: "travel", n: "バス", kw: "bus バス" },
  { c: "🏎", cat: "travel", n: "レーシングカー", kw: "race car レース" },
  { c: "🚑", cat: "travel", n: "救急車", kw: "ambulance 救急" },
  { c: "🚒", cat: "travel", n: "消防車", kw: "fire engine 消防" },
  { c: "🏍", cat: "travel", n: "バイク", kw: "motorcycle バイク" },
  { c: "🛵", cat: "travel", n: "スクーター", kw: "scooter スクーター" },
  { c: "✈️", cat: "travel", n: "飛行機", kw: "plane 飛行機" },
  { c: "🚀", cat: "travel", n: "ロケット", kw: "rocket ロケット" },
  { c: "🚁", cat: "travel", n: "ヘリコプター", kw: "helicopter ヘリ" },
  { c: "🚢", cat: "travel", n: "船", kw: "ship 船" },
  { c: "🚆", cat: "travel", n: "電車", kw: "train 電車" },
  { c: "🚲", cat: "travel", n: "自転車", kw: "bicycle 自転車" },
  { c: "🏠", cat: "travel", n: "家", kw: "house 家" },
  { c: "🏢", cat: "travel", n: "ビル", kw: "office building ビル" },
  { c: "🏯", cat: "travel", n: "城", kw: "castle 城" },
  { c: "🗼", cat: "travel", n: "東京タワー", kw: "tower タワー" },
  { c: "🌉", cat: "travel", n: "橋", kw: "bridge 橋" },
  { c: "🌃", cat: "travel", n: "夜景", kw: "night 夜" },
  { c: "🌍", cat: "travel", n: "地球", kw: "earth globe 地球 世界" },
  { c: "🌎", cat: "travel", n: "アメリカ大陸", kw: "americas globe" },
  { c: "🌏", cat: "travel", n: "アジア大陸", kw: "asia globe" },
  { c: "🗺", cat: "travel", n: "地図", kw: "map 地図" },
  { c: "🏖", cat: "travel", n: "ビーチ", kw: "beach 海" },
  { c: "🏕", cat: "travel", n: "キャンプ", kw: "camp キャンプ" },
  { c: "🌋", cat: "travel", n: "火山", kw: "volcano 火山" },
  { c: "⛰", cat: "travel", n: "山", kw: "mountain 山" },
  { c: "🏝", cat: "travel", n: "島", kw: "island 島" },

  // objects
  { c: "💡", cat: "objects", n: "電球", kw: "bulb idea 電球 アイデア" },
  { c: "🔦", cat: "objects", n: "懐中電灯", kw: "flashlight" },
  { c: "📖", cat: "objects", n: "本", kw: "book 本" },
  { c: "📚", cat: "objects", n: "本棚", kw: "books 本" },
  { c: "✏️", cat: "objects", n: "鉛筆", kw: "pencil 鉛筆" },
  { c: "📝", cat: "objects", n: "メモ", kw: "memo note メモ" },
  { c: "💻", cat: "objects", n: "PC", kw: "laptop pc パソコン" },
  { c: "🖥", cat: "objects", n: "デスクトップ", kw: "desktop pc" },
  { c: "📱", cat: "objects", n: "スマホ", kw: "phone スマホ" },
  { c: "⌚", cat: "objects", n: "時計", kw: "watch 時計" },
  { c: "⏰", cat: "objects", n: "目覚まし", kw: "alarm clock 目覚まし" },
  { c: "📷", cat: "objects", n: "カメラ", kw: "camera カメラ" },
  { c: "🎥", cat: "objects", n: "ビデオ", kw: "video camera ビデオ" },
  { c: "📺", cat: "objects", n: "テレビ", kw: "tv テレビ" },
  { c: "📻", cat: "objects", n: "ラジオ", kw: "radio ラジオ" },
  { c: "🎁", cat: "objects", n: "プレゼント", kw: "gift present プレゼント" },
  { c: "🎈", cat: "objects", n: "風船", kw: "balloon 風船" },
  { c: "🎉", cat: "objects", n: "クラッカー", kw: "party お祝い" },
  { c: "🎊", cat: "objects", n: "紙吹雪", kw: "confetti お祝い" },
  { c: "💎", cat: "objects", n: "宝石", kw: "gem diamond 宝石" },
  { c: "🔑", cat: "objects", n: "鍵", kw: "key 鍵" },
  { c: "🔒", cat: "objects", n: "鍵", kw: "lock lock 鍵" },
  { c: "🔧", cat: "objects", n: "レンチ", kw: "wrench レンチ" },
  { c: "🔨", cat: "objects", n: "ハンマー", kw: "hammer ハンマー" },
  { c: "⚙️", cat: "objects", n: "歯車", kw: "gear 設定" },
  { c: "🧲", cat: "objects", n: "磁石", kw: "magnet 磁石" },
  { c: "🧪", cat: "objects", n: "試験管", kw: "test tube 実験" },
  { c: "🔬", cat: "objects", n: "顕微鏡", kw: "microscope 顕微鏡" },
  { c: "🛏", cat: "objects", n: "ベッド", kw: "bed ベッド" },
  { c: "🚿", cat: "objects", n: "シャワー", kw: "shower シャワー" },

  // symbols
  { c: "❤️", cat: "symbols", n: "ハート", kw: "heart love 愛" },
  { c: "🧡", cat: "symbols", n: "オレンジハート", kw: "orange heart" },
  { c: "💛", cat: "symbols", n: "イエローハート", kw: "yellow heart" },
  { c: "💚", cat: "symbols", n: "グリーンハート", kw: "green heart" },
  { c: "💙", cat: "symbols", n: "ブルーハート", kw: "blue heart" },
  { c: "💜", cat: "symbols", n: "パープルハート", kw: "purple heart" },
  { c: "🖤", cat: "symbols", n: "ブラックハート", kw: "black heart" },
  { c: "🤍", cat: "symbols", n: "白ハート", kw: "white heart" },
  { c: "💔", cat: "symbols", n: "失恋", kw: "broken heart 失恋" },
  { c: "💕", cat: "symbols", n: "ハート2つ", kw: "hearts love" },
  { c: "💖", cat: "symbols", n: "きらきらハート", kw: "sparkling heart" },
  { c: "💯", cat: "symbols", n: "100点", kw: "hundred 100 満点" },
  { c: "✅", cat: "symbols", n: "チェック", kw: "check ok" },
  { c: "❌", cat: "symbols", n: "バツ", kw: "cross no だめ" },
  { c: "⭐", cat: "symbols", n: "星", kw: "star 星" },
  { c: "✨", cat: "symbols", n: "きらきら", kw: "sparkles きらきら" },
  { c: "⚡", cat: "symbols", n: "雷", kw: "zap lightning 雷" },
  { c: "💫", cat: "symbols", n: "めまい", kw: "dizzy 星" },
  { c: "💥", cat: "symbols", n: "爆発", kw: "collision 爆発" },
  { c: "❓", cat: "symbols", n: "疑問", kw: "question ? はてな" },
  { c: "❗", cat: "symbols", n: "感嘆", kw: "exclamation !" },
  { c: "💢", cat: "symbols", n: "怒り", kw: "anger 怒り" },
  { c: "💤", cat: "symbols", n: "睡眠", kw: "sleep zzz 寝る" },
  { c: "♨️", cat: "symbols", n: "温泉", kw: "hotspring 温泉" },
  { c: "🆗", cat: "symbols", n: "OK", kw: "ok" },
  { c: "🆕", cat: "symbols", n: "NEW", kw: "new new" },
  { c: "🆒", cat: "symbols", n: "COOL", kw: "cool" },
  { c: "🔝", cat: "symbols", n: "トップ", kw: "top top" },
  { c: "♻️", cat: "symbols", n: "リサイクル", kw: "recycle リサイクル" },
  { c: "❔", cat: "symbols", n: "白い疑問", kw: "question" },

  // flags
  { c: "🇯🇵", cat: "flags", n: "日本", kw: "japan 日本" },
  { c: "🇺🇸", cat: "flags", n: "アメリカ", kw: "usa america アメリカ" },
  { c: "🇬🇧", cat: "flags", n: "イギリス", kw: "uk britain イギリス" },
  { c: "🇫🇷", cat: "flags", n: "フランス", kw: "france フランス" },
  { c: "🇩🇪", cat: "flags", n: "ドイツ", kw: "germany ドイツ" },
  { c: "🇮🇹", cat: "flags", n: "イタリア", kw: "italy イタリア" },
  { c: "🇪🇸", cat: "flags", n: "スペイン", kw: "spain スペイン" },
  { c: "🇨🇳", cat: "flags", n: "中国", kw: "china 中国" },
  { c: "🇰🇷", cat: "flags", n: "韓国", kw: "korea 韓国" },
  { c: "🇷🇺", cat: "flags", n: "ロシア", kw: "russia ロシア" },
  { c: "🇮🇳", cat: "flags", n: "インド", kw: "india インド" },
  { c: "🇧🇷", cat: "flags", n: "ブラジル", kw: "brazil ブラジル" },
  { c: "🇨🇦", cat: "flags", n: "カナダ", kw: "canada カナダ" },
  { c: "🇦🇺", cat: "flags", n: "オーストラリア", kw: "australia オーストラリア" },
  { c: "🇲🇽", cat: "flags", n: "メキシコ", kw: "mexico メキシコ" },
  { c: "🇮🇩", cat: "flags", n: "インドネシア", kw: "indonesia インドネシア" },
  { c: "🇹🇭", cat: "flags", n: "タイ", kw: "thailand タイ" },
  { c: "🇻🇳", cat: "flags", n: "ベトナム", kw: "vietnam ベトナム" },
  { c: "🇹🇷", cat: "flags", n: "トルコ", kw: "turkey トルコ" },
  { c: "🇸🇦", cat: "flags", n: "サウジ", kw: "saudi サウジ" },
  { c: "🇦🇪", cat: "flags", n: "UAE", kw: "uae emirates" },
  { c: "🇪🇬", cat: "flags", n: "エジプト", kw: "egypt エジプト" },
  { c: "🇿🇦", cat: "flags", n: "南アフリカ", kw: "south africa 南アフリカ" },
  { c: "🇳🇱", cat: "flags", n: "オランダ", kw: "netherlands オランダ" },
  { c: "🇸🇪", cat: "flags", n: "スウェーデン", kw: "sweden スウェーデン" },
  { c: "🇵🇭", cat: "flags", n: "フィリピン", kw: "philippines フィリピン" },
  { c: "🇸🇬", cat: "flags", n: "シンガポール", kw: "singapore シンガポール" },
  { c: "🇭🇰", cat: "flags", n: "香港", kw: "hong kong 香港" },
  { c: "🇹🇼", cat: "flags", n: "台湾", kw: "taiwan 台湾" },
];

export const DEFAULT_FREQUENT = ["👍", "❤️", "🔥", "😂", "💪", "😍", "🙏", "😎", "🎉", "✨", "👏", "🥺"];

const KEY = "beltva_emoji_recent";
const MAX_RECENT = 64;

export function getFrequent(max = 32) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_FREQUENT.slice(0, max);
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return DEFAULT_FREQUENT.slice(0, max);
    return list.slice(0, max);
  } catch {
    return DEFAULT_FREQUENT.slice(0, max);
  }
}

export function addFrequent(char) {
  try {
    const raw = localStorage.getItem(KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    list = list.filter((e) => e !== char);
    list.unshift(char);
    if (list.length > MAX_RECENT) list = list.slice(0, MAX_RECENT);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}