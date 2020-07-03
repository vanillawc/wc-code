/* eslint no-undef: 0 */
/**
 * creates a variable _pyodide_scopes, which contains
 * the variables in various scopes
 *
 * so the thing is dicts created using globals()
 * auto update themselves, and we don't want that
 */
export function init () {
  pyodide.runPython(`\
  import copy
  pyodide_scopes = {
   "copy": copy,
   "init_vars": copy.copy(globals()),
   "current_scope": "",
   "next_scope_number": 0,
   "scopes": {}
  }

  pyodide_scopes['init_vars']['pyodide_scopes'] = pyodide_scopes
  del copy
  `)
}

/**
 * add subinterpreter related functions to pyodide
 *
 * call this code last, because it needs to remember all necessary
 * variables during init
 *
 * these are SubInterpreters since pyodide "fakes" having multiple
 * interpreters, its still one interpreter running, with its global
 * variables removed
 */
export class SubInterpreter {
  init () {
    this.pyodide = pyodide
    const code = `pyodide_scopes['next_scope_number'] += 1
pyodide_scopes['next_scope_number'] - 1`
    this.scope = pyodide.runPython(code)
  }

  /**
   * set as current interpreter
   */
  setAsCurrentInterpreter () {
    return pyodide.runPython(`
# if there is a current scope present
# transfer all of its variables in the current
# globals scope somewhere else
curr_scope = pyodide_scopes['current_scope']
new_scope = "${this.scope}"

if curr_scope and curr_scope != new_scope:
    copy = pyodide_scopes['copy']
    pyodide_scopes['scopes'][curr_scope] = copy.copy(globals())

    # reset to init values first
    for var in list(globals().keys()):
        should_be_variables = list(pyodide_scopes['init_vars'].keys())
        should_be_variables += ['curr_scope', 'new_scope', 'copy', 'var']
        if var not in should_be_variables:
            del globals()[var]

    # add variables of the new scope if they exist
    globals().update(pyodide_scopes['scopes'].setdefault(new_scope, {}))

    del copy

pyodide_scopes['current_scope'] = new_scope
del new_scope
del curr_scope
`)
  }

  /**
   * run code in the current interpreter,
   * a function more for helpfulness
   */
  run (code) {
    this.setAsCurrentInterpreter()
    pyodide.runPython(code)
  }
}
