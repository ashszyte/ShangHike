// Grammar points, HSK 3.
(function () {
  const g = window.__g;

  g(3, 1, '看上去 / 看起来 (looks like)', 'Subject + 看上去 / 看起来 + Description',
    ['看上去 and 看起来 mean "looks…" or "seems…", based on what you can see.'],
    [['他看上去很年轻。', 'Tā kàn shàngqù hěn niánqīng.', 'He looks young.'], ['这个菜看起来很好吃。', 'Zhège cài kàn qǐlái hěn hǎochī.', 'This dish looks delicious.']],
    ['"You look tired"', ['你看起来很累。', '你很累看起来。', '看起来很累你。'], 0, '看起来 + description.']);
  g(3, 1, 'Question words that aren\'t questions (1)', '什么 / 哪儿 / 谁 = something / somewhere / someone',
    ['In a 吗 question or after 想, question words can mean "something", "somewhere", "someone".'],
    [['你想吃点儿什么吗？', 'Nǐ xiǎng chī diǎnr shénme ma?', 'Do you want something to eat?'], ['周末想去哪儿玩儿。', 'Zhōumò xiǎng qù nǎr wánr.', 'I\'d like to go somewhere at the weekend.']],
    ['In 你要买点儿什么吗？, 什么 means…', ['what?', 'something', 'nothing'], 1, 'With 吗, 什么 = "something".']);
  g(3, 1, 'Stacking descriptions', 'Owner + Number/Measure + Description + Noun',
    ['When several words describe a noun, the usual order is: whose → how many → what kind → noun.'],
    [['我们班的两个新同学', 'wǒmen bān de liǎng gè xīn tóngxué', 'two new classmates in our class'], ['我的那件红色的大衣', 'wǒ de nà jiàn hóngsè de dàyī', 'that red coat of mine']],
    ['Which order is natural?', ['两个我们班的新同学', '我们班的两个新同学', '新同学我们班的两个'], 1, 'Whose → how many → what kind.']);

  g(3, 2, '又……又…… (both… and…)', '又 + A + 又 + B',
    ['又…又… joins two qualities that are both true: "both A and B".'],
    [['这家饭馆的菜又便宜又好吃。', 'Zhè jiā fànguǎn de cài yòu piányi yòu hǎochī.', 'The food here is both cheap and tasty.'], ['她又聪明又努力。', 'Tā yòu cōngming yòu nǔlì.', 'She\'s both clever and hardworking.']],
    ['"The room is both big and clean"', ['房间又大又干净。', '房间又大和干净。', '房间大又又干净。'], 0, '又 + A + 又 + B.']);
  g(3, 2, 'Question words meaning "whatever"', 'Question word + Verb，就 + Verb + same word',
    ['Repeat the same question word in both halves: "eat whatever you want to eat".', 'Question word + 都 / 也 means "every…" or "any…": 谁都知道 = everyone knows.'],
    [['你们想吃什么就点什么。', 'Nǐmen xiǎng chī shénme jiù diǎn shénme.', 'Order whatever you feel like.'], ['他哪儿都想去。', 'Tā nǎr dōu xiǎng qù.', 'He wants to go everywhere.']],
    ['"Go wherever you want"', ['你想去哪儿就去哪儿。', '你想去哪儿就去这儿。', '你去哪儿想就去。'], 0, 'Same question word in both halves.']);

  g(3, 3, '挺……的 (quite)', '挺 + Adjective + 的',
    ['挺 is a casual "quite" or "pretty". 的 is often added at the end.'],
    [['这个小区挺好的。', 'Zhège xiǎoqū tǐng hǎo de.', 'This neighborhood is pretty nice.'], ['今天挺冷的。', 'Jīntiān tǐng lěng de.', 'It\'s quite cold today.']],
    ['"Pretty interesting"', ['挺有意思的', '有意思挺的', '的挺有意思'], 0, '挺 + adjective + 的.']);
  g(3, 3, 'Strong degree: 极了 / 死了', 'Adjective + 极了 / 死了',
    ['极了 after an adjective means "extremely". 死了 is a casual, exaggerated "to death".'],
    [['好极了！', 'Hǎo jí le!', 'Excellent!'], ['我饿死了。', 'Wǒ è sǐ le.', 'I\'m starving.']],
    ['"Extremely happy"', ['极高兴了', '高兴极了', '高兴了极'], 1, 'Adjective + 极了.']);
  g(3, 3, '就 vs 才 (early vs late)', 'Time + 就 … 了 · Time + 才 …',
    ['就 shows something happened early or easily (often with 了).', '才 shows it happened late or with difficulty (no 了).'],
    [['他七点就到了。', 'Tā qī diǎn jiù dào le.', 'He arrived as early as seven.'], ['他十点才到。', 'Tā shí diǎn cái dào.', 'He didn\'t arrive until ten.']],
    ['Class starts at 8; she came at 9. 她九点___来。', ['就', '才', '都'], 1, 'Late → 才.']);

  g(3, 4, '一……也/都 + 不/没 (not a single…)', '一 + Measure + Noun + 也/都 + 不/没 + Verb',
    ['This pattern makes a strong negative: "not even one".'],
    [['房间里一个人也没有。', 'Fángjiān li yí gè rén yě méiyǒu.', 'There\'s not a single person in the room.'], ['我一点儿也不累。', 'Wǒ yìdiǎnr yě bú lèi.', 'I\'m not tired at all.']],
    ['"I didn\'t drink a drop of water"', ['我一口水也没喝。', '我没喝一口水也。', '我也一口水没喝。'], 0, '一 + measure + noun + 也 + 没.']);
  g(3, 4, '跟……一样 / 不一样 (same / different)', 'A + 跟 + B + (不)一样',
    ['跟…一样 says two things are the same; 跟…不一样 says they\'re different.'],
    [['这家宾馆跟别的都不一样。', 'Zhè jiā bīnguǎn gēn biéde dōu bù yíyàng.', 'This hotel is unlike any other.'], ['我的手机跟你的一样。', 'Wǒ de shǒujī gēn nǐ de yíyàng.', 'My phone is the same as yours.']],
    ['"My answer is different from yours"', ['我的答案跟你的不一样。', '我的答案不跟你的一样。', '我的答案跟不你的一样。'], 0, '跟 … 不一样.']);
  g(3, 4, '除了……以外 (except / besides)', '除了 A 以外，都 … / 还 / 也 …',
    ['With 都: "except A, all…". With 还 or 也: "besides A, also…".'],
    [['除了他以外，我们都去了。', 'Chúle tā yǐwài, wǒmen dōu qù le.', 'Everyone except him went.'], ['除了汉语以外，我还学英语。', 'Chúle Hànyǔ yǐwài, wǒ hái xué Yīngyǔ.', 'Besides Chinese, I also study English.']],
    ['"Besides tea, I also like coffee"', ['除了茶以外，我都喜欢咖啡。', '除了茶以外，我还喜欢咖啡。', '除了茶，以外我喜欢咖啡。'], 1, '"Besides… also" uses 还.']);

  g(3, 5, '得很 (very)', 'Adjective + 得很',
    ['得很 after an adjective is another way to say "very", common in speech.'],
    [['这样的照片好看得很。', 'Zhèyàng de zhàopiàn hǎokàn de hěn.', 'Photos like these look great.'], ['外面冷得很。', 'Wàimiàn lěng de hěn.', 'It\'s very cold outside.']],
    ['"Very busy"', ['忙得很', '很得忙', '得很忙'], 0, 'Adjective + 得很.']);
  g(3, 5, 'Doubling measure words (every)', 'Measure + Measure · 天天 · 人人',
    ['Doubling a measure word or certain nouns means "every…": 天天 = every day, 个个 = each one.'],
    [['他天天锻炼。', 'Tā tiāntiān duànliàn.', 'He works out every day.'], ['这些苹果个个都很甜。', 'Zhèxiē píngguǒ gègè dōu hěn tián.', 'Every one of these apples is sweet.']],
    ['"Everyone" (doubled)', ['人人', '个人个', '人个人'], 0, '人人 = everyone.']);
  g(3, 5, 'Something appears or arrives', 'Place/Time + Verb + 了 + Person/Thing',
    ['To say someone or something showed up, put the place or time first and the new arrival after the verb.'],
    [['前面走过来一个人。', 'Qiánmiàn zǒu guòlái yí gè rén.', 'Someone is walking over from up ahead.'], ['我们班来了一个新同学。', 'Wǒmen bān lái le yí gè xīn tóngxué.', 'A new student joined our class.']],
    ['"A guest came to our home"', ['一个客人来了我们家。', '我们家来了一个客人。', '我们家一个客人来了了。'], 1, 'Place + verb + 了 + newcomer.']);
  g(3, 5, '……了……就…… (after… then…)', 'Verb 1 + 了 + …，就 + Verb 2',
    ['First action with 了, then 就 + the next action: "after doing A, do B".'],
    [['我下了课就去图书馆。', 'Wǒ xià le kè jiù qù túshūguǎn.', 'After class I\'m going to the library.'], ['他吃了饭就睡觉了。', 'Tā chī le fàn jiù shuìjiào le.', 'He went to sleep right after eating.']],
    ['"After work I\'ll go home"', ['我下了班就回家。', '我就下了班回家。', '我下班了就回家了了。'], 0, 'A + 了, 就 + B.']);

  g(3, 6, '该……了 (it\'s time to)', '该 + Verb + 了',
    ['该…了 means "it\'s time to…" or "it should be someone\'s turn".'],
    [['该起床了！', 'Gāi qǐchuáng le!', 'Time to get up!'], ['该你了。', 'Gāi nǐ le.', 'Your turn.']],
    ['"It\'s time to eat"', ['该吃饭了。', '吃饭该了。', '该了吃饭。'], 0, '该 + verb + 了.']);
  g(3, 6, '如果……，就…… (if… then…)', '如果 + Condition，就 + Result',
    ['如果 introduces a condition and 就 introduces what follows from it.'],
    [['如果明天下雨，我们就不去了。', 'Rúguǒ míngtiān xià yǔ, wǒmen jiù bú qù le.', 'If it rains tomorrow, we won\'t go.'], ['如果你饿了，就点外卖吧。', 'Rúguǒ nǐ è le, jiù diǎn wàimài ba.', 'If you\'re hungry, order takeout.']],
    ['Which word goes in the result? 如果你有时间，___来我家吧。', ['就', '才', '还'], 0, '如果 … 就 ….']);
  g(3, 6, '越来越 (more and more)', 'Subject + 越来越 + Adjective',
    ['越来越 shows something keeps increasing over time.'],
    [['天气越来越热了。', 'Tiānqì yuè lái yuè rè le.', 'The weather is getting hotter and hotter.'], ['你的汉语越来越好。', 'Nǐ de Hànyǔ yuè lái yuè hǎo.', 'Your Chinese keeps getting better.']],
    ['"More and more people"', ['人越来越多。', '越来越人多。', '人多越来越。'], 0, 'Subject + 越来越 + adjective.']);

  g(3, 7, 'Two verbs in a row (2)', 'Subject + 有/没有 + Noun + Verb',
    ['有 / 没有 + noun + verb means "have (no) … to do": 没时间看书 = no time to read.'],
    [['我没有时间看电影。', 'Wǒ méiyǒu shíjiān kàn diànyǐng.', 'I don\'t have time to watch a movie.'], ['他有机会去中国留学。', 'Tā yǒu jīhuì qù Zhōngguó liúxué.', 'He has the chance to study in China.']],
    ['"I have no money to buy it"', ['我没有钱买。', '我买没有钱。', '我没有买钱。'], 0, '没有 + noun + verb.']);
  g(3, 7, 'More 比: 比 + 更 / 还', 'A + 比 + B + 更 / 还 + Adjective',
    ['更 or 还 after 比 means "even more": B is already …, and A is even more so.'],
    [['那条裙子比短裤更好看。', 'Nà tiáo qúnzi bǐ duǎnkù gèng hǎokàn.', 'That skirt looks even better than the shorts.'], ['今天比昨天还冷。', 'Jīntiān bǐ zuótiān hái lěng.', 'Today is even colder than yesterday.']],
    ['"He is even taller than his dad"', ['他比他爸爸更高。', '他更比他爸爸高。', '他比更他爸爸高。'], 0, '比 + B + 更 + adjective.']);
  g(3, 7, 'Strong degree: 得不得了 / 得要命', 'Adjective + 得 + 不得了 / 要命 / 很',
    ['得不得了 and 得要命 after an adjective mean "extremely" — 要命 is very casual.'],
    [['他高兴得不得了。', 'Tā gāoxìng de bùdéliǎo.', 'He\'s extremely happy.'], ['今天热得要命。', 'Jīntiān rè de yàomìng.', 'It\'s crazy hot today.']],
    ['"Extremely tired"', ['累得不得了', '不得了累得', '得累不得了'], 0, 'Adjective + 得 + 不得了.']);
  g(3, 7, '不但……，而且…… (not only… but also…)', '不但 + A，而且 + B',
    ['不但…而且… adds a second, stronger point.'],
    [['她不但会说汉语，而且说得很好。', 'Tā búdàn huì shuō Hànyǔ, érqiě shuō de hěn hǎo.', 'She not only speaks Chinese, she speaks it well.'], ['这里不但便宜，而且很方便。', 'Zhèlǐ búdàn piányi, érqiě hěn fāngbiàn.', 'It\'s not only cheap here, it\'s convenient too.']],
    ['Which word pairs with 不但?', ['所以', '而且', '但是'], 1, '不但 … 而且 ….']);

  g(3, 8, 'Direction words with new meanings', '想起来 · 看出来 · 停下来',
    ['Direction endings can have abstract meanings: 想起来 = remember (it comes up in your mind), 看出来 = make out, 停下来 = come to a stop.'],
    [['我想起来了！', 'Wǒ xiǎng qǐlái le!', 'I remember now!'], ['你看出来了吗？', 'Nǐ kàn chūlái le ma?', 'Can you tell?']],
    ['"I can\'t remember his name"', ['我想不起来他的名字。', '我想起来不他的名字。', '我不想起来他的名字。'], 0, '想不起来 = can\'t recall.']);
  g(3, 8, 'Separable words (2)', '见面 → 见过一次面 · 帮忙 → 帮个忙',
    ['With separable words, time, number or 了/过 go between the two parts.'],
    [['我们见过一次面。', 'Wǒmen jiàn guo yí cì miàn.', 'We\'ve met once.'], ['你能帮我个忙吗？', 'Nǐ néng bāng wǒ gè máng ma?', 'Can you do me a favor?']],
    ['"I slept for two hours" (睡觉)', ['我睡觉了两个小时。', '我睡了两个小时觉。', '我两个小时睡觉了。'], 1, 'Split it: 睡 + time + 觉.']);
  g(3, 8, 'How long so far', 'Verb + 了 + Duration + 了',
    ['A 了 after the verb and another at the end means the action is still going on: "have been … for".'],
    [['我等了你半个小时了。', 'Wǒ děng le nǐ bàn gè xiǎoshí le.', 'I\'ve been waiting for you for half an hour.'], ['他住院住了一个星期了。', 'Tā zhùyuàn zhù le yí gè xīngqī le.', 'He\'s been in hospital for a week.']],
    ['Which one means he\'s STILL studying?', ['他学了三年汉语。', '他学了三年汉语了。', '他学汉语三年。'], 1, 'The final 了 means it\'s ongoing.']);
  g(3, 8, '……以前 / ……以后 (before / after)', 'Event / Time + 以前 / 以后',
    ['以前 and 以后 go after the event: 吃饭以前 = before eating.'],
    [['睡觉以前别喝咖啡。', 'Shuìjiào yǐqián bié hē kāfēi.', 'Don\'t drink coffee before bed.'], ['出院以后要多休息。', 'Chūyuàn yǐhòu yào duō xiūxi.', 'Rest a lot after you leave the hospital.']],
    ['"After class"', ['以后下课', '下课以后', '下以后课'], 1, 'Event + 以后.']);

  g(3, 9, '为了 (in order to)', '为了 + Goal，…',
    ['为了 introduces the goal of an action, usually at the start.'],
    [['为了学好汉语，他每天都练习。', 'Wèile xué hǎo Hànyǔ, tā měitiān dōu liànxí.', 'To learn Chinese well, he practices every day.'], ['为了健康，我天天跑步。', 'Wèile jiànkāng, wǒ tiāntiān pǎobù.', 'I run every day for my health.']],
    ['"To catch the train, he got up early"', ['为了赶火车，他起得很早。', '他起得很早为了，赶火车。', '赶火车为了，他起得很早。'], 0, '为了 + goal comes first.']);
  g(3, 9, 'Can / can\'t (得 / 不 in the middle)', 'Verb + 得 / 不 + Result',
    ['Putting 得 or 不 between a verb and its result says whether you can manage it: 听得懂 = can understand; 看不清 = can\'t see clearly.'],
    [['你听得懂吗？', 'Nǐ tīng de dǒng ma?', 'Can you understand?'], ['字太小，我看不清楚。', 'Zì tài xiǎo, wǒ kàn bu qīngchu.', 'The characters are too small — I can\'t read them clearly.']],
    ['"I can\'t finish eating it"', ['我吃不完。', '我不吃完。', '我吃完不。'], 0, 'Verb + 不 + result.']);
  g(3, 9, '越 A 越 B (the more… the more…)', '越 + A，越 + B',
    ['越 A 越 B: as A increases, so does B.'],
    [['雨越下越大。', 'Yǔ yuè xià yuè dà.', 'The rain is getting heavier and heavier.'], ['我越学越喜欢汉语。', 'Wǒ yuè xué yuè xǐhuan Hànyǔ.', 'The more I study Chinese, the more I like it.']],
    ['"The more he talks, the faster he gets"', ['他越说越快。', '他说越越快。', '越他说越快。'], 0, '越 + A + 越 + B.']);

  g(3, 10, '把 sentences', 'Subject + 把 + Object + Verb + Result / Place',
    ['把 moves the object before the verb to say what you did to it and how it ended up.', 'The verb can\'t stand alone — it needs a result, a place, or 了.'],
    [['你明天再把书还给我吧。', 'Nǐ míngtiān zài bǎ shū huán gěi wǒ ba.', 'You can return the book to me tomorrow.'], ['我把作业做完了。', 'Wǒ bǎ zuòyè zuò wán le.', 'I finished my homework.']],
    ['Which 把 sentence is complete?', ['我把门关。', '我把门关上了。', '我关把门了。'], 1, 'The verb needs a result: 关上了.']);
  g(3, 10, '在……上 / 中 / 下 (in terms of)', '在 + Noun + 上 / 中 / 下',
    ['在…上 = in the area of; 在…中 = in the course of; 在…下 = under (help, guidance).'],
    [['在学习上，他很努力。', 'Zài xuéxí shang, tā hěn nǔlì.', 'When it comes to studying, he works hard.'], ['在老师的帮助下，我进步了。', 'Zài lǎoshī de bāngzhù xià, wǒ jìnbù le.', 'With the teacher\'s help, I improved.']],
    ['"With my friend\'s help" uses…', ['在……上', '在……中', '在……下'], 2, 'Help or guidance → 在…下.']);

  g(3, 11, '还是 vs 或者 (or)', 'Question: 还是 · Statement: 或者',
    ['Both mean "or". In questions use 还是; in statements use 或者.'],
    [['你去还是我去？', 'Nǐ qù háishi wǒ qù?', 'Are you going or am I?'], ['周末我看书或者看电影。', 'Zhōumò wǒ kàn shū huòzhě kàn diànyǐng.', 'At weekends I read or watch movies.']],
    ['我们明天___后天去都可以。', ['还是', '或者', '但是'], 1, 'It\'s a statement, so 或者.']);
  g(3, 11, '把 + Verb + 在 / 到 / 给', '把 + Object + Verb + 在 / 到 / 给 + Place / Person',
    ['To say where something ends up, or who receives it, use 把 + verb + 在 / 到 / 给.'],
    [['请把车停在门口。', 'Qǐng bǎ chē tíng zài ménkǒu.', 'Please park the car at the door.'], ['他把照片发给我了。', 'Tā bǎ zhàopiàn fā gěi wǒ le.', 'He sent me the photos.']],
    ['"Put the book on the table"', ['把书放在桌子上。', '把书在桌子上放。', '放把书在桌子上。'], 0, '把 + object + verb + 在 + place.']);
  g(3, 11, '对……来说 (for someone)', '对 + Person + 来说，…',
    ['对…来说 means "for…" or "from someone\'s point of view".'],
    [['对我来说，汉字很难。', 'Duì wǒ lái shuō, Hànzì hěn nán.', 'For me, Chinese characters are hard.'], ['对孩子来说，玩儿很重要。', 'Duì háizi lái shuō, wánr hěn zhòngyào.', 'For kids, play is important.']],
    ['"For students, this is useful"', ['对学生来说，这很有用。', '来说对学生，这很有用。', '对来说学生，这很有用。'], 0, '对 + person + 来说.']);

  g(3, 12, '或者……，或者…… (either… or…)', '或者 + A，或者 + B',
    ['Repeating 或者 lists options in a statement: "either A or B".'],
    [['我们或者坐地铁，或者打车。', 'Wǒmen huòzhě zuò dìtiě, huòzhě dǎchē.', 'We\'ll either take the subway or a taxi.'], ['周末或者去爬山，或者在家休息。', 'Zhōumò huòzhě qù pá shān, huòzhě zài jiā xiūxi.', 'At the weekend, either hike or rest at home.']],
    ['Which word lists the options? ___打篮球，___踢足球。', ['还是 / 还是', '或者 / 或者', '又 / 又'], 1, 'Statements use 或者.']);
  g(3, 12, '下来 / 下去 (continue / settle)', 'Verb + 下去 = keep going · Verb + 下来 = settle, record',
    ['下去 after a verb means "keep going": 坚持下去.', '下来 means something settles or is kept: 停下来, 写下来, 天气冷下来了.'],
    [['你要坚持下去。', 'Nǐ yào jiānchí xiàqù.', 'You have to keep going.'], ['天气慢慢冷下来了。', 'Tiānqì mànman lěng xiàlái le.', 'The weather is gradually getting cold.']],
    ['"Write it down"', ['写下去', '写下来', '写起来'], 1, 'Recording something = 下来.']);
  g(3, 12, '就 meaning "only"', '就 + Number / Noun',
    ['就 can mean "only, just": 就我一个人 = just me.'],
    [['教室里就我一个人。', 'Jiàoshì li jiù wǒ yí gè rén.', 'I\'m the only one in the classroom.'], ['我就有一百块。', 'Wǒ jiù yǒu yì bǎi kuài.', 'I only have 100 yuan.']],
    ['In 我就要一杯水, 就 means…', ['then', 'only', 'already'], 1, 'Here 就 = only.']);

  g(3, 13, '……的话，就…… (if)', 'Condition + 的话，就 + Result',
    ['的话 at the end of a condition means "if", often with 如果 at the start.'],
    [['明天有空的话，我们就去公园。', 'Míngtiān yǒu kòng dehuà, wǒmen jiù qù gōngyuán.', 'If we\'re free tomorrow, let\'s go to the park.'], ['你累的话就休息吧。', 'Nǐ lèi dehuà jiù xiūxi ba.', 'If you\'re tired, rest.']],
    ['Where does 的话 go?', ['At the end of the condition', 'At the end of the sentence', 'Before the subject'], 0, 'Condition + 的话.']);
  g(3, 13, '把 A + Verb + 成 B (turn A into B)', '把 + A + Verb + 成 + B',
    ['把 + verb + 成 says something becomes or is mistaken for something else.'],
    [['请把美元换成人民币。', 'Qǐng bǎ měiyuán huàn chéng rénmínbì.', 'Please change dollars into RMB.'], ['我把"大"写成了"太"。', 'Wǒ bǎ "dà" xiě chéng le "tài".', 'I wrote 大 as 太 by mistake.']],
    ['"Translate this into Chinese" (翻译)', ['把这个翻译成汉语。', '把汉语翻译成这个。', '翻译把这个成汉语。'], 0, '把 + A + verb + 成 + B.']);
  g(3, 13, '一边……，一边…… (while)', '一边 + Verb 1，一边 + Verb 2',
    ['一边…一边… means doing two things at the same time.'],
    [['他一边吃饭，一边看手机。', 'Tā yìbiān chī fàn, yìbiān kàn shǒujī.', 'He looks at his phone while eating.'], ['我们一边走一边聊。', 'Wǒmen yìbiān zǒu yìbiān liáo.', 'We chatted as we walked.']],
    ['"She sings while cooking"', ['她一边做饭，一边唱歌。', '她做饭一边，唱歌一边。', '一边她做饭，唱歌。'], 0, '一边 + V1, 一边 + V2.']);

  g(3, 14, '被 (passive)', 'Thing + 被 (+ Person) + Verb + Result',
    ['被 makes a passive sentence: the thing affected comes first. It\'s often used when something unwanted happened.'],
    [['这本书被别人借走了。', 'Zhè běn shū bèi biérén jiè zǒu le.', 'This book has been borrowed by someone else.'], ['我的手机被弟弟拿走了。', 'Wǒ de shǒujī bèi dìdi ná zǒu le.', 'My phone was taken by my little brother.']],
    ['"My cake was eaten by the cat"', ['我的蛋糕被猫吃了。', '猫被我的蛋糕吃了。', '我的蛋糕猫被吃了。'], 0, 'Thing + 被 + doer + verb.']);
  g(3, 14, '先……，再/然后…… (first… then…)', '先 + Step 1，再 / 然后 + Step 2',
    ['先 marks the first step; 再 or 然后 marks the next one.'],
    [['你先洗手，再吃饭。', 'Nǐ xiān xǐ shǒu, zài chī fàn.', 'Wash your hands first, then eat.'], ['我们先去银行，然后去超市。', 'Wǒmen xiān qù yínháng, ránhòu qù chāoshì.', 'First the bank, then the supermarket.']],
    ['"First do homework, then play"', ['先做作业，再玩儿。', '再做作业，先玩儿。', '做作业先，玩儿再。'], 0, '先 → 再.']);
  g(3, 14, 'Verb + 什么 (啊) (there\'s no need to…)', 'Verb / Adjective + 什么 (啊)！',
    ['Putting 什么 after a verb or adjective can mean "What\'s there to…?" — it pushes back on something.'],
    [['急什么啊！还早呢。', 'Jí shénme a! Hái zǎo ne.', 'What\'s the rush? It\'s still early.'], ['哭什么！', 'Kū shénme!', 'What are you crying for?']],
    ['你客气什么！ means…', ['What are you so polite for?', 'What is polite?', 'Be polite!'], 0, 'It pushes back: no need to be polite.']);

  g(3, 15, '根据 (according to)', '根据 + Source，…',
    ['根据 means "according to" or "based on".'],
    [['根据天气预报，明天有雨。', 'Gēnjù tiānqì yùbào, míngtiān yǒu yǔ.', 'According to the forecast, it will rain tomorrow.'], ['根据你的要求，我们换了房间。', 'Gēnjù nǐ de yāoqiú, wǒmen huàn le fángjiān.', 'Based on your request, we changed rooms.']],
    ['"According to the map, it\'s nearby"', ['根据地图，就在附近。', '地图根据，就在附近。', '就在附近根据地图。'], 0, '根据 + source comes first.']);
  g(3, 15, 'One by one', '一 + Measure + 一 + Measure (+ 地)',
    ['一个一个, 一遍一遍 mean "one by one", "over and over".'],
    [['请一个一个地进来。', 'Qǐng yí gè yí gè de jìnlái.', 'Please come in one at a time.'], ['他一遍一遍地练习。', 'Tā yí biàn yí biàn de liànxí.', 'He practiced over and over.']],
    ['"Read it again and again"', ['一遍一遍地读', '一一遍遍读', '遍一遍一读'], 0, '一 + measure + 一 + measure + 地.']);
  g(3, 15, '在……看来 (in someone\'s view)', '在 + Person + 看来，…',
    ['在…看来 gives someone\'s opinion: "in my view".'],
    [['在我看来，南京很适合生活。', 'Zài wǒ kànlái, Nánjīng hěn shìhé shēnghuó.', 'In my view, Nanjing is a great place to live.'], ['在他看来，这不是问题。', 'Zài tā kànlái, zhè bú shì wèntí.', 'As he sees it, this isn\'t a problem.']],
    ['"In my opinion" is…', ['在我看来', '我在看来', '看来在我'], 0, '在 + person + 看来.']);
  g(3, 15, '不一会儿 (before long)', '不一会儿，…',
    ['不一会儿 means "in no time", "soon after".'],
    [['不一会儿，雨就停了。', 'Bù yíhuìr, yǔ jiù tíng le.', 'Before long, the rain stopped.'], ['他不一会儿就回来了。', 'Tā bù yíhuìr jiù huílái le.', 'He came back in no time.']],
    ['不一会儿 means…', ['a long time later', 'in no time', 'never'], 1, 'It means very soon after.']);

  g(3, 16, '一会儿……，一会儿…… (one moment… the next…)', '一会儿 + A，一会儿 + B',
    ['This describes something switching back and forth.'],
    [['天气一会儿晴，一会儿阴。', 'Tiānqì yíhuìr qíng, yíhuìr yīn.', 'The weather keeps switching between sunny and cloudy.'], ['孩子一会儿哭，一会儿笑。', 'Háizi yíhuìr kū, yíhuìr xiào.', 'The child cries one moment and laughs the next.']],
    ['"One moment he sits, the next he stands"', ['他一会儿坐，一会儿站。', '他坐一会儿，站一会儿了。', '一会儿他坐站。'], 0, '一会儿 A，一会儿 B.']);
  g(3, 16, '关于 (about)', '关于 + Topic',
    ['关于 means "about, concerning". It usually comes at the start or before a noun with 的.'],
    [['我听说了关于熊猫的新闻。', 'Wǒ tīngshuō le guānyú xióngmāo de xīnwén.', 'I heard the news about the pandas.'], ['关于这个问题，我们明天再说。', 'Guānyú zhège wèntí, wǒmen míngtiān zài shuō.', 'About this problem, let\'s talk tomorrow.']],
    ['"A book about China"', ['一本关于中国的书', '一本中国关于的书', '关于一本中国书'], 0, '关于 + topic + 的 + noun.']);
  g(3, 16, '一般来说 (generally speaking)', '一般来说，…',
    ['一般来说 introduces a general rule.'],
    [['一般来说，南方比北方热。', 'Yìbān lái shuō, nánfāng bǐ běifāng rè.', 'Generally speaking, the south is hotter than the north.'], ['一般来说，熊猫吃竹子。', 'Yìbān lái shuō, xióngmāo chī zhúzi.', 'Generally, pandas eat bamboo.']],
    ['一般来说 is used to…', ['give a general rule', 'tell a story', 'ask a question'], 0, 'It means "generally speaking".']);
  g(3, 16, '不比 (not more … than)', 'A + 不比 + B + Adjective',
    ['A 不比 B + adjective means A isn\'t more … than B — they\'re about the same, or the speaker disagrees with a comparison.'],
    [['我不比你高。', 'Wǒ bù bǐ nǐ gāo.', 'I\'m not taller than you.'], ['这家店不比那家贵。', 'Zhè jiā diàn bù bǐ nà jiā guì.', 'This shop isn\'t more expensive than that one.']],
    ['我不比他忙 means…', ['I\'m busier than him.', 'I\'m not busier than him.', 'I\'m much less busy.'], 1, '不比 = not more … than.']);

  g(3, 17, '向 (towards / from)', '向 + Person / Direction + Verb',
    ['向 means "towards". With 学习 it means "learn from someone".'],
    [['我要多向认真的人学习。', 'Wǒ yào duō xiàng rènzhēn de rén xuéxí.', 'I should learn more from careful people.'], ['一直向前走。', 'Yìzhí xiàng qián zǒu.', 'Walk straight ahead.']],
    ['"Learn from the teacher"', ['向老师学习', '学习向老师', '老师向学习'], 0, '向 + person + 学习.']);
  g(3, 17, '不是……吗？ (isn\'t it…?)', '不是 + … + 吗？',
    ['不是…吗? is a rhetorical question: you think something is true and are a bit surprised.'],
    [['你不是去北京了吗？', 'Nǐ bú shì qù Běijīng le ma?', 'Didn\'t you go to Beijing?'], ['这不是你的书吗？', 'Zhè bú shì nǐ de shū ma?', 'Isn\'t this your book?']],
    ['不是…吗 is used when…', ['you have no idea', 'you think something is true', 'you\'re giving an order'], 1, 'It\'s a rhetorical "isn\'t it?"']);
  g(3, 17, '……，更…… (even more)', 'A，更 + B',
    ['更 in the second half pushes the point further: "…, and even more so…".'],
    [['我喜欢春天，更喜欢秋天。', 'Wǒ xǐhuan chūntiān, gèng xǐhuan qiūtiān.', 'I like spring, and like autumn even more.'], ['学习要努力，更要有好方法。', 'Xuéxí yào nǔlì, gèng yào yǒu hǎo fāngfǎ.', 'Studying takes effort — and even more, good methods.']],
    ['"I like tea, and coffee even more"', ['我喜欢茶，更喜欢咖啡。', '我更喜欢茶，喜欢咖啡。', '我喜欢更茶咖啡。'], 0, '更 goes in the second half.']);
  g(3, 17, '只有……，才…… (only if… then…)', '只有 + Condition，才 + Result',
    ['只有…才… says the condition is the only way to get the result.'],
    [['只有多练习，才能说好汉语。', 'Zhǐyǒu duō liànxí, cái néng shuō hǎo Hànyǔ.', 'Only with lots of practice can you speak Chinese well.'], ['只有你去，他才会去。', 'Zhǐyǒu nǐ qù, tā cái huì qù.', 'He\'ll only go if you go.']],
    ['Which word pairs with 只有?', ['就', '才', '都'], 1, '只有 … 才 ….']);

  g(3, 18, 'Rough numbers', '两三 · 十几 · Number + 左右',
    ['Two neighbouring numbers together mean "about": 两三个 = two or three.', '几 after 十 means "-teen": 十几个. 左右 after a number means "around".'],
    [['我等了十几分钟。', 'Wǒ děng le shí jǐ fēnzhōng.', 'I waited for ten-something minutes.'], ['他一米八左右。', 'Tā yì mǐ bā zuǒyòu.', 'He\'s about 1.8 m tall.']],
    ['"About thirty people"', ['三十个人左右', '左右三十个人', '三十左右个人人'], 0, 'Number + measure + noun + 左右.']);
  g(3, 18, '刚才 vs 刚刚 / 刚', '刚才 = a moment ago (time word) · 刚 = just (adverb)',
    ['刚才 is a time word ("just now") and can go before the subject.', '刚 / 刚刚 are adverbs ("just") and go before the verb.'],
    [['你刚才去哪儿了？', 'Nǐ gāngcái qù nǎr le?', 'Where did you go just now?'], ['我刚到家。', 'Wǒ gāng dào jiā.', 'I just got home.']],
    ['Which can start a sentence before the subject?', ['刚', '刚刚', '刚才'], 2, '刚才 is a time word.']);
  g(3, 18, '只要……，就…… (as long as)', '只要 + Condition，就 + Result',
    ['只要…就… means "as long as A, B will happen" — the condition is enough.'],
    [['只要你努力，就一定能学好。', 'Zhǐyào nǐ nǔlì, jiù yídìng néng xué hǎo.', 'As long as you work hard, you\'ll learn it well.'], ['只要有时间，我就去爬山。', 'Zhǐyào yǒu shíjiān, wǒ jiù qù pá shān.', 'Whenever I have time, I go hiking.']],
    ['只要…就… vs 只有…才…: which says the condition is enough?', ['只要…就…', '只有…才…', 'Neither'], 0, '只要 = enough; 只有 = the only way.']);
  g(3, 18, '从……起 (starting from)', '从 + Time + 起',
    ['从…起 means "starting from (a time)".'],
    [['从明天起，我每天早上跑步。', 'Cóng míngtiān qǐ, wǒ měitiān zǎoshang pǎobù.', 'Starting tomorrow, I\'ll run every morning.'], ['从那天起，他再也没迟到过。', 'Cóng nà tiān qǐ, tā zài yě méi chídào guo.', 'From that day on, he was never late again.']],
    ['"Starting next week"', ['从下个星期起', '起下个星期从', '下个星期从起'], 0, '从 + time + 起.']);

  delete window.__g;
})();
