<template>
  <div id="wrapper">
    <!-- <main> -->
    <div id="todo-container">
      <!-- 标签容器 -->
      <div class="tag-container">
        <!-- 标签Item -->
        <div class="tag-item">
          <span class="tag-text"> 今日计划 </span>
        </div>
        <div id="addTag">
          <img src="~@/assets/add.png" id="addTagImg" />
          <span id="addTagText">Add Tag</span>
        </div>
      </div>

      <!-- TODO容器 -->
      <div class="todo-list-container">
        <div id="todoTitle">To Do</div>
        <!-- 水平居中 -->
        <div class="horizontal-center">
          <div id="todoSearchInput">
            <!-- 搜索框 -->
            <!-- <div id="todoSearchInput"></div> -->
          </div>
          <!-- TODO Item -->
          <div class="todo-item" v-for="item in todoList" :key="item.id">
            <span v-if="item.status == 'Closed'" @click="uncloseTodo">
              <img src="~@/assets/todo-closed.png" class="todo-status-img" />
            </span>
            <span v-if="item.status == 'Pending'" @click="closeTodo">
              <div class="todo-status-img">
                <img
                  src="~@/assets/todo-pending.png"
                  class="todo-img-pending"
                />
              </div>
            </span>
            <span class="todo-text" @click="sync">{{ item.content }}</span>
          </div>
          <img
            src="~@/assets/next-page.png"
            id="nextPageImg"
            @click="nextPage"
          />
        </div>
      </div>
    </div>
    <!-- </main> -->
  </div>
</template>

<script>
  import SystemInformation from "./LandingPage/SystemInformation";
  import fs from "fs";
  import * as neDb from "../../util/database";
  import * as streamUtil from "../../util/streamUtil";
  import request from "../../util/request";
  import * as todoApi from "../../api/todoApi";

  export default {
    name: "landing-page",
    components: { SystemInformation },
    file: "aaa",
    data() {
      return {
        todoList: [],
        curPage: 0,
      };
    },
    methods: {
      // open(link) {
      //   require("electron").shell.openExternal(link);
      // },
      closeTodo() {
        this.status = "Closed";
      },
      uncloseTodo() {
        this.status = "Pending";
      },

      /**
       * 数据同步
       */
      async sync() {
        await this.localSync();
        // request({ url: "/todoList/sync", method: "put",data:[] });
      },
      async page() {
        const limit = 15;
        const res = await new Promise((resolve) => {
          this.$db
            .find({})
            .sort({ createTime: 1 })
            .skip(this.curPage * limit)
            .limit(limit)
            .exec(function (err, docs) {
              return resolve(docs);
            });
        });
        this.todoList = res.filter((item) =>
          ["Pending", "Closed"].includes(item.status)
        );
      },
      async nextPage() {
        this.curPage += 1;
        await this.page();
      },
      /**
       * 同步本地数据
       */
      async localSync() {
        const serverData = await todoApi.list();
        console.log(serverData);
        const localData = await neDb.find();
        const localDataMap = streamUtil.listToMap(localData, "id");
        for (const serverItem of serverData) {
          const localItem = localDataMap.get(serverItem.id);
          serverItem.sync = true;
          if (!localItem) {
            // 新增
            await this.$db.insert(serverItem);
          } else {
            // 修改
            await this.$db.update({ id: serverItem.id }, serverItem);
          }
        }
      },
      async serverSync(data) {},
    },
    async created() {
      // 初始化配置文件
      // if (!fs.existsSync(this.configFilePath)) {
      // }
      // const configFileBuffer = fs.readFileSync(this.configFilePath);
      // const configJson = JSON.parse(configFileBuffer.toString());
      // console.log(configJson);

      // await this.$db.insert({ name: 20, age: 100 });
      // const res = await neDb.find({ age: 100 });
      await this.page();
      await this.sync();
    },
  };
</script>

<style>
  /* @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");
  body {
    font-family: "Source Sans Pro", sans-serif;
  } */

  #todo-container {
    display: flex;
  }

  /* tag */
  .tag-container {
    flex: 0 0 200px;
    background-color: #072c3e;
    min-height: 100vh;
    align-items: center;
  }

  .tag-item {
    margin-top: 10px;
    align-items: center;
    height: 30px;
  }

  .tag-text {
    color: #fff;
    margin-left: 20px;
    line-height: 30px;
  }

  #addTag {
    position: fixed;
    bottom: 23px;
    left: 23px;
    align-items: center;
    display: flex;
  }

  #addTagImg {
    width: 30px;
    height: 30px;
  }

  #addTagText {
    color: #fff;
    font-size: 17px;
    margin-left: 5px;
  }

  /* todo */
  .todo-list-container {
    background-color: #d2dfe7;
    flex: 1;
    min-height: 100vh;
  }

  .horizontal-center {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  #todoTitle {
    color: #fff;
    margin-left: 20px;
    margin-top: 10px;
    font-weight: 600;
    font-size: 20px;
  }

  #todoSearchInput {
    background-color: #e4ebf1;
    width: 55%;
    height: 40px;
    margin-top: 20px;
    border-radius: 13px;
    opacity: 0.6;
  }

  .todo-item {
    background-color: #f3eaea;
    width: 60%;
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 30px;
    border-radius: 10px;
  }

  .todo-status-img {
    width: 30px;
    height: 30px;
    margin-left: 5px;
    align-items: center;
    flex-direction: row;
    display: flex;
  }

  .todo-img-pending {
    width: 20px;
    height: 20px;
    margin-left: 5px;
  }

  .todo-text {
    color: #555;
    margin-left: 10px;
  }

  #nextPageImg {
    float: right;
    margin-left: 60%;
    margin-top: 35px;
    width: 30px;
    height: 30px;
  }
</style>
