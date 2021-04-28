import chunkedSplice from 'micromark/dist/util/chunked-splice.js'
import classifyCharacter from 'micromark/dist/util/classify-character.js'
import shallow from 'micromark/dist/util/shallow.js'

export default function micromarkKbd (options = {}) {
  // By default, use the Unicode character U+124 (`|`)
  const unicodeChar = options.charCode || 124

  const call = {
    name: 'kbd',
    tokenize: tokenizeFactory(unicodeChar),
    resolveAll: resolveAllKbd
  }

  // Inject a hook called on the given character
  return {
    text: { [unicodeChar]: call }
  }
}

function resolveAllKbd (events, context) {
  const eatenEvents = [-1]

  // That's the resolve function, where we remove artifacts
  // In our case, there can be glitchy pipes in the breeze
  for (let i = 0; i < events.length; i++) {
    const current = events[i]

    // We are looking for:
    //   - an enter event;
    //   - inside a `kbdCallDelimiter`;
    //   - that represents a closing delimiter.
    if (current[0] !== 'enter' ||
        current[1].type !== 'kbdCallDelimiter' ||
        !current[1]._end) continue

    // Go back to find the corresponding opening event
    for (let p = i - 1; p > eatenEvents[eatenEvents.length - 1]; p--) {
      const potentialStart = events[p]

      if (potentialStart[0] !== 'enter' ||
          potentialStart[1].type !== 'kbdCallDelimiter' ||
          !potentialStart[1]._start) continue

      const kbdCall = {
        type: 'kbdCall',
        start: shallow(potentialStart[1].start),
        end: shallow(events[i + 1][1].end)
      }

      const kbdCallString = {
        type: 'kbdCallString',
        start: shallow(events[p + 1][1].end),
        end: shallow(current[1].start)
      }

      // Take care of the special case `|||||` (five consecutive pipes)
      if (p + 2 === i) {
        if (!potentialStart[1]._extraIsPipe) continue

        // Remove a character from start
        events[p][1].end._bufferIndex--
        events[p][1].end.column--
        events[p][1].end.offset--

        // Insert data pipe in events
        const data = {
          type: 'data',
          start: shallow(potentialStart[1].end),
          end: shallow(current[1].start)
        }

        chunkedSplice(events, p + 2, 0, [['enter', data, context]])
        chunkedSplice(events, p + 3, 0, [['exit', data, context]])

        i += 2
      }

      chunkedSplice(events, p, 0, [['enter', kbdCall, context]])
      chunkedSplice(events, p + 3, 0, [['enter', kbdCallString, context]])
      chunkedSplice(events, i + 2, 0, [['exit', kbdCallString, context]])
      chunkedSplice(events, i + 5, 0, [['exit', kbdCall, context]])

      // Eat both start & end
      eatenEvents.push(p + 1, i + 3)
      break
    }
  }

  // Mutate events according to what has been found above
  for (let i = 0; i < events.length; i++) {
    // Match only events of interest
    if (events[i][0] !== 'enter') continue
    if (events[i][1].type !== 'kbdCallDelimiter') continue

    if (!eatenEvents.includes(i)) {
      events[i][1].type = 'data'
    }
  }

  return events
}

function tokenizeFactory (charCode) {
  return tokenizeKbd

  function tokenizeKbd (effects, ok, nok) {
    const previous = this.previous

    return start

    // Defines a state `kbdStart` that consumes the first pipe character
    function start (code) {
      // Discard all characters except for the required one
      if (code !== charCode) return nok(code)

      effects.enter('kbdCallDelimiter')
      effects.consume(code)

      return sequence
    }

    // Defines a state `kbdSequence` that consumes all other pipe characters
    function sequence (code) {
      if (code !== charCode) return nok(code)
      effects.consume(code)

      return consumeExtra
    }

    // Defines a state `kbdConsumeExtra` that allow an additionnal pipe
    // and match opening/closing sequences
    function consumeExtra (code) {
      const extraIsPipe = (code === charCode)

      if (extraIsPipe) effects.consume(code)

      const endToken = effects.exit('kbdCallDelimiter')
      endToken._start = extraIsPipe || !classifyCharacter(code)
      endToken._end = !classifyCharacter(previous) || (previous === charCode)
      endToken._extraIsPipe = extraIsPipe

      return extraIsPipe ? ok : ok(code)
    }
  }
}
