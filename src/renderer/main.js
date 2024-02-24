import Vue from "vue";

import App from "./App";
import store from "./store";
import db from "./datastore";
import { Pagination, Input, InfiniteScroll } from "element-ui";

Vue.config.productionTip = false;
Vue.prototype.$db = db;

Vue.use(Pagination);
Vue.use(Input);
Vue.use(InfiniteScroll);

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: "<App/>",
}).$mount("#app");
