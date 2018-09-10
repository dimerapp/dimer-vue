/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { Dimer } from '../src/Api/Dimer'
import * as MockAdapter from 'axios-mock-adapter'

/**
 * Mocks the config request
 *
 * @method mockConfig
 *
 * @param  {Object}   mock
 * @param  {Object}   [options]
 *
 * @return {void}
 */
function mockConfig (mock, options) {
  mock.onGet('/config.json').reply(200, Object.assign({
    domain: 'foo'
  }, options))
}

/**
 * Mocks the zones
 *
 * @method mockZones
 *
 * @param  {Object}  mock
 * @param  {Array}   [zones]
 *
 * @return {void}
 */
function mockZones (mock, zones) {
  mock.onGet('/zones.json').reply(200, zones || [{
    slug: 'dev-guides',
    versions: [{
      no: 'master',
      name: 'master'
    }]
  }])
}

test.group('Dimer - API', () => {
  test('should get an instance of dimer', (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    assert.instanceOf(dimer, Dimer)
  })

  test('return error when baseUrl is missing', (assert) => {
    const dimer = () => new Dimer()
    assert.throw(dimer, 'baseUrl is required to instantiate dimer instance')
  })

  test('load initial config and zones', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)

    await dimer.load()
    assert.deepEqual(dimer.config, { domain: 'foo' })

    assert.deepEqual(dimer.zones, [{
      slug: 'dev-guides',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    }])

    assert.isTrue(dimer.isLoaded)
  })

  test('raise error when zone with given slug doesn\'t exists', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)

    await dimer.load()
    const zone = () => dimer.zone('foo')
    assert.throw(zone, `There isn't any zone with foo slug`)
  })

  test('return instance for a given zone', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)

    await dimer.load()
    const zone = dimer.zone('dev-guides')
    assert.deepEqual(zone.zone, {
      slug: 'dev-guides',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    })
  })

  test('return instance for a given version inside a zone', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)

    await dimer.load()
    const version = dimer.zone('dev-guides').version('master', 'zone/:version/:permalink')

    assert.deepEqual(version.version, {
      no: 'master',
      name: 'master'
    })
  })

  test('return error when version doesn\'t exists for a zone', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)

    await dimer.load()
    const version = () => dimer.zone('dev-guides').version('foo')
    assert.throw(version, 'Version foo doesn\'t exists inside dev-guides zone')
  })

  test('return docs for a given version', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000' })
    const mock = new MockAdapter(dimer.axios)
    const tree = [{
      category: 'getting started',
      docs: [{
        permalink: 'foo'
      }]
    }]

    mockConfig(mock)
    mockZones(mock)

    mock.onGet('/dev-guides/versions/master.json').reply(200, tree)

    await dimer.load()
    const versionTree = await dimer.zone('dev-guides').version('master', ':zone/:version/:permalink').getTree()
    assert.deepEqual(versionTree, tree)
  })

  test('return default version for a given zone', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock, [{
      slug: 'dev-guides',
      versions: [
        {
          no: 'master',
          name: 'master',
          default: true
        },
        {
          no: '1.0.0',
          name: '1.0.0',
          default: false
        }
      ]
    }])

    await dimer.load()
    const version = dimer.zone('dev-guides').defaultVersion(':zone/:version/:permalink')

    assert.deepEqual(version.version, {
      no: 'master',
      name: 'master',
      default: true
    })
  })

  test('return default zone', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock, [{
      slug: 'default',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    }])

    await dimer.load()
    const zone = dimer.defaultZone()

    assert.deepEqual(zone.zone, {
      slug: 'default',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    })
  })

  test('make url as per the docUrlPattern', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock, [{
      slug: 'default',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    }])

    await dimer.load()
    const docUrl = dimer.defaultZone().version('master', ':zone/:version/:permalink').makeUrl('foo')
    assert.equal(docUrl, '/default/master/foo')
  })

  test('remove leading and trailing slashes from permalink', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000', docUrlPattern: ':zone/:version/:permalink' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock, [{
      slug: 'default',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    }])

    await dimer.load()
    const docUrl = dimer.defaultZone().version('master', ':zone/:version/:permalink').makeUrl('/foo/')
    assert.equal(docUrl, '/default/master/foo')
  })

  test('remove leading slashes from :zone', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock, [{
      slug: 'default',
      versions: [{
        no: 'master',
        name: 'master'
      }]
    }])

    await dimer.load()
    const docUrl = dimer.defaultZone().version('master', ':zone/:version/:permalink').makeUrl('/foo/')
    assert.equal(docUrl, '/default/master/foo')
  })

  test('make a search request', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)
    mock.onGet('/dev-guides/versions/master/search.json').reply((config) => {
      const results = []
      for (let i = 0; i < config.params.limit; i++) {
        results.push(`item ${i}`)
      }
      return [200, results]
    })

    await dimer.load()
    const results = await dimer.zone('dev-guides').version('master', ':zone/:version/:permalink').search('hello world')
    assert.lengthOf(results, 10)
  })

  test('limit search result', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)
    mock.onGet('/dev-guides/versions/master/search.json').reply((config) => {
      const results = []
      for (let i = 0; i < config.params.limit; i++) {
        results.push(`item ${i}`)
      }
      return [200, results]
    })

    await dimer.load()
    const results = await dimer.zone('dev-guides').version('master', ':zone/:version/:permalink').search('hello world', 2)
    assert.lengthOf(results, 2)
  })

  test('return empty array when query is empty', async (assert) => {
    const dimer = new Dimer({ baseUrl: 'http://localhost:3000' })
    const mock = new MockAdapter(dimer.axios)
    mockConfig(mock)
    mockZones(mock)
    mock.onGet('/dev-guides/versions/master/search.json').reply((config) => {
      const results = []
      for (let i = 0; i < config.params.limit; i++) {
        results.push(`item ${i}`)
      }
      return [200, results]
    })

    await dimer.load()
    const results = await dimer.zone('dev-guides').version('master', ':zone/:version/:permalink').search()
    assert.lengthOf(results, 0)
  })
})
