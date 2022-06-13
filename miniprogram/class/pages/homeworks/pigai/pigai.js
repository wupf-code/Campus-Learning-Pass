// miniprogram/class/pages/pigai/pigai.js
const db = wx.cloud.database()
const homework = db.collection('homework')
const answer = db.collection('answer')
const userInfo = db.collection('userInfo')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: false, //判断当前点击进去的回答是否被批改过
    groupid: "",
    answerid: "",
    answername: "", //回答者姓名
    homcontent: "", //作业内容
    qphoto_url: "", //作业图片
    answerwords: "", //回答者文字内容
    aphotourl: "", //回答者图片内容
    words2: "", //评语
    words: "", //等第
    index: -1,
    isShown1: false,
    randomstring: "",
    allowupload: false,
    homeworkid: "",
    answerid: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupid: options.groupid,
      answerid: options.answerid
    })
    //判断该群组下的该问题号对应的问题是否被批改过

    answer.where({
      group_id: this.data.groupid,
      answer_id: this.data.answerid
    }).get().then(res => {
      if (res.data[0].evaluate != "暂无评语" || res.data[0].grade != "暂无等第" || res.data[0].status == "已批改") //此时说明已经批改过
      {
        this.setData({
          flag: true
        })
      } else { //这段代码也可以不用写
        this.setData({
          flag: false
        })
      }
      this.setData({
        answername: res.data[0].answer_name, //回答者姓名
        homcontent: res.data[0].homcontent, //作业内容
        qphoto_url: res.data[0].qphoto_url, //作业图片
        answerwords: res.data[0].answer_words, //回答者文字内容
        aphotourl: res.data[0].aphoto_url //回答者图片内容
      })
    })
  },
  lookimage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.qphoto_url // 需要预览的图片http链接列表
    })
  },
  addimage(e) {
    wx.removeStorageSync('tempFilePaths')
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        wx.setStorageSync('tempFilePaths', tempFilePaths)
        let photo = this.data.photo
        photo = wx.getStorageSync('tempFilePaths')
        this.setData({
          photo
        })
      }
    })
  },
  addwords(e) {
    var value = e.detail.value
    this.setData({
      words2: value
    })
  },
  addwords2(e) {
    var value = e.detail.value
    this.setData({
      words: value
    })
  },
  uploadtocloud(e) {
    if (this.data.flag == false) { //没有批改过则更新数据
      // 当标题和正文输入的内容有一个为空时 弹出错误提示的对话框
      if (this.data.words2.length == 0 && this.data.words.length == 0) {
        wx.showToast({
          title: '请添加内容',
          icon: 'error'
        })
      } else {
        //跳出提示是否确认上传
        this.setData({
          isShown1: true
        })
      }
    } else {
      wx.showToast({
        title: '该作业已被批改！',
        icon: 'error'
      })
    }
  },
  closedialog(e) {
    ////do something when sure is clicked
    this.setData({
      isShown1: false
    })
  },
  allowupload(e) {
    this.setData({
      allowupload: true,
      isShown1: false,
      words2: this.data.words2.replace('/n', '&hc'),
      words: this.data.words.replace('/n', '&hc') //等第
    })

    if (this.data.index != -1) {
      wx.getFileSystemManager().unlink({
        filePath: wx.env.USER_DATA_PATH + "/" + this.data.index + ".txt",
        success: res => {}
      })
    }
    //将标题中的内容 正文中的内容 和图片地址 openid 和生成的随机文章码 上传到云数据库中
    // 添加相应数据到云数据库
    wx.showLoading({
      title: '上传中...',
      mask: true
    })
    this.update()
  },
  lookimage2(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.aphotourl // 需要预览的图片http链接列表
    })
  },
  //当选择上传批改时将批改的评语和等地更新并将回答的批改状态改为已批改
  update() {
    setTimeout(() => {
      answer.where({
        answer_id: this.data.answerid
      }).update({
        // data 字段表示需新增的 JSON 数据
        data: {
          status: "已批改",
          grade: this.data.words,
          evaluate: this.data.words2
        }
      }).then(res => {
        wx.navigateBack({}) //刷新
        // homework.where({
        // homework_id:this.data.homeworkid
        // }).update({
        //   data:{
        //   status:"已批改"
        //   }
        // })
        wx.hideLoading()
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        })
      })

      // wx.navigateBack({})//返回上一级界面
      setTimeout(() => {
        answer.where({
          answer_id: this.data.answerid
        }).get().then(res => {
          wx.redirectTo({
            url: '../up/up?homeworkid=' + res.data[0].homework_id + "&groupid=" + this.data.groupid //这边一定要传参 否则无法跳转 太困难嘞md
          })
        })
      }, 1000)

    }, 3000)
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
    console.log(this.data.answerid)
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