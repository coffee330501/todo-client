<template>
  <div id="wrapper">
    <!-- <main> -->
    <div id="todo-container">
      <!-- 标签容器 -->
      <div class="tag-container">
        <ul
          class="infinite-list"
          v-infinite-scroll="load"
          style="overflow: auto"
        >
          <!-- 标签Item -->
          <div class="tag-item" v-for="item in tags">
            <span class="tag-text"> {{ item }} </span>
          </div>
        </ul>

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
          <div id="todoSearchContainer">
            <el-input
              id="todoSearchInput"
              @focus="onFocused"
              @blur="onBlur"
              v-model="searchText"
              ref="todoSearchInput"
            >
              <!-- 搜索框 -->
              <!-- <div id="todoSearchInput"></div> -->
            </el-input>
          </div>

          <!-- TODO Item -->

          <div class="todo-item" v-for="item in todoList">
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

          <!-- 分页 -->
          <div id="pagination-container">
            <el-pagination
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :background="true"
              @current-change="page"
              ref="pagination"
            >
            </el-pagination>
          </div>
          <!-- <img
            src="~@/assets/next-page.png"
            id="nextPageImg"
            @click="nextPage"
          /> -->
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
        tags: [],
        curTag: "",
        curPage: 0,
        total: 0,
        pageSize: 10,

        searchText: "",
        confirmSearch: false,

        focusId: "",

        // 监听的键
        listenKeys: {
          nextPage: "ArrowRight",
          prevPage: "ArrowLeft",
          searchTodo: "Enter",
          esc: "Escape",
        },
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
      async page(curPage = -1) {
        if (curPage >= 0) this.curPage = curPage - 1;

        let findExpress = { status: { $in: ["Pending", "Closed"] } };
        if (this.confirmSearch) {
          findExpress = {
            status: { $in: ["Pending", "Closed"] },
            content: new RegExp(".*" + this.searchText + ".*"),
          };
        }
        const res = await new Promise((resolve) => {
          this.$db
            .find(findExpress)
            .sort({ createTime: -1 })
            .skip(this.curPage * this.pageSize)
            .limit(this.pageSize)
            .exec(function (err, docs) {
              return resolve(docs);
            });
        });
        const total = await new Promise((resolve) => {
          this.$db.count(findExpress).exec(function (err, docs) {
            return resolve(docs);
          });
        });
        this.todoList = res;
        this.total = total;
        await this.sync();
        await this.getTags();
      },
      async nextPage() {
        this.curPage += 1;
        await this.page();
      },
      /**
       * 监听键盘按下
       */
      async onKeydown() {
        const listenKeys = this.listenKeys;
        window.addEventListener(
          "keydown",
          (e) => {
            console.log(e);

            // 焦点在搜索框
            if (this.focusId == "todoSearchInput") {
              // 回车搜索
              if (e.key == listenKeys.searchTodo) {
                if (this.searchText) {
                  this.confirmSearch = true;
                  this.curPage = 0;
                } else {
                  this.confirmSearch = false;
                }
                this.page();
              }
              if (e.key == listenKeys.esc) {
                // 触发失去焦点
                this.$refs.todoSearchInput.blur();
              }
              return;
            }

            // 一般情况
            if (e.key == listenKeys.nextPage) {
              this.$refs.pagination.next();
            } else if (e.key == listenKeys.prevPage) {
              this.$refs.pagination.prev();
            } else if (e.key == listenKeys.searchTodo) {
              // 搜索框聚焦
              this.$refs.todoSearchInput.focus();
            }
          },
          false
        );
      },
      /**
       * 获得焦点
       */
      onFocused(e) {
        this.focusId = e.target.id;
      },
      /**
       * 失去焦点
       */
      onBlur(e) {
        this.focusId = "";
      },
      async getTags() {
        const todoTags = await new Promise((resolve) => {
          this.$db
            .find(
              { status: { $in: ["Pending", "Closed"] } },
              {
                id: 0,
                updateTime: 0,
                deleteTime: 0,
                title: 0,
                content: 0,
                status: 0,
                sync: 0,
                _id: 0,
              }
            )
            .sort({ createTime: 1 })
            .exec(function (err, docs) {
              return resolve(docs);
            });
        });
        const tagMap = new Map();
        todoTags.forEach((i) => {
          tagMap.set(i.tag, i);
          return;
        });
        const tagsIterator = tagMap.values();
        const tags = [];
        for (const item of tagsIterator) {
          tags.push(item);
        }
        tags.sort((a, b) =>
          new Date(new Date(b.createTime).getTime() - a.createTime).getTime()
        );
        this.tags = tags.map((i) => i.tag);
        console.log("tags-----", tags);
      },
      /**
       * 同步本地数据
       */
      async localSync() {
        const serverData = await todoApi.list();
        console.log("serverData:", serverData);
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
      await this.getTags();
      await this.page();
      await this.sync();
      await this.onKeydown();
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

  #todoSearchContainer {
    width: 55%;
    height: 40px;
    margin-top: 20px;
  }

  #todoSearchInput {
    background-color: #e4ebf1;
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

  #pagination-container {
    margin-top: 35px;
  }
</style>
