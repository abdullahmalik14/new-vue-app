/**
 * interactions/index.js  —  Vue plugin
 *
 * Register once in main.js:
 *   import InteractionsPlugin from '@/interactions'
 *   app.use(InteractionsPlugin)
 *
 * With custom rules at boot:
 *   app.use(InteractionsPlugin, {
 *     rules: { isABN: (v) => /^\d{11}$/.test(v.replace(/\s/g, '')) }
 *   })
 *
 * Or register rules anywhere at runtime:
 *   import { registerRule } from '@/interactions'
 *   registerRule('isABN', (v) => /^\d{11}$/.test(v.replace(/\s/g, '')))
 */
import { vInteractions }  from './directives/vInteractions'
import { registerRule }   from './utils/validationRules'

export { vInteractions }
export { registerRule, getRules }         from './utils/validationRules'
export { validateScope, safeParseConfig } from './utils/engine'

const InteractionsPlugin = {
  install(app, options = {}) {
    app.directive('interactions', vInteractions)
    if (options.rules)
      Object.entries(options.rules).forEach(([name, fn]) => registerRule(name, fn))
  },
}

export default InteractionsPlugin
