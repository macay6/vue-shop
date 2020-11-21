import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message可以挂载在Vue实例上实现每个组件都可以使$message的效果
Vue.prototype.$message = Message
