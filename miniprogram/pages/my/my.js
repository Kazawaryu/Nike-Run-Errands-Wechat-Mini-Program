// pages/my/my.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        userInfo:'',
        showAvaModal:false,
        avatarUrl:'',
        nickName:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(!app.globalData.userInfo){
      this.get_userInfo()
    }else{
        this.setData({
           userInfo:app.globalData.userInfo
        })
    }
           this.setData({
                   nickName:app.globalData.nickName,
                   avatarUrl:app.globalData.avatarUrl,
             })
       

  },
  //我的接单跳转函数
  go_order(e){
      let url = e.currentTarget.dataset.url
      db.collection('runner').where({
         _openid:app.globalData.openid,
         pass:true
      }).get({
        success:function(res){
          if(res.data.length!=0){
            //有权限进入
            wx.navigateTo({
              url: url,
            })
          }else{
              //没有权限，则提示用户
              wx.showToast({
                title: '无权限接单，请先申请跑腿权限',
                icon: 'none',
                duration: 3000
              })
          }
        }
      })

  },
  //跳转函数
  go(e){
      let url = e.currentTarget.dataset.url
      wx.navigateTo({
        url: url,
      })
  },
  //跳转申请跑腿
  go_apply(e){
    let that = this
    if(!app.globalData.userInfo){
      wx.showToast({
        title: '请先授权头像',
        icon: 'none',
        duration: 3000
      })
      return false
    }
    db.collection('runner').where({
        _openid:app.globalData.openid,
    }).get({
      success:function(res){
        if(res.data.length!=0){
          //没有授权展示头像昵称
          wx.showToast({
            title: '您已经提交过申请了',
            icon: 'none',
            duration: 3000
          })
          return false
        }else{
          let url = e.currentTarget.dataset.url
          wx.navigateTo({
            url: url,
          })
        }
      }
    })

  },
  //跳转我的订单
  go_publish(e){
    if(!app.globalData.userInfo){
        //没有授权展示头像昵称
        wx.showToast({
          title: '请先授权展示头像和昵称',
          icon: 'none',
          duration: 3000
        })
        return false
    }
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })

  },
  //查询数据库获取用户信息
  get_userInfo(){
    let that = this
    db.collection('user').where({
       _openid:app.globalData.openid,
    }).get({
      success:function(res){
        console.log(res)
          if(res.data.length!=0){
              that.setData({
                 userInfo:res.data[0].userInfo
              })
              app.globalData.userInfo = res.data[0].userInfo
          }
      }
    })
  },
   //官方接口获取用户信息
    getUserProfile(e) {
    console.log('sjshs')
        this.setData({
          showAvaModal:true
        })
    console.log(this.data.showAvaModal)
    
      },
      async getAvaNickData(res){
        let that = this
         wx.showLoading({
           title: '正在设置',
         })
         const { avatarUrl, nickName } = res.detail
         console.log(avatarUrl)
         console.log(nickName)
         let lujin2 = "nickimg/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000)+'.png';
       wx.cloud.uploadFile({
         cloudPath: lujin2,
         filePath: avatarUrl,
         success:function(rer){
             console.log(rer)
                     
               var userInfo = {
                 avatarUrl:rer.fileID,
                 nickName:nickName
             }
            db.collection('user').where({
             _openid:app.globalData.openid
             }).update({
                 data:{...userInfo}
             })
             db.collection('user').where({
              _openid:app.globalData.openid
             }).get({
                success:function(res){
                  console.log(res)
                  wx.hideLoading()
                  app.globalData.userInfo = userInfo
                  app.globalData.nickName = res.data[0].nickName
                  app.globalData.avatarUrl = res.data[0].avatarUrl
                  that.setData({
                    nickName:res.data[0].nickName,
                    avatarUrl:res.data[0].avatarUrl,
                    showAvaModal:false
                  })
                }
             })
    
         }
        });
    },
  //官方接口获取用户信息
  // getUserProfile(e) {
  //   let that = this
  //   // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
  //   // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  //   wx.getUserProfile({
  //     desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
  //     success: (res) => {
  //       that.setData({
  //         userInfo: res.userInfo,
  //       })
  //       app.globalData.userInfo = res.userInfo
  //       console.log(that.data.userInfo)
  //       //存储到用户的user表里，方便以后获取展示
  //       db.collection('user').where({
  //         _openid:app.globalData.openid
  //       }).get({
  //         success:function(re){
  //             if(re.data.length==0){
  //                 db.collection('user').add({
  //                    data:{
  //                      userInfo:res.userInfo,
  //                      money:0,
  //                    }
  //                 })
  //             }else{
  //               db.collection('user').where({
  //                 _openid:app.globalData.openid
  //               }).update({
  //                 data:{
  //                   userInfo:res.userInfo
  //                 }
  //               })
  //             }
  //         }
  //       })
  //     }
  //   })
  // },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {

  // },

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