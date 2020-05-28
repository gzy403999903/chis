<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="销售日期" prop="creationDate">
          <el-date-picker
            style="width: 280px;"
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            :clearable="false"
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
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
        :height="$store.getters.dataGridHeight + 30"
        :data="dataGrid.data"
        highlight-current-row
        show-summary
        stripe
        border
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="sysClinicName" label="机构名称" width="400" show-overflow-tooltip/>
        <el-table-column label="销售金额 / 元" align="center">
          <el-table-column label="西药 / 中成药(开票)" align="center">
            <el-table-column prop="xyKpHsxs" label="含税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="xyKpWsxs" label="无税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="xyKpXxs" label="销售税额" align="center" width="120" show-overflow-tooltip/>
          </el-table-column>
          <el-table-column label="中药(开票)" align="center">
            <el-table-column prop="zyKpHsxs" label="含税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="zyKpWsxs" label="无税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="zyKpXxs" label="销售税额" align="center" width="120" show-overflow-tooltip/>
          </el-table-column>
          <el-table-column label="卫材(开票)" align="center">
            <el-table-column prop="wcKpHsxs" label="含税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="wcKpWsxs" label="无税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="wcKpXxs" label="销售税额" align="center" width="120" show-overflow-tooltip/>
          </el-table-column>
          <el-table-column label="商品(未开票) + 医疗服务" align="center">
            <el-table-column prop="goodsWkpHsxs" label="商品含税销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="itemXs" label="医疗服务销售额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="goodsItemXs" label="小计" align="center" width="120" show-overflow-tooltip/>
          </el-table-column>
          <el-table-column prop="hsxsHj" label="含税销售合计" align="center" width="120" show-overflow-tooltip/>
          <el-table-column prop="wsxsHj" label="无税销售合计" align="center" width="120" show-overflow-tooltip/>
          <el-table-column prop="xxsHj" label="销售税额合计" align="center" width="120" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="销售成本 / 元" align="center">
          <el-table-column label="商品(开票)" align="center">
            <el-table-column prop="goodsKpWscb" label="无税成本额" align="center" width="120" show-overflow-tooltip/>
          </el-table-column>
          <el-table-column label="商品(未开票)" align="center">
            <el-table-column prop="goodsWkpHscb" label="含税成本额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="goodsWkpWscb" label="无税成本额" align="center" width="120" show-overflow-tooltip/>
            <el-table-column prop="goodsWkpJxs" label="采购税额" align="center" width="120" show-overflow-tooltip/>
          </el-table-column>
          <el-table-column prop="goodsCbHj" label="成本合计" align="center" width="120" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="商品出库合计" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.goodsKpWscb + props.row.goodsWkpWscb).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column label="毛利额" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.wsxsHj - props.row.goodsCbHj).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column label="毛利率" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{((props.row.wsxsHj - props.row.goodsCbHj) / props.row.wsxsHj * 100).toFixed(2) + '%'}}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>
</template>

<script>
export default {
  props: {
    action: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        creationDate: this.$store.getters.queryDate
      },
      dataGrid: {
        data: []
      }
    }
  }, // end data

  methods: {
    /**
     * 调整表格高度
     * 此方法主要解决 el-table 合计行会出现错位的情况
     * 必须在数据加载完毕后调用
     */
    adjustTableHeight () {
      // 表单总高度
      let tableHeight = document.getElementsByClassName('el-table')[0].offsetHeight
      // 表头高度
      let headerHeight = document.getElementsByClassName('el-table__header-wrapper')[0].offsetHeight
      // 要等表单渲染完成后才能拿到合计行的高度
      this.$nextTick(() => {
        // 合计行高度
        let footerHeight = document.getElementsByClassName('el-table__footer-wrapper')[0].offsetHeight
        // 设置表单正文高度
        document.getElementsByClassName('el-table__body-wrapper')[0].style.height = tableHeight - headerHeight - footerHeight + 'px'
      })
    },

    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      let url = (
        this.action === 'all'
          ? '/chisAPI/sellRecordReport/getSellRecordStatisticsByCriteria'
          : '/chisAPI/sellRecordReport/getClinicSellRecordStatisticsByCriteria'
      )
      let params = this.queryForm
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
          this.adjustTableHeight()
        }
        this.$loading().close()
      })
    }
  } // end methods
}
</script>

<style scoped>
  .info-col {
    background: rgb(217, 237, 247);
  }
</style>
