import WCCodeZone from './wc-code-zone.js'

const addedScripts = {}
const importedScripts = {}
const addedCSSLinks = {}

/**
 * add a script if we need to add a script,
 * else don't, useful for language syntax/theme additions,
 * adding themes, stuff like that
 */
export async function addScriptIfRequired (_url, base) {
  const url = new URL(_url, base)
  if (addedScripts[url.href]) {
    if (addedScripts[url.href].completed) {
      return
    } else {
      return await addedScripts[url.href].promise
    }
  }

  const script = document.createElement('script')
  script.src = url.href
  document.body.appendChild(script)

  const loaded = new Promise(resolve => {
    script.addEventListener('load', resolve)
  })

  addedScripts[url.href] = {
    promise: loaded,
    completed: false
  }

  await loaded

  addedScripts[url.href].completed = true
}

/**
 * import a script if we need to import a script,
 * else don't, useful for language syntax/theme additions,
 * adding themes, stuff like that
 */
export async function importScriptIfRequired (_url, base) {
  const url = new URL(_url, base)

  if (importedScripts[url.href]) {
    if (importedScripts[url.href].completed) {
      return
    } else {
      return await importedScripts[url.href].promise
    }
  }
  const loaded = import(url.href)

  importedScripts[url.href] = {
    promise: loaded,
    completed: false
  }

  await loaded

  importedScripts[url.href].completed = true
}

/**
 * add a css link if required
 */
export async function addCSSLinkIfRequired (_url, base) {
  const url = new URL(_url, base)
  if (addedCSSLinks[url.href]) {
    if (addedCSSLinks[url.href].completed) {
      return
    } else {
      return await addedCSSLinks[url.href].promise
    }
  }

  var link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', url.href)
  document.body.appendChild(link)

  const loaded = new Promise(resolve => link.addEventListener('load', resolve))

  addedCSSLinks[url.href] = {
    promise: loaded,
    completed: false
  }

  await loaded

  addedCSSLinks[url.href].completed = true
}

/**
 * see addScriptIfRequired, this is for multiple scripts
 */
export async function addScriptsIfRequired (urls, base) {
  for (var url of urls) {
    await addScriptIfRequired(url, base)
  }
}

/**
 * see addCSSLinkIfRequired, this is for multiple links
 */
export async function addCSSLinksIfRequired (urls, base) {
  for (var url of urls) {
    await addCSSLinkIfRequired(url, base)
  }
}

/**
 * find parent wc-zone
 *
 * @param wccode - a wccode instance
 */
export function findParentWCCodeZone (wccode) {
  let parent = wccode.parentNode

  while (true) {
    if (parent === document.body) {
      return null
    } else if (parent instanceof WCCodeZone) {
      return parent
    } else if (!parent) {
      return null
    }
    parent = parent.parentNode
  }
}
