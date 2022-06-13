// class/pages/classorderstudent/classorderstudent.js
var disp = require("../../../utils/broadcast");
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
    beginorder:-1,
    groupmember:[],
    index:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    order.where({
      groupid:options.groupid
    }).get().then(res=>{
      if(res.data.length!=0){
        this.setData({
          beginorder:0,
          groupid:options.groupid
        })
        wx.cloud.callFunction({
          name:'getUserInfo',
          complete:res1=>{
            for(let i=0;i<res.data[0].memberlist.length;i++){
              console.log(res.data[0].memberlist[i].member)
              if(res.data[0].memberlist[i].member!=undefined){
                if(res.data[0].memberlist[i].member.toLowerCase()==res1.result.openid.toLowerCase()){
                  that.setData({
                    beginorder:1,
                    groupmember:res.data[0].memberlist,
                    index:i
                  })
                  break;
                }
              }
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  order(e){
    order.where({
      groupid:this.data.groupid
    }).get().then(res=>{
      if(res.data[0].type=='location'){
        this.location()
      }
      else{
        this.touch()
      }
    })
  },
  location(e){
    var that=this
    wx.getLocation({
      type: 'wgs84',
      success (res1) {
        order.where({
          groupid:that.data.groupid
        }).get().then(res2=>{
          var s=that.distance(res1.latitude,res1.longitude,res2.data[0].latitude,res2.data[0].longitude)
          if(s<=100){
            var arr=res2.data[0].memberlist
            arr.splice(that.data.index,1)
            order.where({
              groupid:that.data.groupid
            }).update({
              data: {
                memberlist:arr 
              }
            })
            wx.showToast({
              title: '签到成功',
              icon: 'success'
            })
            wx.navigateBack()
          }
        })
      }
    })
  },
  distance:function(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    return s;
},
  touch(e){
    order.where({
      groupid:that.data.groupid
    }).get().then(res1=>{
        var arr=res1.data[0].memberlist
        arr.splice(that.data.index,1)
        order.where({
          groupid:that.data.groupid
        }).update({
          data: {
            memberlist:arr 
          }
        })
        wx.showToast({
          title: '签到成功',
          icon: 'success'
        })
        wx.navigateBack()
    })
  }
})