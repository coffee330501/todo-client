import Vue from "vue";

import App from "./App";
import store from "./store";
import db from "./datastore";

Vue.config.productionTip = false;
Vue.prototype.$db = db;

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: "<App/>",
}).$mount("#app");
