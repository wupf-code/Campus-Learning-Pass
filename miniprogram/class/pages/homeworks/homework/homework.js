// miniprogram/class/pages/homework/homework.js
//规this.定老师批改只次学生批改可以上传同一作业的答案很多次 那么已回答界面就会多出很多该学生同一份作业的好几份答案 包括教师端也会收到某个同学同一份作业的多个答案 但现在我只想要已回答界面的所有问题回答都是最新的 即一份作业只有一个最新回答 包括老师端也是：全部需要批改的作业回答都具有唯一性（已解决）
//教师端显示学生的回答图片 回答的学生姓名 学生回答的内容缩减 作业日期 可以再增加一个已发布作业的界面
// 
// 学生端显示作业的照片 作业的发布日期 作业的内容缩减
// 学生某作业批改之前可以反复提交 批改之后改作业不得提交 老师只能上传一次批改
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
    tabs: [{
        id: 0,
        value: "待完成",
        isactive: true
      },
      {
        id: 1,
        value: "未批改",
        isactive: false
      },
      {
        id: 2,
        value: "已批改",
        isactive: false
      },
      {
        id: 3,
        value: "作业统计",
        isactive: false
      },

    ],
    tabs2: [{
        id: 0,
        value: "已上传作业",
        isactive: true
      },
      {

        id: 1,
        value: "全部回答",
        isactive: false
      },
      {
        id: 2,
        value: "已批改回答",
        isactive: false
      },
    ],
    uploadcards4: [], //学生界面的当前组的所有作业
    allmcount: 0, //除了管理员之外的人数
    allanswer: [], //当前组的所有作业的所有人回答
    uploadcards3: [], //存储作业内容是缩减内容的所有作业信息
    myopenid: "", //当前用户openid
    qjcount: 0, //缺交份数
    acount: 0, //回答作业数
    uploadcards: [], //uploadcards获取的是当前组的所有homework相关信息
    duploadcards: [], //存储当前用户所有待完成作业
    simplifycontent: [],
    simplifycontent2: [],
    ischufa: false,
    openid: "",
    groupid: "", //当前组的组号 通过前一个页面传递的参数获得
    groupmember: [],
    groupadmin: [],
    mytype: '', //用来存储当前用户成员类型
    showinputcode: false,
    membercode: '',
    homeworkid: "",
    state: "未完成", //当前用户某个作业的完成状态
    finished: [], //已完成作业的回答
    scontent: [], //已完成回答缩减内容
    finished2: [], //已批改作业
    ahomeworkid: [], //被当前用户回答过的作业的作业ID
    wpg: [], //未批改
    ypg: [], //已批改
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 3000)
    var that = this
    this.setData({
      homeworkid: options.homeworkid,
      groupid: options.groupid
    })
    // 获取当前用户openid
    wx.cloud.callFunction({
      name: 'getUserInfo',
      complete: res1 => {
        this.setData({
          myopenid: res1.result.openid
        })


        // 再获取当前组中当前用户已完成份数
        answer.where({
          group_id: this.data.groupid,
          _openid: this.data.openid,
        }).count().then(res => {
          that.setData({
            acount: res.total
          })

          answer.where({
            group_id: this.data.groupid,
            _openid: this.data.openid
          }).get().then(res => {
            this.setData({
              acount: res.data.length
            })
            // 缺交份数 总份数减去已完成份数
            // 获取当前组中所有作业份数
            homework.where({
              group_id: this.data.groupid
            }).count().then(res => {
              var allcount = 0
              allcount = res.total
              that.setData({
                qjcount: allcount - that.data.acount
              })
            })
          })
        })
      }
    })


    // 为了防止同一组中 其他成员的作业的status 影响到当前成员 可以在开始时 homework的onload前面中 将本群中的所有作业status改为未完成
    // homework.where({
    // group_id:this.data.groupid
    // }).update({
    // data:{
    // status:"待完成"
    // }
    // })
    // homework.where({
    // group_id:this.data.groupid
    // }).get().then(res=>{
    // })
    //获取当前用户openid
    wx.cloud.callFunction({
      name: 'getUserInfo',
      complete: res1 => {
        this.setData({
          openid: res1.result.openid
        })
        //由groupid 当前用户openid获取当前用户在该聊天中所有的已完成回答记录
        answer.where({
          _openid: this.data.openid,
          group_id: this.data.groupid
        }).get().then(res => {
          // let scontent = this.data.scontent
          // for (let i = 0; i < res.data.length; i++) {
          //   scontent.push(res.data[i].homcontent.split('&hc').join('\n').substring(0, 30) + "...")
          // }
          this.setData({
            finished: res.data,
            // scontent
          })
          //判断已完成作业中的作业是否已经批改
          for (let i = 0; i < this.data.finished.length; i++) {
            if (this.data.finished[i].evaluate != "暂无评语" || this.data.finished[i].grade != "暂无等第") {
              //修改页面初始数据中的对象数组
              var t4 = "finished[" + i + "].status";
              this.setData({
                [t4]: "已批改",
              });
            } else {
              //修改页面初始数据中的对象数组
              var t4 = "finished[" + i + "].status";
              this.setData({
                [t4]: "未批改",
              });
            }
          }
          // 获取当前用户当前组所有未批改作业
          var wpigai = []
          var wpigai2 = []
          wpigai = this.data.finished
          for (let i = 0; i < wpigai.length; i++) {
            if (wpigai[i].status == "未批改") {
              wpigai2.push(wpigai[i])
            }
          }
          // 修改未批改
          for (let i = 0; i < wpigai2.length; i++) {
            wpigai2[i].homcontent = wpigai2[i].homcontent.substring(0, 30).concat("...")
          }
          var a = []
          for (let i = wpigai2.length - 1; i >= 0; i--) {
            a.push(wpigai2[i])
          }
          this.setData({
            wpg: a
          })
          // 获取当前用户当前组所有已批改作业
          var ypigai = []
          var ypigai2 = []
          ypigai = this.data.finished
          for (let i = 0; i < ypigai.length; i++) {
            if (ypigai[i].status == "已批改") {
              ypigai2.push(ypigai[i])
            }
          }
          // 修改已批改
          for (let i = 0; i < ypigai2.length; i++) {
            ypigai2[i].homcontent = ypigai2[i].homcontent.substring(0, 30).concat("...")
          }
          var b = []
          for (let i = ypigai2.length - 1; i >= 0; i--) {
            b.push(ypigai2[i])
          }
          this.setData({
            ypg: b
          })

        })
      }
    })
    //获取已批改记录(由groupid grade和evaluate不为空确定记录)
    const _ = db.command
    answer.where({
      group_id: this.data.groupid,
      grade: _.neq("暂无等第"),
      evaluate: _.neq("暂无评语"),
    }).get().then(res => {
      this.setData({
        finished2: res.data
      })
    })


    var that = this
    //得到管理员列表
    var options = {
      groupId: this.data.groupid,
      success: function (resp) {
        that.setData({
          groupadmin: resp.data
        })
      },
      error: function (e) {}
    };
    WebIM.conn.getGroupAdmin(options);
  },

  toanswer(e) {
    wx.navigateTo({
      url: '../answer/answer?groupid=' + this.data.groupid + '&homeworkerid=' + e.currentTarget.dataset.item
    })
  },
  toanswer3(e) {
    wx.navigateTo({
      url: '../answer3/answer3?groupid=' + this.data.groupid + '&answerid=' + e.currentTarget.dataset.item
    })
  },
  topigai2(e) {
    wx.navigateTo({
      url: '../pigai2/pigai2?groupid=' + this.data.groupid + '&answerid=' + e.currentTarget.dataset.item
    })
  },
  toup(e) {
    wx.navigateTo({
      url: '../up/up?groupid=' + this.data.groupid + '&homeworkid=' + e.currentTarget.dataset.item
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
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 3000)
    var that = this
    var pageNum = 1,
      pageSize = 200;
    var options = {
      pageNum: pageNum,
      pageSize: pageSize,
      groupId: that.data.groupid,
      success: function (resp) {
        //获取当前组除了群主之外的所有人
        that.setData({
          allmcount: resp.data.length - 1
        })
        //学生中 老师已上传作业页面的加载
        homework.where({
          group_id: that.data.groupid
        }).get().then(res => {
          //这里的uploadcards获取的是当前组的所有homework相关信息
          // uploadcards4存储当前组老师发布的所有问题
          that.setData({
            uploadcards: res.data,
          })
          // 修改所有homework的作业内容为前30个字加...
          // 所有作业内容修改过的作业uploadcards2 还要进一步修改：设置每一个作业的status:
          // 先要获取每一个作业的已完成数和所有成员数 如果已完成数==0 显示无人完成 如果已完成数==总成员数
          // 显示全部完成 否则部分完成
          //  获取当前组的所有回答
          answer.where({
            group_id: that.data.groupid
          }).get().then(res => {
            that.setData({
              allanswer: res.data
            })
            var allhomework = that.data.uploadcards
            var allanswer = that.data.allanswer
            var allmcount = that.data.allmcount
            for (let i = 0; i < allhomework.length; i++) {
              var count = 0
              for (let j = 0; j < allanswer.length; j++) {
                if (allhomework[i].homework_id == allanswer[j].homework_id) {
                  count++
                }
              }
              if (count == 0) {
                allhomework[i].status = "无人完成"
              } else if (count == allmcount) {
                allhomework[i].status = "全部完成"
              } else if (0 < count < allmcount) {
                allhomework[i].status = "部分完成"
              }
            }
            that.setData({
              uploadcards: allhomework
            })
            var uploadcards2 = []
            uploadcards2 = that.data.uploadcards
            for (let i = 0; i < uploadcards2.length; i++) {
              uploadcards2[i].words = uploadcards2[i].words.substring(0, 30).concat("...")
            }
            // 倒序显示所有卡片
            var a = []
            for (let i = uploadcards2.length - 1; i >= 0; i--) {
              a.push(uploadcards2[i])
            }
            that.setData({
              uploadcards3: a
            })
          })

          //学生界面的待完成
          homework.where({
            group_id: that.data.groupid
          }).get().then(res => {
            that.setData({
              uploadcards4: res.data
            })
            wx.cloud.callFunction({
              name: 'getUserInfo',
              complete: res1 => {
                that.setData({
                  myopenid: res1.result.openid
                })
                // 找出当前组中我答过的问题 将homework中对应数据的status即uploadcards的status改为
                answer.where({
                  group_id: that.data.groupid,
                  _openid: that.data.myopenid
                }).get().then(res => {
                  var ahomeworkid1 = []
                  for (let i = 0; i < res.data.length; i++) {
                    ahomeworkid1.push(res.data[i].homework_id)
                  }
                  that.setData({
                    ahomeworkid: ahomeworkid1
                  })
                  //将该组中所有的作业的作业号和刚才获取的当前用户回答过的作业的作业号比较 如果前者和后者中的任何一个相等则说明该作业被当前用户所完成 并修改该作业状态 其中status就是当前用户的某个作业的完成状态
                  // 由于这里处理的是获取数据库数据之后的页面初始数据 并不影响数据库中的数据即status状态 所以每个群组成员开始获得的uploadcards的状态都是未完成状态 
                  for (let i = 0; i < that.data.uploadcards4.length; i++) {
                    for (let j = 0; j < that.data.ahomeworkid.length; j++) {
                      if (that.data.uploadcards4[i].homework_id == that.data.ahomeworkid[j]) {
                        //修改页面初始数据中的对象数组
                        var t4 = "uploadcards4[" + i + "].status";
                        that.setData({
                          [t4]: "已完成",
                        });
                      }
                    }
                  }
                  // 此时uploadcards4的status存储的是当前用户各项作业的完成状态
                  // 获取当前用户待完成作业
                  var dai = []
                  var dai2 = []
                  dai = that.data.uploadcards4
                  for (let i = 0; i < dai.length; i++) {
                    if (dai[i].status == "待完成") {
                      dai2.push(dai[i])
                    }
                  }
                  for (let i = 0; i < dai2.length; i++) {
                    dai2[i].words = dai2[i].words.substring(0, 30).concat("...")
                  }
                  var a = []
                  for (let i = dai2.length - 1; i >= 0; i--) {
                    a.push(dai2[i])
                  }
                  that.setData({
                    duploadcards: a
                  })
                })
              }
            })
          })
        })

        var groupmember = []
        for (let i = 0; i < resp.data.length; i++) {
          let memberid = ''
          let membertype = ''
          if (resp.data[i].member) {
            memberid = resp.data[i].member
            var index = that.data.groupadmin.indexOf(memberid)
            if (index >= 0) {
              membertype = '管理员'
            } else {
              membertype = '成员'
            }
          } else if (resp.data[i].owner) {
            memberid = resp.data[i].owner
            membertype = '群主'
          }
          userInfo.where({
            _openid: db.RegExp({
              regexp: memberid,
              options: 'i',
            })
          }).get().then(res2 => {
            if (res2.data.length != 0) {
              groupmember.push({
                memberid: res2.data[0]._openid,
                membername: res2.data[0].nickName,
                memberprofile: res2.data[0].avatarUrl,
                membertype: membertype
              })
              that.setData({
                groupmember: groupmember
              })
            }
          })
        }
        wx.cloud.callFunction({
          name: 'getUserInfo',
          complete: res1 => {
            for (let i = 0; i < that.data.groupmember.length; i++) {
              if (res1.result.openid == that.data.groupmember[i].memberid) {
                that.setData({
                  mytype: that.data.groupmember[i].membertype,
                })
              }
            }
          }
        })
      },
      error: function (e) {}
    };


    //老师中 学生已上传回答页面的加载
    answer.where({
      group_id: that.data.groupid
    }).get().then(res => {
      let simplifycontent = that.data.simplifycontent
      for (let i = 0; i < res.data.length; i++) {
        simplifycontent.push(res.data[i].homcontent.split('&hc').join('\n').substring(0, 30) + "...")
      }
      that.setData({
        uploadcards2: res.data,
        simplifycontent
      })
    })

    WebIM.conn.listGroupMember(options);
  },
  handletabsitemchange(e) {
    const index = e.detail.index;
    let tabs = this.data.tabs;
    tabs.forEach((v, i) => {
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
  handletabsitemchange2(e) {
    const index = e.detail.index;
    let tabs = this.data.tabs2;
    tabs.forEach((v, i) => {
      //将选中的tab设置为true 其他的设置为false
      if (i == index) {
        v.isactive = true
      } else {
        v.isactive = false
      }
    });
    this.setData({
      tabs2: tabs
    })
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
  toaddhomework(e) {
    wx.navigateTo({
      url: '../addhomework/addhomework?groupid=' + this.data.groupid
    })
  },
  topigai(e) {
    wx.navigateTo({
      url: '../pigai/pigai?groupid=' + this.data.groupid + '&answerid=' + e.currentTarget.dataset.item + '&homeworkid=' + e.currentTarget.dataset.item
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})