// miniprogram/class/pages/answer3/answer3.js
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
    photo: "", ///回答的图片
    groupid: "",
    time: "", //作业发布时间
    words: "", //作业 内容
    answerid: "", //该回答的码
    photo_url: [], //作业图片
    photo_url2: [], //回答的图片
    index: -1,
    isShown1: false,
    randomstring: "",
    allowupload: false,
    content: "", //上一次的回答内容
    photo2: [] //上一次的回答照片
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
        //根据answerid找到数据库中该作业的对应的作业内容 作业ID 作业发布时间等
        this.setData({
          answerid: options.answerid,
          groupid: options.groupid
        })
        var that = this
        // 由answerid获取当前点击的这个回答的所有信息
        answer.where({
          group_id: this.data.groupid,
          answer_id: this.data.answerid
        }).get().then(res => {
          that.setData({
            content: res.data[0].answer_words,
            photo2: res.data[0].aphoto_url
          })
        })
        // 获取当前用户当前组的该作业回答的 回答文字内容和图片
        answer.where({
          answer_id: this.data.answerid
        }).get().then(res => {
          this.setData({
            // groupid:res.data[0].group_id,
            time: res.data[0].time,
            words: res.data[0].homcontent, //作业内容
            photo_url: res.data[0].qphoto_url //作业图片
          })
        })
        //获取当前群组中当前用户对这个homeworkid对应的作业答题的次数 这决定了之后的上传是添加还是更新
        answer.where({
          group_id: this.data.groupid,
          _openid: this.data.openid,
          answer_id: this.data.answerid //注意这里是answerid
        }).count().then(res => {
          this.setData({
            acount: res.total
          })
        })
        // homework.where({
        // homework_id:this.data.homeworkid
        // }).get().then(res=>{
        //   this.setData({
        //   groupid:res.data[0].group_id,
        //   time:res.data[0].time,
        //   words:res.data[0].words,
        //   photo_url:res.data[0].photo_url
        //   })
        // })
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
      urls: this.data.photo2 // 需要预览的图片http链接列表
    })
  },
  addimage(e) {
    var that = this
    wx.removeStorageSync('tempFilePaths')
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        wx.setStorageSync('tempFilePaths', tempFilePaths)
        let photo2 = this.data.photo2
        photo2 = wx.getStorageSync('tempFilePaths')
        this.setData({
          photo2
        })
      }
    })
  },
  addwords(e) {
    var value = e.detail.value
    this.setData({
      content: value
    })
  },
  uploadtocloud(e) {
    // 当标题和正文输入的内容有一个为空时 弹出错误提示的对话框
    if (this.data.content.length == 0 && this.data.photo2.length == 0) {
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
      content: this.data.content.replace('/n', '&hc')
    })

    if (this.data.index != -1) {
      wx.getFileSystemManager().unlink({
        filePath: wx.env.USER_DATA_PATH + "/" + this.data.index + ".txt",
        success: res => {}
      })
    }
    //将标题中的内容 正文中的内容 和图片地址 openid 和生成的随机文章码 上传到云数据库中

    for (var i = 0; i < this.data.photo.length; i++) {
      let randomstring = 'hm' + this.data.randomstring + '_' + i + '.png'
      // 为了防止上传至云端的文件路径重复
      wx.cloud.uploadFile({
        cloudPath: randomstring,
        filePath: this.data.photo2[i], // 文件路径
        success: res => {
          // get resource ID
          this.setData({
            photo_url2: this.data.photo_url2.concat(res.fileID)
          })
        },
        fail: err => {
          // handle error
          this.data.photo2.splice(i, 1)
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
        answer_id: this.data.answerid
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
          answer_words: this.data.content, //回答的文字内容
          qphoto_url: this.data.photo_url, //作业图片 注意应定义为数组类型
          aphoto_url: this.data.photo2, //回答图片 注意应定义为数组类型
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

      wx.navigateBack({}) //返回上一级界面
      //  wx.navigateTo({
      //  url: '../../pages/homework/homework?homeworkid='+this.data.homeworkid 
      //  })

    }, 3000)
  },
  update() {
    setTimeout(() => {
      answer.where({
        group_id: this.data.groupid,
        _openid: this.data.openid,
        answer_id: this.data.answerid
      }).update({
        data: {
          answer_words: this.data.content, //回答的文字内容
          aphoto_url: this.data.photo2, //回答图片 注意应定义为数组类型
        }
      }).then(res => {

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
          title: '修改回答成功',
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