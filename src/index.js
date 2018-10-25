import createProxy from 'create-proxy'

const ROUTE_CHANGED = 'ROUTE_CHANGED'
const STACK_CHANGED_PUSH = 'STACK_CHANGED_PUSH'
const STACK_CHANGED_REPLACE = 'STACK_CHANGED_REPLACE'
const STACK_CHANGED_GO = 'STACK_CHANGED_GO'
const STACK_CHANGED_BACK = 'STACK_CHANGED_BACK'
const STACK_CHANGED_FORWARD = 'STACK_CHANGED_FORWARD'

export function sync (store, router, options) {
  const moduleName = (options || {}).moduleName || 'history'
  const currentRoute = cloneRoute(router.currentRoute)

  const getMutationName = name => `${moduleName}/${name}`

  const handleRouterGo = (state, n) => {
    const targetIndex = state.index + n
    if (targetIndex < 0 || targetIndex >= this.stack.length) return
    const route = state.stack[targetIndex]
    state.current = route
  }

  store.registerModule(moduleName, {
    namespaced: true,
    state: {
      stack: [currentRoute],
      current: currentRoute,
      index: -1
    },
    mutations: {
      [ROUTE_CHANGED] (state, { to, from }) {
        state.current = cloneRoute(to, from)
      },
      [STACK_CHANGED_PUSH] (state, route) {
        state.stack.push(route)
        state.index++
      },
      [STACK_CHANGED_REPLACE] (state, route) {
        state.stack = state.stack.slice(0, state.index).concat(route)
      },
      [STACK_CHANGED_GO] (state, [n]) {
        handleRouterGo(state, n)
      },
      [STACK_CHANGED_BACK] (state) {
        handleRouterGo(state, -1)
      },
      [STACK_CHANGED_FORWARD] (state) {
        handleRouterGo(state, 1)
      }
    }
  })

  // sync store on router navigation
  router.afterEach((to, from) => {
    store.commit(moduleName + '/ROUTE_CHANGED', { to, from })
  })

  const pRouter = createProxy(router, {
    push: {
      apply (target, thisArg, [route]) {
        target.apply(thisArg, [route, () => {
          store.commit(getMutationName(STACK_CHANGED_PUSH), route)
        }])
      }
    },
    replace: {
      apply (target, thisArg, [route]) {
        target.apply(thisArg, [route, () => {
          store.commit(getMutationName(STACK_CHANGED_REPLACE), route)
        }])
      }
    },
    go: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
        store.commit(getMutationName(STACK_CHANGED_GO), args)
      }
    },
    back: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
        store.commit(getMutationName(STACK_CHANGED_BACK))
      }
    },
    forward: {
      apply (target, thisArg, args) {
        target.apply(thisArg, args)
        store.commit(getMutationName(STACK_CHANGED_FORWARD))
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
