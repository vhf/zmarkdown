import {readFileSync as file} from 'fs'
import {join} from 'path'
import unified from 'unified'
import reParse from 'remark-parse'
import stringify from 'rehype-stringify'
import remark2rehype from 'remark-rehype'

import plugin from '../src/'


const render = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype)
  .use(stringify)
  .processSync(text)


test('grid-table', () => {
  const { contents } = render(file(join(__dirname, 'grid-tables.md')))
  expect(contents).toMatchSnapshot()
})
