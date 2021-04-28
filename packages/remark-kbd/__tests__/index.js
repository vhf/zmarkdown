import dedent from 'dedent'
import unified from 'unified'
import reParse from 'remark-parse'
import kbdPlugin from '../lib/index'
import remarkStringify from 'remark-stringify'
import rehypeStringify from 'rehype-stringify'
import remark2rehype from 'remark-rehype'
// TODO (next): reintroduce this test once the plugin is ready
import remarkCustomBlocks from '../../remark-custom-blocks'

const render = text => unified()
  .use(reParse)
  /*.use(remarkCustomBlocks, {
    secret: 'spoiler',
  })*/
  .use(kbdPlugin)
  .use(remark2rehype)
  .use(rehypeStringify)
  .processSync(text)

const fixture = dedent`
  Blabla ||ok|| kxcvj ||ok foo|| sdff

  sdf |||| df

  sfdgs | | dfg || dgsg | qs

  With two pipes: \||key|| you'll get ||key||.

  It can contain inline markdown:

  * ||hell[~~o~~](#he)?||

  It cannot contain blocks:

  * ||hello: [[secret]]?||
`

describe('parses kbd', () => {
  it.skip('parses a big fixture', () => {
    const {contents} = render(fixture)
    expect(contents).toMatchSnapshot()
  })

  it('escapes the start marker', () => {
    const {contents} = render(dedent`
      ||one|| \||escaped|| ||three|| \|||four|| ||five||
    `)
    expect(contents).toContain('||escaped||')
    expect(contents).toContain('|<kbd>four</kbd>')
  })
})

test('allow non-pipe characters', () => {
  const {contents} = unified()
    .use(reParse)
    .use(kbdPlugin, {char: '+'})
    .use(remark2rehype)
    .use(rehypeStringify)
    .processSync('++CTRL++, \\+++D++')

  expect(contents).toMatchSnapshot()
})

test.skip('allow different left-right characters', () => {
  const {contents} = unified()
    .use(reParse)
    .use(kbdPlugin, {charLeft: '[', charRight: ']'})
    .use(remark2rehype)
    .use(rehypeStringify)
    .processSync('[[CTRL]]+[[ALT]]+[[SUPPR]]')

  expect(contents).toMatchSnapshot()
})

test('to markdown', () => {
  const {contents} = unified()
    .use(reParse)
    .use(remarkStringify)
    .use(kbdPlugin)
    .processSync(fixture)

  expect(contents).toMatchSnapshot()
})
