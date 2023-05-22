// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router'); //云函数路由
const math = require('mathjs'); //云函数路由
cloud.init({
  env:'cloud1-4g8w9exxb2477c3f'
})


// 云函数入口函数
exports.main = async (event, context) => {
      const app = new TcbRouter({
          event
      });
      //乘法,计算跑腿佣金
      app.router('multiply', async(ctx) => {
          //paotui_rate是跑腿费的百分比
          var paotui_rate = math.subtract(math.bignumber(1), math.bignumber(event.num2))
          var value = math.multiply(math.bignumber(event.num1), math.bignumber(paotui_rate))
          ctx.body = math.round(value,2)  //四舍五入，并且保留2位小数
      });
      //除法
      app.router('divide', async(ctx) => {
          var value = math.divide(math.bignumber(event.num1), math.bignumber(event.num2))
          ctx.body = math.round(value,2)  //四舍五入，并且保留2位小数
      });
      //加法
      app.router('sum', async(ctx) => {
          var value = math.add(math.bignumber(event.num1), math.bignumber(event.num2))
          ctx.body = math.round(value,2)  //四舍五入，并且保留2位小数
      });
      //减法
      app.router('subtract', async(ctx) => {
          var value = math.subtract(math.bignumber(event.num1), math.bignumber(event.num2))
          ctx.body = math.round(value,2)  //四舍五入，并且保留2位小数
      });
      return app.serve();
}