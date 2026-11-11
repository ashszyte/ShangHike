# Shang Hike · 上 Hike

**Climb the new HSK, one peak at a time. It's only up from here.**

上 (shàng) means "up", and it's the 上 in 上海. Shang Hike is a free study site for the new HSK (HSK 3.0), levels 1–3.

## How it works

- **Each HSK level is a mountain.** Every textbook lesson is a peak on the trail (HSK 1: 15 peaks, HSK 2: 15, HSK 3: 18).
- **Learn words in small batches.** Each new word gets a card with audio and tone colors, then a quick check: meaning, listening, characters and tones.
- **Spaced repetition.** Reviews come back right before you would forget them (Again / Hard / Good / Easy).
- **Weak words deck.** Anything you mark Again or Hard, or miss in a quiz, gathers in one place until you get it right twice.
- **Tone practice.** Shadow the voice, then say it on your own. Your pitch is drawn over the tone shapes; single syllables get an approximate tone check.
- **Teahouses.** Every peak has a teahouse with a collectible Chinese food card.
- **Your hiker.** Pick a hiker, then unlock cultural gear at big peaks and descents: a bamboo hat, a Tang jacket, a panda backpack and more.
- **The descent.** At the summit, review the whole mountain (80% to pass) to unlock the next one.
- **Weekly goal instead of a streak**, so rest days don't punish you.

Progress is saved in your browser (no account). You can download it as a file in Settings and load it on another device.

## Run it

It's a static site with no build step. Open `index.html`, or serve the folder:

```
python3 -m http.server
```

To rebuild the word data after editing the TSV files in `tools/`:

```
python3 tools/build_data.py
```

## Content

Words, pinyin and lesson numbers follow the lesson vocabulary lists of the *New HSK Course* (新HSK教程) 1–3 textbooks. English glosses, food cards and gear notes were written for this project. Audio uses the browser's built-in Chinese voice.

Made by Alea with Claude.
