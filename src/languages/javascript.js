import * as acorn from 'https://unpkg.com/acorn@8.0.1/dist/acorn.mjs';

/* eslint no-undef: 0 */
// we're running javascript in javascript
// nothing special is required
WCCode.languages.javascript = {
  meta: { url: import.meta.src },
  fileExt: '.js',
  // alternate console for the environment
  createAlternateConsole (interpreter) {
    return {
      log (val) {
        interpreter.zone.console.addText(val)
      }
    }
  },

  /**
   * Interpreter class
   */
  Interpreter: class {
    constructor (codeZone) {
      this.zone = codeZone
      this.zone.setInterpreter(this)
      this.currentVariables = {}
    }

    async run (code) {
      const toGetVariables = this.getVariables(code)
      const finalcode = `
      (async function(){
          const WCCodeJS = WCCode.languages.javascript;
          const interpreter = WCCode
                                 .zones
                                 .get(${this.zone.zoneId})
                                 .interpreter;
          const console = WCCodeJS.createAlternateConsole(interpreter);
          ${this.addVariablesString()}
          ${code}
          ${this.getVariablesString(toGetVariables)};
      })`

      // eslint-disable-next-line no-eval
      await eval(finalcode)()
    }

    getVariables (code) {
      function getVariablesInObject (kind, properties) {
        const variables = []
        for (const property of properties) {
          if (property.type === 'Property') {
            variables.push({ variable: property.key.name, kind })
          } else if (property.type === 'RestElement') {
            variables.push({ variable: property.argument.name, kind })
          }
        }
        return variables
      }

      function getVariablesInArray (kind, elements) {
        const variables = []
        // multiple variables
        for (const element of elements) {
          if (element.type === 'Identifier') {
            variables.push({ variable: element.name, kind })
          } else if (element.type === 'ArrayPattern') {
            variables.push(...getVariablesInArray(kind, element.elements))
          } else if (element.type === 'ObjectPattern') {
            variables.push(...getVariablesInObject(kind, element.properties))
          } else if (element.type === 'RestElement') {
            variables.push({ variable: element.argument.name, kind })
          }
        }
        return variables
      }

      const variables = []
      const parsed = acorn
        .parse(code, { allowAwaitOutsideFunction: true })
        .body
      for (const l of parsed) {
        if (l.type === 'VariableDeclaration') {
          const kind = l.kind // consts, lets or vars
          const declaration = l.declarations[0]
          const variableType = declaration.id.type
          if (variableType === 'Identifier') {
            variables.push({ variable: declaration.id.name, kind })
          } else if (variableType === 'ArrayPattern') {
            variables.push(...getVariablesInArray(kind, declaration.id.elements))
          } else if (variableType === 'ObjectPattern') {
            variables.push(...getVariablesInObject(kind, declaration.id.properties))
          }
        }
      }

      return variables
    }

    /**
     * internally used,
     * assigns the const, let, and var variables to the Interpreter
     */
    addVariablesString () {
      let varsString = ''
      for (const variable in this.currentVariables) {
        const variableProp = this.currentVariables[variable]
        varsString += `${variableProp.kind} ${variable} = interpreter.currentVariables.${variable}.value\n`
      }
      if (!varsString === '') varsString += ';'
      return varsString
    }

    /**
     * retrieves the values of new variables + updates current variables,
     * and stores to for use in the next session
     */
    getVariablesString (variables) {
      let varsString = ''

      // update current variables
      for (const variable in this.currentVariables) {
        const variableProp = this.currentVariables[variable]
        varsString += `interpreter.currentVariables["${variable}"] = {kind: '${variableProp.kind}', value: ${variable}}\n`
      }

      // add new variables
      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i]
        varsString += `interpreter.currentVariables["${variable.variable}"] = {kind: '${variable.kind}', value: ${variable.variable}}\n`
      }

      if (!varsString === '') varsString += ';'
      return varsString
    }
  }

}
