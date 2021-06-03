import parse from 'remark-parse'
import stringify from 'remark-stringify'
import kbd from 'remark-kbd'
import unified from 'unified'

const r = unified()
  .use(parse)
  .use(kbd)
  .use(stringify)
  .processSync('||a||')

console.log(r)
