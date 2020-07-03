/* eslint no-undef: 0 */
// we're running python in javascript,
// we need pyiodide
'use strict'
window.languagePluginUrl = 'https://pyodide-cdn2.iodide.io/v0.15.0/full/'

WCCode.languages.python = {
  meta: { url: import.meta.url },
  fileExt: '.py',
  additionalScripts: [
    'https://pyodide-cdn2.iodide.io/v0.15.0/full/pyodide.js'
  ],
  async init () {
    await languagePluginLoader
    await pyodide.loadPackage(['micropip'])
    this.subInterpreters = await import("./python-subinterpreters.js")
    this.subInterpreters.init();
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
  Interpreter: class{
    constructor(zone){
      const language = WCCode.languages.python
      this.zone = zone
      this.subInterpreter = new language.subInterpreters.SubInterpreter()
    }

    async init(){
      await this.subInterpreter.init()
    }

    run(code){
      this.set_print_fn()
      this.subInterpreter.run(code)
    }

    set_print_fn(){
      pyodide.runPython(`
def print(*args):
    from js import WCCode
    zone = WCCode.zones.get(${this.zone.zoneId})
    zone.console.addText([*args])
`)
    }
  }
}
