<template>
  <!--
    fullscreen
    class="fullscreen-dialog"
  -->
  <el-dialog
    width="50%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="6" style="font-size: 20px;">
        <span>当量参照录入</span>
      </el-col>
      <el-col :span="18" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="visible = false">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="80px">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item prop="useGsmGoodsId" label="使用商品">
            <el-select
              ref="useGsmGoodsId"
              @keyup.enter.native="validateToNextFocus('useGsmGoodsId', 'referGsmGoodsId')"
              v-model.trim="editForm.useGsmGoodsId"
              placeholder="输入 商品名称 / 助记码"
              :remote-method="queryGoods"
              :loading="selectData.loading"
              remote
              @change="useGsmGoodsChange"
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
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="基本数量" style="text-align: center;">1</el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item prop="useGoodsUnitsName" label="单位">
            {{editForm.useGoodsUnitsName}}
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item prop="referGsmGoodsId" label="参照商品">
            <el-select
              ref="referGsmGoodsId"
              @keyup.enter.native="validateToNextFocus('referGsmGoodsId', 'referQuantity')"
              v-model.trim="editForm.referGsmGoodsId"
              placeholder="输入 参照名称 / 助记码"
              :remote-method="queryGoods"
              :loading="selectData.loading"
              remote
              @change="referGsmGoodsChange"
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
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item prop="referQuantity" label="参照数量">
            <el-input-number v-model="editForm.referQuantity" :controls="false" :max="30000" :min="1" :precision="0"
                             ref="referQuantity"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item prop="referGoodsUnitsName" label="单位">
            {{editForm.referGoodsUnitsName}}
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
        useGsmGoodsId: '',
        useGoodsUnitsId: '',
        useGoodsUnitsName: '',
        referGsmGoodsId: '',
        referGoodsUnitsId: '',
        referGoodsUnitsName: '',
        referQuantity: 1
      },
      editFormRules: {
        useGsmGoodsId: [
          {required: true, message: '不能为空'}
        ],
        referGoodsUnitsId: [
          {required: true, message: '不能为空'}
        ],
        referQuantity: [
          {required: true, message: '不能为空'}
        ]
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
      let row = this.row
      if (row.id) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = row[key]
          }
        }
        this.backShowEquivalent(row)
        this.url = `/chisAPI/equivalent/update`
        this.method = 'PUT'
      } else {
        this.$refs.useGsmGoodsId.focus()
        this.url = `/chisAPI/equivalent/save`
        this.method = 'POST'
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.selectData.goodsList = []
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
     * 回显
     */
    backShowEquivalent (row) {
      let temp1 = {
        id: row.useGsmGoodsId,
        name: row.useGsmGoodsName,
        goodsUnitsId: row.useGoodsUnitsId,
        goodsUnitsName: row.useGoodsUnitsName
      }

      let temp2 = {
        id: row.referGsmGoodsId,
        name: row.referGsmGoodsName,
        goodsUnitsId: row.referGoodsUnitsId,
        goodsUnitsName: row.referGoodsUnitsName
      }
      this.selectData.goodsList.push(temp1)
      this.selectData.goodsList.push(temp2)
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
    useGsmGoodsChange (id) {
      const goods = this.selectData.goodsList.find(item => {
        return item.id === id
      })
      this.editForm.useGoodsUnitsId = goods.goodsUnitsId
      this.editForm.useGoodsUnitsName = goods.goodsUnitsName

      this.selectData.goodsList = []
    },

    /**
     * 参照商品发生变化时执行的操作
     * @param id
     */
    referGsmGoodsChange (id) {
      const goods = this.selectData.goodsList.find(item => {
        return item.id === id
      })
      this.editForm.referGoodsUnitsId = goods.goodsUnitsId
      this.editForm.referGoodsUnitsName = goods.goodsUnitsName

      this.selectData.goodsList = []
    },

    /**
     * 提交数据
     */
    submitData () {
      if (this.editForm.useGsmGoodsId === this.editForm.referGsmGoodsId) {
        this.$message.error('使用商品与参照商品不能为同一商品')
        return false
      }
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
