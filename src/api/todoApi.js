import request from "../util/request";

export async function list() {
  return await request({ url: "/todoList/list" });
}
