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
      const order_Res = await transaction.collection('order').doc(event.order_id).get()
      if (publish_Res.data&&order_Res.data) {
        //改publish订单的状态
        const update1_Res = await transaction.collection('publish').doc(event.publish_id).update({
          data: {
               status:0, //改为待接单
          }
        })
        //改order订单的状态
        const update2_Res = await transaction.collection('order').doc(event.order_id).update({
          data: {
               status:1,  //改为已取消
          }
        })
        
        const add_Res = await transaction.collection('cancel_jilu').add({
          data:{
               cancel_openid:order_Res.data._openid,
               cancel_phone:order_Res.data.phone,
               
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