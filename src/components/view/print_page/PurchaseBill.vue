<template>
  <div id="printContent" style="display: none;">
    <div style="width: 287mm;">
      <div style="text-align: center; font-size: 18px; font-weight: 600;">
        <div>{{data.length > 0 ? data[0].sysClinicName : ''}}</div>
        <div>采购{{title ? title : ''}}单</div>
      </div>

      <div style="margin-top: 10px; display: flex;">
        <div style="width: 60mm;">入库日期: {{data.length > 0 ? data[0].creationDate : ''}}</div>
        <div style="width: 75mm;">流水号: {{data.length > 0 ? data[0].lsh : ''}}</div>
        <div style="width: 40mm;">操作人: {{data.length > 0 ?  ('[' + data[0].creatorId + ']' + data[0].creatorName) : ''}}</div>
        <div style="width: 40mm;">审核人: {{data.length > 0 ?  ('[' + data[0].approverId + ']' + data[0].approverName) : ''}}</div>
        <div>随货同行: {{data.length > 0 ? data[0].billNo : ''}}</div>
      </div>

      <div style="margin-top: 5px; display: flex;">
        <div style="width: 60mm;">供应商编码: {{data.length > 0 ? data[0].pemSupplierOid : ''}}</div>
        <div style="width: 115mm;">供应商名称: {{data.length > 0 ? data[0].pemSupplierName : ''}}</div>
        <div style="width: 40mm;">联系人: {{data.length > 0 ? data[0].contacter : ''}}</div>
        <div>联系人电话: {{data.length > 0 ? data[0].contacterPhone : ''}}</div>
      </div>

      <table style="width: 287mm; margin-top: 10px;">
        <tr>
          <th>编码</th>
          <th>名称</th>
          <th>单位</th>
          <th>规格</th>
          <th>数量</th>
          <th>单价(含税)</th>
          <th>小计/元</th>
          <th>批号</th>
          <th>生产日期</th>
          <th>有效期至</th>
          <th>产地</th>
          <th>生产厂家</th>
        </tr>
        <tr v-for="(item, index) in data" :key="index" :value="item">
          <td>{{item.gsmGoodsOid}}</td>
          <td>{{item.gsmGoodsName}}</td>
          <td>{{item.goodsUnitsName}}</td>
          <td>{{item.gsmGoodsSpecs}}</td>
          <td>{{item.quantity}}</td>
          <td>{{item.costPrice}}</td>
          <td>{{(item.quantity * item.costPrice).toFixed(2)}}</td>
          <td>{{item.ph}}</td>
          <td>{{item.producedDate}}</td>
          <td>{{item.expiryDate}}</td>
          <td>{{item.originName}}</td>
          <td>{{item.manufacturerName}}</td>
        </tr>
        <tr>
          <td>合计</td>
          <td colspan="2">{{totalAmount()}}&nbsp;元</td>
          <td>合计大写</td>
          <td colspan="8">{{formatTotalAmount()}}</td>
        </tr>
      </table>

    </div>
  </div> <!-- end printContent -->
</template>

<script>
import {getLodop} from '../../../common/LodopFuncs'
import {getChineseNumUpperCase} from '../../../common/chineseNumUtils'
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },

  methods: {
    /**
     * 打印页面
     */
    printPage () {
      let LODOP = getLodop()
      LODOP.PRINT_INIT('采购入库单')
      let printStyle = '<style> table, th, td { border: 1px solid black; border-collapse: collapse; font-size: 14px;} </style>'
      let printHtml = printStyle + '<body>' + document.getElementById('printContent').innerHTML + '</body>'
      LODOP.SET_PRINT_PAGESIZE(2, '210mm', '297mm') // 打印方向 [1 纵向 2 横向 3纵向,宽度固定 0 方向不定], 宽度, 高度, 纸张类型名
      LODOP.ADD_PRINT_HTM(0, 0, '210mm', '297mm', printHtml) // ADD_PRINT_HTM(上边距(不写单位默认为px) 左边距 打印区域宽度 打印区域高度 打印内容)
      // LODOP.PRINT()
      // LODOP.PRINTA()
      LODOP.PREVIEW()
    },

    /**
     * 获取合计金额
     * @returns {string}
     */
    totalAmount () {
      let totalArray = this.data.map(item => item.quantity * item.costPrice)
      return totalArray.reduce((prev, curr) => {
        return prev + curr
      }, 0).toFixed(2)
    },

    /**
     * 格式化合计金额成中文大写
     */
    formatTotalAmount () {
      return getChineseNumUpperCase(this.totalAmount())
    }

  } // end methods
}
</script>

<style scoped>
</style>
