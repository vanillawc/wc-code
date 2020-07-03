import WCCode from "./main.js"

/**
 * code zones are zones where the code runs,
 * these are supposed to be completely seperate interpreters
 * that don't share variables with other zones
 */
export default class CodeZone{
  constructor(){
    // needs to be set by the interpreter
    this.interpreter = undefined
    this.console = undefined
    this.zoneId = WCCode.zones.save(this);
  }

  /**
   * set the current interpreter
   */
  setInterpreter(interpreter){
    this.interpreter = interpreter;
  }

  /**
   * set the currest console
   */
  setConsole(_console){
    this.console = _console
  }

  /**
   * run code in the zone
   */
  run(code){
    this.interpreter.run(code)
  }
}
