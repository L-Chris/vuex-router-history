import { createProxy } from './utils'

export function link (store, router, options) {
  const moduleName = (options || {}).moduleName || 'history'
  const currentRoute = cloneRoute(router.currentRoute)

  store.registerModule(moduleName, {
    namespaced: true,
    state: {
      stack: [currentRoute],
      current: currentRoute
    },
    mutations: {
      'ROUTE_CHANGED' (state, transition) {
        state[moduleName].current = cloneRoute(transition.to, transition.from)
      }
    }
  })

  // sync store on router navigation
  router.afterEach((to, from) => {
    currentPath = to.fullPath
    store.commit(moduleName + '/ROUTE_CHANGED', { to, from })
  })

  const pRouter = createProxy(router, {
    push: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
      }
    },
    replace: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
      }
    },
    go: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
      }
    },
    back: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
      }
    },
    forward: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
      }
    }
  })

  return pRouter
}

function cloneRoute (to, from) {
  const clone = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta
  }
  if (from) {
    clone.from = cloneRoute(from)
  }
  return Object.freeze(clone)
}