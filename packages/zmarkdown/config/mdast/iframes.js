module.exports = {
  'www.dailymotion.com': {
    width: 480,
    height: 270,
    disabled: false,
    oembed: 'https://www.dailymotion.com/services/oembed'
  },
  'www.vimeo.com': {
    width: 500,
    height: 281,
    disabled: false,
    oembed: 'https://vimeo.com/api/oembed.json'
  },
  'vimeo.com': {
    width: 500,
    height: 281,
    disabled: false,
    oembed: 'https://vimeo.com/api/oembed.json'
  },
  'www.youtube.com': {
    width: 560,
    height: 315,
    disabled: false,
    oembed: 'https://www.youtube.com/oembed'
  },
  'youtube.com': {
    width: 560,
    height: 315,
    disabled: false,
    oembed: 'https://www.youtube.com/oembed'
  },
  'youtu.be': {
    width: 560,
    height: 315,
    disabled: false,
    oembed: 'https://www.youtube.com/oembed'
  },
  'soundcloud.com': {
    width: 500,
    height: 305,
    disabled: false,
    oembed: 'https://soundcloud.com/oembed'
  },
  'www.ina.fr': {
    tag: 'iframe',
    width: 620,
    height: 349,
    disabled: false,
    replace: [
      ['www.', 'player.'],
      ['/video/', '/player/embed/']
    ],
    append: '/1/1b0bd203fbcd702f9bc9b10ac3d0fc21/560/315/1/148db8',
    removeFileName: true
  },
  'www.jsfiddle.net': {
    tag: 'iframe',
    width: 560,
    height: 560,
    disabled: false,
    replace: [
      ['http://', 'https://']
    ],
    append: 'embedded/result,js,html,css/',
    match: /https?:\/\/(www\.)?jsfiddle\.net\/([\w\d]+\/[\w\d]+\/\d+\/?|[\w\d]+\/\d+\/?|[\w\d]+\/?)$/,
    thumbnail: {
      format: 'http://www.unixstickers.com/image/data/stickers' +
      '/jsfiddle/JSfiddle-blue-w-type.sh.png'
    }
  },
  'jsfiddle.net': {
    tag: 'iframe',
    width: 560,
    height: 560,
    disabled: false,
    replace: [
      ['http://', 'https://']
    ],
    append: 'embedded/result,js,html,css/',
    match: /https?:\/\/(www\.)?jsfiddle\.net\/([\w\d]+\/[\w\d]+\/\d+\/?|[\w\d]+\/\d+\/?|[\w\d]+\/?)$/,
    thumbnail: {
      format: 'http://www.unixstickers.com/image/data/stickers' +
      '/jsfiddle/JSfiddle-blue-w-type.sh.png'
    }
  }
}
