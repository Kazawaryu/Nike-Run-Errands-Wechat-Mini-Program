const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-4g8w9exxb2477c3f'
})
const db = cloud.database({
  throwOnNotFound: false,
});
exports.main = async (event) => {
  try {

      const result = await db.runTransaction(async transaction => {
      const publish_Res = await transaction.collection('publish').doc(event.publish_id).get()
      if (publish_Res.data) {
        //默认地址改为true，同时加时间戳，让默认地址排在前面
        const update1_Res = await transaction.collection('publish').doc(event.publish_id).update({
          data: {
                has:true,  //改为已提过异议
          }
        })
        //把原来的默认地址改为false,也更新一下时间戳，让常用地址排在前面
        const add_Res = await transaction.collection('dispute').add({
          data: {
            paotui_phone:event.paotui_phone,
            publish_phone:event.publish_phone,
            paotui_price:event.paotui_price,
            notes:'跑腿费已经付给骑手了，但用户对骑手完成的订单有异议，请工作人员联系协调，人工处理该订单，如发现骑手恶意接单，建议封禁该骑手，维持正常接单系统',
            time:event.time,
          }
        })

        return {
          success:true,
        }
      } else {
        await transaction.rollback('失败了')
      }
    })
    return result;
  } catch (e) {
    console.error(`事务报错`, e)
    return {
      success: false,
      error: e
    }
  }
}