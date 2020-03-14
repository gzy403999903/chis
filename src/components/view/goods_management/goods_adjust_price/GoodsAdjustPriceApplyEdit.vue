<template>
  <!-- append-to-body 防止遮罩层在界面上边 -->
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>商品调价单</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" icon="el-icon-remove-outline" @click="deleteAllRow">清 空</el-button>
        <el-button size="mini" icon="el-icon-circle-plus-outline" @click="insertRow">插入一行</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
      </el-col>
    </el-row>

    <!--数据表-->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dialogDataGridHeight"
        :data="dataGrid.data"
        :row-class-name="tableRowClassName"
        @row-dblclick="editRow"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="60">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="gsmGoodsTypeName" label="商品类型" width="100" show-overflow-tooltip/>
        <el-table-column fixed="left" label="商品名称" width="200" show-overflow-tooltip>
          <template slot-scope="props">
            <el-select
              v-show="props.row.editable"
              :ref="'id' + props.$index"
              v-model.trim="props.row.id"
              placeholder="输入 商品名称 / 助记码"
              :remote-method="queryGoods"
              :loading="selectData.loading"
              remote
              @keyup.enter.native="validateToNextFocus('id','newRetailPrice' + props.$index)"
              @change="goodsSelected"
              filterable
              default-first-option
              size="small">
              <el-option class="custom-el-option" :value="null" v-if="selectData.goodsList.length > 0" disabled>
                <span class="select-option-top" style="width: 120px;">商品编码</span>
                <span class="select-option-top" style="width: 200px;">商品名称</span>
                <span class="select-option-top" style="width: 100px;">单位</span>
                <span class="select-option-top" style="width: 150px;">规格</span>
                <span class="select-option-top" style="width: 100px;">零售单价(元)</span>
                <span class="select-option-top" style="width: 100px;">产地</span>
                <span class="select-option-top">生产厂家</span>
              </el-option>
              <el-option class="custom-el-option" v-for="item in selectData.goodsList" :key="item.id" :value="item.id" :label="item.name">
                <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                <span class="select-option-text" style="width: 200px;">{{item.name}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.goodsUnitsName}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.specs}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.retailPrice}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
                <span class="select-option-text">{{item.manufacturerName}}</span>
              </el-option>
            </el-select>
            <span v-show="!props.row.editable">{{props.row.gsmGoodsName}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="originalRetailPrice" label="原零售价" width="80" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="newRetailPrice" label="新零售价" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.newRetailPrice" :controls="false" :max="30000" :min="0" :precision="4"
                             size="small" :ref="'newRetailPrice' + props.$index" v-show="props.row.editable"
                             @keyup.enter.native="props.row.splitable ?
                             validateToNextFocus('newRetailPrice','newSplitPrice' + props.$index) :
                             validateToNextFocus('newRetailPrice','explains' + props.$index)"/>
            <span v-show="!props.row.editable">{{props.row.newRetailPrice}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="originalSplitPrice" label="原拆零价" width="80" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="newSplitPrice" label="新拆零价" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.newSplitPrice" :controls="false" :max="30000" :min="0" :precision="4"
                             size="small" :ref="'newSplitPrice' + props.$index" v-show="props.row.editable && props.row.splitable"
                             @keyup.enter.native="validateToNextFocus('newSplitPrice','explains' + props.$index)"/>
            <span v-show="!props.row.editable">{{props.row.newSplitPrice}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="explains" label="调价说明" width="200" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input v-model="props.row.explains" size="small" v-show="props.row.editable"
                      :ref="'explains' + props.$index" @keyup.enter.native="insertRow"/>
            <span v-show="!props.row.editable">{{props.row.explains}}</span>
          </template>
        </el-table-column>
        <el-table-column label="可拆零" width="80" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.splitable ? '是' : '否'}}
          </template>
        </el-table-column>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="130" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="300" show-overflow-tooltip/>
      </el-table>
    </el-card>

  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    },
    dataGridLoadData: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      dataGrid: {
        data: [],
        currentRow: {},
        index: 0
      },
      selectData: {
        goodsList: [],
        loading: false
      }
    }
  }, // end data

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.index = 0
      this.selectData.goodsList = []
    },

    /**
     * 退出确认
     */
    dialogCloseConfirm () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('确认要丢弃当前编辑的数据吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dialogClose()
        }).catch(() => {})
      } else {
        this.dialogClose()
      }
    },

    /**
     * 验证当前焦点通过后获取下一个焦点
     */
    validateToNextFocus (currentField, nextRef) {
      if (this.dataGrid.currentRow[currentField]) {
        this.$refs[nextRef].focus()
      }
    },

    /**
     * 为数据表行添加对应样式
     */
    tableRowClassName ({row, rowIndex}) {
      if (this.hasRepeatRow(row)) {
        return 'danger-row'
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
      if (!row.id ||
          parseFloat(row.newRetailPrice).toString() === 'NaN' ||
          parseFloat(row.newSplitPrice).toString() === 'NaN') {
        if (showMsg === undefined) {
          this.$message.error('当前行尚未完成编辑, 不能进行其他操作')
        }
        return false
      }
      if (row.originalRetailPrice === row.newRetailPrice) {
        if (showMsg === undefined) {
          this.$message.error('原零售价与新零售价不能一致')
        }
        return false
      }
      if (!row.splitable && row.newSplitPrice) {
        if (showMsg === undefined) {
          this.$message.error('当前商品不支持拆零, 新拆零价请填写 0')
        }
        return false
      }
      if (row.explains.length > 30) {
        if (showMsg === undefined) {
          this.$message.error('调价说明不能超过30个字符')
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
        return item.id === row.id
      })
      return repeatList.length > 1
    },

    /**
     * 插入一行
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
      row.index = ++this.dataGrid.index // 行ID 仅作为唯一标识
      row.editable = true // 该行是否可编辑
      row.gsmGoodsTypeName = '' // 商品类型
      row.gsmGoodsOid = '' // 商品OID
      row.gsmGoodsId = '' // 商品ID
      row.gsmGoodsName = '' // 商品名称
      row.gsmGoodsSpecs = '' // 规格
      row.goodsUnitsName = '' // 单位
      row.splitable = false // 是否可拆零
      row.originalRetailPrice = '' // 原零售价
      row.newRetailPrice = 0 // 新零售价
      row.originalSplitPrice = '' // 原拆零价
      row.newSplitPrice = 0 // 新拆零价
      row.explains = '' // 调价说明
      row.originName = '' // 产地
      row.manufacturerName = '' // 生产厂家

      // 将新建行指向当前行
      this.dataGrid.currentRow = row
      // 插入数据
      this.dataGrid.data.push(this.dataGrid.currentRow)
      // 延迟处理
      setTimeout(() => {
        // 清空已经查询的数据
        this.selectData.goodsList = []
        // 下一行获取焦点
        this.$refs['id' + (this.dataGrid.data.length - 1)].focus()
      }, 100)
    },

    /**
     * 检索库存
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     * @param name
     */
    queryGoods (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/goods/getEnabledLikeByName`
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
     * 选中库存后执行的操作
     */
    goodsSelected (id) {
      const goods = this.selectData.goodsList.find(item => {
        return item.id === id
      })
      this.dataGrid.currentRow.gsmGoodsTypeName = goods.gsmGoodsTypeName // 商品类型
      this.dataGrid.currentRow.gsmGoodsOid = goods.oid // 商品OID
      this.dataGrid.currentRow.gsmGoodsId = goods.id // 商品ID
      this.dataGrid.currentRow.gsmGoodsName = goods.name // 商品名称
      this.dataGrid.currentRow.gsmGoodsSpecs = goods.specs // 规格
      this.dataGrid.currentRow.goodsUnitsName = goods.goodsUnitsName // 单位
      this.dataGrid.currentRow.splitable = goods.splitable // 是否可拆零
      this.dataGrid.currentRow.originalRetailPrice = goods.retailPrice // 原零售价
      // this.dataGrid.currentRow.newRetailPrice = '' // 新零售价
      this.dataGrid.currentRow.originalSplitPrice = goods.splitPrice // 原拆零价
      // this.dataGrid.currentRow.newSplitPrice = '' // 新拆零价
      // this.dataGrid.currentRow.explains = '' // 调价说明
      this.dataGrid.currentRow.originName = goods.originName // 产地
      this.dataGrid.currentRow.manufacturerName = goods.manufacturerName // 生产厂家
    },

    /**
     * 编辑一行
     */
    editRow (row, column, event) {
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
     * @param row
     */
    deleteRow (row) {
      this.dataGrid.data = this.dataGrid.data.filter(item => {
        return item.index !== row.index
      })
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
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.dataGrid.data = []
      }).catch(() => {})
    },

    /**
     * 验证数据
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

      // 判断是否有可提交数据
      return this.dataGrid.data.length > 0
    },

    /**
     * 获取提交数据
     */
    getSubmitData () {
      let adjustPriceList = []
      this.dataGrid.data.forEach(item => {
        let adjustPrice = {}
        adjustPrice.gsmGoodsId = item.gsmGoodsId // 商品ID
        adjustPrice.originalRetailPrice = item.originalRetailPrice // 原零售价
        adjustPrice.newRetailPrice = item.newRetailPrice // 新零售价
        adjustPrice.originalSplitPrice = item.originalSplitPrice // 原拆零价
        adjustPrice.newSplitPrice = item.newSplitPrice // 新拆零价
        adjustPrice.explains = item.explains // 调价说明

        adjustPriceList.push(adjustPrice)
      })
      return adjustPriceList
    },

    /**
     * 提交数据
     */
    submitData () {
      if (!this.validateSubmitData()) {
        return false
      }

      this.$confirm('确认提交吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        // 提交数据
        this.$loading()
        const url = '/chisAPI/goodsAdjustPrice/save'
        let method = 'POST'
        let data = {
          gapJson: JSON.stringify(this.getSubmitData())
        }

        this.$http({method, url, data}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
            this.dataGridLoadData()
          } else {
            this.$message.error(res.data.msg)
            this.$loading().close()
          }
        })
      }).catch(() => {})
    }

  } // end methods
}
</script>

<style scoped>
</style>
