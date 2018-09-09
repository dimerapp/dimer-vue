/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import utils from '../src/utils'
import Markdown from '@dimerapp/markdown'
import dedent from 'dedent'

test.group('Dimer - Utils', () => {
  test('return true when response body has redirect property', (assert) => {
    assert.isTrue(utils.isARedirect({ redirect: 'foo' }))
  })

  test('return false when response body doesn\'t have redirect property', (assert) => {
    assert.isFalse(utils.isARedirect({}))
  })

  test('extract node from markdown json by mutating the original nodes', async (assert) => {
    const template = dedent`
    # Title

    ## Hello world
    This is a title with para
    `

    const json = await (new Markdown(template)).toJSON()

    const tocContainer = utils.extractNode(json.contents, (node) => {
      return node.tag === 'div' && node.props.className.indexOf('toc-container') > -1
    })

    const originalContainer = json.contents.children.find((node) => {
      return node.tag === 'div' && node.props.className.indexOf('toc-container') > -1
    })

    assert.isDefined(tocContainer)
    assert.isNotNull(tocContainer)
    assert.isUndefined(originalContainer)
  })

  test('convert array of classNames to class string', (assert) => {
    const attrs = utils.propsToAttrs({ className: ['alert', 'alert-note'] })
    assert.deepEqual(attrs, {
      class: 'alert alert-note'
    })
  })

  test('convert data properties to dash case', (assert) => {
    const attrs = utils.propsToAttrs({ dataTitle: 'foo', dataName: 'hello' })
    assert.deepEqual(attrs, {
      'data-title': 'foo',
      'data-name': 'hello'
    })
  })
})
