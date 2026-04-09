import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import {
  faMagnifyingGlass,
  faHouse,
  faSortDown,
  faUserPen,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons'
library.add(faSortDown, faMagnifyingGlass, faHouse, faUserPen, faRightFromBracket)

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(Antd)
app.mount('#app')
