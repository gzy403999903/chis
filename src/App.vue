<template>
 <router-view/>
</template>

<script>
export default {
  mounted () {
    /***
     * 为 storage 添加监听,当 token 被修改时就将其删除并转到登录界面
     */
    window.addEventListener('storage', (event) => {
      if (event.key === this.$store.getters.tokenKey) {
        this.$store.dispatch('removeToken')
        this.$router.replace('/login')
      }
    })
  }
}
</script>

<style>
  body {
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  /* 自定义 el-form 样式*/
  .el-form .el-form-item__label {
    font-weight: 900;
  }

  /* 自定义 el-table 样式*/
  .el-table {
    width: 100%;
    font-size: 14px;
  }
  .el-table .warning-row {
    background: rgb(252, 248, 227);
  }
  .el-table .success-row {
    background: rgb(223, 240, 216);
  }
  .el-table .danger-row {
    background: rgb(242, 222, 222);
  }
  .el-table .info-row {
    background: rgb(217, 237, 247);
  }

  /* 解决使用 fixed 属性后 底部滑动条无法滑动 */
  /* 此处的important表示优先于element.style */
  /* 改为自动高度后，设置与父容器的底部距离，则高度会动态改变 */
  /*
  .el-table .el-table__fixed, .el-table__fixed-right {
    height: 100% !important;
    bottom: 17px;
  }
  */

  /* 使 el-table 可显示合计行 */
  .el-table{
    overflow:visible !important;
  }

  /* 自定义 el-table 下的 el-button 样式*/
  .el-table .el-button {
    padding: 3px 11px;
  }

  /* 自定义 el-select 样式*/
  .el-select {
    width: 100%;
  }
  /* el-select 下拉列表中的样式*/
  .select-option-top {
    display: inline-block;
    color: #bbbbbb;
  }
  .select-option-title {
    /*padding-right: 5px;*/
    color: #bbbbbb;
  }
  .select-option-text {
    /*padding-right: 15px;*/
    display: inline-block;
    word-break: keep-all;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 25px;
    position: relative;
    top: 3px;
  }
  .select-option-text:hover{
    color: red;
    /*width: 300px !important;*/
    overflow: visible;
    position: relative;
    top: 0px;
  }

  .custom-el-option {
    border-bottom: 1px #bbbbbb dashed;
  }

  /* 自定义 el-input-number */
  .el-input-number {
    width: 100%;
  }

  /* 自定义 el-dialog 标题栏样式*/
  .el-dialog__header {
    background: linear-gradient(to left, #3BB878 , white);
    padding: 9px;
  }
  .el-dialog.is-fullscreen {
    background-color: rgba(245, 249, 249, 1);
  }

  /* 全屏 dialog 样式 */
  .fullscreen-dialog .el-dialog__body{
    padding: 0;
    /* background-color: white; */
  }

  /* 自定义确认提示框标题栏样式*/
  .el-message-box__header {
    background: linear-gradient(to left, #3BB878 , white);
    padding: 9px;
  }

  /* 自定义 tooltip 样式 */
  .el-tooltip__popper.is-dark {
    background: #3BB878;
    color: #FFF;
  }

  /* 自定义 el-card */
  .el-card-menus {
    height: 40px;
    text-align: right;
    /*background: linear-gradient(to bottom, rgba(245, 245, 245, 1), white, rgba(245, 245, 245, 1));*/
    background: linear-gradient(to right, white, rgba(238, 238, 238, 1));
    /*background-color: rgba(248, 248, 248, 1);*/
  }

</style>
