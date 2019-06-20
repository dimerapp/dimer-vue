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

import { DimerCollapse } from '../src/DimerCollapse/component'
import { DimerTree } from '../src/DimerTree/component'

function freshInstance (renderers) {
  return DimerTree(renderers)
}

test.group('Dimer - Tree', () => {
  test('process dimer content node to html', async (assert) => {
    const template = dedent`
    [collapse title="Hello world"]
      Hello world
    [/collapse]
    `
    const json = await (new Markdown(template)).toJSON()

    function collapseRenderer (node, rerender, createElement) {
      if (node.props.className && node.props.className.indexOf('collapsible') > -1) {
        return createElement(DimerCollapse, {
          props: { node },
          scopedSlots: {
            default: (props) => {
              return `${props.title} | ${props.body.children[0].children[0].value}`
            }
          }
        })
      }
    }

    const output = render(freshInstance([collapseRenderer]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.text(), 'Hello world | Hello world')
  })
})
