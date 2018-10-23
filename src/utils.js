export function createMap (keys) {
  return keys.reduce((pre, val) => {
    pre[val] = true
    return pre
  }, Object.create(null))
}

export function createProxy (target, that) {
  const keys = Object.keys(that)
  const keyMap = createMap(keys)
  const obj = Object.create(null)

  for (const key of keys) {
    obj[key] = new Proxy(target[key], that[key])
  }

  const p = new Proxy(target, {
    get (target, key, receiver) {
      return keyMap[key] ? obj[key] : target[key]
    }
  })

  return p
}