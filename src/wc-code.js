/* eslint no-undef: 0 */
import {WCCodeMirror} from 'https://cdn.pika.dev/@vanillawc/wc-codemirror@^1.4.1';
import WCCodeConsole from './console.js'
import languageDetails from './language-details.js'
import * as Utils from './utils.js'
import CodeZone from './zone.js'
import WCCode from './main.js'

Utils.addCSSLinkIfRequired('./wc-code.css', import.meta.url)

/**
 * Code, but like its magic
 */
WCCode.WCCode = class extends WCCodeMirror {
  /**
   * create the wc-code instance
   */
  constructor () {
    super()

    this.elements = {}
    const inWCZone = Utils.findParentWCCodeZone(this)

    if (inWCZone) {
      this.parentZoneElement = inWCZone
      this.zone = inWCZone.zone
      this.setAttribute('mode', this.parentZoneElement.language)
      if (this.parentZoneElement.hasAttribute('theme')) {
        this.setAttribute('theme',
          this.parentZoneElement.getAttribute('theme'))
      }
    } else {
      this.zone = new CodeZone()
    }

    this.addLoadingBar()
    this.addButtons()
    this.addConsole()
    this.setTheme()
    this.init()
  }

  get languageOptions () {
    return WCCode.languages[this.language]
  }

  async connectedCallback(...args){
    await super.connectedCallback(...args);
    this.setKeyCombinations()
  }

  /**
   * set the programming language
   */
  async init () {
    this.elements.run.setAttribute('disabled', '')
    this.checkLanguageExists()
    this.language = this.getAttribute('mode')
    await this.initLanguageFiles()
    await this.initLanguage()
    await this.initInterpreter()
    this.loadingBar.setText('coding environment loading complete')
    this.loadingBar.setDone()
    this.elements.run.removeAttribute('disabled')
  }

  checkLanguageExists () {
    const language = this.getAttribute('mode')
    const languageStuff = languageDetails.languages[language]

    if (languageStuff) return
    console.error(`wc-code: the programming language you've used - i.e. "${language}" isn't supported, sorry !`)
    console.log(this)
    console.trace()
  }

  async initLanguageFiles () {
    const language = this.language
    const languageStuff = languageDetails.languages[language]
    this.setAttribute('mode', language)
    this.loadingBar.setText('loading codemirror language file...')
    await Utils.importScriptIfRequired(languageStuff.CMLanguageLoc, languageDetails.metaUrl)
    this.loadingBar.setText('loading wc-code language file...')
    await Utils.importScriptIfRequired(languageStuff.languageFile,
      languageDetails.metaUrl)

    if (this.languageOptions.additionalScripts) {
      this.loadingBar.setText('loading additional required scripts...')
      await Utils
        .addScriptsIfRequired(this.languageOptions.additionalScripts,
          this.languageOptions.meta.url)
    }
  }

  async initLanguage () {
    this.loadingBar.setText('initializing language...')
    if (!this.languageOptions.initilalized) {
      // if the language has an init function,
      // init it !
      if (this.languageOptions.init) {
        if (this.languageOptions.inited) {
          await this.languageOptions.inited
        } else {
          this.languageOptions.inited = this.languageOptions.init()
          await this.languageOptions.inited
        }
      }

      this.languageOptions.initialized = true
    }
  }

  async initInterpreter () {
    // create the interpreter
    if (this.parentZoneElement) {
      if (!this.parentZoneElement.initilalized) this.parentZoneElement.init()
    } else {
      const interpreter = new this.languageOptions.Interpreter(this.zone)
      this.zone.setInterpreter(interpreter)
    }

    const interpreter = this.zone.interpreter

    /** initialize the interpreter**/
    if (!interpreter.initialized) {
      this.loadingBar.setText('initializing interpreter')

      // if init has already been called,
      // piggyback on that and wait for it to complete
      if (interpreter.inited) {
        await interpreter.inited
      } else {
        // init the code
        if (interpreter.init) {
          interpreter.inited = interpreter.init()
          await interpreter.inited
        }
      }

      interpreter.initialized = true
    }
  }

  /**
   * set the theme
   */
  async setTheme () {
    const theme = this.getAttribute('theme')
    if (theme) {
      const base = 'https://codemirror.net/theme/'
      const url = base + theme + '.css'
      Utils.addCSSLinkIfRequired(url, import.meta.url)
    }
  }
  

  setKeyCombinations(){
    this.editor.setOption("extraKeys", {
      "Ctrl-Enter": cm => {
        this.run()
      }
    })
  }

  /**
   * adds the run button, copy button and the download file button
   */
  addButtons () {
    this.elements.features = document.createElement('div')
    this.elements.copy = document.createElement('input')
    this.elements.run = document.createElement('input')
    this.elements.download = document.createElement('input')

    this.elements.copy.type = 'button'
    this.elements.run.type = 'button'
    this.elements.download.type = 'button'

    this.elements.run.value = '▶ run code'
    this.elements.copy.value = '⎘ copy to clipboard'
    this.elements.download.value = '↓ download'

    this.elements.run.addEventListener('click', () => this.run())
    this.elements.copy.addEventListener('click', () => this.copy())
    this.elements.download.addEventListener('click', () => this.download())

    this.elements.features.appendChild(this.elements.run)
    this.elements.features.appendChild(this.elements.copy)
    this.elements.features.appendChild(this.elements.download)
    this.appendChild(this.elements.features)
  }

  /**
   * add the loading bar
   */
  addLoadingBar () {
    this.loadingBar = {
      elements: {
        p: document.createElement('p')
      },
      setText (text) {
        this.elements.p.innerText = text
      },
      setDone () {
        this.elements.p.classList.remove('wc-code-loading-bar-loading')
        this.elements.p.classList.add('wc-code-loading-bar-done')
      }
    }

    const p = this.loadingBar.elements.p
    p.classList.add('wc-code-loading-bar')
    p.classList.add('wc-code-loading-bar-loading')

    this.loadingBar.setText('loading...')
    this.appendChild(p)
  }

  /**
   * adds the code console
   */
  addConsole () {
    this.console = new WCCodeConsole(this)
  }

  /**
   * run the code
   */
  run () {
    this.console.clear()
    this.zone.setConsole(this.console)
    this.zone.run(this.value)
  }

  /**
   * copy the code
   */
  copy () {
    navigator.clipboard.writeText(this.value)
  }

  /**
   * download the code
   */
  download () {
    const a = document.createElement('a')
    const ext = this.languageOptions.fileExt
    const filename = this.getAttribute('file-name') || ('code-file' + ext)
    const file = new File([this.value], filename, { type: 'text/plain' })
    a.href = URL.createObjectURL(file)
    a.download = filename
    a.click()
  }
}

window.WCCode = WCCode

customElements.define('wc-code', WCCode.WCCode)
