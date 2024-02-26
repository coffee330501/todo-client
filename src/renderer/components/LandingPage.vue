<template>
  <div id="wrapper">
    <!-- <main> -->
    <div id="todo-container">
      <!-- 标签容器 -->
      <div class="tag-container">
        <div class="tag-list">
          <!-- 标签Item -->
          <div class="tag-item" v-for="item in tags">
            <span class="tag-text"> {{ item }} </span>
          </div>
        </div>

        <div id="addTag">
          <img src="~@/assets/add.png" id="addTagImg" />
          <span id="addTagText">Add Tag</span>
        </div>
      </div>

      <!-- TODO容器 -->
      <div class="todo-list-container">
        <div id="todoTitle" style="cursor: pointer">To Do</div>
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
              <template #prefix>
                <el-button
                  id="addTodoIcon"
                  icon="el-icon-circle-plus-outline"
                  circle
                  @click="openAddTodoDialog"
                ></el-button>
              </template>
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
        </div>

        <!-- 弹出框 -->
        <el-dialog
          title="Add Todo"
          :visible.sync="addTodoDialogVisible"
          label-width="20px"
        >
          <el-form
            label-position="top"
            label-width="80px"
            :model="addTodoContent"
          >
            <el-form-item label="标签">
              <el-input v-model="addTodoContent.tag"></el-input>
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="addTodoContent.title"></el-input>
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="addTodoContent.content"></el-input>
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="addTodoDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="confirmAddTodoDialog"
              >确 定</el-button
            >
          </div>
        </el-dialog>
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
  import * as todoApi from "../../api/todoApi";
  import { v4 as uuidv4 } from "uuid";
  import moment from "moment";

  export default {
    name: "landing-page",
    components: { SystemInformation },
    file: "aaa",
    data() {
      return {
        todoList: [],
        tags: [],

        curTag: "",
        curTagPage: 0,
        totalTagCount: 0,
        tagSize: 10,
        disableLoadTag: false,

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

        // 弹出框
        addTodoDialogVisible: false,
        addTodoContent: {
          tag: "",
          content: "",
          title: "",
        },

        editTodoDialogVisible: false,
      };
    },
    methods: {
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
            .skip(this.curTagPage * this.tagSize)
            .limit(this.tagSize)
            .sort({ createTime: 1 })
            .exec(function (err, docs) {
              return resolve(docs);
            });
        });
        // count
        const tagCount = await new Promise((resolve) => {
          this.$db
            .count({ status: { $in: ["Pending", "Closed"] } })
            .exec(function (err, docs) {
              return resolve(docs);
            });
        });
        this.totalTagCount = tagCount;

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
        console.log(tags);
        tags.sort(
          (a, b) =>
            new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        );
        this.tags = [...this.tags, ...tags.map((i) => i.tag)];
        console.log("tags-----", this.tags);
      },
      async nextTagList() {
        if (this.totalTagCount != 0 && this.totalTagCount == this.tags.length) {
          this.disableLoadTag = true;
          return;
        }

        this.disableLoadTag = false;
        await this.getTags();
        this.curTagPage++;
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
      /**
       * 管理新增Todo弹窗
       */
      openAddTodoDialog() {
        console.log("我来了哦");
        this.addTodoDialogVisible = true;
      },
      /**
       * 确认新增Todo
       */
      async confirmAddTodoDialog() {
        // 向本地数据库新增
        await this.$db.insert({
          id: uuidv4(),
          createTime: moment().format("yyyy-MM-dd HH:mm:ss"),
          updateTime: moment().format("yyyy-MM-dd HH:mm:ss"),
          deleteTime: null,
          title: this.addTodoContent.title,
          content: this.addTodoContent.content,
          status: "Pending",
          tag: this.addTodoContent.tag,
          sync: true,
        });
        // 重置输入
        const keys = Object.keys(this.addTodoContent);
        for (const key of keys) {
          this.addTodoContent[key] = "";
        }

        this.addTodoDialogVisible = false;

        this.page();
      },
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

    /* 居中 */
    display: flex;
    flex-direction: column;
  }

  .tag-list {
    max-height: 10vh;
    display: block;
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

  #addTodoIcon {
    width: 30px;
    height: 30px;
    font-size: 20px;
    background-color: #e4ebf1;

    opacity: 0.6;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .el-input__prefix {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .el-input--prefix .el-input__inner {
    padding-left: 40px;
  }
</style>
