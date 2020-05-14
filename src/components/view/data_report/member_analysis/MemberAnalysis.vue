<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
      <span class="member-tags">
        <el-tooltip :content="memberTags1" placement="bottom" effect="light">
          <el-tag size="min" effect="dark">高消费会员</el-tag>
        </el-tooltip>
        <el-tooltip :content="memberTags2" placement="bottom" effect="light">
          <el-tag size="min" effect="dark">高单价会员</el-tag>
        </el-tooltip>
        <el-tooltip :content="memberTags3" placement="bottom" effect="light">
          <el-tag type="success" size="min" effect="dark">高忠诚度会员</el-tag>
        </el-tooltip>
        <el-tooltip :content="memberTags4" placement="bottom" effect="light">
          <el-tag type="info" size="min" effect="dark">低价高频次会员</el-tag>
        </el-tooltip>
        <el-tooltip :content="memberTags5" placement="bottom" effect="light">
          <el-tag type="info" size="min" effect="dark">低价低频次会员</el-tag>
        </el-tooltip>
        <el-tooltip :content="memberTags6" placement="bottom" effect="light">
          <el-tag type="warning" size="min" effect="dark">流失会员</el-tag>
        </el-tooltip>
        <el-tooltip :content="memberTags7" placement="bottom" effect="light">
          <el-tag type="danger" size="min" effect="dark">沉睡会员</el-tag>
        </el-tooltip>
      </span>
      <el-button type="default" size="mini" round icon="el-icon-search" @click="dialog.visible = true">条件查询</el-button>
    </el-card>

    <!-- 查询条件界面 -->
    <el-dialog
      top="2.5%"
      width="45%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible">
      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>条件查询</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" size="mini" icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="dialog.visible=false">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="queryForm" ref="queryForm" :inline="false" size="mini" label-width="120px" label-position="left" style="padding: 0 20px;">
        <el-form-item label="分析天数" prop="sellDays">
          <el-input-number v-model="queryForm.sellDays" :controls="false" :min="1"  :max="366" :precision="0"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="会员编码" prop="oid">
          <el-input v-model.trim="queryForm.oid" placeholder="会员编码"/>
        </el-form-item>
        <el-form-item label="会员姓名" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="会员姓名 / 助记码"/>
        </el-form-item>
        <el-form-item label="会员手机" prop="phone">
          <el-input v-model.trim="queryForm.phone" placeholder="会员手机"/>
        </el-form-item>
        <el-form-item label="注册机构" prop="sysClinicName">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="注册机构 / 助记码"/>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-select v-model="queryForm.ageLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('ageLogical', 'age')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.age" :controls="false" :min="0"  :max="100" :precision="0"
                           @change="logicalJoin('ageLogical', 'age')"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="距离生日天数" prop="birthSurplusDays">
          <el-select v-model="queryForm.birthSurplusDaysLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('birthSurplusDaysLogical', 'birthSurplusDays')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.birthSurplusDays" :controls="false" :min="0"  :max="366" :precision="0"
                           @change="logicalJoin('birthSurplusDaysLogical', 'birthSurplusDays')"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="会员卡余额" prop="balance">
          <el-select v-model="queryForm.balanceLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('balanceLogical', 'balance')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.balance" :controls="false" :min="0"  :max="9999999" :precision="0"
                           @change="logicalJoin('balanceLogical', 'balance')"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="储值频次" prop="czpc">
          <el-select v-model="queryForm.czpcLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('czpcLogical', 'czpc')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.czpc" :controls="false" :min="0"  :max="999999" :precision="0"
                           @change="logicalJoin('czpcLogical', 'czpc')"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="储值合计" prop="czhj">
          <el-select v-model="queryForm.czhjLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('czhjLogical', 'czhj')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.czhj" :controls="false" :min="0"  :max="9999999" :precision="0"
                           @change="logicalJoin('czhjLogical', 'czhj')"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="消费频次" prop="xfpc">
          <el-select v-model="queryForm.xfpcLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('xfpcLogical', 'xfpc')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.xfpc" :controls="false" :min="0"  :max="999999" :precision="0"
                           @change="logicalJoin('xfpcLogical', 'xfpc')"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="消费合计" prop="xfhj">
          <el-select v-model="queryForm.xfhjLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('xfhjLogical', 'xfhj')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.xfhj" :controls="false" :min="0"  :max="9999999" :precision="0"
                           @change="logicalJoin('xfhjLogical', 'xfhj')"
                           style="width: 100px;"/>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        highlight-current-row
        stripe
        border
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="oid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="name" label="姓名" width="120" show-overflow-tooltip/>
        <el-table-column prop="genderName" label="性别" width="80" show-overflow-tooltip/>
        <el-table-column prop="age" label="年龄" width="80" show-overflow-tooltip/>
        <el-table-column prop="phone" label="手机" width="120" show-overflow-tooltip/>
        <el-table-column prop="birth" label="生日" width="120" show-overflow-tooltip/>
        <el-table-column prop="birthSurplusDays" label="距离生日天数" width="120" show-overflow-tooltip/>
        <el-table-column prop="balance" label="会员卡余额" width="120" show-overflow-tooltip/>
        <el-table-column prop="czpc" :label="queryForm.sellDays + '天内储值频次'" width="130" show-overflow-tooltip/>
        <el-table-column prop="czhj" label="储值合计" width="120" show-overflow-tooltip/>
        <el-table-column prop="maxCz" label="最大一次储值" width="120" show-overflow-tooltip/>
        <el-table-column prop="minCz" label="最小一次储值" width="120" show-overflow-tooltip/>
        <el-table-column prop="czLastDate" label="最后储值日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="xfpc" :label="queryForm.sellDays + '天内消费频次'" width="130" show-overflow-tooltip/>
        <el-table-column prop="xfhj" label="消费合计" width="120" show-overflow-tooltip/>
        <el-table-column prop="maxXfje" label="最大一次消费" width="120" show-overflow-tooltip/>
        <el-table-column prop="minXfje" label="最小一次消费" width="120" show-overflow-tooltip/>
        <el-table-column prop="xfLastDate" label="最后消费日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="注册日期" width="120" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="注册机构名称" min-width="400" show-overflow-tooltip/>
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
      memberTags1: '年消费额贡献了前 15% 的会员, 此类会员为最优质的会员, 尽可能实现 "一对一" 的针对性服务营销, 比如在会员生日前邮寄专属礼物，会员日中享受最高福利等',
      memberTags2: '单次到店消费金额大大高于人均客单价的会员, 此类会员属于高端用户, 对价格较为不敏感, 需个性化服务和特殊优待, 满足其心理需求来进行维护, 不建议对其做活动优惠',
      memberTags3: '年销售额贡献前 50%, 并且两次到店时间间隔不超过30天的会员, 此类主流客户, 也是老顾客，消费频率高且又有一定的消费能力, 所以要不时推出新出产品来吸引人群, 比如, 通过系统在淡季设定满赠、满减等营销手法',
      memberTags4: '通过促销获取的收益排名前 15% 的会员, 优惠促销产品买的最多的会员, 这类会员单次消费金额较低，但频次较高属于贪小便宜, 但又有一定消费能力的客群, 对他们多做营销活动, 并适时适当提高他们的消费金额, 利用他们推广知名度',
      memberTags5: '通过促销获取的收益排名后 15% 的会员, 优惠力度很大的产品买的最少的会员, 这类会员喜欢占便宜但又没有消费能力, 不建议划入营销目标人群',
      memberTags6: '三个月内消费频率大于累计消费频率的 50%, 这类会员将很快变成沉睡会员, 要时时掌握他们的动态, 定期筛选出明显流失会员进行赠送等营销, 激活他们的消费频率, 让会员感受到我们的关怀',
      memberTags7: '半年内没有消费记录的会员, 针对这类会员, 我们要定期关注客户流动及变化, 通过沟通与交流收集睡眠会员的服务反馈信息, 不断提高完善我们的管理和服务, 再进一步推出唤醒营销活动, 来唤醒睡眠用户, 吸引他们再次进行消费',
      dialog: {
        visible: false
      },
      queryForm: {
        sellDays: 30,
        oid: '',
        name: '',
        phone: '',
        sysClinicName: '',
        age: undefined,
        ageLogical: '=',
        birthSurplusDays: undefined,
        birthSurplusDaysLogical: '=',
        balance: undefined,
        balanceLogical: '=',
        czpc: undefined,
        czpcLogical: '=',
        czhj: undefined,
        czhjLogical: '=',
        xfpc: undefined,
        xfpcLogical: '=',
        xfhj: undefined,
        xfhjLogical: '='

      },
      dataGrid: {
        data: []
      },
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: this.$store.getters.pagination.pageSize, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      }
    }
  }, // end data

  methods: {
    /**
     * 当前页显示行数发生改变时
     * @param value
     */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    /**
     * 当前页码发生改变时
     * @param value
     */
    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    /**
     * 拼接查询逻辑运算符和字段值
     */
    logicalJoin (logical, field) {
      let logicalValue = this.queryForm[logical] ? this.queryForm[logical] : this.$store.getters.numLogicalList[0].value
      let fieldValue = (this.queryForm[field] || this.queryForm[field] === 0) ? this.queryForm[field] : undefined
      if (fieldValue || fieldValue === 0) {
        fieldValue.toString().indexOf(' ') !== -1
          ? this.queryForm[field] = (logicalValue + ' ' + fieldValue.split(' ')[1])
          : this.queryForm[field] = (logicalValue + ' ' + fieldValue)
      }
    },

    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      let url = '/chisAPI/memberReport/getMemberAnalysisByCriteria'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
        }

        this.dialog.visible = false
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
  .member-tags .el-tag {
    margin-right: 8px;
  }
</style>
