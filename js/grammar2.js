// Grammar points, HSK 2.
(function () {
  const g = window.__g;

  g(2, 1, '吧 for guessing', 'Statement + 吧？',
    ['吧 at the end of a statement can also mean "…right?" — you think something is true and want the other person to confirm it.'],
    [['你是李老师吧？', 'Nǐ shì Lǐ lǎoshī ba?', 'You\'re Teacher Li, right?'], ['你累了吧？', 'Nǐ lèi le ba?', 'You must be tired, huh?']],
    ['You think she\'s Chinese and want to check:', ['她是中国人吧？', '她是中国人呢？', '吧她是中国人？'], 0, '吧 = "…right?"']);
  g(2, 1, '是……的 (focus on when / where / how)', 'Subject + 是 + Detail + Verb + 的',
    ['For something that already happened, 是…的 puts the focus on when, where, how or with whom it happened.'],
    [['我是去年来中国的。', 'Wǒ shì qùnián lái Zhōngguó de.', 'It was last year that I came to China.'], ['你是怎么来的？', 'Nǐ shì zěnme lái de?', 'How did you get here?']],
    ['"I came by plane" (focus on how)', ['我是坐飞机来的。', '我坐飞机是来的。', '我是来坐飞机的。'], 0, '是 + how + verb + 的.']);
  g(2, 1, 'Asking someone to do something', 'A + 请 / 让 / 叫 + B + Verb',
    ['请, 让 and 叫 link two actions: A asks / lets B do something. B is the object of the first verb and the subject of the second.'],
    [['她请我们吃了北京烤鸭。', 'Tā qǐng wǒmen chī le Běijīng kǎoyā.', 'She treated us to Peking Duck.'], ['妈妈让我早点儿回家。', 'Māma ràng wǒ zǎo diǎnr huí jiā.', 'Mom told me to come home early.']],
    ['"The teacher asked me to read" is…', ['老师让我读。', '老师我让读。', '让老师我读。'], 0, 'A + 让 + B + verb.']);

  g(2, 2, '还是……吧 (had better)', '还是 + Choice + 吧',
    ['还是…吧 means "we\'d better…" after thinking it over.'],
    [['还是打车去吧。', 'Háishi dǎchē qù ba.', 'We\'d better take a taxi.'], ['太晚了，你还是明天来吧。', 'Tài wǎn le, nǐ háishi míngtiān lái ba.', 'It\'s too late — better come tomorrow.']],
    ['"It\'s raining. We\'d better not go out."', ['下雨了，我们还是不出去吧。', '下雨了，我们吧还是不出去。', '下雨了，还是我们出去不吧。'], 0, '还是 + choice + 吧.']);
  g(2, 2, '多 for "more than"', 'Number + 多 + Measure word',
    ['多 after a round number means "a bit more than": 二十多个 = twenty-something.'],
    [['我们班有二十多个学生。', 'Wǒmen bān yǒu èrshí duō gè xuéshēng.', 'Our class has twenty-something students.'], ['他三十多岁。', 'Tā sānshí duō suì.', 'He\'s in his thirties.']],
    ['"More than a hundred people"', ['一百个多人', '一百多个人', '多一百个人'], 1, 'Number + 多 + measure word.']);
  g(2, 2, 'Describing a noun with a verb phrase', 'Verb phrase + 的 + Noun',
    ['Put a whole action before 的 to describe a noun: "the book I bought" = 我买的书.'],
    [['这是我买的书。', 'Zhè shì wǒ mǎi de shū.', 'This is the book I bought.'], ['他做的菜很好吃。', 'Tā zuò de cài hěn hǎochī.', 'The food he makes is delicious.']],
    ['"The movie we watched yesterday"', ['我们昨天看的电影', '电影我们昨天看的', '我们看电影的昨天'], 0, 'Description + 的 + noun.']);

  g(2, 3, 'Result complements', 'Verb + Result (完 / 懂 / 错 / 到 …)',
    ['A second word after the verb tells you the result: 看完 = finish reading, 听懂 = understand by listening, 写错 = write wrongly.', 'Negative: 没 + verb + result.'],
    [['我看完这本书了。', 'Wǒ kàn wán zhè běn shū le.', 'I\'ve finished this book.'], ['我没听懂。', 'Wǒ méi tīng dǒng.', 'I didn\'t understand (what I heard).']],
    ['"I wrote this character wrong"', ['我写错了这个字。', '我错写了这个字。', '我写了错这个字。'], 0, 'Verb + result: 写错.']);
  g(2, 3, 'Doubling verbs', 'Verb + Verb · Verb + 一 + Verb · AB + AB',
    ['Saying a verb twice makes it light and casual: "have a little look", "take a rest".', 'Two-character verbs double as a whole: 休息休息.'],
    [['你看看这个。', 'Nǐ kànkan zhège.', 'Have a look at this.'], ['我们休息休息吧。', 'Wǒmen xiūxi xiūxi ba.', 'Let\'s take a little rest.']],
    ['How do you double 介绍?', ['介介绍绍', '介绍介绍', '介绍绍'], 1, 'AB → ABAB.']);

  g(2, 4, '过 (have done before)', 'Verb + 过',
    ['过 after a verb means you have had this experience at some point. Negative: 没 + verb + 过.'],
    [['我去过上海。', 'Wǒ qù guo Shànghǎi.', 'I\'ve been to Shanghai.'], ['我没吃过北京烤鸭。', 'Wǒ méi chī guo Běijīng kǎoyā.', 'I\'ve never had Peking Duck.']],
    ['"Have you ever seen a panda?"', ['你看过熊猫吗？', '你过看熊猫吗？', '你看熊猫过吗？'], 0, 'Verb + 过.']);
  g(2, 4, '因为……，所以…… (because… so…)', '因为 + Reason，所以 + Result',
    ['因为 gives the reason and 所以 gives the result. You can use both, or just one.'],
    [['因为下雨，所以我没出去。', 'Yīnwèi xià yǔ, suǒyǐ wǒ méi chūqù.', 'Because it rained, I didn\'t go out.'], ['我很累，所以想睡觉。', 'Wǒ hěn lèi, suǒyǐ xiǎng shuìjiào.', 'I\'m tired, so I want to sleep.']],
    ['Which word goes with the result?', ['因为', '所以', '但是'], 1, '所以 introduces the result.']);
  g(2, 4, '的 meaning "the … one"', 'Adjective / Noun + 的',
    ['When it\'s clear what you mean, you can drop the noun: 红色的 = the red one.'],
    [['你穿红色的很好看。', 'Nǐ chuān hóngsè de hěn hǎokàn.', 'You look good in the red one.'], ['这本书是我的。', 'Zhè běn shū shì wǒ de.', 'This book is mine.']],
    ['"I want the big one"', ['我要大的。', '我要的大。', '我大的要。'], 0, 'Adjective + 的 = "the … one".']);

  g(2, 5, 'Direction with 来 / 去', 'Verb + 来 / 去',
    ['来 means toward the speaker, 去 means away from the speaker: 进来 = come in, 进去 = go in.'],
    [['请进来！', 'Qǐng jìnlái!', 'Please come in!'], ['他上去了。', 'Tā shàngqù le.', 'He went up.'], ['你回来吧。', 'Nǐ huílái ba.', 'Come back.']],
    ['You\'re inside the room, inviting a friend in:', ['请进去！', '请进来！', '请来进！'], 1, 'Toward the speaker = 来.']);
  g(2, 5, '都……了 (already!)', '都 + Time / Amount + 了',
    ['都…了 stresses that it\'s already late, a lot, or a long time.'],
    [['都十点了，快起床！', 'Dōu shí diǎn le, kuài qǐchuáng!', 'It\'s already ten — get up!'], ['他都二十岁了。', 'Tā dōu èrshí suì le.', 'He\'s already twenty.']],
    ['"It\'s already midnight!"', ['都十二点了！', '十二点都了！', '都了十二点！'], 0, '都 + time + 了.']);

  g(2, 6, 'Doubling adjectives', 'AA的 · AABB',
    ['Doubling an adjective makes it more vivid and is common in description: 高高的, 漂漂亮亮的.'],
    [['她有大大的眼睛。', 'Tā yǒu dàdà de yǎnjing.', 'She has big, big eyes.'], ['房间干干净净的。', 'Fángjiān gāngān jìngjìng de.', 'The room is nice and clean.']],
    ['Doubled form of 高兴?', ['高高兴兴', '高兴高兴', '高兴兴'], 0, 'Adjectives double as AABB.']);
  g(2, 6, '什么的 (and so on)', 'List + 什么的',
    ['什么的 at the end of a list means "and so on", "and stuff like that".'],
    [['我买了蛋糕、水果什么的。', 'Wǒ mǎi le dàngāo, shuǐguǒ shénme de.', 'I bought cake, fruit and stuff.'], ['他喜欢踢足球、打篮球什么的。', 'Tā xǐhuan tī zúqiú, dǎ lánqiú shénme de.', 'He likes football, basketball and so on.']],
    ['Where does 什么的 go?', ['At the start of the list', 'At the end of the list', 'Before the verb'], 1, 'It closes the list.']);
  g(2, 6, '地 (adjective → how you do it)', 'Adjective + 地 + Verb',
    ['地 (pronounced de) turns an adjective into an adverb describing how an action is done.'],
    [['她高兴地说："生日快乐！"', 'Tā gāoxìng de shuō: "Shēngrì kuàilè!"', 'She said happily, "Happy birthday!"'], ['请慢慢地说。', 'Qǐng mànman de shuō.', 'Please speak slowly.']],
    ['"He walked in quietly" (安静)', ['他安静的走进来。', '他安静地走进来。', '他安静得走进来。'], 1, '地 goes before the verb.']);

  g(2, 7, '一……就…… (as soon as)', '一 + Action 1，就 + Action 2',
    ['一…就… means "as soon as A happens, B happens".'],
    [['我一下课就去吃饭。', 'Wǒ yí xiàkè jiù qù chī fàn.', 'As soon as class ends, I go eat.'], ['他一喝酒就脸红。', 'Tā yì hē jiǔ jiù liǎn hóng.', 'As soon as he drinks, his face turns red.']],
    ['"As soon as I get home, I sleep"', ['我一到家就睡觉。', '我就到家一睡觉。', '一我到家就睡觉。'], 0, 'Subject + 一 + A + 就 + B.']);
  g(2, 7, 'Describing how well something is done', 'Verb + 得 + Description',
    ['得 after a verb introduces a comment on how the action is done: 跑得很快 = runs fast.', 'If there\'s an object, repeat the verb or put the object first: 他篮球打得很好.'],
    [['他跑得很快。', 'Tā pǎo de hěn kuài.', 'He runs fast.'], ['他篮球打得很好。', 'Tā lánqiú dǎ de hěn hǎo.', 'He plays basketball well.']],
    ['"She sings well"', ['她唱得很好。', '她很好唱得。', '她唱的很好地。'], 0, 'Verb + 得 + comment.']);

  g(2, 8, 'Comparing with 比', 'A + 比 + B + Adjective',
    ['A 比 B + adjective = A is more … than B. Don\'t add 很 here.', 'To say "not as… as", use 没有: A 没有 B + adjective.'],
    [['今天比昨天冷。', 'Jīntiān bǐ zuótiān lěng.', 'Today is colder than yesterday.'], ['我没有他高。', 'Wǒ méiyǒu tā gāo.', 'I\'m not as tall as him.']],
    ['"My brother is taller than me"', ['我哥哥比我很高。', '我哥哥比我高。', '我哥哥高比我。'], 1, 'No 很 after 比.']);
  g(2, 8, '虽然……，但是…… (although… but…)', '虽然 + A，但是 + B',
    ['Chinese uses both halves: "although A, but B". It sounds natural, not repetitive.'],
    [['虽然你忘了，但是我记得。', 'Suīrán nǐ wàng le, dànshì wǒ jìde.', 'Even though you forgot, I remembered.'], ['虽然很累，但是很开心。', 'Suīrán hěn lèi, dànshì hěn kāixīn.', 'Tired, but happy.']],
    ['Which word completes it? 虽然下雨了，___我们还去。', ['所以', '但是', '因为'], 1, '虽然 pairs with 但是.']);

  g(2, 9, 'How much more (比 + amount)', 'A + 比 + B + Adjective + Amount',
    ['Put the exact difference after the adjective: 大两岁 = two years older.'],
    [['我比他大两岁。', 'Wǒ bǐ tā dà liǎng suì.', 'I\'m two years older than him.'], ['这件比那件贵一百块。', 'Zhè jiàn bǐ nà jiàn guì yì bǎi kuài.', 'This one is 100 yuan more than that one.']],
    ['"She is three years younger than me"', ['她比我小三岁。', '她比我三岁小。', '她三岁比我小。'], 0, 'The amount goes after the adjective.']);
  g(2, 9, '离 (distance from)', 'A + 离 + B + 近 / 远',
    ['离 talks about distance between two places (or times): "A is far from / close to B".'],
    [['我家离学校很近。', 'Wǒ jiā lí xuéxiào hěn jìn.', 'My home is close to school.'], ['这儿离机场远吗？', 'Zhèr lí jīchǎng yuǎn ma?', 'Is it far from here to the airport?']],
    ['"The hotel is far from the station"', ['酒店从车站很远。', '酒店离车站很远。', '酒店车站离很远。'], 1, 'Distance uses 离, not 从.']);
  g(2, 9, 'How long (duration)', 'Verb + 了 + Duration (+ Object)',
    ['The length of time goes after the verb: 学了两年 = studied for two years.'],
    [['我学了两年汉语。', 'Wǒ xué le liǎng nián Hànyǔ.', 'I studied Chinese for two years.'], ['我们等了一个小时。', 'Wǒmen děng le yí gè xiǎoshí.', 'We waited for an hour.']],
    ['"I slept for eight hours" (睡)', ['我八个小时睡了。', '我睡了八个小时。', '我睡八个小时了了。'], 1, 'Verb + 了 + duration.']);

  g(2, 10, 'Topic + description', 'Topic + Subject + Adjective',
    ['A sentence can start with a topic, then describe part of it: 他身体很好 = "He — his health is good".'],
    [['他身体很好。', 'Tā shēntǐ hěn hǎo.', 'He\'s in good health.'], ['北京秋天很漂亮。', 'Běijīng qiūtiān hěn piàoliang.', 'Autumn in Beijing is beautiful.']],
    ['"My grandma is in good health"', ['我奶奶身体很好。', '我奶奶很好身体。', '身体很好我奶奶。'], 0, 'Topic + part + description.']);
  g(2, 10, '还是 in questions (or?)', 'A + 还是 + B？',
    ['In a question, "or" is 还是: 你喝茶还是喝咖啡? Don\'t add 吗.'],
    [['你喝茶还是喝咖啡？', 'Nǐ hē chá háishi hē kāfēi?', 'Tea or coffee?'], ['你今天去还是明天去？', 'Nǐ jīntiān qù háishi míngtiān qù?', 'Are you going today or tomorrow?']],
    ['"Is it big or small?"', ['大还是小？', '大或者小吗？', '大还是小吗？'], 0, 'Questions use 还是, no 吗.']);
  g(2, 10, '快要……了 (about to)', '要 / 快 / 快要 / 就要 + Verb + 了',
    ['These all mean something is about to happen. 就要 can follow a time word; 快要 can\'t.'],
    [['就要考试了。', 'Jiù yào kǎoshì le.', 'The exam is coming up.'], ['快下雨了。', 'Kuài xià yǔ le.', 'It\'s about to rain.'], ['明天就要开学了。', 'Míngtiān jiù yào kāixué le.', 'School starts tomorrow.']],
    ['"The train leaves tomorrow" (about to)', ['火车明天快要开了。', '火车明天就要开了。', '火车明天开要了。'], 1, 'With a time word, use 就要.']);

  g(2, 11, '着 (an ongoing state)', 'Verb + 着',
    ['着 after a verb shows a state that continues: 门开着 = the door is (standing) open.', 'Verb 1 + 着 + Verb 2 means doing V2 in the manner of V1: 坐着吃 = eat sitting down.'],
    [['门开着。', 'Mén kāi zhe.', 'The door is open.'], ['他笑着说："没问题。"', 'Tā xiào zhe shuō: "Méi wèntí."', 'He said with a smile, "No problem."']],
    ['"She watches TV lying down" (躺)', ['她躺着看电视。', '她看着躺电视。', '她躺看着电视。'], 0, 'Verb + 着 + main verb.']);
  g(2, 11, '最 (the most)', '最 + Adjective / Verb',
    ['最 before an adjective or a verb like 喜欢 means "the most".'],
    [['我最喜欢吃中国菜。', 'Wǒ zuì xǐhuan chī Zhōngguó cài.', 'I like Chinese food the most.'], ['他是我们班最高的。', 'Tā shì wǒmen bān zuì gāo de.', 'He\'s the tallest in our class.']],
    ['"This is the cheapest"', ['这个最便宜。', '这个便宜最。', '最这个便宜。'], 0, '最 goes before the adjective.']);

  g(2, 12, 'More ways to compare', '比…多了 · 比…更 · 跟…一样',
    ['A 比 B + adjective + 多了 / 得多 = much more.', 'A 比 B + 更 / 还 + adjective = even more.', 'A 跟 B 一样 (+ adjective) = the same as.'],
    [['这里比北京冷多了。', 'Zhèlǐ bǐ Běijīng lěng duō le.', 'It\'s much colder here than in Beijing.'], ['他比我更忙。', 'Tā bǐ wǒ gèng máng.', 'He\'s even busier than me.'], ['我跟你一样高。', 'Wǒ gēn nǐ yíyàng gāo.', 'I\'m as tall as you.']],
    ['"This one is much more expensive"', ['这个比那个很贵。', '这个比那个贵多了。', '这个比那个多贵了。'], 1, 'Adjective + 多了.']);

  g(2, 13, 'Two objects (2)', 'Verb + Person + Thing',
    ['送, 教, 告诉, 问 and 给 can take a person and a thing, with the person first.'],
    [['他送我一本书。', 'Tā sòng wǒ yì běn shū.', 'He gave me a book as a gift.'], ['王老师教我们汉语。', 'Wáng lǎoshī jiāo wǒmen Hànyǔ.', 'Teacher Wang teaches us Chinese.']],
    ['"Tell me your name"', ['告诉你的名字我。', '告诉我你的名字。', '我告诉你的名字。'], 1, 'Person first, then the thing.']);
  g(2, 13, 'Comparing how things are done', 'A + Verb + 得 + 比 + B + Adjective',
    ['To compare actions, combine 得 and 比: 他跑得比我快 = he runs faster than me.', '没有 works here too: 我说得没有他好.'],
    [['他跑得比我快。', 'Tā pǎo de bǐ wǒ kuài.', 'He runs faster than me.'], ['我汉语说得没有她好。', 'Wǒ Hànyǔ shuō de méiyǒu tā hǎo.', 'I don\'t speak Chinese as well as she does.']],
    ['"She writes better than me"', ['她写得比我好。', '她比我写得很好。', '她写比我得好。'], 0, 'Verb + 得 + 比 + B + adjective.']);

  g(2, 14, 'Place + Verb + 着 (there is…)', 'Place + Verb + 着 + Thing',
    ['Describe what is somewhere, and how it\'s placed: 桌子上放着一本书 = on the table lies a book.'],
    [['墙上挂着一张地图。', 'Qiáng shang guà zhe yì zhāng dìtú.', 'There\'s a map hanging on the wall.'], ['门口站着一个人。', 'Ménkǒu zhàn zhe yí gè rén.', 'There\'s someone standing at the door.']],
    ['"There\'s a cat sleeping on the bed" (睡)', ['床上睡着一只猫。', '一只猫床上睡着。', '床上一只猫睡着。'], 0, 'Place + verb + 着 + thing.']);
  g(2, 14, '多 for "how…!"', '多 + Adjective + 啊！',
    ['多 + adjective + 啊 is an exclamation: "How…!", "So…!"'],
    [['一个人过年多没意思啊！', 'Yí gè rén guònián duō méi yìsi a!', 'How boring to spend New Year alone!'], ['这里多漂亮啊！', 'Zhèlǐ duō piàoliang a!', 'How beautiful it is here!']],
    ['"How delicious!"', ['多好吃啊！', '好吃多啊！', '多啊好吃！'], 0, '多 + adjective + 啊.']);
  g(2, 14, 'Direction with two parts', 'Verb + 上/下/进/出/回/过/起 + 来/去',
    ['Add a direction (上, 进, 回…) plus 来 or 去 after a verb: 走回家去, 拿出来.', 'A place goes before the final 来/去: 走进教室来.'],
    [['他跑进来了。', 'Tā pǎo jìnlái le.', 'He ran in.'], ['我们走回家去吧。', 'Wǒmen zǒu huí jiā qù ba.', 'Let\'s walk back home.']],
    ['"Take it out" (toward me)', ['拿出来', '拿来出', '出拿来'], 0, 'Verb + direction + 来/去.']);

  g(2, 15, 'How many times', 'Verb + 过/了 + Number + 次 (+ Object)',
    ['次 counts how many times you did something. It goes after the verb.', 'With a person or place as object, either order works: 来过这儿两次 / 去过两次北京.'],
    [['我去过两次北京。', 'Wǒ qù guo liǎng cì Běijīng.', 'I\'ve been to Beijing twice.'], ['我想再去一次中国。', 'Wǒ xiǎng zài qù yí cì Zhōngguó.', 'I want to go to China once more.']],
    ['"I\'ve seen this movie three times"', ['这个电影我看过三次。', '这个电影我三次看过。', '我三次过看这个电影。'], 0, 'Verb + 过 + number + 次.']);
  g(2, 15, '有 for "as much as"', 'A + 有 + Number / B + (这么/那么) + Adjective',
    ['有 can mean "reach" or "be as … as": 他有一米八 = he\'s about 1.8 m tall.'],
    [['你的老师有三十岁吗？', 'Nǐ de lǎoshī yǒu sānshí suì ma?', 'Is your teacher thirty yet?'], ['他有你这么高吗？', 'Tā yǒu nǐ zhème gāo ma?', 'Is he as tall as you?']],
    ['"Is it as cold as Beijing?"', ['有北京那么冷吗？', '比北京那么冷吗？', '北京有那么冷？'], 0, '有 + B + 那么 + adjective.']);
})();
