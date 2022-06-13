// miniprogram/class/pages/up/up.js
var disp = require("../../../../utils/broadcast");
var WebIM = require('../../../../utils/WebIM.js')
var WebIM = WebIM.default
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const homework = db.collection('homework')
const answer = db.collection('answer')
const membercode = db.collection('membercode')
var mythis = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [ //
      {
        id: 0,
        value: "待批改回答",
        isactive: true
      },
      {

        id: 1,
        value: "已批改",
        isactive: false
      },
      {
        id: 2,
        value: "作业统计情况",
        isactive: false
      },
    ],
    ypcount: 0, //当前作业已批改份数
    wpcount: 0, //当前作业未批改份数
    allmembername: [], //所有普通成员和管理员姓名
    amembername: [], //该作业已完成名单
    groupadmin: [], //当前组管理员信息
    groupmember: [], //当前组普通成员信息
    acount: 0, //已回答人数
    uploadcards: [], //存储改组中该问题的所有待批改回答
    uploadcards2: [], //已批改
    groupid: "",
    homeworkid: "",
    wcount: 0, //未完成人数 用总人数减去已完成人数
    wmembername: []
  },
  topigai2(e) {
    wx.navigateTo({
      url: '../pigai2/pigai2?groupid=' + this.data.groupid + '&answerid=' + e.currentTarget.dataset.item
    })
  },
  topigai(e) {
    wx.navigateTo({
      url: '../pigai/pigai?groupid=' + this.data.groupid + '&answerid=' + e.currentTarget.dataset.item
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      homeworkid: options.homeworkid,
      groupid: options.groupid
    })
    // 获取当前已上传的作业中已批改份数
    answer.where({
      group_id: this.data.groupid,
      homework_id: this.data.homeworkid,
      status: "已批改"
    }).count().then(res => {
      this.setData({
        ypcount: res.total
      })
    })

    // 获取当前已上传的作业中未批改份数
    answer.where({
      group_id: this.data.groupid,
      homework_id: this.data.homeworkid,
      status: "未批改"
    }).count().then(res => {
      this.setData({
        wpcount: res.total
      })
    })

    //获取所有当前群组下的当前homeworkid对应的所有回答(未批改)
    answer.where({
      homework_id: this.data.homeworkid,
      group_id: this.data.groupid,
      evaluate: "暂无评语",
      grade: "暂无等第",
      status: "未批改"
    }).get().then(res => {
      this.setData({
        uploadcards: res.data
      })
    })
    //获取已批改回答
    answer.where({
      homework_id: this.data.homeworkid,
      group_id: this.data.groupid,
      status: "已批改"
    }).get().then(res => {
      this.setData({
        uploadcards2: res.data
      })
    })
  },

  handletabsitemchange(e) {
    const index = e.detail.index;
    let tabs = this.data.tabs;
    tabs.forEach((v, i) => {
      //将选中的tab设置为true 其他的设置为false
      if (i == index) {
        v.isactive = true
      } else {
        v.isactive = false
      }
    });
    this.setData({
      tabs: tabs
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
  // 有问题
  onShow: function () {
    var that = this //保存当前页面对象
    var pageNum = 1,
      pageSize = 200;
    var options = {
      pageNum: pageNum,
      pageSize: pageSize,
      groupId: that.data.groupid,
      success: function (resp) {
        //这里只遍历到倒数第二个是因为最后一个是群主 不是有我要的
        var groupmember2 = []
        for (let i = 0; i < resp.data.length - 1; i++) {
          groupmember2.push(resp.data[i].member)
        }
        that.setData({ //注意这里用that 否则检测不到当前页面的该页面初始数据而报错
          groupmember: groupmember2
        })
        // 获取当前组所有人的名单（除了管理员）
        // 这里注意判等 忽略大小写
        var userinfo = []
        userInfo.get().then(res => {
          // 先获取数据库中所有数据
          userinfo = res.data
          // 去和当前组所有成员openid比较 如果相同则保留
          var allmembername2 = []
          for (let i = 0; i < userinfo.length; i++) {
            for (let j = 0; j < that.data.groupmember.length; j++) {
              // 都转为小写比较
              if (userinfo[i]._openid.toLowerCase() == that.data.groupmember[j].toLowerCase()) {
                allmembername2.push(userinfo[i].nickName)
              }
            }
          }
          that.setData({
            allmembername: allmembername2
          })
          // 用所有成员减去已完成成员
          var wmembername2 = []
          wmembername2 = that.data.allmembername
          for (let i = 0; i < that.data.allmembername.length; i++) {
            for (let j = 0; j < that.data.amembername.length; j++) {
              if (that.data.allmembername[i] == that.data.amembername[j]) {
                wmembername2.splice(i, 1)
              }
            }
          }
          that.setData({
            wmembername: wmembername2
          })
        })



        //获取当前作业的已回答人数
        answer.where({
          homework_id: that.data.homeworkid,
          group_id: that.data.groupid
        }).count().then(res => {
          that.setData({
            acount: res.total
          })
          // 未完成人数等于总人数减去已完成人数
          var wcount2 = that.data.groupmember.length - that.data.acount
          that.setData({
            wcount: wcount2
          })
        })
      },
      error: function (e) {}
    };


    //获取当前作业的所有已回答姓名
    answer.where({
      homework_id: this.data.homeworkid,
      group_id: this.data.groupid
    }).get().then(res => {
      var amembername2 = []
      for (let i = 0; i < res.data.length; i++) {
        amembername2.push(res.data[i].answer_name)
      }
      this.setData({
        amembername: amembername2
      })
    })
    WebIM.conn.listGroupMember(options);
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