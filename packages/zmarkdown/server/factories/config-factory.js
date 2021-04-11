const clone = require('clone')

const defaultMdastConfig = require('../../config/mdast')

module.exports = opts => {
  // Convert endpoint options to configuration
  const mdastConfig = clone(defaultMdastConfig)

  if (opts.disable_ping === true) {
    mdastConfig.ping.pingUsername = () => false
  }

  if (typeof opts.heading_shift === 'number') {
    mdastConfig.headingShifter = opts.heading_shift
  }

  if (opts.disable_jsfiddle === true) {
    mdastConfig.iframes['jsfiddle.net'].disabled = true
    mdastConfig.iframes['www.jsfiddle.net'].disabled = true
  }

  if (
    typeof opts.disable_tokenizers === 'object' &&
    !Array.isArray(opts.disable_tokenizers)
  ) {
    mdastConfig.disableTokenizers = opts.disable_tokenizers
  }

  mdastConfig.postProcessors.getStats = opts.stats === true
  mdastConfig.imagesDownload.disabled = opts.disable_images_download === true

  if (mdastConfig.imagesDownload.disabled !== true) {
    if (typeof opts.images_download_dir === 'string') {
      mdastConfig.imagesDownload.downloadDestination = opts.images_download_dir
    }

    if (
      Array.isArray(opts.local_url_to_local_path) &&
      opts.local_url_to_local_path.length === 2
    ) {
      mdastConfig.imagesDownload.localUrlToLocalPath = opts.local_url_to_local_path
    }

    if (typeof opts.images_download_timeout === 'number') {
      mdastConfig.imagesDownload.httpRequestTimeout = opts.images_download_timeout
    }

    if (typeof opts.images_download_default === 'string') {
      mdastConfig.imagesDownload.defaultImagePath = opts.images_download_default
    }
  }

  if (opts.inline === true) {
    if (!Array.isArray(mdastConfig.disableTokenizers.block)) {
      mdastConfig.disableTokenizers.block = []
    }

    mdastConfig.disableTokenizers.block = mdastConfig.disableTokenizers.block.concat([
      'indentedCode',
      'fencedCode',
      'blockquote',
      'atxHeading',
      'setextHeading',
      'footnote',
      'table',
      'custom_blocks'
    ])
  }

  if (typeof opts.extract_type === 'string') {
    if (['introduction', 'conclusion'].includes(opts.extract_type)) {
      mdastConfig.postProcessors.wrapIntroCcl = {
        type: opts.extract_type,
        level: opts.ic_shift || 0
      }
    }
  }

  return mdastConfig
}
