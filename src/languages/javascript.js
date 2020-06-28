/* eslint no-undef: 0 */
// we're running javascript in javascript
// nothing special is required
WCCode.languages.javascript = {
  meta: { url: document.currentScript.src },
  fileExt: ".js",
  // alternate console for the environment
  createAlternateConsole (webcomponent) {
    return {
      /**
       * console.log alternative
       */
      log (val) {
        webcomponent.console.addText(val)
      }
    }
  },

  /**
   * @param webcomponent - the webcomponent
   */
  async run (webcomponent) {
    const code = `return (async function(){
      const __webcomponent = WCCode.getElement(${webcomponent.WCCodeID})
      var console = WCCode
                      .languages
                      .javascript
                      .createAlternateConsole(__webcomponent)
      ${webcomponent.value}
    })`

    // eslint-disable-next-line
    await Function(code)()()
  }
}
