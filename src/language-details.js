const ModesBaseLoc = 'https://cdn.jsdelivr.net/gh/vanillawc/wc-codemirror@1.8.7/mode/'

/**
 * these attributes, when loaded, load the
 * script file for the language dynamically,
 * as well the code running file
 */
export default {
  metaUrl: import.meta.url,
  languages: {
    javascript: {
      CMLanguageLoc: ModesBaseLoc + 'javascript/javascript.js',
      languageFile: './languages/javascript.js'
    },
    python: {
      CMLanguageLoc: ModesBaseLoc + 'python/python.js',
      languageFile: './languages/python/python.js'
    }
  }
}
