# vuex-router-history
vuex plugin: store vue-router history for better controlling

## Useage
```javascript
import r from '@/router'
import store from '@/store'
import { sync } from 'vuex-router-history'

const router = sync(store, r, options)

new Vue({
  el: '#app',
  render: () => <App/>
  router,
  store
})


this.$store.history.stack // history stack
this.$store.history.current // current route
```