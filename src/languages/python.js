/* eslint no-undef: 0 */
// we're running python in javascript,
// we need pyiodide
'use strict'

window.languagePluginUrl = 'https://pyodide-cdn2.iodide.io/v0.15.0/full/'

WCCode.languages.python = {
  meta: { url: document.currentScript.src },
  fileExt: ".py",
  additionalScripts: [
    'https://pyodide-cdn2.iodide.io/v0.15.0/full/pyodide.js'
  ],
  async init () {
    await languagePluginLoader
    await pyodide.loadPackage(['micropip'])
  },
  /**
   * @param webcomponent - the webcomponent
   */
  async run (webcomponent) {
    pyodide.runPythonAsync(`
import js as __js

def print(*val):
  for v in val:
      wc = __js.WCCode.getElement(${webcomponent.WCCodeID})
      wc.console.addText(v)

${webcomponent.value}`)
  }
}
