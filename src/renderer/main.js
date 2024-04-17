import Vue from "vue";

import App from "./App";
import store from "./store";
import db from "./datastore";
import {
  Pagination,
  Input,
  Button,
  Dialog,
  Form,
  FormItem,
  Collapse,
  CollapseItem,
} from "element-ui";

Vue.config.productionTip = false;
Vue.prototype.$db = db;

Vue.use(Pagination);
Vue.use(Button);
Vue.use(Input);
Vue.use(Dialog);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Collapse);
Vue.use(CollapseItem);

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: "<App/>",
}).$mount("#app");
