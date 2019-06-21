/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { render } from '@vue/server-test-utils'
import Markdown from '@dimerapp/markdown'
import dedent from 'dedent'

import { DimerTabs } from '../src/DimerTabs/component'
import { DimerTree } from '../src/DimerTree/component'

function freshInstance (renderers) {
  return DimerTree(renderers)
}

test.group('Dimer - Tabs', () => {
  test('process dimer tabs via custom component', async (assert) => {
    assert.plan(3)

    const template = dedent`
    [codegroup]
      \`\`\`{}{First tab}
      Foo
      \`\`\`
    [/codegroup]
    `
    const json = await (new Markdown(template)).toJSON()

    function collapseRenderer (node, rerender, createElement) {
      if (node.props.className && node.props.className.indexOf('tabs') > -1) {
        return createElement(DimerTabs, {
          props: { node },
          scopedSlots: {
            default: (props) => {
              assert.equal(props.panes[0].children[0].children[1].tag, 'pre')
              assert.equal(props.panes[0].children[0].children[1].children[0].tag, 'code')
              assert.equal(props.links[0], 'First tab')
            }
          }
        })
      }
    }

    render(freshInstance([collapseRenderer]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })
  })
})
