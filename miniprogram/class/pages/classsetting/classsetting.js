// class/pages/classsetting/classsetting.js
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
const classmember=db.collection('classmember')
const classcode=db.collection('classcode')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupid:'',
    groupmember:[],
    groupadmin:[],
    mytype:'',
    showinputcode:false,
    classcode:'',
    myid:'',
    showinputnamedialog:false,
    changeid:'',
    choosenickname:'',
    nickname:[],
    showchangeowner:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupid:options.groupid
    })
    var that=this
    //得到管理员列表
    var options = {
      groupId: this.data.groupid,
      success: function (resp) {
        that.setData({
          groupadmin:resp.data
        })
      },
      error: function(e){}
  };
    WebIM.conn.getGroupAdmin(options);
    //得到当前用户的类型
    setTimeout(() => {
      wx.cloud.callFunction({
        name:'getUserInfo',
        complete:res1=>{
          that.setData({
            myid:res1.result.openid
          })
          for(let i=0;i<that.data.groupmember.length;i++){
            if(res1.result.openid==that.data.groupmember[i].memberid){
                that.setData({
                  mytype:that.data.groupmember[i].membertype,
                })
            }
          }
        }
      })
    }, 3000);
  },



  onShow: function (options){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var that=this
    var nickname=that.data.nickname
    var groupmember=[]
    setTimeout(function () {
      wx.hideLoading()
      that.setData({
        nickname:nickname,
        groupmember:groupmember
      })
    }, 3000)

    var options = {
      pageNum: 1,
      pageSize: 200,
      groupId: that.data.groupid,
      success: function (resp) {
        //循环群成员
      for(let i=0;i<resp.data.length;i++){
        let memberid=''
        let membertype=''
        //判断成员类型
        if(resp.data[i].member){
          memberid=resp.data[i].member
          var index=that.data.groupadmin.indexOf(memberid)
          if(index>=0){
            membertype='管理员'
          }
          else{
            membertype='成员'
          }
        }
        else if(resp.data[i].owner){
          memberid=resp.data[i].owner
          membertype='群主'
        }
        //获取成员openid和头像
        userInfo.where({
          _openid: db.RegExp({
            regexp: memberid,
            options: 'i',
          })
        }).get().then(res2=>{
          var count = 0
          classmember.where({
            groupid:that.data.groupid
          }).get().then(res3=>{
            if(res3.data.length!=0){
              for(let j=0;j<res3.data[0].studentname.length;j++){
                if(res3.data[0].studentname[j][0]==res2.data[0]._openid){
                  nickname.push(res3.data[0].studentname[j][1])
                  count=1
                  break;
                }
              }
            }
            if(count==0){
              nickname.push(res2.data[0].nickName)
            }
          }).then(res4=>{
            //根据openid获取昵称或群备注
            if(res2.data.length!=0){
              groupmember.push({
                memberid:res2.data[0]._openid,
                memberprofile:res2.data[0].avatarUrl,
                membertype:membertype
              })
            }
          })
      })
    }
  },
      error: function(e){}
  };
    WebIM.conn.listGroupMember(options);
  },
  
  setasmanager(e){
    var that=this
    var options = {
      groupId: that.data.groupid,
      username: e.currentTarget.dataset.user,
      success: function(resp) {
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        })
      },
      error: function(e){
        if(e.statusCode==401){
          wx.showToast({
            title: '你还不是管理员',
            icon: 'error'
          })
        }
        if(e.statusCode==403){
          wx.showToast({
            title: '操作太快!!!',
            icon: 'error'
          })
        }
      }
  };
    WebIM.conn.setAdmin(options);
    wx.navigateBack()
  },
  cancelmanager(e){
    var options = {
      groupId: this.data.groupid,
      username: e.currentTarget.dataset.user,
      success: function(resp) {
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        })
      },
      error: function (e) {
        if(e.statusCode==403){
          wx.showToast({
            title: '操作太快!!!',
            icon: 'error'
          })
        }
      }
   };
    WebIM.conn.removeAdmin(options);
    wx.navigateBack()
  },
  // 解散一个群组
  dissolveGroup(e){
    var that=this
    var option = {
        groupId: that.data.groupid,
        success: function () {
          wx.navigateBack({
            delta: 2,
          })
          wx.showToast({
            title: '班级已解散',
            icon: 'success'
          })
        }
    };
    WebIM.conn.dissolveGroup(option);
  },
  removefromclass(e){
    var that=this
    var options = {
      groupId: that.data.groupid,
      username: e.currentTarget.dataset.user,
      success: function(resp) {
        wx.showToast({
          title: '移除成功',
          icon: 'success'
        })
      },
      error: function(e) {
        if(e.statusCode==401){
          wx.showToast({
            title: '你还不是管理员',
            icon: 'error'
          })
        }
        if(e.statusCode==403){
          wx.showToast({
            title: '操作太快!!!',
            icon: 'error'
          })
        }
      }
  }
    WebIM.conn.groupBlockSingle(options)
    wx.navigateBack()
  },
  formclasscode(e){
    classcode.where({
      groupid:this.data.groupid
    }).count().then(res1=>{
      if(res1.total==1) {
        classcode.where({
        groupid:this.data.groupid
      }).get().then(res2=>{
        this.setData({
          classcode:res2.data[0].classcode,
          showmycode:true
        })
      })
    }
    else{
        // 生成问题码
        let txt = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');
        var randomstring1=""
        for(let i = 0; i < 5; i++) {
          let randomnum = Math.floor(Math.random() * 36);
          randomstring1 += txt[randomnum];
        }
        classcode.add({
          data: {
            classcode:randomstring1,
            groupid:this.data.groupid
          },
        })
        this.setData({
          classcode:randomstring1,
          showmycode:true
        })
      }
    })
  },
  removeclasscode(e){
    classcode.where({
      groupid:this.data.groupid
    }).remove()
  },
  tochagegroupinfo(e){
    wx.navigateTo({
      url: '../changegroupinfo/changegroupinfo?groupid='+this.data.groupid,
    })
  },
  showinputname(e){
    this.setData({
      showinputnamedialog:true,
      changeid:e.currentTarget.dataset.user,
    })
  },
  closeinput(e){
    this.setData({
      showinputnamedialog:false,
      choosenickname:''
    })
  },
  inputnickname(e){
    this.setData({
      choosenickname:e.detail.value
    })
  },
  changegroupmembername(e){
    if(this.data.choosenickname==''){
      wx.showToast({
        title: '输入不能为空',
        icon: 'error'
      })
    }
    else{
      var that=this
      classmember.where({
        groupid:that.data.groupid
      }).get().then(res1=>{
        var count=0
        if(res1.data.length==0){
          classmember.add({
            data:{
              groupid:that.data.groupid,
              studentname:[]
            }
          })
        }
        try{
        if(res1.data[0].studentname.length!=0){
          for(let i=0;i<res1.data[0].studentname.length;i++){
            if(res1.data[0].studentname[i][0]==that.data.changeid){
              classmember.where({
                groupid:that.data.groupid
              }).update({
                data: {
                  ["studentname."+[i]+"."+[1]]:that.data.choosenickname
                },
              })
              count=1
              wx.showToast({
                title: '修改成功',
                icon: 'success'
              })
              wx.navigateBack()
              break;
            }
          }
        }
      }
      catch{}
      if(count==0){
        classmember.where({
          groupid:that.data.groupid
        }).update({
          data: {
            studentname:db.command.push([[that.data.changeid,that.data.choosenickname]])
            }
          })
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          })
          wx.navigateBack()
        }
      })
    }
  },
  changeowner(e){
    this.setData({
      showchangeowner:true
    })
  },
  changegroupowner(e){
    var that=this
    var options={
      groupId: that.data.groupid,
      username: that.data.groupmember[e.target.dataset.memberindex].memberid,
      success: function(resp) {
        console.log(resp)
        wx.showToast({
          title: '转让成功',
          icon: 'success'
        })
      },
      error: function(e) {
        console.log(e)
          wx.showToast({
            title: '操作失败',
            icon: 'error'
          })
      }
    }
    WebIM.conn.changeOwner(options)
    wx.navigateBack()
  }
})