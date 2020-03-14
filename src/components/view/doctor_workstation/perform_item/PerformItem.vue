<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="会员姓名" prop="mrmMemberId">
          <el-select
            v-model.trim="queryForm.mrmMemberId"
            placeholder="输入 姓名 / 助记码 / 手机 搜索"
            :remote-method="queryMember"
            :loading="select.loading"
            remote
            filterable>
            <el-option class="custom-el-option" :value="null" v-if="select.members.length > 0" disabled>
              <span class="select-option-top" style="width: 100px;">姓名</span>
              <span class="select-option-top" style="width: 100px;">性别</span>
              <span class="select-option-top" style="width: 100px;">年龄</span>
              <span class="select-option-top" style="width: 120px;">出生年月</span>
              <span class="select-option-top" style="width: 150px;">联系电话</span>
              <span class="select-option-top">身份证号</span>
            </el-option>
            <el-option class="custom-el-option" v-for="item in select.members" :key="item.id" :value="item.id" :label="item.name" >
              <span class="select-option-text" style="width: 100px;">{{item.name}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.genderName}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.age}}</span>
              <span class="select-option-text" style="width: 120px;">{{item.birth}}</span>
              <span class="select-option-text" style="width: 150px;">{{item.phone}}</span>
              <span class="select-option-text">{{item.idCardNo}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="cimItemName">
          <el-input v-model.trim="queryForm.cimItemName" placeholder="项目名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="显示剩余次数为0" prop="showZero">
          <el-switch v-model="queryForm.showZero" active-color="#13ce66" inactive-color="#ff4949"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button size="mini" @click="updateResidueQuantity(scope.row)" :disabled="scope.row.residueQuantity <= 0">执行</el-button>
            <el-button size="mini" :disabled="true">预约</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="cimItemName" label="项目名称" width="150" show-overflow-tooltip/>
        <el-table-column prop="residueQuantity" label="剩余次数" width="100" show-overflow-tooltip/>
        <el-table-column prop="sellerName" label="销售人" width="100" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="销售日期" width="165" show-overflow-tooltip/>
        <el-table-column label="购买说明" min-width="200" show-overflow-tooltip>
          <template slot-scope="props">
            {{"购买" + props.row.quantity + "次, 每次可执行" + props.row.onceContainQuantity + "次, 共计" +
            (props.row.quantity * props.row.onceContainQuantity) + "次"}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :current-page="pagination.currentPage"
        :pager-count="pagination.pagerCount"
        :page-sizes="pagination.pageSizes"
        :layout="pagination.layout"
        @size-change="paginationSizeChange"
        @current-change="paginationCurrentChange">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryForm: {
        mrmMemberId: null,
        cimItemName: null,
        showZero: false
      },
      dataGrid: {
        data: [],
        row: {}
      },
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: this.$store.getters.pagination.pageSize, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      },
      dialog: {
        visible: false
      },
      select: {
        loading: false,
        members: []
      }
    }
  }, // end data

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/performItem/getByCriteria`
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 更新剩余次数
     */
    updateResidueQuantity (row) {
      this.$confirm(`<span>会员姓名:</span><span style="padding-left: 10px">${row.mrmMemberName}</span>` + '<br/>' +
        `<span>手机号码:</span><span style="padding-left: 10px">${row.phone}</span>` + '<br/>' +
        `<span>执行项目:</span><span style="padding-left: 10px">${row.cimItemName}</span>` + '<br/>' +
        `<span>扣减次数:</span><span style="padding-left: 10px; color: red;">1</span>`, '执行确认', {
        dangerouslyUseHTMLString: true, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/performItem/updateResidueQuantityById`
        let method = 'PUT'
        let params = {
          id: row.id,
          performQuantity: 1
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
     * 检索会员
     */
    queryMember (keyword) {
      if (keyword.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          const url = `/chisAPI/member/getEnabledLikeByKeyword`
          let params = {keyword}
          this.$http.get(url, {params}).then((res) => {
            this.select.members = res.data
            this.select.loading = false
          })
        }, (this.select.members ? 0 : 500)) // 当查询结果不为0时, 才会有 0.5 秒的延迟查询
      }
    }
  } // end methods
}
</script>

<style scoped>
</style>
