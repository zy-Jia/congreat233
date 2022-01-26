/**
 * @Description: 接口地址前缀分模块抽离
 * @author: 门明
 * @location: 腾讯烟台新工科研究院
 * @date: 2021/7/5
 */

import axios from "axios";
import router from "@/router";
import store from "@/store";
import { message, Modal } from "ant-design-vue";
import { API } from "@/assets/config";
import { isEmpty } from "@/utils/tools";
//Ant-Design-vue message component
message.config({
  duration: 2,
  maxCount: 3,
});

//代理路径
// const BASE_URL = process.env.VUE_APP_API_URL
// console.log('API.BASE_UR',API.BASE_URL);
const BASE_URL = API.BASE_URL;
//错误信息与操作
const catchError = (code, msg) => {
  code = typeof code === "number" ? code : parseInt(code, 10);
  let value = "";
  // if (code === 401) {
  //     value = '未授权'
  //     sessionStorage.removeItem('token')
  //     router.replace('/login')
  // }
  // if (code === 403) {
  //     value = '禁止访问'
  // }
  // if (code === 404) {
  //     value = '找不到资源'
  //     router.replace('/login')
  // }
  if (code === 405) {
    value = "网络请求方法不正确，请联系管理员";
    message.error(value);
  }
  if (code === 408) {
    value = "请请求超时";
    message.error(value);
  }
  // if (code === 500) {
  //     value = '服务器内部错误'
  // }
  // if (code === 503) {
  //     value = '服务不可用'
  // }
  if (code === 401) {
    toLogin(msg);
  }
  if (code === 403 || code === 404 || code === 500 || code === 503) {
    router.push({
      name: "error-page",
      params: {
        code: code,
      },
    });
  }
};
/**
 * 处理异常信息
 * @param {*} error
 *
 * @author 向李果
 * @date 2021/12/23 21:00
 */
const handleError = (error) => {
  let msg = "";
  if (error.response) {
    const resp = error.response;
    if (resp.status) {
      if (isEmpty(resp.statusText)) {
        msg = resp.data.msg;
      } else {
        msg = resp.statusText;
      }
      catchError(resp.status, msg);
      return;
    } else {
      msg = resp.data.msg;
    }
  } else {
    msg = error.message + (error.stack ? error.stack : "");
  }
  if (!isEmpty(msg)) {
    message.error(msg);
  }
};
//登录过期/其他端登录
const toLogin = (msg) => {
  store.dispatch("cancelAxios");
  Modal.warning({
    title: msg || "您的验证信息已失效，请重新登录。",
    okText: "重新登录",
    keyboard: false,
    centered: true,
    mask: true,
    onOk: () => {
      sessionStorage.clear();
      localStorage.removeItem("token");
      localStorage.removeItem("teacher_info");
      router.replace("/login");
    },
  });
};

//实例化axios
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  // withCredentials: process.env.NODE_ENV === 'production',
  withCredentials: false,
});
//请求拦截
instance.interceptors.request.use((config) => {
  config.cancelToken = new axios.CancelToken((cancel) => {
    store.dispatch("pushAxios", { cancelToken: cancel });
  });
  let token = localStorage.getItem("token");
  if (token) {
    config.headers.authorization = token;
    config.baseURL = BASE_URL;
    var mokuai = "";
    if (window.location.href.indexOf("prepare") >= 0) {
      mokuai = "prepare";
    } else {
      mokuai = "activity";
    }

    if (localStorage.getItem("teacher_info")) {
      window.vm.$uweb.trackPageview(mokuai + JSON.parse(localStorage.getItem("teacher_info")).userId + BASE_URL);
    }
  }
  return config;
}),
  (error) => {
    return Promise.reject(error);
  };
//响应拦截
instance.interceptors.response.use((response) => {
  const { code, msg } = response.data;
  if (code === "9997") {
    toLogin(msg);
  } else if (code === "9999") {
    message.error(msg);
  }
  return response;
}),
  (error) => {
    // const { status } = error.response;
    // catchError(status);
    handleError(error);
    return Promise.reject(error);
  };

//封装 GET 方法
const GET = (url, params) => {
  params = params || {};
  return new Promise((resolve, reject) => {
    instance
      .get(url, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        handleError(err);
        // console.log(err);
        // catchError(err.response.status);
        reject(err.response);
      });
  });
};
//封装 POST 方法
const POST = (url, data, conf) => {
  data = data || {};
  return new Promise((resolve, reject) => {
    instance
      .post(url, data, conf)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        handleError(err);
        // catchError(err.response.status);
        reject(err.response);
      });
  });
};
//封装 PUT 方法
const PUT = (url, data) => {
  data = data || {};
  return new Promise((resolve, reject) => {
    instance
      .put(url, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        handleError(err);
        // catchError(err.response.status);
        reject(err.response);
      });
  });
};
//封装 DELETE 方法
const DELETE = (url, data) => {
  data = data || {};
  return new Promise((resolve, reject) => {
    instance
      .request({ url: url, method: "delete", data: data })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        handleError(err);
        // catchError(err.response.status);
        reject(err.response);
      });
  });
};

//封装 get
const Get = (url = "", params = {}, key = "") => {
  return GET(`${url}${key ? "/" : ""}${key}`, params).then((res) => {
    return res;
  });
};
// 封装 post
const Post = (url = "", data = {}, conf = {}, key = "") => {
  return POST(`${url}${key ? "/" : ""}${key}`, data, conf).then((res) => {
    return res;
  });
};
// 封装 put
const Put = (url = "", data = {}, key = "") => {
  return PUT(`${url}${key ? "/" : ""}${key}`, data).then((res) => {
    return res;
  });
};
// 封装 delete
const Delete = (url = "", data = {}, key = "") => {
  return DELETE(`${url}${key ? "/" : ""}${key}`, data).then((res) => {
    return res;
  });
};

export { Get, Post, Put, Delete };
