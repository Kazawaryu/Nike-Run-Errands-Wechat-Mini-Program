// pages/my_order/my_order.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    nomore:false,
    page:0,

    status:0,
    button_disabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       this.get_list()
  },
  //取消接单
  cancel_order(e){
    let that = this
    that.setData({
      button_disabled:true
    })
    let publish_id = e.currentTarget.dataset.item.publish_data._id
    let order_id = e.currentTarget.dataset.item._id
    wx.showModal({
      title: '提示',
      content: '取消接单的行为会被记录。多次取消接单，接单权限将会被取消哦',
      success (re) {
        if (re.confirm) {
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name:'cancel_order',
            data:{
                publish_id:publish_id,
                order_id:order_id,
            },
            success:function(res){
              if(res.result.success){
                //去获取最新的列表数据
                that.get_list()
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 2000
                })
                that.setData({
                  button_disabled:false
                })
              }
              console.log(res)
              //如果失败，则提示重试
              if(!res.result.success){
                  wx.showToast({
                    title: '取消失败',
                    icon: 'error',
                    duration: 2000
                  })
                  that.setData({
                    button_disabled:false
                  })
              }
            },
            fail(er){
              that.setData({
                button_disabled:false
              })
              wx.showToast({
                title: '取消失败',
                icon: 'error',
                duration: 2000
              })
            }
          })
        } else if (re.cancel) {
          console.log('用户点击取消')
          that.setData({
            button_disabled:false
          })
        }
      }
    })
  },
  //订单详情
  order_detail(e){

    let order_id = e.currentTarget.dataset.item._id
    wx.navigateTo({
      url: '/pages/order_detail/order_detail?order_id='+order_id,
    })
  },
  //联系客户
  call_kehu(e){
    let phone = e.currentTarget.dataset.item.publish_data.address.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  //预览图片
previewImage_img:function(event){
  console.log(event)
  wx.previewImage({
    urls: event.currentTarget.dataset.url // 需要预览的图片http链接列表
  })    
},
  //确认送达
  confirm_songda(e){
    let that = this
    that.setData({
      button_disabled:true
    })
    wx.showLoading({
      title: '正在处理',
    })
    db.collection('user').where({
      _openid:app.globalData.openid,
    }).get({
      success:function(eee){
          if(eee.data.length!=0){
            let user_id = eee.data[0]._id
            let publish_id = e.currentTarget.dataset.item.publish_id
            let publish_openid = e.currentTarget.dataset.item.publish_data._openid
            let order_id = e.currentTarget.dataset.item._id
            let pei_time = e.currentTarget.dataset.pei_time
            console.log(publish_id)
            console.log(order_id)
            console.log(pei_time)
            console.log(user_id)
            wx.cloud.callFunction({
              name:'confirm_songda',
              data:{
                  publish_id:publish_id,
                  order_id:order_id,
                  user_id:user_id,
                  pei_time:pei_time,
                  creat:new Date().getTime(),
              },
              success:function(res){
                wx.hideLoading()
                if(res.result.success){
                  //去获取最新的列表数据
                  that.get_list()
                  that.setData({
                    button_disabled:false
                  })
                  let nian = new Date().getFullYear();
                  let yue = new Date().getMonth()+1;
                  let ri = new Date().getDate();
                  let shi = new Date().getHours();
                  let fen = new Date().getMinutes();
                  //发送送达提醒订阅消息
                  wx.cloud.callFunction({
                    name:'send',
                    data:{
                        type:parseInt(2),    //1代表发送订单接单提醒，2代表发送订单送达提醒
                        publish_id:publish_id,
                        publish_openid:publish_openid,
                        time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
                    },
                    success:function(r){
                      console.log("送达订阅消息发送成功")
                    },
                    fail(rr){
                      console.log(rr)
                    }
                  })
                  wx.showToast({
                    title: '确认成功',
                    icon: 'success',
                    duration: 2000
                  })
                }
                console.log(res)
                //如果失败，则提示重试
                if(!res.result.success){
                    wx.showToast({
                      title: '确认失败',
                      icon: 'error',
                      duration: 2000
                    })
                    that.setData({
                      button_disabled:false
                    })
                }
              },
              fail(er){
                console.log(er)
                wx.showToast({
                  title: '确认失败',
                  icon: 'error',
                  duration: 2000
                })
                that.setData({
                  button_disabled:false
                })
              }
            })
          }
      },
      fail(errr){
        that.setData({
          button_disabled:false
        })
      }
    })

  },
  //删除已取消的接单订单
  delete_order(e){
    let that = this
    that.setData({
      button_disabled:true
    })
    let order_id = e.currentTarget.dataset.item._id
    db.collection('order').doc(order_id).remove({
      success:function(res){
         that.get_list();
         that.setData({
          button_disabled:false
        })
      },
      fail(er){
        that.setData({
          button_disabled:false
        })
      }
    })
  },
  //订单类型
  status_Change(e){
    this.setData({
        status:e.detail.name,
        list:[],
        nomore:false,
        page:0,
    })
    console.log(this.data.status)
    //切换顶部导航栏要重新获取符合条件的列表数据
    this.get_list()
  },
  //获取我的接单列表数据
  get_list(){
     let that = this
     if(that.data.status==3){
          db.collection('pingjia').where({
            paotui_openid:app.globalData.openid,
          }).orderBy('creat','desc').limit(20).get({
            success:function(res){
              console.log(res)
                that.setData({
                  list:res.data
                })
                //如果返回不够20条，则说明没有更多了
                if(res.data.length<20){
                    that.setData({
                      nomore:true,
                    })
                }
            }
          })
     }else{
      db.collection('order').where({
        _openid:app.globalData.openid,
        status:that.data.status,
      }).orderBy('creat','desc').limit(20).get({
        success:function(res){
           console.log(res)
            that.setData({
              list:res.data
            })
            //如果返回不够20条，则说明没有更多了
            if(res.data.length<20){
                that.setData({
                  nomore:true,
                })
            }
        }
      })
     }
  },
  //获取更多订单数据
  get_more:function(){
        let that = this;
        if (that.data.nomore || that.data.list.length < 20) {
          wx.showToast({
            title: '没有更多了',
          })
          return false
        }
        
        let page = that.data.page + 1;
        if(that.data.status==3){
          //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
          db.collection('pingjia').where({
            paotui_openid_openid:app.globalData.openid
          }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
                  success: function(res) {
                        console.log(res)
                        if (res.data.length == 0) {
                              that.setData({
                                    nomore: true
                              })
                              return false
                        }
                        if (res.data.length < 20) {
                              that.setData({
                                    nomore: true
                              })
                        }
                        //取到成功后，都连接到旧数组，然后组成新数组
                        that.setData({
                            //这里的page为1
                            page: page,
                            list: that.data.list.concat(res.data)
                       })
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                  }
          })
        }else{
          //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
          db.collection('order').where({
            _openid:app.globalData.openid,
            status:that.data.status,
          }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
                  success: function(res) {
                        console.log(res)
                        if (res.data.length == 0) {
                              that.setData({
                                    nomore: true
                              })
                              return false
                        }
                        if (res.data.length < 20) {
                              that.setData({
                                    nomore: true
                              })
                        }
                        //取到成功后，都连接到旧数组，然后组成新数组
                        that.setData({
                            //这里的page为1
                            page: page,
                            list: that.data.list.concat(res.data)
                       })
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                  }
          })
        }

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
    this.get_more()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})