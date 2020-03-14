<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-row>
        <el-col :span="6" align="left">&nbsp;
          <span style="font-size: 16px; font-weight: 600; color: #3BB878;" v-show="interval.enabled">
            数据将在 {{interval.time}} 秒后刷新
          </span>
        </el-col>
        <el-col :span="18">
          <el-input v-model="searchWord" size="mini" placeholder="会员编码 / 会员手机 查找" clearable
                    @change="searchWordChange" style="width: 280px; padding-right: 10px;">
            <template slot="prepend"><i class="el-icon-search"></i></template>
          </el-input>
          <el-button type="default" size="mini" round icon="el-icon-user" @click="dialogOpen">门诊挂号</el-button>
          <el-button type="default" size="mini" round icon="el-icon-refresh" @click="dataGridLoadData">查 询</el-button>
          <el-button type="default" size="mini" round icon="el-icon-time" @click="autoRefresh" :disabled="false">
            {{interval.enabled ? '结束' : '开启'}}自动刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0 0 30px 0;">
      <el-table
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" plain @click="dataGridDelete(scope.row)" v-if="!scope.row.receptionState">退</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="creationDate" label="挂号时间" width="170" show-overflow-tooltip/>
        <el-table-column prop="sysDoctorName" label="医生姓名" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="genderName" label="性别" width="100" show-overflow-tooltip/>
        <el-table-column prop="age" label="年龄" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="电话" width="150" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="操作人" width="100" show-overflow-tooltip/>
        <el-table-column prop="receptionState" label="就诊状态" min-width="100" :formatter="dataGridFormatterState" show-overflow-tooltip/>
      </el-table>
    </el-card>

    <!-- 挂号界面 -->
    <RegistrationEdit :visible="dialog.visible"
                      :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>
  </div>
</template>

<script>
import RegistrationEdit from './RegistrationEdit'
export default {
  components: {
    RegistrationEdit
  },

  data () {
    return {
      searchWord: '',
      dataGrid: {
        data: []
      },
      dialog: {
        visible: false
      },
      interval: {
        id: '', // 调度器ID
        enabled: false, // 启动状态
        defaultTime: this.$store.getters.autoRefreshTime, // 默认倒计时时间
        time: this.$store.getters.autoRefreshTime // 倒计时时间
      }
    }
  }, // end data

  mounted () {
    // 加载页面载入数据
    this.dataGridLoadData()
  },

  destroyed () {
    // 结束自动自动刷新调度器的 ID
    clearInterval(this.interval.id)
  }, // end destroyed

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '就诊中' : '待诊'
    },

    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/registrationRecord/getClinicListFromCache`
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 取消挂号
     */
    dataGridDelete (row) {
      this.$confirm('确认退号吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/registrationRecord/deleteByLshFromCache`
        let method = 'DELETE'
        let params = {
          lsh: row.lsh
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$message.error(res.data.msg)
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },

    /**
     * 过滤查找
     */
    searchWordChange (searchWord) {
      if (!searchWord.trim()) {
        this.dataGridLoadData()
      }
      this.dataGrid.data = this.dataGrid.data.filter(item => {
        return (item.mrmMemberOid.indexOf(searchWord) !== -1) || (item.phone.indexOf(searchWord) !== -1)
      })
    },

    /**
     * 自动刷新
     */
    autoRefresh () {
      this.interval.enabled = !this.interval.enabled
      clearInterval(this.interval.id)
      this.interval.time = this.interval.defaultTime

      if (this.interval.enabled) {
        this.interval.id = setInterval(() => {
          this.interval.time--
          if (this.interval.time < 1) {
            this.interval.time = this.interval.defaultTime
            this.dataGridLoadData()
          }
        }, 1000)
      }
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开界面
     */
    dialogOpen () {
      this.dialog.visible = true
    },

    /**
     * 关闭界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
