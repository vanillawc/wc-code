<h1 align="center">&lt;wc-code&gt; run code in the browser</h1>

<div align="center">
  <a href="https://github.com/vanillawc/wc-code/releases"><img src="https://badgen.net/github/tag/vanillawc/wc-code" alt="GitHub Releases"></a>
  <a href="https://github.com/vanillawc/wc-code/actions"><img src="https://github.com/vanillawc/wc-code/workflows/Latest/badge.svg" alt="Latest Status"></a>
  <a href="https://github.com/vanillawc/wc-code/actions"><img src="https://github.com/vanillawc/wc-code/workflows/Release/badge.svg" alt="Release Status"></a>
  <a href="https://discord.gg/aSWYgtybzV"><img alt="Discord" src="https://img.shields.io/discord/723296249121603604?color=%23738ADB"></a>
  <a href="https://www.webcomponents.org/element/@vanillawc/wc-code"><img src="https://img.shields.io/badge/webcomponents.org-published-blue.svg" alt="Published on WebComponents.org"></a>
</div>

## Usage

*Import from CDN*
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-code@1.0.4/src/wc-code.js"></script>
```

## Usage NOTE

`wc-code` requires the use of `<!DOCTYPE html>` don't ask me why, ask the forgotten html God of proscii


## Usage

Attributes


- `src` - load an external source file
- `style` - CSS styling (default `height:100%;width:100%;`)
- `mode` - the language you want to use
- `theme` - the codemirror theme you want to use
- `file-name` - this will be the file name used when the file is downloaded
- `viewport-margin`<sup>1</sup> - sets the `viewportMargin` option of the CodeMirrror editor instance (default `10`)
- `readonly` - sets the codemirror's "readOnly" configuration attribute to true, you may set `readonly="nocursor"` if you want to disable the cursor and not let the user select the text inside

*<sup>1</sup>Setting `viewport-margin` to `infinity` will auto-resize the editor to its contents. To see this in action, check out the [CodeMirror Auto-Resize Demo](https://codemirror.net/demo/resize.html).*

### Basic Usage

all language modes/themes are dynamically loaded, and the css is dynamically loaded, you don't need to add any additional files for them 

**JavaScript example**

```html
<!DOCTYPE html>
<head>
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-code@1.0.3/src/wc-code.js"></script>
</head>
<body>
  <wc-code mode="javascript">
    <script type="wc-content">
      const resp = await fetch("https://sv443.net/jokeapi/v2/joke/Any?blacklistFlags=nsfw,racist,sexist&format=txt");
      const text = await resp.text();
      console.log(text);
    </script>
  </wc-code>                                                                                         
</body>
```

**Python Example**

```html
<!DOCTYPE html>
<head>
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-code@1.0.3/src/wc-code.js"></script>
</head>
<body>
  <wc-code mode="python">
    <script type="wc-content">
       a = 1
       b = 1
       print(a+b)
    </script>
  </wc-code>                                                                                         
</body>
```

**Theme Example**
```html
<!DOCTYPE html>
<head>
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-code@1.0.3/src/wc-code.js"></script>
</head>
<body>
  <wc-code mode="python" theme="monokai">
    <script type="wc-content">
       a = 1
       b = 1
       print(a+b)
    </script>
  </wc-code>                                                                                         
</body>
```

**Example in pug !**

**JavaScript example**

```pug
doctype html
html(lang="en")
  script(type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-code@1.0.3/src/wc-code.js")
body
  wc-code(mode="javascript" theme="monokai")
    script(type="wc-content").
      const resp = await fetch("https://sv443.net/jokeapi/v2/joke/Any?blacklistFlags=nsfw,racist,sexist&format=txt");
      const text = await resp.text();
      console.log(text);
```

see https://codemirror.net/theme/ for a list of supported themes

## Contributing

See [CONTRIBUTING.md](https://github.com/vanillawc/vanillawc/blob/main/CONTRIBUTING.md)
