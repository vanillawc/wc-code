const addedScripts = new Set()
const addedCSSLinks = new Set()

/**
 * import a script if we need to import a script,
 * else don't, useful for language syntax/theme additions,
 * adding themes, stuff like that
 */
export async function addScriptIfRequired (_url, base) {
  const url = new URL(_url, base)
  if (addedScripts.has(url.href)) return
  const script = document.createElement('script')
  script.src = url.href
  document.body.appendChild(script)

  await new Promise(resolve => {
    script.addEventListener('load', resolve)
  })
  addedScripts.add(url.href)
}

/**
 * add a css link if required
 */
export async function addCSSLinkIfRequired (_url, base) {
  const url = new URL(_url, base)
  if (addedCSSLinks.has(url.href)) return
  var link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', url.href)
  document.body.appendChild(link)
  await new Promise(resolve => {
    link.addEventListener('load', resolve)
  })
  addedCSSLinks.add(url.href)
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
