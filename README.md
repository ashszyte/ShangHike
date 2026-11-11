# Shang Hike · 上 Hike

**Climb the new HSK, one peak at a time. It's only up from here.**

上 (shàng) means "up", and it's the 上 in 上海. Shang Hike is a free study site for the new HSK (HSK 3.0), levels 1–3.

## How it works

- **A 3D mountain range.** HSK 1, 2 and 3 are three low-poly mountains, each higher than the last. Every textbook lesson is a checkpoint on the trail (15 + 15 + 18), and a teahouse waits on each summit.
- **Your hiker.** Choose hair, skin, hair color and jacket. Your hiker stands at your latest checkpoint with idle animations, and walks up the trail when you finish a lesson.
- **Learn, then flashcards.** Meet each new word (audio, tone colors), take a quick check, then do flashcards when you feel ready: see the character, say "I know it" or "Don't know", flip for pinyin and meaning.
- **Spaced repetition + Weak words.** Cards come back right before you'd forget them; don't-knows gather in a Weak words deck.
- **Grammar.** 135 grammar points across all 48 lessons, each with an explanation, examples you can listen to and a quick check.
- **Tone practice.** Shadow the voice, then say it on your own. Your pitch is drawn over the tone shapes and each syllable gets an approximate tone check that adapts to your voice.
- **Rewards.** A Chinese food card at every checkpoint, and cultural gear (bamboo hat, Tang jacket, panda backpack…) at big checkpoints and descents.
- **The descent.** At the summit, review the whole mountain (80% to pass) to reach base camp and unlock the next one.
- **Weekly goal instead of a streak**, so rest days don't punish you.

Progress is saved in your browser (no account). You can download it as a file in Settings and load it on another device.

## Run it

It's a static site with no build step, but the 3D world is an ES module, so serve the folder rather than opening the file directly:

```
python3 -m http.server
```

To rebuild the word data after editing the TSV files in `tools/`:

```
python3 tools/build_data.py
```

## Content

Words, pinyin and lesson numbers follow the lesson vocabulary lists of the *New HSK Course* (新HSK教程) 1–3 textbooks. English glosses, food cards and gear notes were written for this project. Audio uses the device's Chinese voice when one is installed, otherwise an online voice. 3D uses [three.js](https://threejs.org) (MIT, bundled in `js/vendor`).

Made by Alea with Claude.
