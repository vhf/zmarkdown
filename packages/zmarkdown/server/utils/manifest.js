const manifestUtils = {}

// Concatenate two arrays, excluding duplicates
const listConcatUnique = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return Array.from(new Set(a.concat(b)))
  }

  return []
}

// Execute a given function on a manifest
// If the function returns, then content inside the manifest
// will be replaced by the returned value.
const executeOnExtracts = (children, execFunction, depth = 0) => {
  function changeIfReturn (obj, extractType, d) {
    const r = execFunction(obj[extractType], {
      extract_type: extractType,
      depth: d
    })
    if (typeof r === 'string') obj[extractType] = r
  }

  depth++

  children.forEach(child => {
    if (child.title) {
      // Titles need to be handled as titles
      child.title = `# ${child.title}`
      changeIfReturn(child, 'title', depth - 1)
    }

    if (child.introduction) changeIfReturn(child, 'introduction', depth)
    if (child.text) changeIfReturn(child, 'text', depth)

    // Process element's children
    if (child.children) executeOnExtracts(child.children, execFunction, depth)

    if (child.conclusion) changeIfReturn(child, 'conclusion', depth)
  })

  return children
}

// List of rules to assemble VFile `data` section
const metadataPropertiesRules = {
  disableToc: (a, b) => a && b,
  languages: listConcatUnique,
  stats: (a, b) => ({ signs: a.signs + b.signs, words: a.words + b.words }),
  ping: listConcatUnique
}

manifestUtils.gatherExtracts = manifest => {
  const rawExtracts = []

  const appendToExtracts = (text, options = {}) => {
    rawExtracts.push({ text, options })
  }

  // Start recursion by top-level element
  executeOnExtracts([manifest], appendToExtracts)

  return rawExtracts
}

manifestUtils.assemble = (beginVfile, endVfile) => {
  const assembledVfile = {
    contents: `${beginVfile.contents}\n${endVfile.contents}`,
    messages: [],
    data: {}
  }

  if (beginVfile.messages) {
    assembledVfile.messages = assembledVfile.messages.concat(beginVfile.messages)
  }

  if (endVfile.messages) {
    assembledVfile.messages = assembledVfile.messages.concat(endVfile.messages)
  }

  if (beginVfile.data) {
    // Append unique items from A
    for (const [item, value] of Object.entries(beginVfile.data)) {
      if (!Object.keys(endVfile.data).includes(item)) {
        assembledVfile.data[item] = value
      }
    }
  }

  if (endVfile.data) {
    for (const [item, value] of Object.entries(endVfile.data)) {
      // Append unique items from B
      if (!Object.keys(beginVfile.data).includes(item)) {
        assembledVfile.data[item] = value
        continue
      }

      // Append assembled cross-items
      const assemblyRule = metadataPropertiesRules[item]
      if (assemblyRule) {
        assembledVfile.data[item] = assemblyRule(beginVfile.data[item], endVfile.data[item])
      }
    }
  }

  return assembledVfile
}

manifestUtils.dispatch = (parsedExtracts, originalManifest) => {
  // Create a clone of the original manifest
  const finalManifest = Object.assign({}, originalManifest)
  // Dispatching is quite weird: we want the manifest to be rendered
  // but returning every part as a vfile makes a huge response...
  const assembledExtracts = parsedExtracts.reduce(manifestUtils.assemble)

  // Replace each extract where it belongs
  let i = 0
  executeOnExtracts([finalManifest], () => parsedExtracts[i++].contents)

  assembledExtracts.contents = finalManifest
  return assembledExtracts
}

module.exports = manifestUtils
