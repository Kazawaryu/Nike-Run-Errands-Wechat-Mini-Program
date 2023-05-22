// pages/index/index.js
const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
       type:0,
       content_value:'', 
       content_counts:0,

       address:'',
       pick_address:'',
       weight: 3,

       goods:['请选择物品类型'],
       goods_show:false,
       choose_goods:'请选择',

       price:2,
       rate:0.2,  // 默认0.2提成

       paotui_price:1.6, //默认是1.6跑腿费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        //进来先获取用户的openid，设置全局变量app.globalData.openid,以供使用
        this.get_openid()
        this.get_goods()
  },
  dianji(){
     console.log("点击了小秃僧")
  },
    //查询数据库获取用户信息
    get_userInfo(){
      let that = this
      db.collection('user').where({
         _openid:app.globalData.openid,
      }).get({    //.add //update //.remove()
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
  //订单类型
  type_Change(e){
      this.setData({
          type:e.detail.name,
		  content_counts:0,
          content_value:'',
      })
  },
    //请求获取发送订阅消息的权限
    subscribeMessage() {
      let that = this;
      wx.requestSubscribeMessage({
        tmplIds: [
          "Jl958k6_OXKLXGqQDvnaA_Ee8Xmhq4x9cKI6lzx_sIA",//订阅消息模板ID，一次可以写三个，可以是同款通知、到货通知、新品上新通知等，通常用户不会拒绝，多写几个就能获取更多授权
          "p-JsyVQc5Sg4KbxT9ml8muCSWCKP2dpfIz1sP7rDgeM"
        ],
        success(res) {
          console.log("订阅消息API调用成功：",res)
          //不论是用户选择同意还是取消，都会执行success回调函数
          //再检查输入值
          that.check();
          
        },
        fail(res) {
          console.log("订阅消息API调用失败：",res)
        }
      })
    },
  //检查各项输入值
  check(){
    let that = this
    if(that.data.type==0){
      if(!that.data.content_value){
        wx.showToast({
          title: '请选择取件码',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
    }
    if(that.data.type==2){
      if(!that.data.content_value){
        wx.showToast({
          title: '请选择要购买的商品',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
    }
    if(that.data.type==1){
      if(!that.data.pick_address){
        wx.showToast({
          title: '请选择取件地址',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      if(!that.data.choose_goods=='请选择'){
        wx.showToast({
          title: '请选择物品类型',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
    }
    if(!that.data.address){
      wx.showToast({
        title: '请选择收件地址',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.type==1){
      if(that.data.address.address==that.data.pick_address.address){
        wx.showToast({
          title: '取件和收件地址不能相同',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
    }
    //先计算跑腿佣金
    that.calculation()

  },
  //计算佣金
  calculation(){
     let that = this
     wx.showLoading({
       title: '正在下单',
     })
     if(that.data.rate){
      wx.cloud.callFunction({
        name: 'calculation',
        data: {
              $url: "multiply", //云函数路由参数
              num1:that.data.price,
              num2:that.data.rate,
        },
        success: res => {
              that.setData({
                  paotui_price:res.result.value
              })
              console.log(res.result.value)
              //存储新订单
              that.add_data();
        },
        fail(e) {
              console.log(e)
  
        }
      });
     }

  },

  //存储新订单
  add_data(){
    let that = this
    if(that.data.type==0){
      db.collection('publish').add({
        data:{
            creat:new Date().getTime(),
            type:that.data.type,
            content_value:that.data.content_value,
            address:that.data.address,
            weight:that.data.weight,
            price:that.data.price,
            pay_status:false,
            status:0,
            paotui_price:parseFloat(that.data.paotui_price),
        },
        success:function(res){
            wx.hideLoading()

        }
      })
    }
    if(that.data.type==1){
      db.collection('publish').add({
        data:{
            creat:new Date().getTime(),
            type:that.data.type,
            pick_address:that.data.pick_address,
            choose_goods:that.data.choose_goods,
            address:that.data.address,
            weight:that.data.weight,
            price:that.data.price,
            pay_status:false,
            status:0,
            paotui_price:parseFloat(that.data.paotui_price),
        },
        success:function(res){
          wx.hideLoading()

        }
      })
    }
    if(that.data.type==2){
      db.collection('publish').add({
        data:{
            creat:new Date().getTime(),
            type:that.data.type,
            content_value:that.data.content_value,
            address:that.data.address,
            weight:that.data.weight,
            price:that.data.price,
            pay_status:false,
            status:0,
            paotui_price:parseFloat(that.data.paotui_price),
        },
        success:function(res){
          wx.hideLoading()

        }
      })
    }

  },
  //跑腿费输入
  price_Change(e) {
    console.log(e.detail);
    this.setData({
      price:e.detail
    })
  },
     //获取物品类型
     get_goods:function(){
      let that = this;
      db.collection('goods').get({
         success:function(res){
            console.log(res)
            for(let i=0;i<res.data.length;i++){
              that.setData({
                goods:that.data.goods.concat(res.data[i].goods_name),
              })
            }
         }
      })
    },
    
   //打开选择物品类型窗口
   popup_goods:function(){
    let that = this;
    that.setData({
      goods_show:true,
    })
  },
  //监听选择物品类型变化
  goods_change:function(event){
       let that = this;
       console.log(event)
       that.setData({
         choose_goods:event.detail.value
       })
  },
  //取消选择物品类型
  goods_cancel:function(){
    let that = this;
    //关闭选择物品类型窗口
    that.setData({
       goods_show:false,
    })
  },
  //确定物品类型选择
  goods_confirm:function(){
    let that = this;
    //关闭选择物品类型窗口
    that.setData({
      goods_show:false,
    })
  },
  //重量变化
  change_weight(e){
    //如果是点击重量滑块，则这样取值
    if(e.type=='change'){
      this.setData({
        weight: e.detail,
      });
    }else{
      //如果是拖动重量滑块，则这样取值
      this.setData({
        weight: e.detail.value,
      });
    }

  },

  

  get_address(){
     let that = this
     db.collection('dizhi').where({
       _openid:app.globalData.openid,
       default:true,
     }).get({
       success:function(res){
         if(res.data.length!=0){
             app.globalData.address = res.data[0]
             that.setData({
                  address:res.data[0]
             })
             //获取地区提成
             that.get_rate(res.data[0].campus)
         }
       }
     })
  },
  //获取地区的提成， 获取地区提成，方便下单的时候计算除去平台提成后的跑腿佣金
  get_rate(campus_name){
    let that = this
    db.collection('campus').where({
      campus_name:campus_name,
    }).get({
      success:function(res){
        if(res.data.length!=0){
            that.setData({
                rate:res.data[0].rate
            })
            console.log('提成：'+that.data.rate)
        }
      }
    })
  },
    get_nick(){

    db.collection('user').where({
      _openid:app.globalData.openid
     }).get({
        success:function(res){
          console.log(res)
           var userInfo = {
               avatarUrl:res.data[0].avatarUrl,
               nickName:res.data[0].nickName
           }
           app.globalData.userInfo = userInfo
          app.globalData.nickName = res.data[0].nickName
          app.globalData.avatarUrl = res.data[0].avatarUrl

        }
     })
  },
  get_openid(){
    let that = this
    //先查看手机缓存是否有openid，如果没有openid,则调用login云函数重新获取
    wx.getStorage({
      key: 'openid',
      success (res) {
          app.globalData.openid = res.data
          console.log(app.globalData.openid)
          
          that.get_userInfo()
          //获取默认地址
          that.get_address()
          that.get_nick()
          //如果没有初始化钱包余额，则要初始化钱包余额
          that.get_startMoney()
      },
      fail(er){
          //如果没有，也就是不存在openid,则调用login云函数重新获取
          if(!app.globalData.openid){
            wx.cloud.callFunction({
              name:'login',
              data:{},
              success:function(res){
                  console.log(res)
                  app.globalData.openid = res.result.openid
                  that.get_userInfo()
                  //如果没有初始化钱包余额，则要初始化钱包余额
                  that.get_startMoney()
                  //获取默认地址
                  that.get_address()
                  that.get_nick()
                  //设置缓存，以供后面使用
                  wx.setStorage({
                    key:"openid",
                    data:res.result.openid,
                  })
              }
            })
          }
      }
    })
  },
  //初始化钱包余额
  get_startMoney(){

       db.collection('user').where({
           _openid:app.globalData.openid,
       }).get({
         success:function(res){
            console.log(res)
            if(res.data.length==0){
                  db.collection('user').add({
                    data:{
                        money:0,
                    }
                  })
            }else{
                if(!res.data[0].money){
                      db.collection('user').doc(res.data[0]._id).update({
                        data:{
                            money:0,
                        }
                      })
                }
            }
         },
         fail(er){
           console.log(er)
         }
       })
  },
  //获取用户输入的取件内容
  content_Input(e){
    let that = this;
    console.log(e)
    that.setData({
          content_counts: e.detail.cursor,
          content_value: e.detail.value,
    })
  },
  //跳转选择收件地址
  go(e){
    let come_id = e.currentTarget.dataset.come_id
    wx.navigateTo({
      url: '/pages/address/address?come_id='+come_id,
    })
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
       let that = this
       if(app.globalData.address.address){

            if(app.globalData.address.campus!=that.data.address.campus){
              console.log('地区不同的时候，才重新获取提成，避免过度消耗数据库')
              //获取地区提成，方便下单的时候计算除去平台提成后的跑腿佣金
              that.get_rate(app.globalData.address.campus)
            }
            that.setData({
                  address:app.globalData.address
            })
       }
       if(app.globalData.pick_address){
        that.setData({
            pick_address:app.globalData.pick_address
        })
      }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
