// class/pages/changegroupinfo/changegroupinfo.js
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Groupname:'',
    Groupndesc:'',
    groupId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    var getinfo = {
      groupId: options.groupid,
      success: function(resp){
        console.log(resp)
        that.setData({
          Groupname:resp.data[0].name,
          Groupndesc:resp.data[0].description,
          groupId:options.groupid
        })
      },
      error: function(){}
    };
    WebIM.conn.getGroupInfo(getinfo);
  },
  addname(e){
    this.setData({
      Groupname:e.detail.value
    })
  },
  adddesc(e){
    this.setData({
      Groupndesc:e.detail.value
    })
  },
  savechanges(e){
    var that=this
    if(this.data.Groupname.length==0)
    {
      wx.showToast({
        title: '班名不能为空',
        icon: 'error'
      })
    }
    else if(this.data.Groupndesc.length==0)
    {
      wx.showToast({
        title: '简介不能为空',
        icon: 'error'
      })
    }
    else{
      // 修改群信息
        var option = {
            groupId: that.data.groupId,
            groupName: that.data.Groupname,    // 群组名称
            description:that.data.Groupndesc,  // 群组简介
            success: function () {
              wx.navigateBack()
              wx.showToast({
                title: '修改成功',
                icon: 'success'
              })
            },
            error: function(e){
              console.log(e)
              wx.showToast({
                title: '修改失败',
                icon: 'error'
              })
            }
        };
        WebIM.conn.modifyGroup(option);
    }
  }
})
