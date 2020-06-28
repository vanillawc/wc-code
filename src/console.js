// the contains code for the output console

class WCCodeConsole {
  constructor (wccode) {
    this.elements = {}
    this.createDiv(wccode)
  }

  /**
   * creates the console div for wc-code
   *
   * @param wccode - a wc-code instance
   */
  createDiv (wccode) {
    this.elements.console = document.createElement('div')
    this.elements.console.classList.add('wc-code-console')
    this.elements.consoleList = document.createElement('ol')

    this.elements.console.appendChild(this.elements.consoleList)
    wccode.appendChild(this.elements.console)
  }

  /**
   * add an element inside a console,
   *
   * this will be put in an 'li' element befor being put inside
   *
   * @param el - the HTMLElement to be put inside
   */
  addEl (el) {
    const li = document.createElement('li')
    li.appendChild(el)
    this.elements.consoleList.appendChild(li)
  }

  /**
   * easy method to put a span element inside the console with some text inside
   *
   * @param {String} text - the text to put inside the console
   */
  addText (text) {
    const span = document.createElement('span')
    span.innerText = text
    this.addEl(span)
  }

  /** clear the console **/
  clear () {
    this.elements.consoleList.innerText = ''
  }
}

export default WCCodeConsole
