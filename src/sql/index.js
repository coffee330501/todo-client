import { log } from "console";

const sqlite3 = require("sqlite3").verbose();

let db;
// 连接数据库
export default function conDb() {
  const os = require("os");
  console.log("=============");
  // 用于获取当前用户的主目录路径
  // const homedir = os.homedir();
  // console.log("=============" + homedir);
  // // 替换绝对和相对路径
  // const users = homedir.replace(/\\/g, "\\\\");
  // if (!db || !db.open) {
  //   // 保存地址文件
  //   db = new sqlite3.Database(users + "\\sql.db");
  // }
  // return db;
}
