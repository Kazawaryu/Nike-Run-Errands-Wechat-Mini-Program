var app = getApp();
var db = wx.cloud.database();

Page({
      /**
       * 页面的初始数据
       */
      data: {
            list: [{
                  title: '该程序是做什么的？',
                  id: 0,
                  des: ['本程序主要是方便用户发布跑腿和接单赚钱'
                  ],
                  check: true,
            },  
            {
              title: '如订单配送中，但物品迟迟未送到',
              id: 1,
              des: ['用户可以进入“我的订单”联系骑手，如骑手恶意接单，请联系工作人员，发送骑手号码，工作人员核实后会取消骑手的接单权限。'],
              check: false,
            },
            {
              title: '如订单已完成，但物品未收到',
              id: 2,
              des: ['用户可以进入“我的订单”提起异议，工作人员核实后会退还跑腿费，同时，取消骑手的接单权限。'],
              check: false,
            }, {
                  title: '无人接单后取消订单，钱款会自动到微信钱包吗？',
                  id: 3,
                  des: ['如果发布者取消了订单，钱款都会原数退还至您在此小程序的钱包内（我的钱包），最后需要您手动提现，工作人员会24小时内付款到您的微信钱包'],
                  check: false,
            },
            {
              title: '如何防止恶意接单而不配送',
              id: 4,
              des: ['本程序对取消订单的行为进行监控记录，多次取消接单，后台将取消接单权限。'],
              check: false,
           },
           {
            title: '为什么要留下联系方式？',
            id: 5,
            des: ['对于纠纷订单，工作人员会介入协商，需联系上双方。'],
            check: false,
           },
            {
                  title: '本程序的通知形式？',
                  id: 6,
                  des: ['对于发布者下单时，我们会提醒用户授权接收通知，同意后后续订单状态都可以接单得到，如果不同意，只能进入本小程序才能查看订单状态'],
                  check: false,
            }, ]
      },
      onReady() {},

      show(e) {
            var that = this;
            let ite = e.currentTarget.dataset.show;
            let list = that.data.list;
            if (!ite.check) {
                  list[ite.id].check = true;
            } else {
                  list[ite.id].check = false;
            }
            that.setData({
                  list: list
            })
      },

      onLoad() {

      },

})