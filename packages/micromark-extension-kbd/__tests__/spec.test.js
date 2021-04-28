import micromark from 'micromark'
import micromarkKbd from '../lib/index'
import micromarkKbdHtml from '../lib/html'

const specificationTests = {
  'works': ['||Ctrl||', '<p><kbd>Ctrl</kbd></p>'],
  'missing one': ['||Ctrl|', '<p>||Ctrl|</p>'],
  'can contain pipe': ['|||||', '<p><kbd>|</kbd></p>'],
  'no more than one pipe': ['||a||b||', '<p><kbd>a</kbd>b||</p>'],
  'no spaces opening': ['| |a||', '<p>| |a||</p>'],
  'no spaces closing': ['||a| |', '<p>||a| |</p>'],
  'cannot start with space': ['|| a||', '<p>|| a||</p>'],
  'cannot end with space': ['||a ||', '<p>||a ||</p>'],
  'needs content': ['||||', '<p>||||</p>'],
  'escaped': ['\\||a||', '<p>||a||</p>'],
  // TODO: fix the parser for these two
  'has precedence': ['*foo||*||', '<p>*foo<kbd>*</kbd></p>', true],
  'cannot contain inline': ['||*foo*||', '<p><kbd>*foo*</kbd></p>', true]
}

const renderString = (fixture) =>
  micromark(fixture, {
    extensions: [micromarkKbd()],
    htmlExtensions: [micromarkKbdHtml]
  })

describe('conforms to the specification', () => {
  for (const test in specificationTests) {
    const jestFunction = (!specificationTests[test][2]) ? it : it.skip

    jestFunction(test, () => {
      const [input, expectedOutput] = specificationTests[test]
      const output = renderString(input)

      expect(output).toEqual(expectedOutput)
    })
  }
})
