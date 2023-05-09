# Speedrun's Bingo Template

## Requirements

* Node.js


## How to use

1. clone this repo
2. run `npm i`
3. edit `src/data/data.json`
4. edit `next.config.json` as below:

```js
...
8: assetPrefix: isDevEnv ? "" : "/your-repo-name"
...
```

5. git push


## `data.json`'s scheme

later