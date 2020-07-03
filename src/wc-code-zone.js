import CodeZone from "./zone.js"
/**
 * the wc-code-zone element
 */
export default class WCCodeZone extends HTMLElement{
  constructor(){
    super()
    this.language = this.getAttribute("mode")
    this.zone = new CodeZone()
    this.initalized = false;
    this.elements = {}
  }

  init(){
    const language = WCCode.languages[this.language]
    this.zone.setInterpreter(new language.Interpreter(this.zone));
    this.initalized = true
  }

  get wccodes(){
    return this.getElementsByTagName("wc-code")
  }

  run(){
    this.zone.run()
  }
}

customElements.define("wc-code-zone", WCCodeZone)
