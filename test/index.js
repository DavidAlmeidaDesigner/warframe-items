const assert = require('assert')

const dedupe = require('../build/dedupe')

describe('index.js', () => {
  // Smoke test
  it('should contain items when initializing.', () => {
    const Items = require('../index.js')
    const items = new Items()
    assert(items.length)
  })

  it('should ignore enemies when configured.', () => {
    const Items = require('../index.js')
    const items = new Items({ ignoreEnemies: true }).filter(i => i.category === 'Enemy')
    assert(!items.length)
  })

  // Custom filter override in index.js
  it('should not return more or equal the number of objects after .filter(), when custom categories are specified.', () => {
    const Items = require('../index.js')
    const items = new Items({ category: ['Primary'] })
    const primes = items.filter(i => i.name.includes('Prime'))
    assert(primes.length < items.length)
  })

  describe('drops should not include variant drops', () => {
    it('should not have drops for hikou', () => {
      const Items = require('../index.js')
      const items = new Items({ category: ['Secondary'] })
      const hikouMatches = items.filter(i => i.name === 'Hikou')
      assert(hikouMatches.length === 1)
      const { drops } = hikouMatches[0]
      assert(typeof drops === 'undefined')
    })

    it('should only have non-prime drops for Gorgon', () => {
      const Items = require('../index.js')
      const items = new Items({ category: ['Primary'] })
      const matches = items.filter(i => i.name === 'Gorgon')
      assert(matches.length === 1)
      const { drops } = matches[0]
      assert(typeof drops === 'undefined')

      const bp = matches[0].components.filter(component => component.name === 'Blueprint')[0]
      assert(typeof bp !== 'undefined')
      assert(bp.drops.length !== 0)

      const primeBpDrops = bp.drops.filter(n => n.type.includes('Prime'))
      assert(primeBpDrops.length === 0)
    })

    it('should have variant drops when requested', () => {
      const Items = require('../index.js')
      const items = new Items({ category: ['Primary'] })
      const matches = items.filter(i => i.name === 'Gorgon Wraith')
      assert(matches.length === 1)
      const { drops } = matches[0]
      assert(typeof drops === 'undefined')

      const bp = matches[0].components.filter(component => component.name === 'Blueprint')[0]
      assert(typeof bp !== 'undefined')
      assert(bp.drops.length !== 0)

      const variantDrops = bp.drops.filter(n => n.type.includes('Wraith'))
      assert(variantDrops.length === 1)
    })

    it('should only have 1 result for Mausolon', () => {
      const Items = require('../index.js')
      const items = new Items({ category: ['Arch-Gun'] })
      const matches = items.filter(i => i.name === 'Mausolon').map(i => {
        delete i.patchlogs
        return i
      })
      const dd = dedupe(matches)
      assert.strictEqual(dd.length, matches.length, 'Before and after dedupe should match')
      assert.strictEqual(matches.length, 1, 'There can be only One')
    })
  })
})
