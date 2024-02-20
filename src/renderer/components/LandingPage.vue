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
          <div class="todo-item">
            <span v-if="status == 'Closed'" @click="uncloseTodo">
              <img src="~@/assets/todo-closed.png" class="todo-status-img" />
            </span>
            <span v-if="status == 'Pending'" @click="closeTodo">
              <div class="todo-status-img">
                <img
                  src="~@/assets/todo-pending.png"
                  class="todo-img-pending"
                />
              </div>
            </span>
            <span class="todo-text">这是一项清单内容，今天吃6顿</span>
          </div>
        </div>
      </div>
    </div>
    <!-- </main> -->
  </div>
</template>

<script>
  import SystemInformation from "./LandingPage/SystemInformation";
  import fs from "fs";

  export default {
    name: "landing-page",
    components: { SystemInformation },
    file: "aaa",
    data() {
      return {
        status: "Pending",
        configFilePath: "E:/Todo/todo-config.json",
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
    },
    created() {
      // 初始化配置文件
      if (!fs.existsSync(this.configFilePath)) {
      }
      const configFileBuffer = fs.readFileSync(this.configFilePath);
      const configJson = JSON.parse(configFileBuffer.toString());
      console.log(configJson);
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
</style>
