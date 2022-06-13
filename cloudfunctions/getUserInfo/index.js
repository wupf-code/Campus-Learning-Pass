// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
// 通过云函数获取用户的微信授权信息
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return {
    openid: wxContext.OPENID,//获取用户在当前小程序的openid
    appid: wxContext.APPID,//获取当前小程序的身份idP:appid
    unionid: wxContext.UNIONID,//用户在开放平台的身份id
    env:wxContext.ENV//当前环境
  }
}