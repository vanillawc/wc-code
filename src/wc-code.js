/* eslint no-undef: 0 */
import { WCCodeMirror } from '../../node_modules/@vanillawc/wc-codemirror/index.js'
import WCCodeConsole from './console.js'
import languageDetails from './language-details.js'
import * as Utils from './utils.js'

Utils.addCSSLinkIfRequired('./wc-code.css', import.meta.url)

const WCCode = {
  /**
   * getting elements
   */
  __nextInstanceID: 0,
  instances: {},
  getElement (val) { return this.instances[val] },
  __setElement (el) {
    const WCCodeID = WCCode.__nextInstanceID
    WCCode.__nextInstanceID++
    WCCode.instances[WCCodeID] = el
    return WCCodeID
  },
  WCCodeConsole,
  languages: {},
  Utils
}

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
    this.WCCodeID = WCCode.__setElement(this)

    this.addLoadingBar();
    this.addButtons()
    this.addConsole()
    this.setTheme()
    this.setProgrammingLanguage()
  }

  get languageOptions () {
    return WCCode.languages[this.language]
  }

  /**
   * set the programming language
   */
  async setProgrammingLanguage () {
    const language = this.getAttribute('mode')
    const languageStuff = languageDetails.languages[language]

    this.elements.run.setAttribute('disabled', '')

    if (languageStuff) {
      this.language = language
      this.setAttribute('mode', language)
      this.loadingBar.setText("loading codemirror language file...")
      await Utils.addScriptIfRequired(languageStuff.CMLanguageLoc,
        languageDetails.metaUrl)
      this.loadingBar.setText("loading wc-code language file...")
      await Utils.addScriptIfRequired(languageStuff.languageFile,
        languageDetails.metaUrl)

      if (this.languageOptions.additionalScripts) {
        this.loadingBar.setText("loading additional required scripts...")
        await Utils
          .addScriptsIfRequired(this.languageOptions.additionalScripts,
            this.languageOptions.metaUrl)
      }

      if(!this.languageOptions.initialized){
        this.loadingBar.setText("initializing environment")
        if (this.languageOptions.init){
          await this.languageOptions.init()
        }
        this.languageOptions.initialized = true;
      }

      this.loadingBar.setText("coding environment loading complete");

      this.loadingBar.setDone()

      this.elements.run.removeAttribute('disabled')

      return
    }

    console.error(`wc-code: the programming language you've used - i.e. "${language}" isn't supported, sorry !`)
    console.log(this)
    console.trace()
  }

  /**
   * set the theme
   */
  async setTheme(){
    const theme = this.getAttribute('theme');
    if(theme){
      const base = "https://codemirror.net/theme/"
      const url = base + theme + ".css"
      Utils.addCSSLinkIfRequired(url ,import.meta.url);
    }
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
  addLoadingBar(){
    this.loadingBar = {
      elements : {
        p : document.createElement('p')
      },
      setText(text){
        this.elements.p.innerText = text
      },
      setDone(){
        this.elements.p.classList.remove('wc-code-loading-bar-loading')
        this.elements.p.classList.add('wc-code-loading-bar-done')
      }
    }

    const p = this.loadingBar.elements.p;
    p.classList.add('wc-code-loading-bar')
    p.classList.add('wc-code-loading-bar-loading')

    this.loadingBar.setText("loading...")
    this.appendChild(p);
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
    this.languageOptions.run(this)
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
    const a = document.createElement("a")
    const ext = this.languageOptions.fileExt;
    const filename = this.getAttribute("file-name")||("code-file" + ext)
    const file = new File([this.value], filename, {type: "text/plain"})
    a.href = URL.createObjectURL(file)
    a.download = filename;
    a.click()
  }
}

window.WCCode = WCCode

customElements.define('wc-code', WCCode.WCCode)

export default WCCode
