// miniprogram/class/pages/pigai2/pigai2.js
// 该页作用好像和answer2一样 可以删去
const db = wx.cloud.database()
const answer = db.collection('answer')
const userInfo = db.collection('userInfo')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    answerid: "",
    userInfo: {},
    hasUserInfo: false,
    uploadcards: [],
    hasFull: true,
    simplifycontent: [],
    simplifycontent2: [],
    ischufa: false,
    openid: "",
    groupid: "",
    groupmember: [],
    groupadmin: [],
    mytype: '',
    showinputcode: false,
    membercode: '',
    homeworkid: "",
    state: "未完成",
    uploadcards2: [],


    photo_url: [], //作业照片
    homeworkid: "",
    photo: "",
    time: "", //作业发布时间
    words: "", //作业 内容
    words2: "", //回答内容
    answerid: "", //
    index: -1,
    answer: "", //作业回答
    photo_url2: [], //回答图片
    grade: "",
    evaluate: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      answerid: options.answerid
    })
    answer.where({
      answer_id: this.data.answerid
    }).get().then(res => {
      this.setData({
        time: res.data[0].time, //发布时间
        words: res.data[0].homcontent, //发布作业
        photo_url: res.data[0].qphoto_url, //作业照片 
        answer: res.data[0].answer_words, //作业回答
        photo_url2: res.data[0].aphoto_url, //回答图片
        grade: res.data[0].grade, //回答等第
        evaluate: res.data[0].evaluate //回答评价
      })
    })
  },

  lookimage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.photo_url // 需要预览的图片http链接列表
    })
  },
  lookimage2(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.photo_url2 // 需要预览的图片http链接列表
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})