/* eslint no-undef: 0 */
// we're running python in javascript,
// we need pyiodide
'use strict'
window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.17.0/full/'

WCCode.languages.python = {
  meta: { url: import.meta.url },
  fileExt: '.py',
  additionalScripts: [
    'https://cdn.jsdelivr.net/pyodide/v0.17.0/full/pyodide.js'
  ],
  async init () {
    await languagePluginLoader
    await pyodide.loadPackage(['micropip'])
    await pyodide.loadPackage('numpy')
    this.subInterpreters = await import('./python-subinterpreters.js')
    this.subInterpreters.init()
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
  },
  Interpreter: class {
    constructor (zone) {
      const language = WCCode.languages.python
      this.zone = zone
      this.subInterpreter = new language.subInterpreters.SubInterpreter()
    }

    async init () {
      await this.subInterpreter.init()
    }

    run (code) {
      this.setPrintFn()
      this.subInterpreter.run(code)
    }

    setPrintFn () {
      this.subInterpreter.run(`
def print(*args):
    from js import WCCode
    zone = WCCode.zones.get(${this.zone.zoneId})
    zone.console.addText([*args])
`)
    }
  }
}
