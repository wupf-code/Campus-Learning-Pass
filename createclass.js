// class/pages/createclass/createclass.js
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name:"",
    desc:"",
    public: true,
    approval: true,
    allowinvites: false
  },
  onLoad: function (options) {

  },
  addname(e){
    this.setData({
      name:e.detail.value
    })
  },
  adddesc(e){
    this.setData({
      desc:e.detail.value
    })
  },
  bindchange1(e){
    if(this.data.public){
      this.setData({
        public:false
      })
    }
    else{
      this.setData({
        public:true
      })
    }
  },
  bindchange2(e){
    if(this.data.allowinvites){
      this.setData({
        allowinvites:false
      })
    }
    else{
      this.setData({
        allowinvites:true
      })
    }
  },
  creatclass(e){
    if(this.data.name.length==0)
    {
      wx.showToast({
        title: '班名不能为空',
        icon: 'error'
      })
    }
    else if(this.data.desc.length==0)
    {
      wx.showToast({
        title: '班名不能为空',
        icon: 'error'
      })
    }
    else{
      var options = {
        data: {
            groupname:this.data.name,
            desc: this.data.desc,
            members:[],
            public: this.data.public,
            approval: this.data.approval,
            allowinvites: this.data.allowinvites
        },
        success: function (respData) {
          wx.navigateBack()
          wx.showToast({
            title: '创建成功',
            icon: 'success'
          })
        },
        error: function () {
          wx.showToast({
            title: '创建失败',
            icon: 'error'
          })
        }
      };
      WebIM.conn.createGroupNew(options);
    }
  }
})