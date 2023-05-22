// pages/publish/publish.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
      type:0,   //订单类型
      campus:'',
      pass:false,  //是否可以接单

      list:[],
      nomore:false,
      page:0,

      button_disabled:false, //接单按钮是否开启，这个值主要是用于防止多次点击“立即接单”而造成bug
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       this.get_campus();
  },
  //点击立即接单要先去检查用户是否已申请跑腿权限
  check_paotui(e){
     let that = this
     let publish_id = e.currentTarget.dataset.item._id
     let publish_openid = e.currentTarget.dataset.item._openid
     let publish_price = e.currentTarget.dataset.item.price
     //设置按钮禁用
     that.setData({
        button_disabled:true,
     })
     wx.showLoading({
       title: '正在接单',
     })
     db.collection('runner').where({
      _openid:app.globalData.openid,
      pass:true,
     }).get({
       success:function(res){
         if(res.data.length!=0){
             //先检查是否已接单
             db.collection('publish').where({
                 _id:publish_id,
                 status:0,
             }).get({
               success:function(resss){
                  if(resss.data.length!=0){
                        //有权限
                        //调用云函数处理接单事务
                        wx.cloud.callFunction({
                          name:'take_order',
                          data:{
                              publish_id:publish_id,
                              creat:new Date().getTime(),
                              phone:res.data[0].phone,  //骑手电话
                          },
                          success:function(re){
                            if(re.result.success){
                              //去获取最新的列表数据
                              that.get_list()
                              that.setData({
                                button_disabled:false
                              })
                              wx.hideLoading()
                              wx.showToast({
                                title: '接单成功',
                                icon: 'success',
                                duration: 2000
                              })
                              let nian = new Date().getFullYear();
                              let yue = new Date().getMonth()+1;
                              let ri = new Date().getDate();
                              let shi = new Date().getHours();
                              let fen = new Date().getMinutes();
                              //接单成功，则要调用send云函数发送订单接单提醒给订单发布者
                              wx.cloud.callFunction({
                                name:'send',
                                data:{
                                    type:parseInt(1),    //1代表发送订单接单提醒，2代表发送订单送达提醒
                                    publish_id:publish_id,
                                    publish_price:parseFloat(publish_price),
                                    publish_openid:publish_openid,
                                    time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
                                },
                                success:function(r){
                                  console.log('成功发送')
                                  console.log(r)
                                },
                                fail(rr){
                                  console.log(rr)
                                }
                              })
                            }
                            console.log(re)
                            //如果失败，则提示重试
                            if(!re.result.success){
                                that.setData({
                                    button_disabled:false
                                })
                                wx.showToast({
                                  title: '接单失败',
                                  icon: 'error',
                                  duration: 2000
                                })
                            }
                          }
                      })
                  }else{
                        that.get_list()
                        //已经有人接单了
                        wx.showToast({
                          title: '已经有人接单了',
                          icon: 'none',
                          duration: 3000
                        })
                        //恢复按钮
                        that.setData({
                          button_disabled:false,
                        })             
                  }
               }
             })

         }else{
              //没有权限，则提示用户
              wx.showToast({
                title: '无权限接单，请先申请跑腿权限',
                icon: 'none',
                duration: 3000
              })
              //恢复按钮
              that.setData({
                 button_disabled:false,
              })
         }
       },
       fail(eee){
          that.setData({
            button_disabled:false
          })
       }
     })
  },
  
  //获取地区，方便获取该地区的订单
  get_campus(){
    let that = this
    db.collection('runner').where({
        _openid:app.globalData.openid,
    }).get({
      success:function(res){
         if(res.data.length!=0){
              that.setData({
                 campus:res.data[0].campus,
              })
              //根据地区去获取订单列表
              that.get_list()
         }else{
              //没有认证跑腿，则获取默认收件地址的学校
              db.collection('dizhi').where({
                _openid:app.globalData.openid,
                default:true,
              }).get({
                success:function(re){
                    if(re.data.length!=0){
                      that.setData({
                        campus:re.data[0].campus,
                      })
                      //根据地区去获取订单列表
                      that.get_list()
                    }else{
                       //也没有填写过收件地址，则获取默认第一个地区
                       db.collection('campus').orderBy('_updateTime','asc').limit(1).get({
                        success:function(ree){
                            if(ree.data.length!=0){
                              that.setData({
                                campus:ree.data[0].campus.name,
                              })
                              //根据地区去获取订单列表
                              that.get_list()
                            }else{
                                //如果也没有设置地区，则留空
                               
                            }
                        }
                      })
                    }
                }
              })
         }
      }
    })
  },
  //订单类型
  type_Change(e){
    this.setData({
        type:e.detail.name,
        list:[],
        nomore:false,
        page:0,
    })
    console.log(this.data.type)
    //切换顶部导航栏要重新获取符合条件的列表数据
    this.get_list()
  },
  //获取订单列表
  get_list(){
    let that = this
    if(that.data.type==0){
      db.collection('publish').where({
        status:_.in([0,3])   //待接单、已完成，0或3
      }).orderBy('status', 'asc').orderBy('creat','desc').limit(20).get({
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
            //停止下拉刷新
            wx.stopPullDownRefresh()
        }
      })
    }else{
      var type = parseFloat(that.data.type - 1)
      db.collection('publish').where({
        type:type,
        status:_.in([0,3])
      }).orderBy('status', 'asc').orderBy('creat','desc').limit(20).get({
        success:function(res){
             that.setData({
               list:res.data
             })
             //如果返回不够20条，则说明没有更多了
             if(res.data.length<20){
                 that.setData({
                    nomore:true,
                 })
             }
             //停止下拉刷新
             wx.stopPullDownRefresh()
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
      if(that.data.type==0){
        //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
        db.collection('publish').where({
          status:_.in([0,3])
        }).orderBy('status', 'asc').orderBy('creat', 'desc').skip(page * 20).limit(20).get({
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
        var type = parseFloat(that.data.type - 1)
        //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
        db.collection('publish').where({
          type:type,
          status:_.in([0,3])
        }).orderBy('status', 'asc').orderBy('creat', 'desc').skip(page * 20).limit(20).get({
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
    this.get_list()
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
     this.get_list()
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