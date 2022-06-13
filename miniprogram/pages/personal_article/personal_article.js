// pages/personal_article/personal_article.js
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
const cloudarticle=db.collection('cloudarticle')
const likeandcollect=db.collection('likeandcollect')
Page({
  /**
   * 页面的初始数据
  */
  data: {
    tabs:[
      {
          id:0,
          value:"未上传",
          isactive:true
      },
      {
          id:1,
          value:"已上传",
          isactive:false
      }
    ],
    userInfo: {},
    hasUserInfo: false,
    notuploadcards:["","","","",""],
    uploadcards:[],
    hasFull:true,
    isShown:false,
    isShown1:false,
    deleteindex:-1,
    deletecloudindex:"",
    simplifycontent:["","","","",""],
    simplifycontent2:[],
    ischufa:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        userInfo.where({
          _openid:res1.result.openid
        }).count().then(res2=>{
          if(res2.total==1) {userInfo.where({
            _openid:res1.result.openid
          })
          .get().then(res3=>{
             this.setData({
               userInfo:res3.data[0],
               hasUserInfo:true
             })
          })
        }
        })
      }
    })
  },
  onShow:function(option){
    //未上传页面的加载
    this.setData({
      hasFull:true
    })
    for(let i=1;i<6;i++)
    {
      wx.getFileSystemManager().readFile({  //读取文件
        filePath: wx.env.USER_DATA_PATH+"/"+i+".txt",
        encoding: 'utf-8',
        success: res => {
          let notuploadcards=this.data.notuploadcards
          let simplifycontent=this.data.simplifycontent
          notuploadcards[i-1]=res.data.split("&hc")
          var x=notuploadcards[i-1][notuploadcards[i-1].length-2]
          simplifycontent[i-1]=x.substring(0,30)+"..."
          this.setData({
            notuploadcards,
            simplifycontent
          })
        },
        fail: res => {
          this.setData({
            hasFull:false
          })
        },
      })
    }

    //已上传页面的加载
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
          cloudarticle.where({
          _openid:res1.result.openid
        }).get().then(res2=>{
          let simplifycontent2=this.data.simplifycontent2
          for(let i=0;i<res2.data.length;i++){
            simplifycontent2.push(res2.data[i].words.split('&hc').join('\n').substring(0,30)+"...")
          }
          this.setData({
            uploadcards:res2.data,
            simplifycontent2
          })
        })
      }
    })
  },
  toregister(e){
    wx.switchTab({
      url: '../personal/personal'
    })
  },

  handletabsitemchange(e){
    const index=e.detail.index;
    let tabs=this.data.tabs;
    tabs.forEach((v,i)=>{i===index?v.isactive=true:v.isactive=false});
    this.setData({
      tabs
    })
  },
  toaddarticle(e){
    if(!this.data.hasFull)
    {
      wx.navigateTo({
        url: '../personal_article_write/personal_article_write',
      })
    }
    else
    {
      wx.showToast({
        title: '最多存5个草稿',
        icon: 'error'
      })
    }
  },

  editarticle(e){
    var x=""
    for(let i=0;i<parseInt(e.currentTarget.dataset.item[0])+3;i++)
    {
      x+=e.currentTarget.dataset.item[i]+","
    }
    x+=e.currentTarget.dataset.item[parseInt(e.currentTarget.dataset.item[0])+3]
    wx.navigateTo({
      url: '../personal_article_write/personal_article_write?str='+x
    })
  },
  toarticle(e){
    var i=e.currentTarget.dataset.item
    if(!this.data.ischufa)
    wx.navigateTo({
      url: '../article/article?article_id='+i
    })
  },
  deletearticle(e){
    var i=e.currentTarget.dataset.item[parseInt(e.currentTarget.dataset.item.length)-1]
    this.setData({
      deleteindex:i,
      isShown:true
    })
  },
  deletecloud(e){
    this.setData({
      ischufa:true
    })
    var i=e.currentTarget.dataset.item.article_id
    this.setData({
      deletecloudindex:i,
      isShown1:true
    })
  },
  closedialog(e) {
    this.setData({
      ischufa:false
    })
    ////do something when sure is clicked
    this.setData({
        isShown: false,
        isShown1:false
    })
  },
  allowdelete(e){
    this.setData({
      isShown:false
    })
    wx.getFileSystemManager().unlink({
      filePath: wx.env.USER_DATA_PATH+"/"+this.data.deleteindex+".txt",
      success:res=>{
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        let notuploadcards=this.data.notuploadcards
        notuploadcards.splice(this.data.deleteindex-1,1)
        this.setData({
          notuploadcards
        })
      }
    })
  }, 
  allowdeletecloud(e){
    this.setData({
      isShown1:false
    })
    cloudarticle.where({
      article_id:this.data.deletecloudindex
    }).get().then(res=>{
      
      this.data.tempdelete =res.data[0].article_id
      this.remove_s()
      let j=res.data[0].photo_url.length
      for(let i=0;i<j;i++)
      {
        wx.cloud.deleteFile({
          fileList:[res.data[0].photo_url[i]],
          complete(res){
          },
        })
      }
      cloudarticle.where({
        article_id:this.data.deletecloudindex
      }).remove()
      this.onShow()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    })
  },
  //删除点赞和收藏
  remove_s:function(e)
  {
    likeandcollect.get().then(res=>{
      this.setData({jilu:res.data})//获取数据库数据
      for(let i=0;i<res.data.length;i++)
      {
        for(let j=0;j<res.data[i].hasdz.length;j++)
        {
          var dz=res.data[i].hasdz
          if(dz[j]==this.data.tempdelete)
          {dz.splice(j,1)
          likeandcollect.where({_openid:res.data[i]._openid}).update({
            data:{hasdz:dz},
          })
        }
        }
        for(let j=0;j<res.data[i].hassc.length;j++)
        {
          var sc=res.data[i].hassc
          if(sc[j]==this.data.tempdelete){
          sc.splice(j,1)
          likeandcollect.where(
            {_openid:res.data[i]._openid}
          ).update({
            data:{
              hassc:sc
            }
          })
        }
        }
      }
    })
  }
})
