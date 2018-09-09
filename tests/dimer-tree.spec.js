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
import { DimerTree } from '../src/DimerTree/component'

function freshInstance (renderers) {
  return DimerTree(renderers)
}

test.group('Dimer - Tree', () => {
  test('process dimer content node to html', async (assert) => {
    const template = 'Hello world'
    const json = await (new Markdown(template)).toJSON()

    const output = render(freshInstance(), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.text(), 'Hello world')
  })

  test('process dimer content node with ul', async (assert) => {
    const template = dedent`
    - This is li
    `

    const json = await (new Markdown(template)).toJSON()

    const output = render(freshInstance(), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('ul li').length, 1)
    assert.equal(output.find('ul li').text(), 'This is li')
  })

  test('use renderer output for the node when defined', async (assert) => {
    const template = dedent`
    - This is li
    `

    function renderer (node, render, createElement) {
      if (node.tag === 'li') {
        return createElement('li', Object.assign(node.props, { class: 'foo' }), node.children.map(render))
      }
    }

    const json = await (new Markdown(template)).toJSON()
    const output = render(freshInstance([renderer]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('ul li.foo').length, 1)
    assert.equal(output.find('ul li.foo').text(), 'This is li')
  })

  test('skip node when renderer returns false', async (assert) => {
    const template = dedent`
    - This is li
    `

    function renderer (node) {
      if (node.tag === 'li') {
        return false
      }
    }

    const json = await (new Markdown(template)).toJSON()
    const output = render(freshInstance([renderer]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('ul li').length, 0)
  })

  test('do not run next renderer when one renderer handles the node', async (assert) => {
    const template = dedent`
    - This is li
    `

    function renderer (node, render, createElement) {
      if (node.tag === 'li') {
        return createElement('li', Object.assign(node.props, { class: 'foo' }), node.children.map(render))
      }
    }

    function rendererOne (node) {
      if (node.tag === 'li') {
        return false
      }
    }

    const json = await (new Markdown(template)).toJSON()
    const output = render(freshInstance([renderer, rendererOne]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('ul li.foo').length, 1)
  })

  test('do not run next renderer when one renderer discards the node', async (assert) => {
    const template = dedent`
    - This is li
    `

    function renderer (node) {
      if (node.tag === 'li') {
        return false
      }
    }

    function rendererOne (node, render, createElement) {
      if (node.tag === 'li') {
        return createElement('li', Object.assign(node.props, { class: 'foo' }), node.children.map(render))
      }
    }

    const json = await (new Markdown(template)).toJSON()
    const output = render(freshInstance([renderer, rendererOne]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('ul li.foo').length, 0)
  })

  test('run next renderer when one renderer skips the node', async (assert) => {
    const template = dedent`
    - This is li
    `

    function renderer () {
    }

    function rendererOne (node, render, createElement) {
      if (node.tag === 'li') {
        return createElement('li', Object.assign(node.props, { class: 'foo' }), node.children.map(render))
      }
    }

    const json = await (new Markdown(template)).toJSON()
    const output = render(freshInstance([renderer, rendererOne]), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('ul li.foo').length, 1)
  })

  test('assing class props to elements', async (assert) => {
    const template = dedent`
    [note]
    hello
    [/note]
    `

    const json = await (new Markdown(template)).toJSON()

    const output = render(freshInstance(), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('.alert').text(), 'hello')
  })

  test('assing data props to elements', async (assert) => {
    const template = dedent`
    \`\`\`{1-2,3-8}
    hello
    \`\`\`
    `

    const json = await (new Markdown(template)).toJSON()

    const output = render(freshInstance(), {
      context: {
        props: {
          node: json.contents
        }
      }
    })

    assert.equal(output.find('[data-line]').length, 1)
  })
})
