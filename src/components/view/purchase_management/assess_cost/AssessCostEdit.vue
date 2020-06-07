<template>
  <el-dialog
    width="60%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="6" style="font-size: 20px;">
        <span>供应商返利</span>
      </el-col>
      <el-col :span="18" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="visible = false">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="110px">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="10">
          <el-form-item label="供应商编码" prop="pemSupplierId">
            <el-select
              ref="pemSupplierId"
              v-model.trim="editForm.pemSupplierId"
              :remote-method="querySupplier"
              :loading="selectData.loading"
              remote
              filterable
              default-first-option
              @change="supplierChange"
              @keyup.enter.native="validateToNextFocus('pemSupplierId', 'gsmGoodsId')"
              placeholder="输入 供应商名称 / 助记码 搜索">
              <el-option class="custom-el-option" :value="null" v-if="selectData.supplierList.length > 0" disabled>
                <span class="select-option-top" style="width: 120px;">供应商编码</span>
                <span class="select-option-top" style="width: 300px;">名称</span>
                <span class="select-option-top" style="width: 100px;">联系人</span>
                <span class="select-option-top" style="width: 120px;">联系电话</span>
              </el-option>
              <el-option class="custom-el-option" v-for="item in selectData.supplierList" :key="item.id" :value="item.id" :label="item.oid">
                <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                <span class="select-option-text" style="width: 300px;">{{item.name}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.contacter}}</span>
                <span class="select-option-text" style="width: 120px;">{{item.contacterPhone}}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="13" :push="1" style="border: #cccccc 1px solid;">
          <el-form-item label="供应商名称" prop="pemSupplierName">
            {{editForm.pemSupplierName}}
          </el-form-item>
        </el-col>
      </el-row>

      <br/>
      <el-row>
        <el-col :span="10">
          <el-form-item label="商品编码" prop="gsmGoodsId">
            <el-select
              ref="gsmGoodsId"
              v-model.trim="editForm.gsmGoodsId"
              :remote-method="queryGoods"
              :loading="selectData.loading"
              remote
              filterable
              default-first-option
              @keyup.enter.native="validateToNextFocus('gsmGoodsId', 'firstCostPrice')"
              @change="goodsChange"
              placeholder="输入 商品名称 / 助记码">
              <el-option class="custom-el-option" :value="null" v-if="selectData.goodsList.length > 0" disabled>
                <span class="select-option-top" style="width: 120px;">商品编码</span>
                <span class="select-option-top" style="width: 200px;">商品名称</span>
                <span class="select-option-top" style="width: 100px;">单位</span>
                <span class="select-option-top" style="width: 150px;">规格</span>
                <span class="select-option-top" style="width: 100px;">零售单价(元)</span>
                <span class="select-option-top" style="width: 100px;">产地</span>
                <span class="select-option-top">生产厂家</span>
              </el-option>
              <el-option class="custom-el-option" v-for="item in selectData.goodsList" :key="item.id" :value="item.id" :label="item.oid">
                <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                <span class="select-option-text" style="width: 200px;">{{item.name}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.goodsUnitsName}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.specs}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.retailPrice}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
                <span class="select-option-text">{{item.manufacturerName}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="一成本" prop="firstCostPrice">
            <el-input-number v-model="editForm.firstCostPrice" :controls="false" :max="30000" :min="0" :precision="4"
                             ref="firstCostPrice" style="width: 150px;"
                             @focus="editForm.firstCostPrice = editForm.firstCostPrice === 0 ? undefined : editForm.firstCostPrice"
                             @keyup.enter.native="validateToNextFocus('firstCostPrice', 'secondCostPrice')"/>&nbsp;元
          </el-form-item>
          <el-form-item label="二成本" prop="secondCostPrice">
            <el-input-number v-model="editForm.secondCostPrice" :controls="false" :max="30000" :min="0" :precision="4"
                             ref="secondCostPrice" style="width: 150px;"
                             @focus="editForm.secondCostPrice = editForm.secondCostPrice === 0 ? undefined : editForm.secondCostPrice"/>&nbsp;元
          </el-form-item>
        </el-col>
        <el-col :span="13" :push="1" style="border: #cccccc 1px solid;">
          <el-form-item label="商品名称" prop="gsmGoodsName">
            {{editForm.gsmGoodsName}}
          </el-form-item>
          <el-form-item label="单位" prop="goodsUnitsName">
            {{editForm.goodsUnitsName}}
          </el-form-item>
          <el-form-item label="规格" prop="specs">
            {{editForm.specs}}
          </el-form-item>
          <el-form-item label="零售价" prop="retailPrice">
            {{editForm.retailPrice}}&nbsp;元
          </el-form-item>
          <el-form-item label="产地" prop="originName">
            {{editForm.originName}}
          </el-form-item>
          <el-form-item label="生产厂家" prop="manufacturerName">
            {{editForm.manufacturerName}}
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

  </el-dialog>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      required: true
    },
    dataGridLoadData: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      visible: false,
      method: 'POST',
      url: '',
      editForm: {
        id: '',
        pemSupplierId: '',
        pemSupplierName: '',
        gsmGoodsId: '',
        gsmGoodsName: '',
        goodsUnitsName: '',
        specs: '',
        retailPrice: '',
        originName: '',
        manufacturerName: '',
        firstCostPrice: 0,
        secondCostPrice: 0
      },
      editFormRules: {
        pemSupplierId: [
          {required: true, message: '不能为空'}
        ],
        gsmGoodsId: [
          {required: true, message: '不能为空'}
        ],
        firstCostPrice: [
          {required: true, message: '不能为空'}
        ],
        secondCostPrice: [
          {required: true, message: '不能为空'}
        ]
      },
      selectData: {
        supplierList: [],
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
      let row = this.row
      if (row.id) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = row[key]
          }
        }
        this.url = `/chisAPI/assessCost/update`
        this.method = 'PUT'
        this.backShow(row)
      } else {
        this.$refs.pemSupplierId.focus()
        this.url = `/chisAPI/assessCost/save`
        this.method = 'POST'
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.selectData.supplierList = []
      this.selectData.goodsList = []
    },

    /**
     * 回显
     */
    backShow (row) {
      let supplier = {
        id: row.pemSupplierId,
        oid: row.pemSupplierOid,
        name: row.pemSupplierName
      }
      this.selectData.supplierList.push(supplier)

      let goods = {
        id: row.gsmGoodsId,
        oid: row.gsmGoodsOid,
        name: row.gsmGoodsName,
        goodsUnitsName: row.goodsUnitsName,
        specs: row.specs,
        retailPrice: row.retailPrice,
        originName: row.originName,
        manufacturerName: row.manufacturerName
      }
      this.selectData.goodsList.push(goods)
    },

    /**
     * 验证通过到下一个焦点
     */
    validateToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    /**
     * 检索供应商
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     */
    querySupplier (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/supplier/getEnabledLikeByName`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.supplierList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.supplierList ? 0 : 500))
      }
    },

    /**
     * 当供应商发生改变时执行的操作
     */
    supplierChange (id) {
      const supplier = this.selectData.supplierList.find(item => {
        return item.id === id
      })

      this.editForm.pemSupplierName = supplier.name
    },

    /**
     * 检索商品
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
     * 使用商品发生变化时执行的操作
     * @param id
     */
    goodsChange (id) {
      const goods = this.selectData.goodsList.find(item => {
        return item.id === id
      })
      this.editForm.gsmGoodsName = goods.name
      this.editForm.goodsUnitsName = goods.goodsUnitsName
      this.editForm.specs = goods.specs
      this.editForm.retailPrice = goods.retailPrice
      this.editForm.originName = goods.originName
      this.editForm.manufacturerName = goods.manufacturerName
    },

    /**
     * 提交数据
     */
    submitData () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }
        this.$loading()
        let url = this.url
        let method = this.method
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
            this.visible = false
          } else {
            this.$loading().close()
          }
        })
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
