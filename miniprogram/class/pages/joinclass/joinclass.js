// class/pages/joinclass/joinclass.js
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const classcode=db.collection('classcode')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchwords:'',
    havefound:-1,
    classinfo:[],
    showmycode:false,
    mycode:'',
    classcode:''
  },
  inputclassnum(e){
    var words=e.detail.value.trim()
    this.setData({
      searchwords:words
    })
  },
  search(e){
    var that=this
    var options = {
      groupId: this.data.searchwords,
      success: function(resp){
        if(resp.data[0].public){
          that.setData({
            havefound:1,
            classinfo:resp.data[0]
          })
        }
        else{
          that.setData({
            havefound:2
          })
        }
      },
      error: function(resp){
        that.setData({
          havefound:0
        })
      }
  };
    WebIM.conn.getGroupInfo(options);
  },
  joinclass(e){
    var that=this
    var options = {
      groupId: that.data.classinfo.id,
      success: function(resp) {
        wx.navigateBack({})
        console.log('申请发送成功')
        wx.showToast({
          title: '申请发送成功',
          icon: 'success'
        })
      },
      error: function(e) {
          if(e.statusCode == 403){
            wx.navigateBack({})
            console.log('你已经在班级中了')
            wx.showToast({
              title: '你已在班级中了',
              icon: 'error'
            })
          }
          else{
            console.log('申请发送失败')
            wx.showToast({
              title: '申请发送失败',
              icon: 'error'
            })
            wx.navigateBack({})
          }
      }
    };
    WebIM.conn.joinGroup(options);
  },
  inputclasscode(e){
    this.setData({
      showinputcode:true
    })
  },
  inputclasscode_(e){
    this.setData({
      classcode:e.detail.value
    })
  },
  CloseDialog1(e){
    this.setData({
      showinputcode:false,
      classcode:''
    })
  },
  useclasscode(e){
    var that=this
    if(this.data.classcode==''){
      wx.showToast({
        title: '输入不能为空',
        icon: 'error'
      })
    }
    else{
      classcode.where({
        classcode:that.data.classcode
      }).get().then(res1=>{
        if(res1.data[0]==undefined){
          that.setData({
            classcode:''
          })
          wx.showToast({
            title: '未查询到该班级',
            icon: 'error'
          })
        }
        else{
            var option = {
              groupId:res1.data[0].groupid,
                success: function(resp) {
                  that.setData({
                    classcode:''
                  })
                  wx.showToast({
                    title: '已发送邀请',
                    icon: 'success'
                  })
                },
                error: function(e) {
                  that.setData({
                    classcode:''
                  })
                  console.log(e)
                  if(e.statusCode == 403){
                    wx.showToast({
                      title: '已在群中',
                      icon: 'error'
                    })
                  }
                }
            };
            WebIM.conn.joinGroup(option);
        }
      })
    }
  },
})