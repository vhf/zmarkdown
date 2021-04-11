"use strict";

const visit = require('unist-util-visit');

const fetch = require('node-fetch');

module.exports = function plugin(opts) {
  if (typeof opts !== 'object' || !Object.keys(opts).length) {
    throw new Error('remark-iframes needs to be passed a configuration object as option');
  }

  function detectProvider(url) {
    const hostname = new URL(url).hostname;
    return opts[hostname];
  }

  function blockTokenizer(eat, value, silent) {
    if (!value.startsWith('!(http')) return;
    let eatenValue = '';
    let url = '';
    const specialChars = ['!', '(', ')'];

    for (let i = 0; i < value.length && value[i - 1] !== ')'; i++) {
      eatenValue += value[i];

      if (!specialChars.includes(value[i])) {
        url += value[i];
      }
    }
    /* istanbul ignore if - never used (yet) */


    if (silent) return true;
    const provider = detectProvider(url);

    if (!provider || provider.disabled === true || provider.match && provider.match instanceof RegExp && !provider.match.test(url)) {
      return eat(eatenValue)({
        type: 'paragraph',
        children: [{
          type: 'text',
          value: eatenValue
        }]
      });
    }

    let finalUrl, thumbnail;
    const data = {
      hName: provider.tag || 'iframe',
      hProperties: {
        src: 'tmp',
        width: provider.width,
        height: provider.height,
        allowfullscreen: true,
        frameborder: '0'
      }
    };

    if (provider.oembed) {
      Object.assign(data, {
        oembed: {
          provider: provider,
          url: `${provider.oembed}?format=json&url=${encodeURIComponent(url)}`,
          fallback: {
            type: 'link',
            url: url,
            children: [{
              type: 'text',
              value: url
            }]
          }
        }
      });
    } else {
      finalUrl = computeFinalUrl(provider, url);
      thumbnail = computeThumbnail(provider, finalUrl);
      Object.assign(data, {
        hProperties: {
          src: finalUrl,
          width: provider.width,
          height: provider.height,
          allowfullscreen: true,
          frameborder: '0'
        },
        thumbnail: thumbnail
      });
    }

    eat(eatenValue)({
      type: 'iframe',
      src: url,
      data
    });
  }

  const Parser = this.Parser; // Inject blockTokenizer

  const blockTokenizers = Parser.prototype.blockTokenizers;
  const blockMethods = Parser.prototype.blockMethods;
  blockTokenizers.iframes = blockTokenizer;
  blockMethods.splice(blockMethods.indexOf('blockquote') + 1, 0, 'iframes');
  const Compiler = this.Compiler;

  if (Compiler) {
    const visitors = Compiler.prototype.visitors;
    if (!visitors) return;

    visitors.iframe = node => `!(${node.src})`;
  }

  return async function transform(tree, vfile, next) {
    let toVisit = 0;
    visit(tree, 'iframe', async node => {
      toVisit++;
    });

    function nextVisitOrBail() {
      if (toVisit === 0) next();
    }

    nextVisitOrBail();
    visit(tree, 'iframe', async node => {
      if (!node.data.oembed) {
        toVisit--;
        nextVisitOrBail();
        return;
      }

      const data = node.data;
      const oembed = data.oembed;
      const provider = data.oembed.provider;
      const fallback = data.oembed.fallback;

      try {
        const {
          url,
          thumbnail,
          height,
          width
        } = await fetchEmbed(oembed.url);
        node.thumbnail = thumbnail;
        Object.assign(data.hProperties, {
          src: url,
          width: provider.width || width,
          height: provider.height || height,
          allowfullscreen: true,
          frameborder: '0'
        });
      } catch (err) {
        let message = err.message;

        if (err.name === 'AbortError') {
          message = `oEmbed URL timeout: ${oembed.url}`;
        }

        vfile.message(message, node.position, oembed.url);
        node.data = {};
        Object.assign(node, fallback);
      }

      delete data.oembed;
      toVisit--;
      nextVisitOrBail();
    });
  };
};

function computeFinalUrl(provider, url) {
  let finalUrl = url;
  let parsed = new URL(finalUrl);

  if (provider.droppedQueryParameters && parsed.search) {
    const search = new URLSearchParams(parsed.search);
    provider.droppedQueryParameters.forEach(ignored => search.delete(ignored));
    parsed.search = search.toString();
    finalUrl = parsed.toString();
  }

  if (provider.replace && provider.replace.length) {
    provider.replace.forEach(rule => {
      const [from, to] = rule;
      if (from && to) finalUrl = finalUrl.replace(from, to);
      parsed = new URL(finalUrl);
    });
    finalUrl = parsed.toString();
  }

  if (provider.removeFileName) {
    parsed.pathname = parsed.pathname.substring(0, parsed.pathname.lastIndexOf('/'));
    finalUrl = parsed.toString();
  }

  if (provider.removeAfter && finalUrl.includes(provider.removeAfter)) {
    finalUrl = finalUrl.substring(0, finalUrl.indexOf(provider.removeAfter));
  }

  if (provider.append) {
    finalUrl += provider.append;
  }

  return finalUrl;
}

function computeThumbnail(provider, url) {
  let thumbnailURL = '';
  const thumbnailConfig = provider.thumbnail;

  if (thumbnailConfig && thumbnailConfig.format) {
    thumbnailURL = thumbnailConfig.format;
    Object.keys(thumbnailConfig).filter(key => key !== 'format').forEach(key => {
      const search = new RegExp(`{${key}}`, 'g');
      const replace = new RegExp(thumbnailConfig[key]).exec(url);
      if (replace) thumbnailURL = thumbnailURL.replace(search, replace[1]);
    });
  }

  return thumbnailURL;
}

async function fetchEmbed(url) {
  return fetch(url, {
    timeout: 1500
  }).then(res => res.json()).then(oembedRes => {
    const oembedUrl = oembedRes.html.match(/src="(.+?)"/)[1];
    const oembedThumbnail = oembedRes.thumbnail_url;
    return {
      url: oembedUrl,
      thumbnail: oembedThumbnail,
      width: oembedRes.width,
      height: oembedRes.height
    };
  });
}