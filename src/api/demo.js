import {Get, Post, Put, Delete} from "./index";

const removeCurrentPageQuestions = data => Delete(`${URL}/question/homework/batchRemoveQues`, data)

export {
  removeCurrentPageQuestions
}
