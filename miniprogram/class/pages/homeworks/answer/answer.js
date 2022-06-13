// miniprogram/class/pages/answer/answer.js
const db = wx.cloud.database()
const homework = db.collection('homework')
const answer = db.collection('answer')
const userInfo = db.collection('userInfo')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    acount: 0, //统计answer数据库中该学生对同一个homeworkid回答的次数 若次数等于0则添加到数据库否则修改即可修改即可
    name: "",
    openid: "",
    homeworkid: "",
    photo: "",
    groupid: "",
    time: "", //作业发布时间
    words: "", //作业 内容
    words2: "", //回答内容

    photo_url: [], //作业图片
    photo_url2: [], //回答的图片
    index: -1,
    isShown1: false,
    randomstring: "",
    allowupload: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //由openid获取当前用户姓名
    wx.cloud.callFunction({
      name: 'getUserInfo',
      complete: res1 => {
        this.setData({
          openid: res1.result.openid
        })
        //根据homeworkerid找到数据库中该作业的对应的作业内容 作业ID 作业发布时间等
        this.setData({
          homeworkid: options.homeworkerid,
          groupid: options.groupid
        })
        //获取当前群组中当前用户对这个homeworkid对应的作业答题的次数 这决定了之后的上传是添加还是更新
        answer.where({
          group_id: this.data.groupid,
          _openid: this.data.openid,
          homework_id: this.data.homeworkid
        }).count().then(res => {
          this.setData({
            acount: res.total
          })
        })
        homework.where({
          homework_id: this.data.homeworkid
        }).get().then(res => {
          this.setData({
            groupid: res.data[0].group_id,
            time: res.data[0].time,
            words: res.data[0].words,
            photo_url: res.data[0].photo_url
          })
        })
        //确定openid的有效区域
        userInfo.where({
          _openid: res1.result.openid
        }).get().then(res2 => {
          this.setData({
            name: res2.data[0].nickName
          })
        })
      }
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
      urls: this.data.photo // 需要预览的图片http链接列表
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
  uploadtocloud(e) {
    // 当标题和正文输入的内容有一个为空时 弹出错误提示的对话框
    if (this.data.words2.length == 0 && this.data.photo.length == 0) {
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
      words2: this.data.words2.replace('/n', '&hc')
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
            photo_url2: this.data.photo_url2.concat(res.fileID)
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
      mask: true
    })
    if (this.data.acount == 0) //如果是第一次上传则添加
    {
      this.add()
    } else //反之则更新 如果是第二次上传 可能第一次上传的作业已被批改 而作业被批改之后是不能再上传的 所以在更新答案之前需要先判断一下 该当前组 当前用户的该作业的批改状态
    {
      answer.where({
        group_id: this.data.groupid,
        _openid: this.data.openid,
        homework_id: this.data.homeworkid
      }).get().then(res => {
        //更新该回答前已批改则不可以上传 并提示错误信息
        if (res.data[0].status == "已批改") {
          wx.showToast({
            title: '已批改无法上传！',
            icon: 'error'
          })
        } else { //更新该回答前未批改则可以上传
          this.update()
        }
      })
    }
  },
  add() {
    setTimeout(() => {
      answer.add({
        // data 字段表示需新增的 JSON 数据
        data: {
          answer_id: this.data.randomstring,
          homework_id: this.data.homeworkid,
          group_id: this.data.groupid,
          answer_name: this.data.name,
          time: this.data.time,
          homcontent: this.data.words, //作业内容
          answer_words: this.data.words2, //回答的文字内容
          qphoto_url: this.data.photo_url, //作业图片 注意应定义为数组类型
          aphoto_url: this.data.photo_url2, //回答图片 注意应定义为数组类型
          status: "未批改",
          grade: "暂无等第",
          evaluate: "暂无评语"
        }

      }).then(res => {
        wx.navigateBack({}) //用于实时刷新
        //    	wx.navigateTo({
        // 	url: '../homewo/answer?groupid=' + this.data.groupid+'&answerid='+this.data.randomstring
        // })
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
      setTimeout(() => {
        wx.redirectTo({
          url: '../homework/homework?groupid=' + this.data.groupid //这边一定要传参 否则无法跳转 太困难嘞md
        })
      }, 1000)
    }, 3000)
  },
  update() {
    setTimeout(() => {
      answer.where({
        group_id: this.data.groupid,
        _openid: this.data.openid,
        homework_id: this.data.homeworkid
      }).update({
        data: {
          answer_words: this.data.words2, //回答的文字内容
          aphoto_url: this.data.photo_url2, //回答图片 注意应定义为数组类型
        }
      }).then(res => {
        wx.navigateBack({}) //用于实时刷新
        //    	wx.navigateTo({
        // 	url: '../homewo/answer?groupid=' + this.data.groupid+'&answerid='+this.data.randomstring
        // })
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

      wx.redirectTo({
        url: '../homework/homework?groupid=' + this.data.groupid //这边一定要传参 否则无法跳转 太困难嘞md
      })
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
    console.log("回答次数为：")
    console.log(this.data.acount)
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