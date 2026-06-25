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
import { registerAllowedScript } from './utils/allowedScriptsRegistry'
import { INTERACTION_CONFIG_ATTR } from './utils/engine'
import { registerRule }   from './utils/validationRules'

export { vInteractions }
export { registerRule, getRules }         from './utils/validationRules'
export { validateScope, safeParseConfig } from './utils/engine'
export { setupDisableUntilScript, isScriptGateReady } from './utils/disableUntilScript'
export {
  allowedScriptsRegistry,
  registerAllowedScript,
  unregisterAllowedScript,
} from './utils/allowedScriptsRegistry'

function registerBuiltInInteractionScripts() {
  registerAllowedScript('dispatchScopeInteractionInputs', (el, scope) => {
    const root = scope ?? el?.closest?.('[interaction-container]') ?? document
    root.querySelectorAll(`[${INTERACTION_CONFIG_ATTR}]`).forEach((field) => {
      field.dispatchEvent(new Event('input', { bubbles: true }))
    })
  })
}

registerBuiltInInteractionScripts()

const InteractionsPlugin = {
  install(app, options = {}) {
    app.directive('interactions', vInteractions)
    if (options.rules)
      Object.entries(options.rules).forEach(([name, fn]) => registerRule(name, fn))
  },
}

export default InteractionsPlugin
