<template>
  <el-header class="top-bar" height="45px">
    <div class="top-bar-row">
      <div class="top-bar-radio">
        <el-radio-group v-model="activeModuleName" size="small" fill="#3BB878" @change="showLeftBarMenu">
          <el-radio-button label="doctorWorkstation"><i class="el-icon-qn-int">医生工作站</i></el-radio-button>
          <el-radio-button label="nurseWorkstation"><i class="el-icon-qn-like_fill">护士工作站</i></el-radio-button>
          <el-radio-button label="memberManagement"><i class="el-icon-qn-group_fill">会员管理</i></el-radio-button>
          <el-radio-button label="goodsManagement"><i class="el-icon-qn-label_fill">商品管理</i></el-radio-button>
          <el-radio-button label="purchaseManagement"><i class="el-icon-qn-publishgoods_fill">采购管理</i></el-radio-button>
          <el-radio-button label="inventoryManagement"><i class="el-icon-qn-workbench_fill">库存管理</i></el-radio-button>
          <el-radio-button label="itemsManagement"><i class="el-icon-qn-transaction_fill">医疗服务项目</i></el-radio-button>
          <el-radio-button label="financialManagement"><i class="el-icon-qn-coupons_fill">财务管理</i></el-radio-button>
          <!--<el-radio-button label="marketingManagement"><i class="el-icon-qn-integral_fill">营销管理</i></el-radio-button>-->
          <el-radio-button label="dataReport"><i class="el-icon-s-data">数据报表</i></el-radio-button>
          <el-radio-button label="systemManagement"><i class="el-icon-qn-setup_fill">系统管理</i></el-radio-button>
        </el-radio-group>
      </div> <!-- end top-bar-radio -->

      <div class="top-bar-menu">
        <el-dropdown>
          <span>
            <i class="el-icon-qn-mine_fill"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <UserInfo/>
          </el-dropdown-menu>
        </el-dropdown>
        <span>
          <i class="el-icon-qn-remind_fill" @click="showMessage"></i>
        </span>
        <span>
           <i class="el-icon-qn-homepage_fill" @click="showHomePage"></i>
        </span>
        <span class="top-bar-fold-menu">
           <i @click="foldLeftBar(isFold=false)" v-show="isFold" class="el-icon-s-unfold"></i>
           <i @click="foldLeftBar(isFold=true)" v-show="!isFold" class="el-icon-s-fold"></i>
        </span>
      </div> <!-- end top-bar-menu -->
    </div> <!-- end top-bar-row -->

    <!--修改密码组件-->
    <UpdatePassword/>
  </el-header>
</template>

<script>
import PubSub from 'pubsub-js'
import UserInfo from './topBar/UserInfo'
import UpdatePassword from './topBar/UpdatePassword'

export default {
  components: {
    UserInfo,
    UpdatePassword
  },

  data () {
    return {
      isFold: this.$store.getters.isFoldLeftBar,
      activeModuleName: this.$store.getters.leftBarMenuName
    }
  },

  methods: {
    // 显示/隐藏左侧菜单栏
    foldLeftBar (isFold) {
      this.$store.dispatch('isFoldLeftBar', isFold)
    },

    // 显示激活对应模块的菜单
    showLeftBarMenu (activeModuleName) {
      this.$store.dispatch('leftBarMenuName', activeModuleName)
    },

    // 显示消息
    showMessage () {
      // this.$notify.info({title: '消息推送功能', message: '开发中.......'})
    },

    // 显示主页
    showHomePage () {
      PubSub.publish('renderView', '/main/home')
    }
  }
}
</script>

<style scoped>
  .top-bar {
    /* background-color: rgb(255, 255, 255); */
    /* background: linear-gradient(to right, #3BB878 , rgba(255, 255, 255, 0.15)); */ /* 从左到右渐变 */
    border-bottom: #E0E0E0 1px solid;
    padding: 0;
  }
  .top-bar-row {
    height: 45px;
    display: flex;
    align-items: center;
    position: relative;
  }
  .top-bar-radio {
    padding-left: 10px;
    /*min-width: 1100px;*/
    float: left;
  }
  .top-bar-radio i{
    font-size: 13px;
  }

  .top-bar-menu {
    padding-right: 10px;
    min-width: 160px;
    position: absolute;
    right: 0;
  }
  .top-bar-menu i {
    cursor: pointer; /* 指针样式 */
    color: #606266;
    padding-left: 3px;
  }
  .top-bar-menu .el-icon-qn-mine_fill {
    font-size: 2.2em;
  }
  .top-bar-menu .el-icon-qn-remind_fill, .el-icon-qn-homepage_fill {
    font-size: 2.5em;
  }
  .top-bar-menu label {
    font-size: 14px;
    position: relative;
    bottom: 3px;
  }
  .top-bar-menu .top-bar-fold-menu i {
    font-size: 2.5em;
    position: relative;
    top: 0;
    left: 0;
  }
</style>
