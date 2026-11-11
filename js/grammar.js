// Grammar points for each lesson of HSK 1–3 (topics follow the New HSK Course contents; explanations and examples written for Shang Hike).
(function () {
  const out = [];
  const count = {};
  function g(lv, ls, title, pattern, explain, ex, quiz) {
    const k = `${lv}-${ls}`; count[k] = (count[k] || 0) + 1;
    out.push({
      id: `${k}-${count[k]}`, lv, ls, title, pattern,
      explain: Array.isArray(explain) ? explain : [explain],
      examples: ex.map(([zh, py, en]) => ({ zh, py, en })),
      quiz: quiz ? { q: quiz[0], options: quiz[1], answer: quiz[2], why: quiz[3] } : null
    });
  }

  // ================= HSK 1 =================
  g(1, 2, 'Basic word order', 'Subject + Verb + Object',
    ['Chinese sentences usually go subject, then verb, then object — the same order as English.', 'Time words (like 今天) and adverbs (like 也, 很) go before the verb, never at the end.'],
    [['我叫李文。', 'Wǒ jiào Lǐ Wén.', 'My name is Li Wen.'], ['我喝茶。', 'Wǒ hē chá.', 'I drink tea.'], ['他也是学生。', 'Tā yě shì xuéshēng.', 'He is a student too.']],
    ['Which sentence is in the right order?', ['我茶喝。', '喝我茶。', '我喝茶。'], 2, 'Subject 我 + verb 喝 + object 茶.']);

  g(1, 3, '是 sentences', 'A + 是 + B',
    ['是 links two nouns: "A is B". Make it negative with 不是.', 'Don\'t use 是 before adjectives — say 我很忙, not 我是忙.'],
    [['我是中国人。', 'Wǒ shì Zhōngguórén.', 'I am Chinese.'], ['她不是老师。', 'Tā bú shì lǎoshī.', 'She is not a teacher.']],
    ['How do you say "He is not a student"?', ['他没是学生。', '他不是学生。', '他是不学生。'], 1, '不 goes right before 是.']);
  g(1, 3, 'The particle 的', 'A + 的 + B',
    ['的 shows that something belongs to someone or describes it, like "\'s" or "of".', 'With close family or your own group, 的 is often dropped: 我妈妈, 我们学校.'],
    [['这是我的手机。', 'Zhè shì wǒ de shǒujī.', 'This is my phone.'], ['老师的名字', 'lǎoshī de míngzi', 'the teacher\'s name']],
    ['"My friend\'s book" is…', ['我朋友的书', '我的朋友书', '书的我朋友'], 0, 'Owner + 的 + thing.']);
  g(1, 3, 'Yes-no questions with 吗', 'Statement + 吗？',
    ['Add 吗 to the end of a statement to turn it into a yes-no question. The word order doesn\'t change.', 'Answer by repeating the verb: 是 / 不是, 有 / 没有.'],
    [['你是老师吗？', 'Nǐ shì lǎoshī ma?', 'Are you a teacher?'], ['你忙吗？', 'Nǐ máng ma?', 'Are you busy?']],
    ['Turn 你是中国人 into a question.', ['吗你是中国人？', '你是中国人吗？', '你吗是中国人？'], 1, '吗 goes at the very end.']);

  g(1, 4, '有 sentences', 'A + 有 / 没有 + B',
    ['有 means "to have". Its negative is always 没有 — never 不有.'],
    [['我有两个孩子。', 'Wǒ yǒu liǎng gè háizi.', 'I have two children.'], ['他没有哥哥。', 'Tā méiyǒu gēge.', 'He doesn\'t have an older brother.']],
    ['Which is correct?', ['我不有猫。', '我没有猫。', '我有没猫。'], 1, 'The negative of 有 is 没有.']);
  g(1, 4, 'Numbers', '一 … 十 · 十一 · 二十 · 一百',
    ['Numbers build up logically: 十一 is 11, 二十 is 20, 二十五 is 25, 一百 is 100.', 'Before a measure word, "two" is 两, not 二: 两个人.'],
    [['我今年二十岁。', 'Wǒ jīnnián èrshí suì.', 'I am twenty this year.'], ['这儿有两百个学生。', 'Zhèr yǒu liǎng bǎi gè xuéshēng.', 'There are 200 students here.']],
    ['"Two people" is…', ['二个人', '两个人', '两人个'], 1, 'Use 两 before a measure word.']);
  g(1, 4, '呢 for "and you?"', 'Noun + 呢？',
    ['After talking about yourself, add 呢 to a person or thing to ask the same question back: "What about…?"'],
    [['我是学生，你呢？', 'Wǒ shì xuéshēng, nǐ ne?', 'I\'m a student — and you?'], ['我很好，你妈妈呢？', 'Wǒ hěn hǎo, nǐ māma ne?', 'I\'m fine. How about your mom?']],
    ['"I like tea. What about you?"', ['我喜欢茶，你吗？', '我喜欢茶，你呢？', '我喜欢茶，呢你？'], 1, 'Noun + 呢 asks "and you?"']);
  g(1, 4, 'Measure words', 'Number + Measure word + Noun',
    ['In Chinese you can\'t put a number straight before a noun. A measure word goes in between.', '个 is the general one. Others match the shape or type: 本 for books, 口 for family members, 杯 for cups.'],
    [['三个人', 'sān gè rén', 'three people'], ['一本书', 'yì běn shū', 'one book'], ['我家有四口人。', 'Wǒ jiā yǒu sì kǒu rén.', 'There are four people in my family.']],
    ['"One book" is…', ['一书', '一个书', '一本书'], 2, 'Books use the measure word 本.']);

  g(1, 5, 'Saying dates', 'Year + 月 + 号 + 星期',
    ['Chinese goes from big to small: year, month, day, weekday.', 'Months are numbers + 月 (三月 = March). Weekdays are 星期 + number (星期一 = Monday), and Sunday is 星期天 / 星期日.'],
    [['今天三月五号。', 'Jīntiān sān yuè wǔ hào.', 'Today is March 5th.'], ['明天星期六。', 'Míngtiān xīngqīliù.', 'Tomorrow is Saturday.']],
    ['"Monday" is…', ['一星期', '星期一', '星期天'], 1, '星期 + 一.']);
  g(1, 5, 'Sentences without a verb', 'Subject + time / age / price',
    ['For dates, days, ages and prices you can skip 是: 今天星期一 means "Today is Monday".', 'In the negative, 是 comes back: 今天不是星期一.'],
    [['我十九岁。', 'Wǒ shíjiǔ suì.', 'I am nineteen.'], ['今天不是五号。', 'Jīntiān bú shì wǔ hào.', 'Today isn\'t the 5th.']],
    ['"Today isn\'t Monday" is…', ['今天不星期一。', '今天不是星期一。', '今天没星期一。'], 1, 'The negative needs 不是.']);
  g(1, 5, '会 (can, from learning)', 'Subject + 会 + Verb',
    ['会 means you can do something because you learned how: speak a language, cook, drive.', 'It also means "will" for something likely to happen. Negative: 不会.'],
    [['我会做饭。', 'Wǒ huì zuò fàn.', 'I can cook.'], ['他不会说汉语。', 'Tā bú huì shuō Hànyǔ.', 'He can\'t speak Chinese.']],
    ['"I can drive (I know how)" is…', ['我会开车。', '我开会车。', '我开车会。'], 0, '会 goes before the verb.']);

  g(1, 6, '想 (want to)', 'Subject + 想 + Verb',
    ['想 + verb means "would like to / want to". It sounds softer than 要.', 'On its own, 想 + person means "to miss someone".'],
    [['我想喝水。', 'Wǒ xiǎng hē shuǐ.', 'I\'d like to drink some water.'], ['你想去哪儿？', 'Nǐ xiǎng qù nǎr?', 'Where do you want to go?']],
    ['"I want to buy fruit" is…', ['我想买水果。', '我买想水果。', '想我买水果。'], 0, '想 comes right before the verb.']);
  g(1, 6, 'Two verbs in a row (1)', 'Subject + 去/来 + Place + Verb',
    ['Chinese can line verbs up in the order things happen: first go somewhere, then do something there.'],
    [['我去超市买东西。', 'Wǒ qù chāoshì mǎi dōngxi.', 'I\'m going to the supermarket to buy things.'], ['他来中国学习汉语。', 'Tā lái Zhōngguó xuéxí Hànyǔ.', 'He came to China to study Chinese.']],
    ['"I go to the shop to buy milk" is…', ['我买牛奶去商店。', '我去商店买牛奶。', '我去买商店牛奶。'], 1, 'Go to the place first, then do the action.']);
  g(1, 6, '怎么 (how)', '怎么 + Verb？',
    ['怎么 before a verb asks how to do something: 怎么去? = how do I get there?'],
    [['这个字怎么写？', 'Zhège zì zěnme xiě?', 'How do you write this character?'], ['去机场怎么走？', 'Qù jīchǎng zěnme zǒu?', 'How do I get to the airport?']],
    ['"How do you say this in Chinese?"', ['这个汉语怎么说？', '这个怎么汉语说？', '怎么这个说汉语？'], 0, '怎么 sits directly before the verb 说.']);

  g(1, 7, 'Telling the time', 'Number + 点 (+ 分 / 半)',
    ['点 is "o\'clock". 半 is "half past", 一刻 "a quarter".', 'Times go before the verb, with the bigger time first: 晚上六点半.'],
    [['现在八点。', 'Xiànzài bā diǎn.', 'It\'s 8 o\'clock now.'], ['我晚上六点半下班。', 'Wǒ wǎnshang liù diǎn bàn xiàbān.', 'I get off work at 6:30 in the evening.']],
    ['"Half past three" is…', ['三半点', '三点半', '半三点'], 1, 'Hour + 点 + 半.']);
  g(1, 7, '吧 for suggestions', 'Suggestion + 吧',
    ['吧 at the end softens a sentence into a suggestion: "Let\'s…", "…okay?"'],
    [['我们走吧。', 'Wǒmen zǒu ba.', 'Let\'s go.'], ['你休息一下吧。', 'Nǐ xiūxi yíxià ba.', 'Take a rest, okay?']],
    ['"Let\'s eat" is…', ['我们吃饭吗。', '我们吃饭吧。', '我们吃饭呢。'], 1, '吧 makes a suggestion.']);
  g(1, 7, 'Where time words and adverbs go', 'Subject + Time + Adverb + Verb',
    ['Time words go before the verb — either right after the subject or at the very start.', 'Adverbs like 也, 都, 很, 不 go directly before the verb or adjective.'],
    [['我明天也去。', 'Wǒ míngtiān yě qù.', 'I\'m going tomorrow too.'], ['明天我们都不上课。', 'Míngtiān wǒmen dōu bú shàngkè.', 'None of us have class tomorrow.']],
    ['Which is correct?', ['我去明天。', '我明天去。', '我去也明天。'], 1, 'Time words go before the verb.']);
  g(1, 7, '呢 for "where is…?"', 'Noun + 呢？',
    ['When something is missing, Noun + 呢 asks "Where is…?"'],
    [['我的手机呢？', 'Wǒ de shǒujī ne?', 'Where\'s my phone?'], ['妈妈呢？', 'Māma ne?', 'Where\'s Mom?']],
    ['You can\'t find your cup. You say…', ['我的杯子呢？', '我的杯子吗？', '我的杯子吧？'], 0, 'Noun + 呢 asks where it is.']);

  g(1, 8, 'Position words', 'Noun + 上 / 下 / 里 / 前 / 后 (+ 边)',
    ['Position words come after the noun: 桌子上 = on the table, 房间里 = in the room.', '边 can be added: 前边, 外边, 左边.'],
    [['书在桌子上。', 'Shū zài zhuōzi shang.', 'The book is on the table.'], ['医院在学校前边。', 'Yīyuàn zài xuéxiào qiánbian.', 'The hospital is in front of the school.']],
    ['"In the room" is…', ['里房间', '房间里', '在里房间'], 1, 'Noun first, then the position word.']);
  g(1, 8, '在 for "at / in"', 'Subject + 在 + Place + Verb',
    ['在 + place goes before the verb to say where something happens.', 'On its own, 在 means "to be at": 我在家.'],
    [['我爸爸在医院工作。', 'Wǒ bàba zài yīyuàn gōngzuò.', 'My dad works at a hospital.'], ['他在家吗？', 'Tā zài jiā ma?', 'Is he at home?']],
    ['"I study at school" is…', ['我学习在学校。', '我在学校学习。', '在学习我学校。'], 1, '在 + place comes before the verb.']);
  g(1, 8, '能 (can, be able to)', 'Subject + 能 + Verb',
    ['能 means you\'re able to, or circumstances allow it.', 'Compare: 会 = know how; 能 = able / allowed right now.'],
    [['你能来吗？', 'Nǐ néng lái ma?', 'Can you come?'], ['我今天不能去。', 'Wǒ jīntiān bù néng qù.', 'I can\'t go today.']],
    ['"I\'m sick, I can\'t go to class." Which word fits? 我生病了，不___上课。', ['会', '能', '想'], 1, 'It\'s about being able right now, so 能.']);

  g(1, 9, 'Place + 有 (there is)', 'Place + 有 + Noun',
    ['To say "there is something somewhere", put the place first, then 有.'],
    [['桌子上有一本书。', 'Zhuōzi shang yǒu yì běn shū.', 'There\'s a book on the table.'], ['学校里有很多人。', 'Xuéxiào li yǒu hěn duō rén.', 'There are lots of people at school.']],
    ['"There are two chairs in the room"', ['两把椅子有房间里。', '房间里有两把椅子。', '有房间里两把椅子。'], 1, 'Place + 有 + thing.']);
  g(1, 9, 'Time before place', 'Subject + Time + 在 + Place + Verb',
    ['When a sentence has both a time and a place, the time comes first.'],
    [['我明天上午在学校学习。', 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.', 'Tomorrow morning I\'ll study at school.'], ['他晚上在家看电视。', 'Tā wǎnshang zài jiā kàn diànshì.', 'He watches TV at home in the evening.']],
    ['Which order is right?', ['我在家晚上吃饭。', '我晚上在家吃饭。', '我吃饭晚上在家。'], 1, 'Time first, then place, then verb.']);
  g(1, 9, '第 for ordinals', '第 + Number',
    ['Put 第 before a number to make "first, second, third…".'],
    [['这是我第一次来北京。', 'Zhè shì wǒ dì-yī cì lái Běijīng.', 'This is my first time in Beijing.'], ['第三课', 'dì-sān kè', 'Lesson three']],
    ['"The second day" is…', ['二第天', '第二天', '天第二'], 1, '第 + number.']);

  g(1, 10, 'Talking about money', 'Number + 块 / 元 (+ 毛)',
    ['In speech, 块 is used for yuan and 毛 for 0.1 yuan. 元 is the written form.', 'Ask the price with 多少钱?'],
    [['这个多少钱？', 'Zhège duōshao qián?', 'How much is this?'], ['三块五。', 'Sān kuài wǔ.', '3.50 yuan.']],
    ['How do you ask the price?', ['几钱？', '多少钱？', '钱多少？'], 1, '多少钱 = how much money.']);
  g(1, 10, 'Adjectives as the main verb', 'Subject + 很 + Adjective',
    ['Adjectives work like verbs, so you don\'t need 是. Plain statements usually add 很, even if you don\'t mean "very".'],
    [['这儿的苹果很便宜。', 'Zhèr de píngguǒ hěn piányi.', 'The apples here are cheap.'], ['今天不冷。', 'Jīntiān bù lěng.', 'It isn\'t cold today.']],
    ['"This dress is pretty" is…', ['这件衣服是漂亮。', '这件衣服很漂亮。', '这件衣服漂亮是。'], 1, 'No 是 before adjectives — use 很.']);
  g(1, 10, '怎么样 (how is it?)', '… 怎么样？',
    ['怎么样 at the end asks for an opinion: "How is…?" or "How about…?"'],
    [['这家饭店怎么样？', 'Zhè jiā fàndiàn zěnmeyàng?', 'How is this restaurant?'], ['我们明天去，怎么样？', 'Wǒmen míngtiān qù, zěnmeyàng?', 'Let\'s go tomorrow — how about it?']],
    ['"How\'s the weather today?"', ['今天天气怎么样？', '今天怎么天气？', '怎么样今天天气？'], 0, '怎么样 goes at the end.']);

  g(1, 11, 'Verb-not-verb questions', 'Verb + 不 + Verb？',
    ['Another way to ask yes-no questions: say the verb, then 不 + the verb. Don\'t add 吗.'],
    [['你去不去？', 'Nǐ qù bu qù?', 'Are you going or not?'], ['他是不是老师？', 'Tā shì bu shì lǎoshī?', 'Is he a teacher?']],
    ['Which question is correct?', ['你忙不忙吗？', '你忙不忙？', '你不忙忙？'], 1, 'With verb-不-verb, don\'t add 吗.']);
  g(1, 11, '在 / 正在 (in the middle of)', 'Subject + (正)在 + Verb (+ 呢)',
    ['在 or 正在 before a verb shows the action is happening right now. 呢 is often added at the end.'],
    [['我在吃饭呢。', 'Wǒ zài chī fàn ne.', 'I\'m eating.'], ['她正在睡觉。', 'Tā zhèngzài shuìjiào.', 'She\'s sleeping right now.']],
    ['"He is studying" is…', ['他学习在。', '他正在学习。', '正在他学习。'], 1, '正在 goes before the verb.']);
  g(1, 11, '要 (want / will / need)', 'Subject + 要 + Verb',
    ['要 + verb means "want to" (stronger than 想), "will", or "need to".', '"Don\'t want to" is 不想; "don\'t need to" is 不用.'],
    [['我要喝咖啡。', 'Wǒ yào hē kāfēi.', 'I want a coffee.'], ['明天要下雨。', 'Míngtiān yào xià yǔ.', 'It\'s going to rain tomorrow.']],
    ['"I don\'t want to go" is best said as…', ['我不要去。', '我不想去。', '我要不去。'], 1, 'For "don\'t want to", use 不想.']);

  g(1, 12, 'Sentences without a subject', '下雨了 · 下雪了',
    ['Weather and some events don\'t need a subject: just 下雨了 ("It\'s raining").'],
    [['下雪了！', 'Xià xuě le!', 'It\'s snowing!'], ['上课了。', 'Shàngkè le.', 'Class is starting.']],
    ['"It\'s raining" is…', ['它下雨了。', '下雨了。', '雨下了它。'], 1, 'No subject needed.']);
  g(1, 12, '了 for a change', 'Sentence + 了',
    ['了 at the end of a sentence shows something has changed or a new situation has started.'],
    [['天冷了。', 'Tiān lěng le.', 'It\'s gotten cold.'], ['我不忙了。', 'Wǒ bù máng le.', 'I\'m not busy anymore.']],
    ['"He\'s sick now (he wasn\'t before)"', ['他生病了。', '他了生病。', '了他生病。'], 0, '了 at the end shows a change.']);
  g(1, 12, '太……了 (too / so…)', '太 + Adjective + 了',
    ['太…了 means "too…" or, when you\'re happy, "so…!"'],
    [['太贵了！', 'Tài guì le!', 'That\'s too expensive!'], ['太好了！', 'Tài hǎo le!', 'That\'s great!']],
    ['"It\'s so hot!"', ['太热！', '太热了！', '热太了！'], 1, '太 + adjective + 了.']);

  g(1, 13, '可以 (may / can)', 'Subject + 可以 + Verb',
    ['可以 asks for or gives permission: "may I…?" It can also mean "it\'s possible to".'],
    [['我可以坐这儿吗？', 'Wǒ kěyǐ zuò zhèr ma?', 'May I sit here?'], ['这儿不可以吃东西。', 'Zhèr bù kěyǐ chī dōngxi.', 'You can\'t eat here.']],
    ['Asking politely "May I come in?"', ['我会进来吗？', '我可以进来吗？', '我想进来吗？'], 1, 'Permission = 可以.']);
  g(1, 13, 'Verb + 一下', 'Verb + 一下',
    ['一下 after a verb makes it short and casual: "have a quick look", "wait a moment".'],
    [['请等一下。', 'Qǐng děng yíxià.', 'Please wait a moment.'], ['你看一下这个。', 'Nǐ kàn yíxià zhège.', 'Take a look at this.']],
    ['"Let me have a quick look" is…', ['我看一下。', '我一下看。', '一下我看。'], 0, 'Verb + 一下.']);
  g(1, 13, 'Two objects (1)', 'Subject + 给 + Person + Thing',
    ['Some verbs take a person and a thing. The person comes first: 给我一杯茶 = give me a cup of tea.'],
    [['请给我一杯茶。', 'Qǐng gěi wǒ yì bēi chá.', 'A cup of tea, please.'], ['他给我一本书。', 'Tā gěi wǒ yì běn shū.', 'He gave me a book.']],
    ['"Give me a bottle of water"', ['给一瓶水我。', '给我一瓶水。', '我给一瓶水。'], 1, 'Person before thing.']);

  g(1, 14, '了 after the verb (done)', 'Verb + 了 + Number + Object',
    ['了 right after a verb shows the action is completed — usually with a number or detail after it.', 'Negative: 没 + verb, without 了.'],
    [['我看了一个电影。', 'Wǒ kàn le yí gè diànyǐng.', 'I watched a movie.'], ['他没去。', 'Tā méi qù.', 'He didn\'t go.']],
    ['"I didn\'t eat breakfast"', ['我不吃了早饭。', '我没吃早饭。', '我没吃了早饭。'], 1, 'Use 没 and drop 了.']);
  g(1, 14, 'Separable words (1)', '睡觉 → 睡了 + time + 觉',
    ['Some verbs are really verb + object, like 睡觉 (sleep a sleep) or 上课. Extra words go between the two parts.'],
    [['我睡了八个小时觉。', 'Wǒ shuì le bā gè xiǎoshí jiào.', 'I slept for eight hours.'], ['今天上了两节课。', 'Jīntiān shàng le liǎng jié kè.', 'I had two classes today.']],
    ['"I helped him" (帮忙) is…', ['我帮忙他。', '我帮他的忙。', '我帮忙了他。'], 1, '帮忙 splits: 帮 + person\'s + 忙.']);
  g(1, 14, '都 (all, both)', 'Subject (plural) + 都 + Verb',
    ['都 goes before the verb and refers back to everyone or everything mentioned before it.'],
    [['我们都是学生。', 'Wǒmen dōu shì xuéshēng.', 'We are all students.'], ['他们都不去。', 'Tāmen dōu bú qù.', 'None of them are going.']],
    ['"We all like tea"', ['都我们喜欢茶。', '我们都喜欢茶。', '我们喜欢都茶。'], 1, '都 goes before the verb.']);

  g(1, 15, '……，还/也…… (and also)', 'Clause 1，还 / 也 + Clause 2',
    ['还 adds one more thing: "and also". 也 says the same is true: "too".'],
    [['我想去北京，还想去上海。', 'Wǒ xiǎng qù Běijīng, hái xiǎng qù Shànghǎi.', 'I want to go to Beijing, and Shanghai too.'], ['他会说汉语，也会说英语。', 'Tā huì shuō Hànyǔ, yě huì shuō Yīngyǔ.', 'He speaks Chinese, and English too.']],
    ['"I bought apples, and also bought bananas"', ['我买了苹果，还买了香蕉。', '我买了苹果，买还了香蕉。', '还我买了苹果香蕉。'], 0, '还 goes before the second verb.']);

  window.SH_GRAMMAR = out;
  window.__g = g;
})();
