// class/pages/filemanagement/filemanagement.js
var disp = require("../../../utils/broadcast");
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const _ = db.command
const groupfile=db.collection('groupfile')
const classmember=db.collection('classmember')
const userInfo=db.collection('userInfo')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupid:'',
    mynickname:'',
    filelist:[],
    choosefile:{},
    showdialog:false,
    begindelete:false,
    isadmin:false,
  },

  onLoad(options){
    this.setData({
      groupid:options.groupid
    })
    var that=this
    var count=0;
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        classmember.where({
          groupid:that.data.groupid
        }).get().then(res2=>{
          if(res2.data.length!=0){
            for(let j=0;j<res2.data[0].studentname.length;j++){
              if(res2.data[0].studentname[j][0].toLowerCase()==res1.result.openid){
                that.setData({
                  mynickname:res2.data[0].studentname[j][1]
                })
                count=1
                break;
              }
            }
          }
          if(count==0){
            userInfo.where({
              _openid:res1.result.openid
            }).get().then(res3=>{
              that.setData({
                mynickname:res3.data[0].nickName
              })
            })
          }
        })
      }
    })
  },

  onShow(e){
    var that=this
    groupfile.where({
      groupid:that.data.groupid
    }).get().then(res=>{
      if(res.data.length!=0){
        that.setData({
          filelist:res.data[0].file
        })
      }
    })
  },

  uploadfile(e){
    var timestamp = Date.parse(new Date())
    var date = new Date(timestamp)
    var time=date.getFullYear()+"-"+(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)+"-"+(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())+" "+date.getHours()+":"+date.getMinutes()
    var that=this
    wx.chooseMessageFile({
      success (res) {
        setTimeout(() => {
          that.onShow()
        }, 1000);
        // 为了防止上传至云端的文件路径重复
        wx.cloud.uploadFile({
          // console.log(randomstring)
            cloudPath: res.tempFiles[0].name,
            filePath: res.tempFiles[0].path, // 文件路径
            success: res1 => {
              var x=0
              // get resource ID
              groupfile.where({
                groupid:that.data.groupid
              }).count().then(resp=>{
                console.log(resp)
                x=resp.total
              }).then(resx=>{
                if(x==0){
                  groupfile.add({
                    data:{
                      groupid:that.data.groupid,
                      file:[{filename:res.tempFiles[0].name,filePath:res1.fileID,uploader:that.data.mynickname,uploadtime:time}]
                    }
                  })
                }
                else{
                  groupfile.where({
                    groupid:that.data.groupid
                  }).update({
                    data:{
                      file:_.push({filename:res.tempFiles[0].name,filePath:res1.fileID,uploader:that.data.mynickname,uploadtime:time})
                    }
                  })
                }           
            })
            },
            fail: err => {
              // handle error
              this.data.photo.splice(i,1)
            }    
          })
      },
      fail (res) {
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        })
      },
    })
  },

  showdownloadfile(e){
    var that =this
    if(!this.data.begindelete){
      this.setData({
        choosefile:e.target.dataset.file,
        showdialog:true
      })
    }
    else{
      console.log(e.target.dataset.file.uploader)
      console.log(that.data.mynickname)
      if(that.data.isadmin||e.target.dataset.file.uploader==that.data.mynickname){
        setTimeout(() => {
          that.onShow()
        }, 1000);
        that.setData({
          deleteFile:true
        })
        var file=that.data.filelist
        for(let i=0;i<file.length;i++){
          if(file[i].filePath==e.target.dataset.file.filePath){
            file.splice(i,1)
          }
        }
        wx.cloud.deleteFile({
          fileList: [e.target.dataset.file.filePath]
        }).then(res => {
          // handle success
          groupfile.where({
            groupid:that.data.groupid
          }).update({
            data:{
              file:file
            }
          })
        })
      }
      else{
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    }
  },

  deletefile(e){
    this.getidenty()
    this.setData({
      begindelete:true
    })
    wx.showToast({
      title: '请选择一个要删除的文件',
      icon:'none'
    })
  },
  getidenty(e){
    var that=this
    var alladmin=[]
    var options = {
      groupId: that.data.groupid,
      success: function (res) {
        alladmin=res.data
        var options = {
          pageNum: 1,
          pageSize: 100,
          groupId: that.data.groupid,
          success: function (resp) { 
            for(let i=0;i<resp.data.length;i++){
              if(resp.data[i].owner!=undefined){
                alladmin.push(resp.data[i].owner)
                break
              }
            }
            wx.cloud.callFunction({
              name:'getUserInfo',
              complete:res1=>{
                for(let i=0;i<alladmin.length;i++){
                  if(alladmin[i].toLowerCase()==res1.result.openid.toLowerCase()){
                    that.setData({
                      isadmin:true
                    })
                    break;
                  }
                }
              }})
          },
          error: function(e){}
      };
      WebIM.conn.listGroupMember(options);
      },
      error: function(e){}
  };
    WebIM.conn.getGroupAdmin(options);

  },
  downloadfile(e){
    console.log(this.data.choosefile.filePath)
    wx.cloud.downloadFile({
      fileID: this.data.choosefile.filePath,
      success (res) {
        console.log(res.tempFilePath)
        wx.showToast({
          title: '下载成功',
          icon:'none'
        })
      },
      fail(res){
        console.log(res)
      }
    })
  },

})