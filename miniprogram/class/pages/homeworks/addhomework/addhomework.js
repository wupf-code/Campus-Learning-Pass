// miniprogram/class/pages/addhomework/addhomework.js
const db = wx.cloud.database()
const fs = wx.getFileSystemManager()
const homework = db.collection('homework')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupid: "",
    photo: [],
    photo_url: [],
    index: -1,
    time: "",
    words: "",
    isShown1: false,
    randomstring: "",
    allowupload: false,
    homeworkid: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取当前时间
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年份  
    var Y = date.getFullYear();
    //获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var time2 = M + '月' + D + '日' + "作业"
    this.setData({ //time的初始值
      time: time2
    })
    this.setData({
      groupid: options.groupid
    })
    if (options.str != null) {
      var string = options.str.split(',')
      var url = []
      for (let i = 0; i < parseInt(string[0]); i++) {
        url.push(string[i + 1])
      }
      this.setData({
        photo: url,
        time: string[parseInt(string[0]) + 1],
        words: string[parseInt(string[0]) + 2],
        index: parseInt(string[parseInt(string[0]) + 3])
      })
    }
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
  addtitle(e) {
    let value = e.detail.value; //获取textarea的内容，
    this.setData({
      time: value
    })
  },
  addwords(e) {
    var value = e.detail.value
    this.setData({
      words: value
    })
  },
  uploadtocloud(e) {
    // 当标题和正文输入的内容有一个为空时 弹出错误提示的对话框
    if (this.data.words.length == 0 && this.data.photo.length == 0 || this.data.time.length == 0) {
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
      words: this.data.words.replace('/n', '&hc')
    })

    if (this.data.index != -1) {
      wx.getFileSystemManager().unlink({
        filePath: wx.env.USER_DATA_PATH + "/" + this.data.index + ".txt",
        success: res => {}
      })
    }

    // 先生成作业码
    let txt = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    var randomstring1 = ""
    for (let i = 0; i < 8; i++) {
      let randomnum = Math.floor(Math.random() * 36);
      randomstring1 += txt[randomnum];
    }
    this.setData({
      randomstring: randomstring1
    })
    //将标题中的内容 正文中的内容 和图片地址 openid 和生成的随机文章码 上传到云数据库中

    for (var i = 0; i < this.data.photo.length; i++) {
      let randomstring = 'hm' + this.data.randomstring + '_' + i + '.png'
      // 为了防止上传至云端的文件路径重复
      wx.cloud.uploadFile({
        cloudPath: randomstring,
        filePath: this.data.photo[i], // 文件路径
        success: res => {
          // get resource ID
          this.setData({
            photo_url: this.data.photo_url.concat(res.fileID)
          })
        },
        fail: err => {
          // handle error
          this.data.photo.splice(i, 1)
        }
      })
    }
    // 添加相应数据到云数据库
    wx.showLoading({
      title: '上传中...',
    })
    this.add()
  },
  add() {
    setTimeout(() => {
      homework.add({
          // data 字段表示需新增的 JSON 数据
          data: {
            group_id: this.data.groupid,
            time: this.data.time,
            words: this.data.words,
            photo_url: this.data.photo_url,
            homework_id: this.data.randomstring,
            status: "待完成"
          },
        })
        .then(res => {
          wx.hideLoading()
          wx.showToast({
            title: '上传并更新数据成功',
            icon: 'success'
          })
        })
      //  wx.navigateBack({//虽然添加完数据之后还要点击之后 但是可以刷新数据
      //  })
      wx.redirectTo({
        url: '../homework/homework?groupid=' + this.data.groupid //这边一定要传参
      })
    }, 5000)
  },
  lookimage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.photo // 需要预览的图片http链接列表
    })
  }
})