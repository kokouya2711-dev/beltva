// Hobby data with multi-language support.
// Hobbies are stored in user profiles as strings with prefixes:
//   "p:<key>"  — preset hobby (translated via HOBBY_LABELS)
//   "c:<text>" — custom free-text hobby (displayed as-is)
// Legacy: bare Japanese strings (e.g. "筋トレ") are displayed as-is for backward compat.

export const LANG_ORDER = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "it", "ru", "vi", "id", "th", "hi", "ar"];

export const HOBBY_CATEGORIES = [
  { key: "fitness", items: ["strength_training", "running", "cycling", "swimming", "yoga", "pilates", "climbing", "hiking", "crossfit", "dance", "stretching", "home_training"] },
  { key: "ball_sports", items: ["soccer", "basketball", "baseball", "tennis", "table_tennis", "badminton", "volleyball", "golf", "futsal", "american_football", "rugby", "handball"] },
  { key: "combat", items: ["boxing", "martial_arts", "judo", "karate", "wrestling", "mma", "kendo"] },
  { key: "board_winter", items: ["snowboarding", "skiing", "skating", "skateboard", "surfing", "skate_skiing"] },
  { key: "games", items: ["fps", "rpg", "fighting_games", "board_games", "trpg", "puzzle_games", "rhythm_games", "retro_games", "mobile_games", "indie_games", "simulation", "strategy_games"] },
  { key: "music", items: ["rock", "jpop", "kpop", "hiphop", "classical", "jazz", "electronic", "dj", "instruments", "guitar", "piano", "singing", "band", "vocaloid", "live_music"] },
  { key: "anime_film", items: ["anime", "movie", "drama", "manga", "light_novel", "sci_fi", "horror", "comedy", "documentary", "netflix", "youtube", "vtuber"] },
  { key: "travel", items: ["domestic_travel", "overseas_travel", "solo_travel", "camping", "backpacking", "hot_springs", "theme_parks", "road_trip", "world_heritage"] },
  { key: "reading", items: ["novels", "business_books", "magazines", "self_help", "history", "mystery", "poetry", "web_novels", "philosophy", "science_books"] },
  { key: "cafe_drinks", items: ["cafe_hopping", "coffee", "tea", "sweets", "wine", "beer", "whiskey", "cocktail", "sake", "matcha"] },
  { key: "photo", items: ["landscape", "portrait", "street_photo", "film_camera", "drone", "astrophotography", "macro_photo"] },
  { key: "cooking", items: ["japanese_food", "western_food", "chinese_food", "korean_food", "italian_food", "baking", "healthy_cooking", "spicy_food", "gourmet", "lunch_box"] },
  { key: "fashion", items: ["street_fashion", "casual", "vintage", "sneakers", "watches", "accessories", "cosplay", "traditional_clothing"] },
  { key: "car_bike", items: ["cars", "motorcycles", "driving", "car_audio", "jdm", "bicycle"] },
  { key: "pet", items: ["dogs", "cats", "fish", "reptiles", "birds", "small_animals", "horse_riding"] },
  { key: "tech", items: ["programming", "gadgets", "ai", "pc_building", "smart_home", "3d_printing", "raspberry_pi"] },
  { key: "art", items: ["drawing", "painting", "digital_art", "calligraphy", "crafts", "pottery", "origami", "design"] },
  { key: "outdoor", items: ["fishing", "gardening", "bbq", "stargazing", "bird_watching", "diving", "kayaking"] },
  { key: "learning", items: ["languages", "investment", "startups", "marketing", "psychology", "philosophy_study", "cooking_class"] },
  { key: "lifestyle", items: ["meditation", "minimalism", "diy", "interior", "plants", "thrift_shopping", "volunteer"] }
];

// Each value is an array indexed by LANG_ORDER above.
export const HOBBY_LABELS = {
  strength_training: ["筋トレ", "Strength training", "力量训练", "웨이트 트레이닝", "Entrenamiento de fuerza", "Musculation", "Krafttraining", "Musculação", "Allenamento con i pesi", "Силовая тренировка", "Tập tạ", "Angkat beban", "ยกน้ำหนัก", "वेट ट्रेनिंग", "تمارين القوة"],
  running: ["ランニング", "Running", "跑步", "러닝", "Running", "Course à pied", "Laufen", "Corrida", "Corsa", "Бег", "Chạy bộ", "Lari", "วิ่ง", "दौड़", "الجري"],
  cycling: ["サイクリング", "Cycling", "自行车", "사이클링", "Ciclismo", "Cyclisme", "Radfahren", "Ciclismo", "Ciclismo", "Велоспорт", "Đạp xe", "Bersepeda", "ปั่นจักรยาน", "साइकिलिंग", "ركوب الدراجات"],
  swimming: ["水泳", "Swimming", "游泳", "수영", "Natación", "Natation", "Schwimmen", "Natação", "Nuoto", "Плавание", "Bơi lội", "Berenang", "ว่ายน้ำ", "तैराकी", "السباحة"],
  yoga: ["ヨガ", "Yoga", "瑜伽", "요가", "Yoga", "Yoga", "Yoga", "Yoga", "Yoga", "Йога", "Yoga", "Yoga", "โยคะ", "योग", "اليوغا"],
  pilates: ["ピラティス", "Pilates", "普拉提", "필라테스", "Pilates", "Pilates", "Pilates", "Pilates", "Pilates", "Пилатес", "Pilates", "Pilates", "พิลาเตส", "पिलेट्स", "بيلاتس"],
  climbing: ["クライミング", "Climbing", "攀岩", "클라이밍", "Escalada", "Escalade", "Klettern", "Escalada", "Arrampicata", "Скалолазание", "Leo trèo", "Panjat tebing", "ปีนเขา", "रॉक क्लाइम्बिंग", "تسلق الصخور"],
  hiking: ["登山", "Hiking", "徒步", "등산", "Senderismo", "Randonnée", "Wandern", "Trilha", "Escursionismo", "Походы", "Đi bộ đường dài", "Mendaki", "เดินป่า", "हाइकिंग", "المشي لمسافات طويلة"],
  crossfit: ["クロスフィット", "CrossFit", "综合训练", "크로스핏", "CrossFit", "CrossFit", "CrossFit", "CrossFit", "CrossFit", "Кроссфит", "CrossFit", "CrossFit", "ครอสฟิต", "क्रॉसफिट", "كروس فيت"],
  dance: ["ダンス", "Dance", "舞蹈", "댄스", "Baile", "Danse", "Tanzen", "Dança", "Danza", "Танцы", "Khiêu vũ", "Menari", "เต้นรำ", "नृत्य", "الرقص"],
  stretching: ["ストレッチ", "Stretching", "拉伸", "스트레칭", "Estiramientos", "Étirements", "Dehnen", "Alongamento", "Allungamento", "Растяжка", "Giãn cơ", "Peregangan", "ยืดเหยียด", "स्ट्रेचिंग", "التمدد"],
  home_training: ["自重トレ", "Home workout", "居家训练", "홈 트레이닝", "Entrenamiento en casa", "Musculation maison", "Heimtraining", "Treino em casa", "Allenamento a casa", "Домашние тренировки", "Tập tại nhà", "Latihan di rumah", "ออกกำลังกายที่บ้าน", "होम वर्कआउट", "تمارين منزلية"],
  soccer: ["サッカー", "Soccer", "足球", "축구", "Fútbol", "Football", "Fußball", "Futebol", "Calcio", "Футбол", "Bóng đá", "Sepak bola", "ฟุตบอล", "फुटबॉल", "كرة القدم"],
  basketball: ["バスケ", "Basketball", "篮球", "농구", "Baloncesto", "Basketball", "Basketball", "Basquete", "Pallacanestro", "Баскетбол", "Bóng rổ", "Bola basket", "บาสเก็ตบอล", "बास्केटबॉल", "كرة السلة"],
  baseball: ["野球", "Baseball", "棒球", "야구", "Béisbol", "Baseball", "Baseball", "Beisebol", "Baseball", "Бейсбол", "Bóng chày", "Bola bisbol", "เบสบอล", "बेसबॉल", "البيسبول"],
  tennis: ["テニス", "Tennis", "网球", "테니스", "Tenis", "Tennis", "Tennis", "Tênis", "Tennis", "Теннис", "Quần vợt", "Tenis", "เทนนิส", "टेनिस", "التنس"],
  table_tennis: ["卓球", "Table tennis", "乒乓球", "탁구", "Tenis de mesa", "Tennis de table", "Tischtennis", "Tênis de mesa", "Ping pong", "Настольный теннис", "Bóng bàn", "Tenis meja", "ปิงปอง", "टेबल टेनिस", "تنس الطاولة"],
  badminton: ["バドミントン", "Badminton", "羽毛球", "배드민턴", "Bádminton", "Badminton", "Badminton", "Badmínton", "Badminton", "Бадминтон", "Cầu lông", "Bulu tangkis", "แบดมินตัน", "बैडमिंटन", "كرة الريشة"],
  volleyball: ["バレーボール", "Volleyball", "排球", "배구", "Voleibol", "Volleyball", "Volleyball", "Voleibol", "Pallavolo", "Волейбол", "Bóng chuyền", "Bola voli", "วอลเลย์บอล", "वॉलीबॉल", "الكرة الطائرة"],
  golf: ["ゴルフ", "Golf", "高尔夫", "골프", "Golf", "Golf", "Golf", "Golfe", "Golf", "Гольф", "Golf", "Golf", "กอล์ฟ", "गोल्फ", "الجولف"],
  futsal: ["フットサル", "Futsal", "室内足球", "풋살", "Fútbol sala", "Futsal", "Futsal", "Futsal", "Calcetto", "Мини-футбол", "Futsal", "Futsal", "ฟุตซอล", "फुटसल", "كرة الصالات"],
  american_football: ["アメフト", "American football", "美式橄榄球", "미식축구", "Fútbol americano", "Football américain", "American Football", "Futebol americano", "Football americano", "Американский футбол", "Bóng bầu dục Mỹ", "Sepak bola Amerika", "อเมริกันฟุตบอล", "अमेरिकन फुटबॉल", "كرة القدم الأمريكية"],
  rugby: ["ラグビー", "Rugby", "橄榄球", "럭비", "Rugby", "Rugby", "Rugby", "Rugby", "Rugby", "Регби", "Bóng bầu dục", "Rugby", "รักบี้", "रग्बी", "الرجبي"],
  handball: ["ハンドボール", "Handball", "手球", "핸드볼", "Balonmano", "Handball", "Handball", "Handebol", "Pallamano", "Гандбол", "Bóng ném", "Bola tangan", "แฮนด์บอล", "हैंडबॉल", "كرة اليد"],
  boxing: ["ボクシング", "Boxing", "拳击", "복싱", "Boxeo", "Boxe", "Boxen", "Boxe", "Pugilato", "Бокс", "Quyền Anh", "Tinju", "มวยสากล", "मुक्केबाज़ी", "الملاكمة"],
  martial_arts: ["格闘技", "Martial arts", "武术", "격투기", "Artes marciales", "Arts martiaux", "Kampfsport", "Artes marciais", "Arti marziali", "Боевые искусства", "Võ thuật", "Bela diri", "ศิลปะการต่อสู้", "मार्शल आर्ट्स", "الفنون القتالية"],
  judo: ["柔道", "Judo", "柔道", "유도", "Judo", "Judo", "Judo", "Judô", "Judo", "Дзюдо", "Judo", "Judo", "ยูโด", "जूडो", "الجودو"],
  karate: ["空手", "Karate", "空手道", "가라테", "Karate", "Karaté", "Karate", "Karate", "Karate", "Карате", "Karate", "Karate", "คาราเต้", "कराटे", "الكاراتيه"],
  wrestling: ["レスリング", "Wrestling", "摔跤", "레슬링", "Lucha libre", "Lutte", "Ringen", "Luta livre", "Lotta", "Борьба", "Đấu vật", "Gulat", "มวยปล้ำ", "कुश्ती", "المصارعة"],
  mma: ["MMA", "MMA", "综合格斗", "MMA", "MMA", "MMA", "MMA", "MMA", "MMA", "ММА", "MMA", "MMA", "เอ็มเอ็มเอ", "एमएमए", "إم إم إيه"],
  kendo: ["剣道", "Kendo", "剑道", "검도", "Kendo", "Kendo", "Kendo", "Kendo", "Kendo", "Кэндо", "Kendo", "Kendo", "เคนโด", "केंडो", "الكندو"],
  snowboarding: ["スノーボード", "Snowboarding", "单板滑雪", "스노보드", "Snowboard", "Snowboard", "Snowboarden", "Snowboard", "Snowboard", "Сноуборд", "Trượt ván tuyết", "Seluncur salju", "สโนว์บอร์ด", "स्नोबोर्डिंग", "التزلج على اللوح"],
  skiing: ["スキー", "Skiing", "滑雪", "스키", "Esquí", "Ski", "Skifahren", "Esqui", "Sci", "Лыжи", "Trượt tuyết", "Ski", "สกี", "स्कीइंग", "التزلج"],
  skating: ["スケート", "Skating", "滑冰", "스케이트", "Patinaje", "Patinage", "Schlittschuhlaufen", "Patinação", "Pattinaggio", "Катание на коньках", "Trượt băng", "Seluncur roda", "สเก็ต", "स्केटिंग", "التزلج على الجليد"],
  skateboard: ["スケートボード", "Skateboard", "滑板", "스케이트보드", "Skate", "Skateboard", "Skateboard", "Skate", "Skateboard", "Скейтборд", "Trượt ván", "Skateboard", "สเกตบอร์ด", "स्केटबोर्ड", "السكيت بورد"],
  surfing: ["サーフィン", "Surfing", "冲浪", "서핑", "Surf", "Surf", "Surfen", "Surfe", "Surf", "Сёрфинг", "Lướt sóng", "Selancar", "เซิร์ฟ", "सर्फिंग", "ركوب الأمواج"],
  skate_skiing: ["クロスカントリースキー", "Cross-country skiing", "越野滑雪", "크로스컨트리 스키", "Esquí de fondo", "Ski de fond", "Langlauf", "Esqui cross-country", "Sci di fondo", "Лыжные гонки", "Trượt tuyết băng đồng", "Ski lintas alam", "สกีข้ามประเทศ", "क्रॉस-कंट्री स्कीइंग", "التزلج الريفي"],
  fps: ["FPS", "FPS games", "FPS游戏", "FPS", "FPS", "FPS", "FPS", "FPS", "FPS", "FPS", "FPS", "FPS", "FPS", "एफपीएस", "إف بي إس"],
  rpg: ["RPG", "RPG games", "RPG游戏", "RPG", "RPG", "RPG", "RPG", "RPG", "RPG", "RPG", "RPG", "RPG", "RPG", "आरपीजी", "آر بي جي"],
  fighting_games: ["対戦格闘", "Fighting games", "格斗游戏", "대전 격투", "Juegos de lucha", "Jeux de combat", "Kampfspielen", "Jogos de luta", "Picchiaduro", "Файтинги", "Game đối kháng", "Game pertarungan", "เกมต่อสู้", "फाइटिंग गेम्स", "ألعاب القتال"],
  board_games: ["ボードゲーム", "Board games", "桌游", "보드게임", "Juegos de mesa", "Jeux de société", "Brettspiele", "Jogos de tabuleiro", "Giochi da tavolo", "Настольные игры", "Cờ bàn", "Permainan papan", "เกมกระดาน", "बोर्ड गेम्स", "ألعاب الطاولة"],
  trpg: ["TRPG", "Tabletop RPG", "桌面RPG", "TRPG", "Rol en vivo", "JdR", "Pen & Paper", "RPG de mesa", "GdR da tavolo", "Настольные ролевые игры", "TRPG", "TRPG", "ทีอาร์พีจี", "टीआरपीजी", "تي آر بي جي"],
  puzzle_games: ["パズルゲーム", "Puzzle games", "解谜游戏", "퍼즐 게임", "Juegos de puzle", "Jeux de puzzle", "Puzzlespiele", "Jogos de quebra-cabeça", "Puzzle", "Головоломки", "Game giải đố", "Game teka-teki", "เกมปริศนา", "पज़ल गेम्स", "ألعاب الألغاز"],
  rhythm_games: ["音ゲー", "Rhythm games", "音游", "리듬 게임", "Juegos de ritmo", "Jeux de rythme", "Rhythmusspiele", "Jogos de ritmo", "Rhythmici", "Ритм-игры", "Game nhạc", "Game ritme", "เกมจังหวะ", "रिदम गेम्स", "ألعاب الإيقاع"],
  retro_games: ["レトロゲーム", "Retro games", "复古游戏", "레트로 게임", "Juegos retro", "Jeux rétro", "Retro-Spiele", "Jogos retrô", "Giochi retrò", "Ретро-игры", "Game cổ điển", "Game retro", "เกมย้อนยุค", "रेट्रो गेम्स", "الألعاب الكلاسيكية"],
  mobile_games: ["スマホゲーム", "Mobile games", "手游", "모바일 게임", "Juegos móviles", "Jeux mobiles", "Handyspiele", "Jogos móveis", "Giochi per cellulari", "Мобильные игры", "Game di động", "Game seluler", "เกมมือถือ", "मोबाइल गेम्स", "ألعاب الجوال"],
  indie_games: ["インディーゲーム", "Indie games", "独立游戏", "인디 게임", "Juegos indie", "Jeux indé", "Indie-Spiele", "Jogos indie", "Giochi indie", "Инди-игры", "Game indie", "Game indie", "เกมอินดี้", "इंडी गेम्स", "الألعاب المستقلة"],
  simulation: ["シミュレーション", "Simulation games", "模拟游戏", "시뮬레이션", "Simulación", "Simulation", "Simulation", "Simulação", "Simulazione", "Симуляторы", "Game mô phỏng", "Game simulasi", "เกมจำลองสถานการณ์", "सिमुलेशन गेम्स", "ألعاب المحاكاة"],
  strategy_games: ["ストラテジー", "Strategy games", "策略游戏", "전략 게임", "Estrategia", "Stratégie", "Strategiespiele", "Estratégia", "Strategia", "Стратегии", "Game chiến thuật", "Game strategi", "เกมวางแผน", "स्ट्रेटेजी गेम्स", "ألعاب الاستراتيجية"],
  rock: ["ロック", "Rock", "摇滚", "록", "Rock", "Rock", "Rock", "Rock", "Rock", "Рок", "Rock", "Rock", "ร็อก", "रॉक", "روك"],
  jpop: ["J-POP", "J-POP", "日流", "J-POP", "J-POP", "J-POP", "J-POP", "J-POP", "J-POP", "J-POP", "J-POP", "J-POP", "เจ-ป๊อป", "जे-पॉप", "جي بوب"],
  kpop: ["K-POP", "K-POP", "韩流", "K-POP", "K-POP", "K-POP", "K-POP", "K-POP", "K-POP", "K-POP", "K-POP", "K-POP", "เค-ป๊อป", "के-पॉप", "كي بوب"],
  hiphop: ["HIPHOP", "Hip-hop", "嘻哈", "힙합", "Hip-hop", "Hip-hop", "Hip-Hop", "Hip-hop", "Hip-hop", "Хип-хоп", "Hip-hop", "Hip-hop", "ฮิปฮอป", "हिप-हॉप", "هيب هوب"],
  classical: ["クラシック", "Classical", "古典", "클래식", "Clásica", "Classique", "Klassik", "Clássica", "Classica", "Классика", "Nhạc cổ điển", "Klasik", "คลาสสิก", "क्लासिकल", "كلاسيكي"],
  jazz: ["ジャズ", "Jazz", "爵士", "재즈", "Jazz", "Jazz", "Jazz", "Jazz", "Jazz", "Джаз", "Jazz", "Jazz", "แจ๊ส", "जैज़", "جاز"],
  electronic: ["電子音楽", "Electronic", "电子音乐", "일렉트로닉", "Electrónica", "Électronique", "Elektronik", "Eletrônica", "Elettronica", "Электроника", "Nhạc điện tử", "Elektronik", "อิเล็กทรอนิกส์", "इलेक्ट्रॉनिक", "موسيقى إلكترونية"],
  dj: ["DJ", "DJ", "DJ", "DJ", "DJ", "DJ", "DJ", "DJ", "DJ", "Диджей", "DJ", "DJ", "ดีเจ", "डीजे", "دي جي"],
  instruments: ["楽器", "Instruments", "乐器", "악기", "Instrumentos", "Instruments", "Instrumente", "Instrumentos", "Strumenti", "Инструменты", "Nhạc cụ", "Alat musik", "เครื่องดนตรี", "वाद्य यंत्र", "الآلات الموسيقية"],
  guitar: ["ギター", "Guitar", "吉他", "기타", "Guitarra", "Guitare", "Gitarre", "Guitarra", "Chitarra", "Гитара", "Guitar", "Gitar", "กีตาร์", "गिटार", "الغيتار"],
  piano: ["ピアノ", "Piano", "钢琴", "피아노", "Piano", "Piano", "Klavier", "Piano", "Pianoforte", "Пианино", "Piano", "Piano", "เปียโน", "पियानो", "البيانو"],
  singing: ["歌唱", "Singing", "唱歌", "노래", "Canto", "Chant", "Gesang", "Canto", "Canto", "Пение", "Hát", "Bernyanyi", "ร้องเพลง", "गायन", "الغناء"],
  band: ["バンド", "Band", "乐队", "밴드", "Banda", "Groupe", "Band", "Banda", "Band", "Группа", "Ban nhạc", "Band", "วงดนตรี", "बैंड", "فرقة موسيقية"],
  vocaloid: ["ボーカロイド", "Vocaloid", "虚拟歌手", "보카로이드", "Vocaloid", "Vocaloid", "Vocaloid", "Vocaloid", "Vocaloid", "Вокалоид", "Vocaloid", "Vocaloid", "โวคาลอยด์", "वोकलॉइड", "فوكالويد"],
  live_music: ["ライブ音楽", "Live music", "现场音乐", "라이브 음악", "Música en vivo", "Musique live", "Live-Musik", "Música ao vivo", "Musica dal vivo", "Живая музыка", "Nhạc sống", "Musik langsung", "ดนตรีสด", "लाइव संगीत", "الموسيقى الحية"],
  anime: ["アニメ", "Anime", "动漫", "애니메이션", "Anime", "Anime", "Anime", "Anime", "Anime", "Аниме", "Anime", "Anime", "อนิเมะ", "एनीमे", "أنمي"],
  movie: ["映画", "Movies", "电影", "영화", "Cine", "Cinéma", "Filme", "Filmes", "Film", "Фильмы", "Phim ảnh", "Film", "ภาพยนตร์", "फिल्में", "أفلام"],
  drama: ["ドラマ", "Drama", "电视剧", "드라마", "Series", "Séries", "Serien", "Séries", "Serie TV", "Сериалы", "Phim truyền hình", "Drama", "ละคร", "नाटक", "مسلسلات"],
  manga: ["漫画", "Manga", "漫画", "만화", "Manga", "Manga", "Manga", "Mangá", "Manga", "Манга", "Manga", "Manga", "มังงะ", "मांगा", "مانغا"],
  light_novel: ["ライトノベル", "Light novels", "轻小说", "라이트 노벨", "Novelas ligeras", "Light novels", "Light Novels", "Light novels", "Light novel", "Ранобэ", "Light novel", "Novel ringan", "ไลต์โนเวล", "लाइट नॉवेल", "روايات خفيفة"],
  sci_fi: ["SF", "Sci-fi", "科幻", "SF", "Ciencia ficción", "Science-fiction", "Sci-Fi", "Ficção científica", "Fantascienza", "Фантастика", "Khoa học viễn tưởng", "Fiksi ilmiah", "ไซไฟ", "विज्ञान-कल्पित", "خيال علمي"],
  horror: ["ホラー", "Horror", "恐怖", "공포", "Terror", "Horreur", "Horror", "Terror", "Horror", "Хоррор", "Kinh dị", "Horor", "สยองขวัญ", "हॉरर", "رعب"],
  comedy: ["コメディ", "Comedy", "喜剧", "코미디", "Comedia", "Comédie", "Komödie", "Comédia", "Commedia", "Комедия", "Hài hước", "Komedi", "ตลก", "कॉमेडी", "كوميديا"],
  documentary: ["ドキュメンタリー", "Documentary", "纪录片", "다큐멘터리", "Documental", "Documentaire", "Dokumentation", "Documentário", "Documentario", "Документальное", "Phim tài liệu", "Dokumenter", "สารคดี", "डॉक्यूमेंट्री", "وثائقي"],
  netflix: ["Netflix", "Netflix", "Netflix", "넷플릭스", "Netflix", "Netflix", "Netflix", "Netflix", "Netflix", "Netflix", "Netflix", "Netflix", "เน็ตฟลิกซ์", "नेटफ्लिक्स", "نتفليكس"],
  youtube: ["YouTube", "YouTube", "YouTube", "유튜브", "YouTube", "YouTube", "YouTube", "YouTube", "YouTube", "YouTube", "YouTube", "YouTube", "ยูทูบ", "यूट्यूब", "يوتيوب"],
  vtuber: ["VTuber", "VTuber", "虚拟主播", "버튜버", "VTuber", "VTuber", "VTuber", "VTuber", "VTuber", "Втьюбер", "VTuber", "VTuber", "วีทูเบอร์", "व्यूट्यूबर", "فيتيوبر"],
  domestic_travel: ["国内旅行", "Domestic travel", "国内旅行", "국내 여행", "Viajes nacionales", "Voyages nationaux", "Inlandsreisen", "Viagens nacionais", "Viaggi nazionali", "Поездки по стране", "Du lịch trong nước", "Perjalanan domestik", "เดินทางในประเทศ", "घरेलू यात्रा", "السفر المحلي"],
  overseas_travel: ["海外旅行", "Overseas travel", "海外旅行", "해외 여행", "Viajes al extranjero", "Voyages à l'étranger", "Auslandsreisen", "Viagens internacionais", "Viaggi all'estero", "Поездки за рубеж", "Du lịch nước ngoài", "Perjalanan luar negeri", "เดินทางต่างประเทศ", "विदेशी यात्रा", "السفر للخارج"],
  solo_travel: ["一人旅", "Solo travel", "独自旅行", "나홀로 여행", "Viajes en solitario", "Voyage solo", "Alleinreisen", "Viagens solitárias", "Viaggi da soli", "Соло-путешествия", "Du lịch một mình", "Perjalanan sendiri", "เดินทางคนเดียว", "सोलो ट्रैवल", "السفر المنفرد"],
  camping: ["キャンプ", "Camping", "露营", "캠핑", "Camping", "Camping", "Camping", "Camping", "Camping", "Кемпинг", "Cắm trại", "Berkemah", "แคมป์ปิ้ง", "कैम्पिंग", "التخييم"],
  backpacking: ["バックパッカー", "Backpacking", "背包旅行", "배낭여행", "Mochilero", "Backpacking", "Rucksackreisen", "Mochilão", "Zaino in spalla", "Бэкпекинг", "Phượt thủ", "Backpacking", "แบ็กแพ็กกิ้ง", "बैकपैकिंग", "الرحلات بالحقيبة"],
  hot_springs: ["温泉", "Hot springs", "温泉", "온천", "Aguas termales", "Sources chaudes", "Thermalquellen", "Águas termais", "Terme", "Горячие источники", "Suối nước nóng", "Pemandian air panas", "น้ำพุร้อน", "गर्म चश्मे", "ينابيع حارة"],
  theme_parks: ["テーマパーク", "Theme parks", "主题公园", "테마파크", "Parques temáticos", "Parcs à thème", "Freizeitparks", "Parques temáticos", "Parchi a tema", "Тематические парки", "Công viên giải trí", "Taman hiburan", "สวนสนุก", "थीम पार्क", "المدن الترفيهية"],
  road_trip: ["ロードトリップ", "Road trips", "公路旅行", "로드 트립", "Viajes por carretera", "Road trip", "Roadtrips", "Viagens de carro", "Road trip", "Автопутешествия", "Chuyến du lịch đường dài", "Perjalanan darat", "โรดทริป", "रोड ट्रिप", "رحلات الطريق"],
  world_heritage: ["世界遺産", "World heritage", "世界遗产", "세계유산", "Patrimonio mundial", "Patrimoine mondial", "Welterbe", "Patrimônio mundial", "Patrimonio mondiale", "Всемирное наследие", "Di sản thế giới", "Warisan dunia", "มรดกโลก", "विश्व धरोहर", "التراث العالمي"],
  novels: ["小説", "Novels", "小说", "소설", "Novelas", "Romans", "Romane", "Romances", "Romanzi", "Романы", "Tiểu thuyết", "Novel", "นวนิยาย", "उपन्यास", "روايات"],
  business_books: ["ビジネス書", "Business books", "商业书籍", "비즈니스 서적", "Libros de negocios", "Livres business", "Business-Bücher", "Livros de negócios", "Libri business", "Бизнес-литература", "Sách kinh doanh", "Buku bisnis", "หนังสือธุรกิจ", "व्यापार की किताबें", "كتب الأعمال"],
  magazines: ["雑誌", "Magazines", "杂志", "잡지", "Revistas", "Magazines", "Magazine", "Revistas", "Riviste", "Журналы", "Tạp chí", "Majalah", "นิตยสาร", "पत्रिकाएं", "مجلات"],
  self_help: ["自己啓発", "Self-help", "自助", "자기계발", "Autoayuda", "Développement personnel", "Selbsthilfe", "Autoajuda", "Self-help", "Саморазвитие", "Sách phát triển bản thân", "Pengembangan diri", "หนังสือพัฒนาตนเอง", "स्व-सहायता", "تطوير الذات"],
  history: ["歴史", "History", "历史", "역사", "Historia", "Histoire", "Geschichte", "História", "Storia", "История", "Lịch sử", "Sejarah", "ประวัติศาสตร์", "इतिहास", "تاريخ"],
  mystery: ["ミステリー", "Mystery", "推理", "미스터리", "Misterio", "Mystère", "Krimi", "Mistério", "Mistero", "Детективы", "Trinh thám", "Misteri", "ปริศนา", "रहस्य", "الغموض"],
  poetry: ["詩", "Poetry", "诗歌", "시", "Poesía", "Poésie", "Poesie", "Poesia", "Poesia", "Поэзия", "Thơ", "Puisi", "บทกวี", "कविता", "الشعر"],
  web_novels: ["Web小説", "Web novels", "网络小说", "웹소설", "Web novels", "Web novels", "Web-Novels", "Web novels", "Web novel", "Веб-новеллы", "Tiểu thuyết mạng", "Novel web", "นิยายออนไลน์", "वेब उपन्यास", "روايات الويب"],
  philosophy: ["哲学", "Philosophy", "哲学", "철학", "Filosofía", "Philosophie", "Philosophie", "Filosofia", "Filosofia", "Философия", "Triết học", "Filsafat", "ปรัชญา", "दर्शन", "الفلسفة"],
  science_books: ["科学書", "Science books", "科学书籍", "과학 서적", "Libros de ciencia", "Livres de science", "Sachbücher", "Livros de ciência", "Libri di scienza", "Научные книги", "Sách khoa học", "Buku sains", "หนังสือวิทยาศาสตร์", "विज्ञान की किताबें", "كتب العلوم"],
  cafe_hopping: ["カフェ巡り", "Cafe hopping", "咖啡店巡游", "카페 투어", "Ruta de cafés", "Tour des cafés", "Café-Hopping", "Cafés", "Tour dei bar", "Кофейный туризм", "Đi cà phê", "Ngopi keliling", "เที่ยวคาเฟ่", "कैफे हॉपिंग", "جولة المقاهي"],
  coffee: ["コーヒー", "Coffee", "咖啡", "커피", "Café", "Café", "Kaffee", "Café", "Caffè", "Кофе", "Cà phê", "Kopi", "กาแฟ", "कॉफी", "القهوة"],
  tea: ["紅茶", "Tea", "茶", "차", "Té", "Thé", "Tee", "Chá", "Tè", "Чай", "Trà", "Teh", "ชา", "चाय", "الشاي"],
  sweets: ["スイーツ", "Sweets", "甜点", "디저트", "Postres", "Desserts", "Süßigkeiten", "Doces", "Dolci", "Десерты", "Tráng miệng", "Manisan", "ขนมหวาน", "मिठाइयाँ", "الحلويات"],
  wine: ["ワイン", "Wine", "葡萄酒", "와인", "Vino", "Vin", "Wein", "Vinho", "Vino", "Вино", "Rượu vang", "Anggur", "ไวน์", "वाइन", "النبيذ"],
  beer: ["ビール", "Beer", "啤酒", "맥주", "Cerveza", "Bière", "Bier", "Cerveja", "Birra", "Пиво", "Bia", "Bir", "เบียร์", "बीयर", "البيرة"],
  whiskey: ["ウイスキー", "Whiskey", "威士忌", "위스키", "Whisky", "Whisky", "Whisky", "Uísque", "Whisky", "Виски", "Rượu whisky", "Wiski", "วิสกี้", "व्हिस्की", "الويسكي"],
  cocktail: ["カクテル", "Cocktails", "鸡尾酒", "칵테일", "Cócteles", "Cocktails", "Cocktails", "Coquetéis", "Cocktail", "Коктейли", "Cocktail", "Koktail", "ค็อกเทล", "कॉकटेल", "الكوكتيل"],
  sake: ["日本酒", "Sake", "日本酒", "사케", "Sake", "Saké", "Sake", "Saquê", "Sake", "Сакэ", "Sake", "Sake", "สาเก", "साके", "الساكي"],
  matcha: ["抹茶", "Matcha", "抹茶", "말차", "Matcha", "Matcha", "Matcha", "Matcha", "Matcha", "Матча", "Trà xanh bột", "Matcha", "มัทฉะ", "माचा", "الماتشا"],
  landscape: ["風景", "Landscape", "风景", "풍경", "Paisaje", "Paysage", "Landschaft", "Paisagem", "Paesaggio", "Пейзаж", "Phong cảnh", "Pemandangan", "ภูมิทัศน์", "भूदृश्य", "مناظر طبيعية"],
  portrait: ["ポートレート", "Portrait", "人像", "인물 사진", "Retrato", "Portrait", "Porträt", "Retrato", "Ritratto", "Портрет", "Chân dung", "Potret", "ภาพบุคคล", "पोर्ट्रेट", "صورة شخصية"],
  street_photo: ["ストリート", "Street photography", "街拍", "스트리트 사진", "Fotografía callejera", "Photo de rue", "Streetfotografie", "Fotografia de rua", "Fotografia di strada", "Уличная фотография", "Chụp ảnh đường phố", "Foto jalanan", "ถ่ายภาพถนน", "स्ट्रीट फोटोग्राफी", "تصوير الشارع"],
  film_camera: ["フィルムカメラ", "Film camera", "胶片相机", "필름 카메라", "Cámara de película", "Argentique", "Filmkamera", "Câmera de filme", "Fotocamera analogica", "Плёночная камера", "Máy ảnh phim", "Kamera film", "กล้องฟิล์ม", "फिल्म कैमरा", "كاميرا فيلم"],
  drone: ["ドローン", "Drone", "无人机", "드론", "Dron", "Drone", "Drohne", "Drone", "Drone", "Дрон", "Máy bay không người lái", "Drone", "โดรน", "ड्रोन", "الطائرات بدون طيار"],
  astrophotography: ["天体写真", "Astrophotography", "天文摄影", "천체 사진", "Astrofotografía", "Astrophotographie", "Astrofotografie", "Astrofotografia", "Astrofotografia", "Астрофотография", "Chụp ảnh thiên văn", "Astrofotografi", "ถ่ายภาพทางช้างนคร", "खगोल फोटोग्राफी", "التصوير الفلكي"],
  macro_photo: ["マクロ撮影", "Macro photography", "微距摄影", "매크로 사진", "Macrofotografía", "Macro", "Makrofotografie", "Macrofotografia", "Macrofotografia", "Макросъёмка", "Chụp cận cảnh", "Makro fotografi", "ถ่ายภาพมาโคร", "मैक्रो फोटोग्राफी", "التصوير الماكرو"],
  japanese_food: ["和食", "Japanese food", "日本料理", "일식", "Comida japonesa", "Cuisine japonaise", "Japanische Küche", "Comida japonesa", "Cucina giapponese", "Японская кухня", "Món Nhật", "Masakan Jepang", "อาหารญี่ปุ่น", "जापानी भोजन", "المطبخ الياباني"],
  western_food: ["洋食", "Western food", "西餐", "양식", "Comida occidental", "Cuisine occidentale", "Westliche Küche", "Comida ocidental", "Cucina occidentale", "Европейская кухня", "Món Âu", "Masakan Barat", "อาหารตะวันตก", "पश्चिमी भोजन", "المطبخ الغربي"],
  chinese_food: ["中華", "Chinese food", "中餐", "중식", "Comida china", "Cuisine chinoise", "Chinesische Küche", "Comida chinesa", "Cucina cinese", "Китайская кухня", "Món Hoa", "Masakan Tionghoa", "อาหารจีน", "चीनी भोजन", "المطبخ الصيني"],
  korean_food: ["韓国料理", "Korean food", "韩餐", "한식", "Comida coreana", "Cuisine coréenne", "Koreanische Küche", "Comida coreana", "Cucina coreana", "Корейская кухня", "Món Hàn", "Masakan Korea", "อาหารเกาหลี", "कोरियाई भोजन", "المطبخ الكوري"],
  italian_food: ["イタリアン", "Italian food", "意大利菜", "이탈리아 음식", "Comida italiana", "Cuisine italienne", "Italienische Küche", "Comida italiana", "Cucina italiana", "Итальянская кухня", "Món Ý", "Masakan Italia", "อาหารอิตาลี", "इतालवी भोजन", "المطبخ الإيطالي"],
  baking: ["スイーツ作り", "Baking", "烘焙", "베이킹", "Repostería", "Pâtisserie", "Backen", "Confeitaria", "Pasticceria", "Выпечка", "Làm bánh", "Memanggang", "ทำขนมปัง", "बेकिंग", "الخبز"],
  healthy_cooking: ["ヘルシー料理", "Healthy cooking", "健康饮食", "헬시 요리", "Cocina saludable", "Cuisine saine", "Gesunde Küche", "Culinária saudável", "Cucina sana", "Здоровое питание", "Nấu ăn lành mạnh", "Memasak sehat", "ทำอาหารเพื่อสุขภาพ", "स्वस्थ भोजन", "الطبخ الصحي"],
  spicy_food: ["激辛料理", "Spicy food", "辣味料理", "맵집", "Comida picante", "Plats épicés", "Scharfes Essen", "Comida picante", "Cibo piccante", "Острая еда", "Đồ cay", "Makanan pedas", "อาหารเผ็ด", "मसालेदार भोजन", "الطعام الحار"],
  gourmet: ["グルメ", "Gourmet", "美食", "미식", "Gastronomía", "Gastronomie", "Gourmet", "Gastronomia", "Gourmet", "Гурман", "Ẩm thực", "Kuliner", "อาหารเลิศ", "गुरमे", "الذواقة"],
  lunch_box: ["弁当", "Bento", "便当", "도시락", "Bentō", "Bento", "Bento", "Bento", "Bento", "Бенто", "Cơm hộp", "Bento", "ข้าวกล่อง", "बेंटो", "الصندوق"],
  street_fashion: ["ストリート", "Street fashion", "街头时尚", "스트릿 패션", "Moda callejera", "Mode street", "Streetwear", "Moda street", "Moda street", "Стрит-мода", "Thời trang street", "Street fashion", "สตรีทแฟชั่น", "स्ट्रीट फैशन", "الموضة الشبابية"],
  casual: ["カジュアル", "Casual", "休闲", "캐주얼", "Casual", "Casual", "Casual", "Casual", "Casual", "Кэжуал", "Thời trang thường ngày", "Kasual", "แคชชวล", "कैज़ुअल", "كاجوال"],
  vintage: ["ヴィンテージ", "Vintage", "复古", "빈티지", "Vintage", "Vintage", "Vintage", "Vintage", "Vintage", "Винтаж", "Thời trang vintage", "Vintage", "วินเทจ", "विंटेज", "عتيق"],
  sneakers: ["スニーカー", "Sneakers", "运动鞋", "스니커즈", "Zapatillas", "Sneakers", "Sneaker", "Tênis", "Sneaker", "Кроссовки", "Giày thể thao", "Sepatu kets", "รองเท้าผ้าใบ", "स्नीकर्स", "الأحذية الرياضية"],
  watches: ["時計", "Watches", "手表", "시계", "Relojes", "Montres", "Uhren", "Relógios", "Orologi", "Часы", "Đồng hồ", "Jam tangan", "นาฬิกา", "घड़ियाँ", "الساعات"],
  accessories: ["アクセサリー", "Accessories", "配饰", "액세서리", "Accesorios", "Accessoires", "Accessoires", "Acessórios", "Accessori", "Аксессуары", "Phụ kiện", "Aksesori", "เครื่องประดับ", "सहायक उपकरण", "الإكسسوارات"],
  cosplay: ["コスプレ", "Cosplay", "角色扮演", "코스프레", "Cosplay", "Cosplay", "Cosplay", "Cosplay", "Cosplay", "Косплей", "Cosplay", "Cosplay", "คอสเพลย์", "कॉसप्ले", "كوسبلاي"],
  traditional_clothing: ["伝統衣装", "Traditional clothing", "传统服饰", "전통 의상", "Ropa tradicional", "Vêtements traditionnels", "Tracht", "Roupas tradicionais", "Abiti tradizionali", "Традиционная одежда", "Trang phục truyền thống", "Pakaian tradisional", "เครื่องแต่งกายดั้งเดิม", "पारंपरिक परिधान", "الملابس التقليدية"],
  cars: ["車", "Cars", "汽车", "자동차", "Coches", "Voitures", "Autos", "Carros", "Auto", "Машины", "Ô tô", "Mobil", "รถยนต์", "कारें", "السيارات"],
  motorcycles: ["バイク", "Motorcycles", "摩托车", "오토바이", "Motos", "Motos", "Motorräder", "Motos", "Moto", "Мотоциклы", "Xe máy", "Motor", "รถจักรยานยนต์", "मोटरसाइकिल", "الدراجات النارية"],
  driving: ["ドライブ", "Driving", "驾驶", "드라이브", "Conducir", "Conduite", "Fahren", "Dirigir", "Guidare", "Вождение", "Lái xe", "Mengemudi", "ขับรถ", "ड्राइविंग", "القيادة"],
  car_audio: ["カーオーディオ", "Car audio", "汽车音响", "카오디오", "Audio de coche", "Auto audio", "Car-Hifi", "Áudio de carro", "Autoradio", "Авто-аудио", "Âm thanh ô tô", "Audio mobil", "ระบบเสียงในรถ", "कार ऑडियो", "صوت السيارة"],
  jdm: ["JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM", "JDM"],
  bicycle: ["自転車", "Bicycles", "自行车", "자전거", "Bicicletas", "Vélos", "Fahrräder", "Bicicletas", "Bici", "Велосипеды", "Xe đạp", "Sepeda", "จักรยาน", "साइकिल", "الدراجات"],
  dogs: ["犬", "Dogs", "狗", "강아지", "Perros", "Chiens", "Hunde", "Cães", "Cani", "Собаки", "Chó", "Anjing", "สุนัข", "कुत्ते", "الكلاب"],
  cats: ["猫", "Cats", "猫", "고양이", "Gatos", "Chats", "Katzen", "Gatos", "Gatti", "Кошки", "Mèo", "Kucing", "แมว", "बिल्लियाँ", "القطط"],
  fish: ["魚", "Fishkeeping", "鱼", "물고기", "Peces", "Poissons", "Fische", "Peixes", "Pesci", "Рыбы", "Cá", "Ikan", "ปลา", "मछली", "الأسماك"],
  reptiles: ["爬虫類", "Reptiles", "爬行动物", "파충류", "Reptiles", "Reptiles", "Reptilien", "Répteis", "Rettili", "Рептилии", "Bò sát", "Reptil", "สัตว์เลื้อยคลาน", "सरीसृप", "الزواحف"],
  birds: ["鳥", "Birds", "鸟", "새", "Aves", "Oiseaux", "Vögel", "Aves", "Uccelli", "Птицы", "Chim", "Burung", "นก", "पक्षी", "الطيور"],
  small_animals: ["小動物", "Small animals", "小动物", "소동물", "Pequeños animales", "Petits animaux", "Kleintiere", "Pequenos animais", "Piccoli animali", "Мелкие животные", "Động vật nhỏ", "Hewan kecil", "สัตว์เลี้ยงขนาดเล็ก", "छोटे जानवर", "حيوانات صغيرة"],
  horse_riding: ["乗馬", "Horse riding", "骑马", "승마", "Equitación", "Équitation", "Reiten", "Equitação", "Equitazione", "Верховая езда", "Cưỡi ngựa", "Berkuda", "ขี่ม้า", "घुड़सवारी", "ركوب الخيل"],
  programming: ["プログラミング", "Programming", "编程", "프로그래밍", "Programación", "Programmation", "Programmierung", "Programação", "Programmazione", "Программирование", "Lập trình", "Pemrograman", "เขียนโปรแกรม", "प्रोग्रामिंग", "البرمجة"],
  gadgets: ["ガジェット", "Gadgets", "数码产品", "가젯", "Gadgets", "Gadgets", "Gadgets", "Gadgets", "Gadget", "Гаджеты", "Thiết bị điện tử", "Gadget", "แกดเจ็ต", "गैजेट्स", "الأدوات الذكية"],
  ai: ["AI", "AI", "AI", "AI", "IA", "IA", "KI", "IA", "IA", "ИИ", "AI", "AI", "เอไอ", "एआई", "الذكاء الاصطناعي"],
  pc_building: ["自作PC", "PC building", "装机", "조립PC", "Montaje de PC", "Montage de PC", "PC-Zusammenbau", "Montar PC", "Assemblaggio PC", "Сборка ПК", "Lắp ráp PC", "Merakit PC", "ประกอบคอมพิวเตอร์", "पीसी बिल्डिंग", "تجميع الكمبيوتر"],
  smart_home: ["スマートホーム", "Smart home", "智能家居", "스마트홈", "Hogar inteligente", "Maison connectée", "Smart Home", "Casa inteligente", "Casa intelligente", "Умный дом", "Nhà thông minh", "Rumah pintar", "บ้านอัจฉริยะ", "स्मार्ट होम", "المنزل الذكي"],
  "3d_printing": ["3Dプリント", "3D printing", "3D打印", "3D 프린팅", "Impresión 3D", "Impression 3D", "3D-Druck", "Impressão 3D", "Stampa 3D", "3D-печать", "In 3D", "Cetak 3D", "พิมพ์ 3 มิติ", "3डी प्रिंटिंग", "الطباعة ثلاثية الأبعاد"],
  raspberry_pi: ["Raspberry Pi", "Raspberry Pi", "树莓派", "라즈베리 파이", "Raspberry Pi", "Raspberry Pi", "Raspberry Pi", "Raspberry Pi", "Raspberry Pi", "Raspberry Pi", "Raspberry Pi", "Raspberry Pi", "ราสเบอร์รี่ พาย", "रास्पबेरी पाई", "راسبيري باي"],
  drawing: ["イラスト", "Drawing", "插画", "일러스트", "Dibujo", "Dessin", "Zeichnen", "Desenho", "Disegno", "Рисование", "Vẽ minh họa", "Menggambar", "วาดเขียน", "चित्रकला", "الرسم"],
  painting: ["絵画", "Painting", "绘画", "그림", "Pintura", "Peinture", "Malerei", "Pintura", "Pittura", "Живопись", "Vẽ tranh", "Melukis", "วาดภาพ", "पेंटिंग", "الرسم التلوين"],
  digital_art: ["デジタルアート", "Digital art", "数字艺术", "디지털 아트", "Arte digital", "Art numérique", "Digitale Kunst", "Arte digital", "Arte digitale", "Цифровое искусство", "Nghệ thuật số", "Seni digital", "ศิลปะดิจิทัล", "डिजिटल आर्ट", "الفن الرقمي"],
  calligraphy: ["書道", "Calligraphy", "书法", "서예", "Caligrafía", "Calligraphie", "Kalligrafie", "Caligrafia", "Calligrafia", "Каллиграфия", "Thư pháp", "Kaligrafi", "พิธีเขียนพู่กันจีน", "सुलेखन", "خط اليد"],
  crafts: ["手芸・クラフト", "Crafts", "手工艺", "공예", "Manualidades", "Artisanat", "Handwerk", "Artesanato", "Artigianato", "Ремесло", "Thủ công", "Kerajinan", "งานฝีมือ", "शिल्प", "الحرف اليدوية"],
  pottery: ["陶芸", "Pottery", "陶艺", "도예", "Cerámica", "Poterie", "Töpferei", "Cerâmica", "Ceramica", "Керамика", "Gốm sứ", "Keramik", "เซรามิก", "कुम्हारी", "الفخار"],
  origami: ["折り紙", "Origami", "折纸", "종이접기", "Origami", "Origami", "Origami", "Origami", "Origami", "Оригами", "Gấp giấy", "Origami", "การพับกระดาษ", "ओरिगामी", "أوريغامي"],
  design: ["デザイン", "Design", "设计", "디자인", "Diseño", "Design", "Design", "Design", "Design", "Дизайн", "Thiết kế", "Desain", "การออกแบบ", "डिज़ाइन", "التصميم"],
  fishing: ["釣り", "Fishing", "钓鱼", "낚시", "Pesca", "Pêche", "Angeln", "Pesca", "Pesca", "Рыбалка", "Câu cá", "Memancing", "ตกปลา", "मछली पकड़ना", "صيد السمك"],
  gardening: ["ガーデニング", "Gardening", "园艺", "가드닝", "Jardinería", "Jardinage", "Gartenarbeit", "Jardinagem", "Giardinaggio", "Садоводство", "Làm vườn", "Bertanam", "ทำสวน", "बागवानी", "البستنة"],
  bbq: ["BBQ", "BBQ", "烧烤", "바비큐", "BBQ", "BBQ", "Grillen", "Churrasco", "BBQ", "Барбекю", "Nướng BBQ", "BBQ", "บาร์บีคิว", "बार्बेक्यू", "الشواء"],
  stargazing: ["天体観測", "Stargazing", "观星", "별보기", "Observación de estrellas", "Observation des étoiles", "Sterngucker", "Observação de estrelas", "Osservazione delle stelle", "Наблюдение за звёздами", "Ngắm sao", "Mengamati bintang", "ดูดาว", "तारों का अवलोकन", "مراقبة النجوم"],
  bird_watching: ["バードウォッチング", "Bird watching", "观鸟", "버드워칭", "Observación de aves", "Observation des oiseaux", "Vogelbeobachtung", "Observação de aves", "Birdwatching", "Наблюдение за птицами", "Xem chim", "Mengamati burung", "ดูนก", "पक्षी निगरानी", "مراقبة الطيور"],
  diving: ["ダイビング", "Diving", "潜水", "다이빙", "Buceo", "Plongée", "Tauchen", "Mergulho", "Immersione", "Дайвинг", "Lặn biển", "Menyelam", "ดำน้ำ", "गोताखोरी", "الغوص"],
  kayaking: ["カヤック", "Kayaking", "皮划艇", "카약", "Kayak", "Kayak", "Kajak", "Canoagem", "Kayak", "Каякинг", "Chèo thuyền kayak", "Kayak", "พายเรือคายัค", "कयाकिंग", "التجديف"],
  languages: ["語学", "Languages", "语言学习", "언어 학습", "Idiomas", "Langues", "Sprachen", "Idiomas", "Lingue", "Языки", "Học ngoại ngữ", "Bahasa", "ภาษา", "भाषाएँ", "اللغات"],
  investment: ["投資", "Investing", "投资", "투자", "Inversión", "Investissement", "Investition", "Investimento", "Investimento", "Инвестиции", "Đầu tư", "Investasi", "การลงทุน", "निवेश", "الاستثمار"],
  startups: ["起業", "Startups", "创业", "스타트업", "Startups", "Startups", "Startups", "Startups", "Startup", "Стартапы", "Khởi nghiệp", "Startup", "สตาร์ทอัพ", "स्टार्टअप", "الشركات الناشئة"],
  marketing: ["マーケティング", "Marketing", "营销", "마케팅", "Marketing", "Marketing", "Marketing", "Marketing", "Marketing", "Маркетинг", "Tiếp thị", "Pemasaran", "การตลาด", "विपणन", "التسويق"],
  psychology: ["心理学", "Psychology", "心理学", "심리학", "Psicología", "Psychologie", "Psychologie", "Psicologia", "Psicologia", "Психология", "Tâm lý học", "Psikologi", "จิตวิทยา", "मनोविज्ञान", "علم النفس"],
  philosophy_study: ["哲学勉強", "Philosophy study", "哲学研究", "철학 공부", "Estudio de filosofía", "Étude de philosophie", "Philosophiestudium", "Estudo de filosofia", "Studio di filosofia", "Изучение философии", "Học triết học", "Belajar filsafat", "เรียนปรัชญา", "दर्शन अध्ययन", "دراسة الفلسفة"],
  cooking_class: ["料理教室", "Cooking class", "料理课", "요리 교실", "Clases de cocina", "Cours de cuisine", "Kochkurse", "Aulas de culinária", "Corsi di cucina", "Кулинарные курсы", "Lớp nấu ăn", "Kelas memasak", "เรียนทำอาหาร", "खाना बनाने की कक्षा", "دروس الطبخ"],
  meditation: ["瞑想", "Meditation", "冥想", "명상", "Meditación", "Méditation", "Meditation", "Meditação", "Meditazione", "Медитация", "Thiền", "Meditasi", "สมาธิ", "ध्यान", "التأمل"],
  minimalism: ["ミニマリズム", "Minimalism", "极简主义", "미니멀리즘", "Minimalismo", "Minimalisme", "Minimalismus", "Minimalismo", "Minimalismo", "Минимализм", "Tối giản", "Minimalisme", "มินิมอลลิสม์", "मिनिमलिज़्म", "البساطة"],
  diy: ["DIY", "DIY", "DIY", "DIY", "Bricolaje", "DIY", "Heimwerken", "Faça você mesmo", "Fai da te", "Сделай сам", "DIY", "DIY", "DIY", "DIY", "افعلها بنفسك"],
  interior: ["インテリア", "Interior design", "室内设计", "인테리어", "Interiorismo", "Décoration", "Inneneinrichtung", "Interiores", "Interior design", "Интерьер", "Nội thất", "Interior", "ตกแต่งภายใน", "इंटीरियर डिज़ाइन", "التصميم الداخلي"],
  plants: ["観葉植物", "Houseplants", "室内植物", "반려식물", "Plantas", "Plantes", "Zimmerpflanzen", "Plantas", "Piante da appartamento", "Комнатные растения", "Cây cảnh", "Tanaman", "ต้นไม้ในบ้าน", "घर के पौधे", "نباتات المنزل"],
  thrift_shopping: ["古着屋巡り", "Thrift shopping", "二手购物", "벼룩시장", "Compras de segunda mano", "Shopping d'occasion", "Second-Hand-Shopping", "Compras de brechó", "Shopping vintage", "Секонд-хенд", "Mua đồ cũ", "Belanja thrift", "ช้อปมือสอง", "थ्रिफ्ट शॉपिंग", "تسوق الأشياء المستعملة"],
  volunteer: ["ボランティア", "Volunteering", "志愿者", "봉사활동", "Voluntariado", "Bénévolat", "Ehrenamt", "Voluntariado", "Volontariato", "Волонтёрство", "Tình nguyện", "Relawan", "อาสาสมัคร", "स्वयंसेवक", "التطوع"]
};

export const ALL_HOBBY_KEYS = HOBBY_CATEGORIES.flatMap((c) => c.items);

// --- helpers for stored format ---
export function makePresetHobby(key) { return "p:" + key; }
export function makeCustomHobby(text) { return "c:" + text.trim(); }
export function isPresetHobby(h) { return h && h.startsWith("p:"); }
export function isCustomHobby(h) { return h && h.startsWith("c:"); }
export function hobbyKey(h) { return isPresetHobby(h) ? h.slice(2) : null; }
export function hobbyCustomText(h) { return isCustomHobby(h) ? h.slice(2) : null; }

export function hobbyLabel(h, lang) {
  if (!h) return "";
  if (isPresetHobby(h)) {
    const key = hobbyKey(h);
    const labels = HOBBY_LABELS[key];
    if (!labels) return key;
    const idx = LANG_ORDER.indexOf(lang);
    return labels[idx >= 0 ? idx : 0] || labels[0];
  }
  if (isCustomHobby(h)) return hobbyCustomText(h);
  return h; // backward compat: legacy bare string
}

export function searchHobbyKeys(query, lang) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_HOBBY_KEYS.filter((key) => {
    const labels = HOBBY_LABELS[key];
    if (!labels) return false;
    return labels.some((l) => l.toLowerCase().includes(q));
  });
}

export const HOBBY_CATEGORY_LABELS = {
  fitness: ["フィットネス", "Fitness", "健身", "피트니스", "Fitness", "Fitness", "Fitness", "Fitness", "Fitness", "Фитнес", "Thể hình", "Kebugaran", "ฟิตเนส", "फिटनेस", "اللياقة"],
  ball_sports: ["球技", "Ball sports", "球类运动", "구기", "Deportes de balón", "Sports de ball", "Ballsport", "Esportes de bola", "Sport con palla", "Игровые виды спорта", "Thể thao bóng", "Olahraga bola", "กีฬาลูกบอล", "बॉल खेल", "الرياضات بالكرة"],
  combat: ["格闘技", "Combat sports", "格斗运动", "격투기", "Deportes de combate", "Sports de combat", "Kampfsport", "Esportes de combate", "Sport da combattimento", "Единоборства", "Võ thuật", "Olahraga tempur", "กีฬาต่อสู้", "मार्शल आर्ट्स", "الرياضات القتالية"],
  board_winter: ["ボード・ウィンター", "Board & Winter", "板类与冬季运动", "보드·윈터", "Tabla e invierno", "Board et hiver", "Board & Winter", "Board e inverno", "Board e inverno", "Доски и зима", "Ván trượt & Mùa đông", "Board & Musim dingin", "บอร์ดและฤดูหนาว", "बोर्ड और विंटर", "اللوح والشتاء"],
  games: ["ゲーム", "Games", "游戏", "게임", "Juegos", "Jeux", "Spiele", "Jogos", "Giochi", "Игры", "Trò chơi", "Permainan", "เกม", "गेम्स", "الألعاب"],
  music: ["音楽", "Music", "音乐", "음악", "Música", "Musique", "Musik", "Música", "Musica", "Музыка", "Âm nhạc", "Musik", "ดนตรี", "संगीत", "الموسيقى"],
  anime_film: ["映画・アニメ", "Film & Anime", "影视动漫", "영화·애니", "Cine y anime", "Cinéma et anime", "Film & Anime", "Cinema e anime", "Film e anime", "Кино и аниме", "Phim & Anime", "Film & Anime", "ภาพยนตร์และอนิเมะ", "फिल्म और एनीमे", "الأفلام والأنمي"],
  travel: ["旅行", "Travel", "旅行", "여행", "Viajes", "Voyages", "Reisen", "Viagens", "Viaggi", "Путешествия", "Du lịch", "Perjalanan", "การเดินทาง", "यात्रा", "السفر"],
  reading: ["読書", "Reading", "阅读", "독서", "Lectura", "Lecture", "Lesen", "Leitura", "Lettura", "Чтение", "Đọc sách", "Membaca", "การอ่าน", "पठन", "القراءة"],
  cafe_drinks: ["カフェ・ドリンク", "Cafe & Drinks", "咖啡饮品", "카페·드링크", "Café y bebidas", "Café et boissons", "Café & Getränke", "Café e bebidas", "Caffè e bevande", "Кафе и напитки", "Cà phê & Đồ uống", "Kafe & Minuman", "คาเฟ่และเครื่องดื่ม", "कैफे और पेय", "المقاهي والمشروبات"],
  photo: ["写真", "Photography", "摄影", "사진", "Fotografía", "Photographie", "Fotografie", "Fotografia", "Fotografia", "Фотография", "Nhiếp ảnh", "Fotografi", "การถ่ายภาพ", "फोटोग्राफी", "التصوير"],
  cooking: ["料理", "Cooking", "烹饪", "요리", "Cocina", "Cuisine", "Kochen", "Culinária", "Cucina", "Кулинария", "Nấu ăn", "Memasak", "การทำอาหาร", "खाना बनाना", "الطبخ"],
  fashion: ["ファッション", "Fashion", "时尚", "패션", "Moda", "Mode", "Mode", "Moda", "Moda", "Мода", "Thời trang", "Mode", "แฟชั่น", "फैशन", "الموضة"],
  car_bike: ["車・バイク", "Cars & Bikes", "汽车与摩托", "차·바이크", "Coches y motos", "Voitures et motos", "Autos & Bikes", "Carros e motos", "Auto e moto", "Авто и мото", "Ô tô & Xe máy", "Mobil & Motor", "รถและมอเตอร์ไซค์", "कार और बाइक", "السيارات والدراجات"],
  pet: ["ペット", "Pets", "宠物", "반려동물", "Mascotas", "Animaux", "Haustiere", "Animais de estimação", "Animali domestici", "Питомцы", "Thú cưng", "Hewan peliharaan", "สัตว์เลี้ยง", "पालतू जानवर", "الحيوانات الأليفة"],
  tech: ["テクノロジー", "Technology", "科技", "테크", "Tecnología", "Technologie", "Technik", "Tecnologia", "Tecnologia", "Технологии", "Công nghệ", "Teknologi", "เทคโนโลยี", "तकनीक", "التكنولوجيا"],
  art: ["アート", "Art", "艺术", "아트", "Arte", "Art", "Kunst", "Arte", "Arte", "Искусство", "Nghệ thuật", "Seni", "ศิลปะ", "कला", "الفن"],
  outdoor: ["アウトドア", "Outdoors", "户外", "아웃도어", "Aire libre", "Plein air", "Outdoor", "Ao ar livre", "All'aperto", "На природе", "Hoạt động ngoài trời", "Luar ruangan", "กิจกรรมกลางแจ้ง", "आउटडोर", "الأنشطة الخارجية"],
  learning: ["学習", "Learning", "学习", "학습", "Aprendizaje", "Apprentissage", "Lernen", "Aprendizado", "Apprendimento", "Обучение", "Học tập", "Belajar", "การเรียนรู้", "अध्ययन", "التعلم"],
  lifestyle: ["ライフスタイル", "Lifestyle", "生活方式", "라이프스타일", "Estilo de vida", "Mode de vie", "Lebensstil", "Estilo de vida", "Stile di vita", "Образ жизни", "Phong cách sống", "Gaya hidup", "ไลฟ์สไตล์", "जीवनशैली", "نمط الحياة"]
};

export function hobbyCategoryLabel(key, lang) {
  const labels = HOBBY_CATEGORY_LABELS[key];
  if (!labels) return key;
  const idx = LANG_ORDER.indexOf(lang);
  return labels[idx >= 0 ? idx : 0] || labels[0];
}

export const TRAINING_PURPOSES = [
  { key: "health" },
  { key: "bodymake" },
  { key: "contest" },
  { key: "friends" }
];

export function parseHobbies(s) {
  try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; }
}