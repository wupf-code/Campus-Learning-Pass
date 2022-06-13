// class/pages/classorderteacher/classorderteacher.js
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
const classmember=db.collection('classmember')
const order=db.collection('order')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupid:'',
    ordertype:'',
    second:0,
    absentlist:[],
    showabsentlist:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupid:options.groupid,
      ordertype:options.ordertype
    })
    setInterval(() => {
      this.setData({
        second:this.data.second+1
      })
    }, 1000);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.ordertype=='touch'){
      this.touchorder()
    }
    if(this.data.ordertype=='location'){
      this.locationorder()
    }
  },

  touchorder(e){
    var that= this
    var options = {
        pageNum: 1,
        pageSize: 100,
        groupId: that.data.groupid,
        success: function (res) {
          order.add({
            data:{
              groupid:that.data.groupid,
              memberlist:res.data,
              type:'touch'
            }
          })
        },
        error: function(e){}
    };
    WebIM.conn.listGroupMember(options);
  },
  locationorder(e){
    var that= this
    var options = {
        pageNum: 1,
        pageSize: 100,
        groupId: that.data.groupid,
        success: function (res) {
          wx.getLocation({
            type: 'wgs84',
            success (res1) {
              order.add({
                data:{
                  groupid:that.data.groupid,
                  memberlist:res.data,
                  type:'location',
                  latitude:res1.latitude,
                  longitude:res1.longitude
                }
              })
            },
            fail(){
              wx.navigateBack()
              wx.showToast({
                title: '请开启定位授权',
                icon:'error'
              })
            }
           })
        },
        error: function(e){}
    };
    WebIM.conn.listGroupMember(options);
  },

  changename(e){
    var that=this
    var absentlist=[]
    for(let i=0;i<e.length;i++){
      var count=0
      classmember.where({
          groupid:that.data.groupid
      }).get().then(res1=>{
        for(let j=0;j<e.length;j++){
          if(res1.data.length!=0){
              if(res1.data[0].studentname[j][0]==e[i]){
                absentlist.push(res1.data[0].studentname[j][1])
                count=1
                break;
              }
            }
          }
        })
        if(count==0){
          userInfo.where({
            _openid: db.RegExp({
              regexp: e[i],
              options: 'i',
            })
          }).get().then(res2=>{
            absentlist.push(res2.data[0].nickName)
        })
      }
      if(i==e.length-1){
        console.log(absentlist)
        setTimeout(() => {
          wx.hideLoading()
          this.setData({
            absentlist:absentlist,
            showabsentlist:true
          })
        }, 1000);
      }
    }
  },
  stoporder(e){
    var absentlist=[]
    var that=this
    order.where({
      groupid:that.data.groupid,
    }).get().then(res=>{
      for(let i=0;i<res.data[0].memberlist.length;i++){
        if(res.data[0].memberlist[i].member!=undefined){
          absentlist.push(res.data[0].memberlist[i].member)
        }
      }
    }).then(res1=>{
      wx.showLoading({
        title: '请稍后',
      })
      this.changename(absentlist)
      order.where({
        groupid:that.data.groupid
      }).remove()
    })
  },
  
  goback(e){
    wx.navigateBack()
  }
})