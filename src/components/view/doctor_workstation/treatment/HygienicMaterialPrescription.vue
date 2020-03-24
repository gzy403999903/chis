<template>
  <div>
    <el-row class="inquiry-top">
      <el-col :span="24" align="right">
        <el-button size="small" @click="insertRow">插入一行</el-button>
        <el-button size="small" @click="deleteAllRow">清 空</el-button>
        <el-button size="small" @click="preloadDialogOpen">更正处方</el-button>
        <el-button size="small" type="primary" @click="submitData">提交处方</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <div style="padding: 2px; border: #3BB878 2px solid; height: 550px; background: white;">
      <el-table
        height="500px"
        :data="dataGrid.data"
        :row-class-name="dataGridRowClassName"
        @row-dblclick="dataGridEditRow"
        size="mini">
        <el-table-column fixed="left" label="操作" align="center" width="60">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="oid" label="药品编码" width="130" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="name" label="药品名称" width="230" show-overflow-tooltip>
          <template slot-scope="props">
            <el-select
              v-show="props.row.editable"
              :ref="'uuid' + props.$index"
              @keyup.enter.native="validateFieldToNextFocus('oid','quantity' + props.$index)"
              @focus="promptMsg='注意区分同一商品整装与拆零销售单位. 黄色行代表库存不足, 红色行代表商品重复录入'"
              v-model.trim="props.row.uuid"
              placeholder="输入 商品名称 / 助记码"
              :remote-method="queryGoods"
              :loading="selectData.loading"
              remote
              filterable
              default-first-option
              size="small"
              @change="goodsSelected">
              <el-option class="custom-el-option" :value="null" v-if="selectData.goodsList.length > 0" disabled>
                <span class="select-option-top" style="width: 120px;">商品编码</span>
                <span class="select-option-top" style="width: 200px;">商品名称</span>
                <span class="select-option-top" style="width: 150px;">规格</span>
                <span class="select-option-top" style="width: 100px;">零售单价</span>
                <span class="select-option-top" style="width: 100px;">库存数量</span>
                <span class="select-option-top" style="width: 100px;">产地</span>
                <span class="select-option-top">生产厂家</span>
              </el-option>
              <el-option class="custom-el-option" v-for="item in selectData.goodsList" :key="item.uuid" :value="item.uuid" :label="item.name">
                <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                <span class="select-option-text" style="width: 200px;">{{item.name}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.specs}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.retailPrice}}元</span>
                <span class="select-option-text" style="width: 100px;">{{item.quantity + item.goodsUnitsName}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
                <span class="select-option-text">{{item.manufacturerName}}</span>
              </el-option>
            </el-select>
            <span v-show="!props.row.editable">{{props.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="quantity" label="数量" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number size="small" v-model="props.row.quantity" :controls="false" :max="30000" :min="1" :precision="0"
                             v-show="props.row.editable"
                             :ref="'quantity' + props.$index"
                             @keyup.enter.native="insertRow"
                             @change="sumRetailPrice"
                             @focus="promptMsg=(props.row.id ? ('当前库存数量为: ' + props.row.inventoryQuantity + props.row.goodsUnitsName) : '销售数量')"/>
            <span v-show="!props.row.editable">{{props.row.quantity}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="goodsUnitsName" label="单位" width="70" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="manufacturerName" label="生产厂家" min-width="200" show-overflow-tooltip/>
      </el-table>
      <div style="height: 50px; line-height: 50px; text-align: right; font-weight: 600; color: #3BB878;">
        <span style="padding-right: 20px;">
          医生 : {{payload.userName}}
        </span>
        <span style="padding-right: 20px;">
          处方日期: {{new Date().toLocaleDateString().replace(/(\/)/g, '-')}}
        </span>
        <span style="padding-right: 20px; color: red;">
           处方总价: {{totalRetailPrice}}&nbsp;元
        </span>
      </div>
    </div>
    <div style="padding: 10px; font-weight: 600; color: #3BB878;">{{promptMsg}}</div>

    <!-- 处方更正 -->
    <PrescriptionCachePreload :visible="dialog.visible" :mrmMemberId="mrmMemberId" :sysSellTypeId="sellType.GOODS" :entityTypeId="goodsType.HYGIENIC_MATERIAL"
                         :dialog-close="preloadDialogClose" :loadFromCache="loadFromCache"/>
  </div>
</template>

<script>
import PubSub from 'pubsub-js'
import jwtDecode from 'jwt-decode'
import PrescriptionCachePreload from './PrescriptionCachePreload'

export default {
  props: {
    mrmMemberId: {
      type: Number,
      required: true
    },
    dwtClinicalHistoryId: {
      type: Number,
      required: true
    }
  },

  components: {
    PrescriptionCachePreload
  },

  data () {
    return {
      sellType: this.$store.getters.sellType,
      goodsType: this.$store.getters.goodsType,
      payload: jwtDecode(this.$store.getters.token),
      totalRetailPrice: 0, // 处方总金额
      promptMsg: '', // 提示消息
      dataGrid: {
        data: [],
        currentRow: {},
        index: 0
      },
      selectData: {
        loading: false,
        goodsList: []
      },
      dialog: {
        visible: false
      }
    }
  }, // end data

  mounted () {
    // 接收订阅初始化页面
    PubSub.subscribe('receptionTabsPageReset', (msg) => {
      this.pageReset()
    })
  }, // end mounted

  destroyed () {
    PubSub.unsubscribe('receptionTabsPageReset')
  }, // end destroyed

  methods: {
    /**
     * 页面重置
     */
    pageReset () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.index = 0
      this.totalRetailPrice = 0
      this.promptMsg = ''
    },

    /**
     * 根据传入的 selectList 和 id 返回该 id 对应的 name
     * @param selectList
     * @param id
     */
    getNameById (selectList, id) {
      if (!Array.isArray(selectList) || selectList.length === 0) {
        return
      }

      let data = selectList.find(item => {
        return item.id === id
      })

      return (data ? data.name : '')
    },

    /**
     * 验证当前字段有效则获取下一个焦点
     */
    validateFieldToNextFocus (currentField, nextRef) {
      if (this.dataGrid.currentRow[currentField]) {
        this.$refs[nextRef].focus()
      }
    },

    /**
     * 为数据表行添加对应样式
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (this.hasRepeatRow(row)) {
        return 'danger-row'
      }
      if (row.id && (row.quantity > row.inventoryQuantity)) {
        return 'warning-row'
      }
      if (row.editable) {
        return 'info-row'
      }
      return ''
    },

    /**
     * 验证一行是否有效
     * @row 要进行验证的 row
     * @showMsg 是否显示错误消息, 不传参数显示，传任何参数则不显示
     */
    validateRow (row, showMsg) {
      if (!row.sysSellTypeId ||
          !row.id ||
          !row.quantity ||
          !row.splitQuantity) {
        if (showMsg === undefined) {
          this.$message.error('请完成当前行编辑 或 将其删除, 方可进行该操作')
        }
        return false
      }
      return true
    },

    /**
     * 验证是否重复录入
     */
    hasRepeatRow (row) {
      let repeatList = this.dataGrid.data.filter(item => {
        return item.uuid === row.uuid
      })
      return repeatList.length > 1
    },

    /**
     * 计算处方总价
     */
    sumRetailPrice () {
      this.totalRetailPrice = 0
      this.dataGrid.data.forEach(item => {
        if (item.quantity && item.retailPrice) {
          this.totalRetailPrice += item.quantity * item.retailPrice
        }
      })
      this.totalRetailPrice = this.totalRetailPrice.toFixed(4)
    },

    /**
     * 向 dataGrid 插入一行
     */
    insertRow () {
      // 如果当前行无效则不继续执行
      if (this.dataGrid.data.length > 0 && !this.validateRow(this.dataGrid.currentRow)) {
        return
      }
      // 判断是否已经录入
      if (this.hasRepeatRow(this.dataGrid.currentRow)) {
        this.$message.error('当前记录已存在, 不能重复录入')
        return
      }
      // 停止编辑当前行
      if (this.dataGrid.data.length > 0) {
        this.dataGrid.currentRow.editable = false
      }
      // 初始化一行数据
      let row = {}
      row.index = ++this.dataGrid.index // 行ID 仅作为有重复商品时 删除其中一个的唯一标识
      row.editable = true // 该行是否可编辑
      row.uuid = '' // 后台拼接成的字段, 主要用于可拆分的商品产生多条记录时, 对每个记录的唯一标识
      row.lsh = null // 流水号, 用于区分是否为是已经存在的处方
      row.sysSellTypeId = '' // 销售类型ID
      row.gsmGoodsTypeId = '' // 商品类型ID
      row.id = '' // 商品ID
      row.oid = '' // 商品OID
      row.name = '' // 商品名称
      row.specs = '' // 商品规格
      row.manufacturerName = '' // 生产厂家
      row.retailPrice = '' // 零售价
      row.discountable = '' // 是否可打折
      row.splitQuantity = '' // 拆分数量(指的是库存记录的拆分数量)
      row.goodsUnitsName = '' // 销售单位
      row.quantity = '' // 销售数量
      row.inventoryQuantity = '' // 库存数量
      // 将新建行指向当前行
      this.dataGrid.currentRow = row
      // 插入数据
      this.dataGrid.data.push(this.dataGrid.currentRow)
      // 延迟处理
      setTimeout(() => {
        // 清空已经查询的数据
        this.selectData.goodsList = []
        // 下一行获取焦点
        this.$refs['uuid' + (this.dataGrid.data.length - 1)].focus()
      }, 100)
    },

    /**
     * 对商品进行检索查询
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     * @param name
     */
    queryGoods (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/hygienicMaterial/getEnabledLikeByNameForPrescription`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.goodsList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.goodsList ? 0 : 500))
      }
    },

    /**
     * 当选中一个商品后执行的操作
     * @param uuid
     */
    goodsSelected (uuid) {
      // 获取选中的商品
      let goods = this.selectData.goodsList.find(item => {
        return item.uuid === uuid
      })

      // 赋值其他属性的默认值
      this.dataGrid.currentRow.sysSellTypeId = this.sellType.GOODS // 销售类型ID
      this.dataGrid.currentRow.gsmGoodsTypeId = goods.gsmGoodsTypeId // 商品类型ID
      this.dataGrid.currentRow.id = goods.id // 商品ID
      this.dataGrid.currentRow.oid = goods.oid // 商品OID
      this.dataGrid.currentRow.name = goods.name // 商品名称
      this.dataGrid.currentRow.specs = goods.specs // 商品规格
      this.dataGrid.currentRow.manufacturerName = goods.manufacturerName // 生产厂家
      this.dataGrid.currentRow.retailPrice = goods.retailPrice // 零售价
      this.dataGrid.currentRow.discountable = goods.discountable // 是否可打折
      this.dataGrid.currentRow.splitQuantity = goods.splitQuantity // 拆分数量
      this.dataGrid.currentRow.goodsUnitsName = goods.goodsUnitsName // 销售单位
      this.dataGrid.currentRow.inventoryQuantity = goods.quantity // 库存数量

      // 计算处方总价
      this.sumRetailPrice()
    },

    /**
     * 编辑一行
     */
    dataGridEditRow (row, column, event) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }
      // 如果目标行无未完成编辑则询问是否放弃该行
      if (!this.validateRow(this.dataGrid.currentRow, false)) {
        this.$confirm('当前行尚未完成编辑, 确认要放弃编辑吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.deleteRow(this.dataGrid.currentRow) // 删除当前行
          this.dataGrid.currentRow = row // 设置目标为当前行
          this.dataGrid.currentRow.editable = true // 开启编辑
        }).catch(() => {})
      } else {
        this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
        this.dataGrid.currentRow = row // 设置目标行为当前行
        this.dataGrid.currentRow.editable = true // 开启编辑
      }
    },

    /**
     * 删除一行
     */
    deleteRow (row) {
      this.dataGrid.data = this.dataGrid.data.filter(item => {
        return item.index !== row.index
      })
      // 计算处方总价
      this.sumRetailPrice()
      // 设置当前行
      this.dataGrid.currentRow = this.dataGrid.data[this.dataGrid.data.length - 1]
    },

    /**
     * 删除所有行
     */
    deleteAllRow () {
      if (this.dataGrid.data.length === 0) {
        return
      }
      this.$confirm('确认要删除所有行吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.pageReset()
      }).catch(() => {})
    },

    /**
     * 验证提交数据
     */
    validateSubmitData () {
      // 删除空行 并验证所有行是否有效
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let row = this.dataGrid.data[i]
        // 如果 id 为空则删除该行
        if (!row.id) {
          this.deleteRow(row)
          continue
        }
        // 如果该行无效则终止执行
        if (!this.validateRow(row)) {
          return false
        }
        // 如果该行验证通过则停止编辑状态
        row.editable = false
      }

      // 验证是否有提交数据
      if (this.dataGrid.data.length === 0) {
        return false
      }

      // 验证会员
      if (!Number(this.mrmMemberId)) {
        this.$message.error('未能获取会员信息')
        return false
      }

      // 检查病例 ID
      if (!Number(this.dwtClinicalHistoryId)) {
        this.$message.error('请填写并提交病例后再开具处方')
        return false
      }

      return true
    },

    /**
     * 获取处方的 JSON 数据
     */
    getSubmitDataJson () {
      let prescriptionArray = []
      this.dataGrid.data.forEach(item => {
        // 处方内容:
        let prescription = {}
        prescription.lsh = item.lsh // 如果流水号全部为null, 则后台自动创建, 如果其中一条包含水流号, 则全部使用该流水号
        prescription.dwtClinicalHistoryId = this.dwtClinicalHistoryId // 病例ID
        prescription.mrmMemberId = this.mrmMemberId // 会员ID
        prescription.sysDoctorName = this.payload.userName // 医生名字 *

        prescription.sysSellTypeId = item.sysSellTypeId // 销售类型ID
        prescription.entityTypeId = item.gsmGoodsTypeId // 药品类型
        prescription.entityId = item.id // 药品ID
        prescription.oid = item.oid // 药品编码 *
        prescription.name = item.name // 药品名称
        prescription.specs = item.specs // 药品规格
        prescription.quantity = item.quantity // 销售数量
        prescription.unitsName = item.goodsUnitsName // 销售单位
        prescription.splitQuantity = item.splitQuantity // 拆分数量
        prescription.retailPrice = item.retailPrice // 零售单价 *
        prescription.discountable = item.discountable // 是否可打折 *
        prescription.inventoryQuantity = item.inventoryQuantity // 库存数量 *

        let sig = {}
        sig.manufacturerName = item.manufacturerName // 生产厂家
        prescription.sigJson = JSON.stringify(sig)

        prescriptionArray.push(prescription)
      })

      return JSON.stringify(prescriptionArray)
    },

    /**
     * 提交数据
     */
    submitData () {
      if (!this.validateSubmitData()) {
        return false
      }

      // 提交数据
      this.$loading()
      const url = '/chisAPI/sellPrescription/saveOrUpdateToCacheForHygienicMaterial'
      const method = 'POST'
      let data = {
        prescriptionJson: this.getSubmitDataJson()
      }
      this.$http({method, url, data}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.pageReset()
        }
        this.$loading().close()
      })
    },
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开更正处方界面
     */
    preloadDialogOpen () {
      this.dialog.visible = true
    },

    /**
     * 关闭更正处方界面
     */
    preloadDialogClose () {
      this.dialog.visible = false
    },

    /**
     * 载入选中的处方
     */
    loadFromCache (prescriptionData) {
      // 初始化页面
      this.pageReset()

      // 载入处方
      prescriptionData.forEach((item, index) => {
        this.insertRow()
        this.dataGrid.currentRow.editable = false // 停止该行编辑
        this.dataGrid.currentRow.uuid = index
        this.dataGrid.currentRow.lsh = item.lsh // 流水号
        this.dataGrid.currentRow.sysSellTypeId = item.sysSellTypeId // 销售类型ID
        this.dataGrid.currentRow.gsmGoodsTypeId = item.entityTypeId // 药品类型ID
        this.dataGrid.currentRow.id = item.entityId // 药品ID
        this.dataGrid.currentRow.oid = item.oid // 药品编码 *
        this.dataGrid.currentRow.name = item.name // 药品名称
        this.dataGrid.currentRow.specs = item.specs // 药品规格
        this.selectData.goodsList.push(this.dataGrid.currentRow) // 插入部分商品信息 使其编辑时搜索框可显示商品名称 ~~~
        this.dataGrid.currentRow.quantity = item.quantity // 销售数量
        this.dataGrid.currentRow.goodsUnitsName = item.unitsName // 销售单位
        this.dataGrid.currentRow.splitQuantity = item.splitQuantity // 拆分数量
        this.dataGrid.currentRow.retailPrice = item.retailPrice // 零售单价 *
        this.dataGrid.currentRow.discountable = item.discountable // 是否可打折 *
        this.dataGrid.currentRow.inventoryQuantity = item.inventoryQuantity // 库存数量 *

        let sig = JSON.parse(item.sigJson)
        this.dataGrid.currentRow.manufacturerName = sig.manufacturerName // 生产厂家
      })

      // 计算处方总价
      this.sumRetailPrice()
    }

  } // end methods
}
</script>

<style scoped>
</style>
