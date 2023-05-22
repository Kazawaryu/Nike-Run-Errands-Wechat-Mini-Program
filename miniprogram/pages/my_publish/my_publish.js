// pages/my_publish/my_publish.js
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

    pinglun_counts:0,
    pinglun_value:'',
    fileList_img:[],
    linshi_img:[],

    pinglun_show:false,
    paotui_openid:'',
    button_disabled:false,

    publish_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       this.get_list()
  },
  pingjia(e){
      let that = this
      let publish_id = e.currentTarget.dataset.item._id
      that.setData({
        button_disabled:true,
        publish_id:publish_id,
      })
      db.collection('order').where({
          publish_id:publish_id,
          status:2,
      }).get({
        success:function(res){
             console.log(res)
              that.setData({
                 button_disabled:false
              })
              if(res.data.length!=0){
                 //拿到跑腿员的openid
                 that.setData({
                     paotui_openid:res.data[0]._openid,
                     pinglun_show:true,
                 })
              }
        },
        fail(er){
          that.setData({
            button_disabled:false
          })
        }
      })
  },
  //有异议
  has_yiyi(e){
    let that = this
    that.setData({
      button_disabled:true
    })
    wx.showLoading({
      title: '正在处理',
    })
    let publish_id = e.currentTarget.dataset.item._id
    db.collection('order').where({
        publish_id:publish_id,
        status:2,
    }).get({
      success:function(res){
            if(res.data.length!=0){
              let nian = new Date().getFullYear();
              let yue = new Date().getMonth()+1;
              let ri = new Date().getDate();
              let shi = new Date().getHours();
              let fen = new Date().getMinutes();
                //1、存入纠纷订单，2、update更新publish，也就是加入has：true，代表已提过异议
                wx.cloud.callFunction({
                  name:'has_yiyi',
                  data:{
                    publish_id:res.data[0].publish_id,
                    paotui_phone:res.data[0].phone,
                    publish_phone:res.data[0].publish_data.address.phone,
                    paotui_price:res.data[0].publish_data.paotui_price,
                    notes:'跑腿费已经付给骑手了(骑手没提现的话，钱还在你的卡里)，但用户对骑手完成的订单有异议，请工作人员联系协调，人工处理该订单，如发现骑手恶意接单，建议封禁该骑手，维持正常接单系统',
                    time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
                  },
                  success:function(res){
                       wx.hideLoading()
                       if(res.result.success){
                         //去获取最新的列表数据
                         that.get_list()
                         wx.showToast({
                           title: '提交成功',
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
                             title: '提交失败',
                             icon: 'error',
                             duration: 2000
                           })
                           that.setData({
                             button_disabled:false
                           })
                       }
                  },
                  fail(eeeeeee){
                    wx.hideLoading()
                    that.setData({
                      button_disabled:false
                    })
                  }
                })
            }
      },
      fail(er){
        that.setData({
          button_disabled:false
        })
      }
    })
  },
    //获取用户输入的评价内容
    pinglunInput(e){
      let that = this;
      console.log(e.detail.cursor)
      that.setData({
            pinglun_counts: e.detail.cursor,
            pinglun_value: e.detail.value,
      })
    },
 //添加评价
  add_pinglun(){
    let that = this;
    if(!that.data.pinglun_value){
      wx.showToast({
        title: '请先输入评价内容',
        icon: 'none',
        duration: 2000
      });
      return false
    }
    let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
    db.collection('pingjia').add({
      data:{
        pinglun_value:that.data.pinglun_value,
        paotui_openid:that.data.paotui_openid,
        creat:new Date().getTime(),
        riqi:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
        avatarUrl:app.globalData.userInfo.avatarUrl,
        nickName:app.globalData.userInfo.nickName,
        userInfo:app.globalData.userInfo,
        paotui_openid:that.data.paotui_openid,
        fileList_img:that.data.fileList_img,
      },
      success:function(res){
            //更新已评价过
            db.collection('publish').doc(that.data.publish_id).update({
              data:{
                  pingjia:true,
              },
              success:function(rerr){
                that.get_list();
              }
            })
            wx.showToast({
              title: '评价成功',
              icon: 'success',
              duration: 2000
            });

            that.setData({
                pinglun_show:false,
                button_disabled:false
            })
            
      },
      fail(er){
        wx.showToast({
          title: '评价失败，请重试',
          icon: 'none',
          duration: 2000
        });
        that.setData({
          pinglun_show:false,
          button_disabled:false
        })
      }
    })
  },
  //取消评价
  cancel(){
    this.setData({
      pinglun_show:false,
      button_disabled:false,
   })
  },
   // 上传图片
   uploadToCloud_img(event) {
         let that = this;
          wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success (res) {
              wx.showLoading({
                title: '正在上传',
              })    
              console.log(res)
              that.setData({
                linshi_img:that.data.linshi_img.concat(res.tempFilePaths)
              })
              console.log(that.data.linshi_img)
              
              //临时数组
              let lujin2 = "pinglun_img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000)+'.png';
              const uploadTasks = that.data.linshi_img.map((item, index)  => {
                return  that.uploadFilePromise_img(index+lujin2, item)
                
              }); //传给wx.cloud.uploadFile的cloudPath属性的值不能重复！！！巨坑，加个index就可以避免重复了
                Promise.all(uploadTasks)
                .then(data => {
                  console.log(data)
                  wx.hideLoading()
                  wx.showToast({ 
                    title: '上传成功', 
                    icon: 'none' 
                  });
                  const newFileList = data.map(item => (item.fileID));
                  console.log(newFileList)
                  //每次上传成功后，都要清空一次临时数组，避免第二次重复上传，浪费存储资源，
                  that.setData({ 
                    fileList_img: that.data.fileList_img.concat(newFileList),
                    linshi_img:[],
                  });
                  
                })
                .catch(e => {
                  wx.showToast({ title: '上传失败', icon: 'none' });
                  console.log(e);
                });
          
            }
          })
          

    
   
},
 //上传到云存储，并且获得图片新路径
  uploadFilePromise_img(fileName, chooseResult) {
    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: chooseResult
    });
  },
//预览图片
previewImage_img:function(event){
  console.log(event)
  wx.previewImage({
    urls: [event.currentTarget.dataset.url] // 需要预览的图片http链接列表
  })    
},
//删除图片
delete_img:function(event){
  let that = this;
  console.log(event)
  let inde = event.currentTarget.dataset.id
  //删除数组里面的值
  that.data.fileList_img.splice(inde,1)
  that.setData({
      fileList_img:that.data.fileList_img,
  })
},
  //获取订单列表
  get_list(){
    let that = this
    db.collection('publish').where({
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
  },
  //取消订单
  cancel_publish(e){
     let that = this
     that.setData({
      button_disabled:true
    })
    wx.showLoading({
      title: '正在处理',
    })
     let publish_id = e.currentTarget.dataset.item._id
     db.collection('user').where({
       _openid:app.globalData.openid
     }).get({
       success:function(ress){
           if(ress.data.length!=0){
                  console.log(publish_id)
                  console.log(ress.data[0]._id)
                  //1、改publish订单状态，2、增加自己的钱包余额,3、增加取消订单的钱包余额收入
                  wx.cloud.callFunction({
                    name:'cancel_publish',
                    data:{
                      publish_id:publish_id,
                      user_id:ress.data[0]._id,
                      creat:new Date().getTime()
                    },
                    success:function(res){
                        wx.hideLoading()
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
                    fail(ere){
                      wx.hideLoading()
                    }
                  })
           }
       }
     })

  },
  //联系骑手
  call_qishou(e){
     let that = this
     that.setData({
      button_disabled:true
    })
     let publish_id = e.currentTarget.dataset.item._id
     db.collection('order').where({
         publish_id:publish_id,
         status:0,  //确保订单是正在配送中的,因为我的订单，可以也被其他骑手接过，但是取消了，所以必须要保证状态是配送中才是对的骑手
     }).get({
       success:function(res){
            that.setData({
              button_disabled:false
            })
            if(res.data.length!=0){
                wx.makePhoneCall({
                  phoneNumber: res.data[0].phone,
                })
            }

       },
       fail(er){
        that.setData({
          button_disabled:false
        })
       }
     })
  },
  //删除订单
  delete_publish(e){
    let that = this
    that.setData({
      button_disabled:true
    })
    let publish_id = e.currentTarget.dataset.item._id
    db.collection('publish').doc(publish_id).remove({
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

        //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
        db.collection('publish').where({
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