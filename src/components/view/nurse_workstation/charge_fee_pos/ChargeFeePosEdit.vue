<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <span style="border: #bbbbbb 1px dashed; padding: 10px 10px; margin-right: 5px;">
        <el-button type="default" size="mini" round icon="el-icon-circle-plus-outline" @click="insertRow">插入一行</el-button>
        <el-button type="default" size="mini" round icon="el-icon-remove-outline" @click="deleteAllRow">清空录入商品</el-button>
        <el-button type="default" size="mini" round icon="el-icon-remove-outline" @click="editFormReset">清空表单信息</el-button>
        <el-button type="default" size="mini" round icon="el-icon-remove-outline" @click="pageReset">重置</el-button>
      </span>
      <span style="border: #bbbbbb 1px dashed; padding: 10px 10px; margin-right: 5px;">
          <span style="padding-right: 10px; font-size: 14px; font-weight: 600;">折扣率</span>
          <el-input-number size="mini" v-model="discountRate" :controls="false" :max="99" :min="0" :precision="0"
                           @change="discountRateChange"
                           style="width: 100px; margin-right: -2px;"/>
          <el-button type="success" size="mini" plain round icon="el-icon-discount" @click="discountData">打 折</el-button>
          <el-button type="default" size="mini" plain round icon="el-icon-user" :disabled="true">打折申请</el-button>
        </span>
      <el-button type="success" size="mini" plain round icon="el-icon-money" @click="dialogOpen">收 费</el-button>
    </el-card>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0 0 30px 0;">
      <el-table
        :height="$store.getters.dataGridHeight - 222"
        :data="dataGrid.data"
        :row-class-name="dataGridRowClassName"
        @row-dblclick="dataGridEditRow"
        @cell-mouse-enter="dataGridCellMouseEnter"
        @cell-mouse-leave="dataGridCellMouseLeave"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="70">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="oid" label="商品编码" width="150" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="name" label="名称" width="250" show-overflow-tooltip>
          <template slot-scope="props">
            <el-select
              v-show="props.row.editable"
              :ref="'id' + props.$index"
              @keyup.enter.native="validateFieldToNextFocus('id','quantity' + props.$index)"
              @change="goodsSelected"
              v-model.trim="props.row.id"
              placeholder="输入 商品名称 / 助记码"
              :remote-method="queryGoods"
              :loading="selectData.loading"
              remote
              filterable
              default-first-option
              size="small">
              <el-option class="custom-el-option" :value="null"  v-if="selectData.inventoryList.length > 0" disabled>
                <span class="select-option-top" style="width: 80px;">编码</span>
                <span class="select-option-top" style="width: 150px;">名称</span>
                <span class="select-option-top" style="width: 100px;">规格</span>
                <span class="select-option-top" style="width: 100px;">零售单价</span>
                <span class="select-option-top" style="width: 100px;">库存数量</span>
                <span class="select-option-top" style="width: 120px;">批号</span>
                <span class="select-option-top" style="width: 120px;">批次</span>
                <span class="select-option-top" style="width: 100px;">含税进价</span>
                <span class="select-option-top" style="width: 90px;">有效期至</span>
                <span class="select-option-top" style="width: 80px;">产地</span>
                <span class="select-option-top">生产厂家</span>
              </el-option>
              <el-option class="custom-el-option" v-for="item in selectData.inventoryList" :key="item.id" :value="item.id" :label="item.gsmGoodsName">
                <span class="select-option-text" style="width: 80px;">{{item.gsmGoodsOid}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.gsmGoodsName}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.gsmGoodsSpecs}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.retailPrice}}&nbsp;元</span>
                <span class="select-option-text" style="width: 100px;">{{item.quantity + ' ' + item.goodsUnitsName}}</span>
                <span class="select-option-text" style="width: 120px;">{{item.ph}}</span>
                <span class="select-option-text" style="width: 120px;">{{item.pch}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.costPrice}}&nbsp;元</span>
                <span class="select-option-text" style="width: 90px;">{{item.expiryDate}}</span>
                <span class="select-option-text" style="width: 80px;">{{item.originName}}</span>
                <span class="select-option-text">{{item.manufacturerName}}</span>
              </el-option>
            </el-select>
            <span v-show="!props.row.editable">{{props.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="quantity" label="销售数量" width="110" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.quantity" :controls="false" :max="30000" :min="1" :precision="0"
                             v-show="props.row.editable" size="small"
                             :ref="'quantity' + props.$index"
                             @keyup.enter.native="validateFieldToNextFocus('quantity','actualRetailPrice' + props.$index)"
                             @change="sumActualRetailPrice"/>
            <span v-show="!props.row.editable">{{props.row.quantity}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="unitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="retailPrice" label="零售单价" width="110" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="costPrice" label="含税进价" width="110" show-overflow-tooltip>
          <template slot-scope="props">
            <span v-show="props.row.showCostPrice">{{props.row.costPrice}}</span>
            <span v-show="!props.row.showCostPrice">***</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="actualRetailPrice" label="实收单价" width="110" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.actualRetailPrice" :controls="false" :max="30000" :min="0" :precision="4"
                             v-show="props.row.editable" size="small"
                             :ref="'actualRetailPrice' + props.$index"
                             @keyup.enter.native="insertRow"
                             @change="sumActualRetailPrice"/>
            <span v-show="!props.row.editable">
              <span v-if="props.row.actualRetailPrice < props.row.retailPrice" style="color: #67C23A;">{{props.row.actualRetailPrice}}</span>
              <span v-else>{{props.row.actualRetailPrice}}</span>
            </span>
          </template>
        </el-table-column>
        <!--
        <el-table-column prop="ph" label="批号" width="110" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期" width="110" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="110" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="110" show-overflow-tooltip/>
        -->
        <el-table-column fixed="left" label="小计/元" min-width="110" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.quantity * props.row.actualRetailPrice).toFixed(4)}}
          </template>
        </el-table-column>
      </el-table>

      <!-- 其他信息 -->
      <div style="height: 250px; background-color: rgb(250, 250, 250)">
        <el-row>
          <el-col :span="18" style="border: #cccccc 1px solid; padding: 20px;">
            <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="mini" label-width="80px">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="销售员" prop="sellerId">
                    <el-select
                      v-model.trim="editForm.sellerId"
                      filterable
                      clearable
                      placeholder="请选择">
                      <el-option v-for="item in clinicUserList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="ID">
                    <el-input v-model="editForm.sellerId" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="收银员">
                    <el-input disabled v-model="payload.userName"/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="销售日期">
                    <el-input disabled v-model="today"/>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="6">
                  <el-form-item label="会员编码" prop="mrmMemberId">
                    <el-select
                      v-model.trim="editForm.mrmMemberId"
                      @change="memberSelected"
                      placeholder="输入 姓名 / 手机 搜索"
                      :remote-method="queryMember"
                      :loading="selectData.loading"
                      remote
                      filterable>
                      <el-option class="custom-el-option" :value="null" v-if="selectData.memberList.length > 0" disabled>
                        <span class="select-option-top" style="width: 100px;">姓名</span>
                        <span class="select-option-top" style="width: 100px;">性别</span>
                        <span class="select-option-top" style="width: 120px;">出生年月</span>
                        <span class="select-option-top" style="width: 150px;">联系电话</span>
                        <span class="select-option-top">身份证号</span>
                      </el-option>
                      <el-option class="custom-el-option" v-for="item in selectData.memberList" :key="item.id" :value="item.id" :label="item.oid">
                        <span class="select-option-text" style="width: 100px;">{{item.name}}</span>
                        <span class="select-option-text" style="width: 100px;">{{item.genderName}}</span>
                        <span class="select-option-text" style="width: 120px;">{{item.birth}}</span>
                        <span class="select-option-text" style="width: 150px;">{{item.phone}}</span>
                        <span class="select-option-text">{{item.idCardNo}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="姓名">
                    <el-input v-model="editForm.member.name" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="性别">
                    <el-input v-model="editForm.member.genderName" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="会员类型">
                    <el-input v-model="editForm.member.mrmMemberTypeName" disabled/>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="6">
                  <el-form-item label="出生年月">
                    <el-input v-model="editForm.member.birth" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="身份证">
                    <el-input v-model="editForm.member.idCardNo" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="联系电话">
                    <el-input v-model="editForm.member.phone" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="E-mail">
                    <el-input v-model="editForm.member.eMail" disabled/>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="住址">
                    <el-input v-model="editForm.member.address" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="可用余额">
                    <el-input v-model="editForm.member.balance" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="累计积分">
                    <el-input v-model="editForm.member.points" disabled/>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="18">
                  <el-form-item label="创建机构">
                    <el-input v-model="editForm.member.sysClinicName" disabled/>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="创建日期">
                    <el-input v-model="editForm.member.creationDate" disabled/>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-col> <!-- end left -->

          <el-col :span="6" style="height: 250px; padding: 20px 0 0 20px; position: relative;">
            <div style="font-size: 28px; font-weight: 600;">
              合计: {{totalPrice}} &nbsp;元
            </div>
            <div style="position: absolute; bottom: 20px;">
              <div>批号: {{dataGrid.currentRow ? dataGrid.currentRow.ph : ''}}</div>
              <div>有效期至: {{dataGrid.currentRow ? dataGrid.currentRow.expiryDate : ''}}</div>
              <div>产地: {{dataGrid.currentRow ? dataGrid.currentRow.originName : ''}}</div>
              <div>生产厂家: {{dataGrid.currentRow ? dataGrid.currentRow.manufacturerName : ''}}</div>
            </div>
          </el-col> <!-- end right -->
        </el-row>
      </div>

      <!-- 收费界面 -->
      <ChargeFeePosPay :visible="dialog.visible" :member="editForm.member"
                       :totalPrice="totalPrice" :sellRecordList="dataGrid.sellRecordList"
                       :dialogClose="dialogClose" :pageReset="pageReset"/>

    </el-card>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode'
import ChargeFeePosPay from './ChargeFeePosPay'

export default {
  components: {
    ChargeFeePosPay
  },

  data () {
    return {
      sellWay: this.$store.getters.sellWay, // 销售方式
      sellType: this.$store.getters.sellType, // 销售类型
      // goodsType: this.$store.getters.goodsType, // 商品类型
      inventoryType: this.$store.getters.inventoryType, // 仓库类型
      payload: jwtDecode(this.$store.getters.token),
      today: new Date().toLocaleDateString().replace(/(\/)/g, '-'), // 当前日期
      discountRate: 0, // 折扣率
      totalPrice: 0, // 总金额
      dataGrid: {
        data: [],
        currentRow: {}, // 当前行
        index: 0, // 行号
        sellRecordList: [] // 销售数据
      },
      selectData: {
        loading: false,
        inventoryList: [],
        memberList: []
      },
      dialog: {
        visible: false
      },
      editForm: {
        sellerId: '', // 销售员ID
        mrmMemberId: '', // 会员ID
        member: {} // 选中的会员
      },
      editFormRules: {
        sellerId: [
          {required: true, message: '不能为空'}
        ]
      }
    }
  },

  computed: {
    clinicUserList: function () {
      return this.$store.getters.clinicUserList
    }
  },

  mounted () {
    this.$store.dispatch('queryClinicUserList')
  }, // end mounted

  methods: {
    // 重置页面
    pageReset () {
      this.dataGridReset()
      this.editFormReset()
    },

    /**
     * 重置数据表
     */
    dataGridReset () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.index = 0
      this.selectData.inventoryList = []
      this.discountRate = 0
      this.totalPrice = 0

      // this.dataGrid.sellRecordList = [] // 不能在这里重置该属性, 否则打印小票时无法获取信息, 在 getSubmitData 中进行重置
    },

    /**
     * 重置表单
     */
    editFormReset () {
      this.selectData.memberList = []
      this.$refs.editForm.resetFields()
      this.editForm.member = {}
    },

    /**
     * 鼠标进入监听
     */
    dataGridCellMouseEnter (row, column, cell, event) {
      if (column.property === 'costPrice') {
        row.showCostPrice = true
      }
    },

    /**
     * 鼠标退出监听
     */
    dataGridCellMouseLeave (row, column, cell, event) {
      if (column.property === 'costPrice') {
        row.showCostPrice = false
      }
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
      if (row.editable) {
        return 'info-row'
      }
      return ''
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
     * 验证一行是否有效
     * @row 要进行验证的 row
     * @showMsg 是否显示错误消息, 不传参数显示，传任何参数则不显示
     */
    validateRow (row, showMsg) {
      if (!row.id || !row.quantity || !row.actualRetailPrice) {
        if (showMsg === undefined) {
          this.$message.error('请完成当前行编辑 或 将其删除, 方可进行该操作')
        }
        return false
      }

      if (this.hasRepeatRow(row)) {
        if (showMsg === undefined) {
          this.$message.error('当前记录已存在, 不能重复录入')
        }
        return false
      }

      // 判断库存数量是否足够
      if (row.quantity > row.inventoryQuantity) {
        if (showMsg === undefined) {
          this.$message.error('【' + row.oid + ' ' + row.name + '】可销数量不足, 当前库存数量: ' + row.inventoryQuantity)
        }
        return false
      }

      // 判断实收单价是否大于零售单价
      if (row.actualRetailPrice > row.retailPrice) {
        if (showMsg === undefined) {
          this.$message.error('【' + row.oid + ' ' + row.name + '】实收单价不能大于零售单价: ' + row.retailPrice)
        }
        return false
      }

      // 判断是否可打折
      if (!row.discountable && (row.actualRetailPrice < row.retailPrice)) {
        if (showMsg === undefined) {
          this.$message.error('【' + row.oid + ' ' + row.name + '】该商品不能打折')
        }
        return false
      }

      // 判断商品是否低于成本价
      if (!row.lossable && (row.actualRetailPrice < row.costPrice)) {
        if (showMsg === undefined) {
          this.$message.error('【' + row.oid + ' ' + row.name + '】实收单价不能低于成本价: ' + row.costPrice)
        }
        return false
      }

      // 判断是否过期
      if (new Date(row.expiryDate) < new Date()) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】商品批号已过期')
        return false
      }

      return true
    },

    /**
     * 向数据表插入一行
     */
    insertRow () {
      // 如果当前行无效则不继续执行
      if (this.dataGrid.data.length > 0 && !this.validateRow(this.dataGrid.currentRow)) {
        return
      }
      // 停止编辑当前行
      if (this.dataGrid.data.length > 0) {
        this.dataGrid.currentRow.editable = false
      }

      // 初始化一行编辑属性
      let row = {}
      row.index = ++this.dataGrid.index // 行ID 仅作为有重复商品时 删除其中一个的唯一标识
      row.editable = true // 该行是否可编辑
      row.showCostPrice = false // 是否显示成本价
      row.id = '' // 库存ID
      row.quantity = 1 // 库存数量
      row.actualRetailPrice = 0 // 实收单价

      // 将新建行指向当前行
      this.dataGrid.currentRow = row
      // 插入数据
      this.dataGrid.data.push(this.dataGrid.currentRow)
      // 延迟处理
      setTimeout(() => {
        // 清空已经查询的数据
        this.selectData.inventoryList = []
        // 下一行获取焦点
        this.$refs['id' + (this.dataGrid.data.length - 1)].focus()
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
          const url = `/chisAPI/inventory/getClinicPchEnabledLikeByCriteria`
          let params = {
            iymInventoryTypeId: this.inventoryType.HYGIENIC_MATERIAL_INVENTORY,
            gsmGoodsName: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.inventoryList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.inventoryList ? 0 : 500))
      }
    },

    /**
     * 当选中一个商品后执行的操作
     * @param id
     */
    goodsSelected (id) {
      // 获取选中的商品
      let inventory = this.selectData.inventoryList.find(item => {
        return item.id === id
      })

      this.dataGrid.currentRow.sysSellWayId = this.sellWay.POS // 销售方式
      this.dataGrid.currentRow.sysSellTypeId = this.sellType.GOODS // 销售类型
      this.dataGrid.currentRow.entityTypeId = inventory.gsmGoodsTypeId // 商品类型ID
      this.dataGrid.currentRow.entityId = inventory.gsmGoodsId // 商品ID
      this.dataGrid.currentRow.oid = inventory.gsmGoodsOid // 商品OID
      this.dataGrid.currentRow.name = inventory.gsmGoodsName // 商品名称
      this.dataGrid.currentRow.specs = inventory.gsmGoodsSpecs // 商品规格
      this.dataGrid.currentRow.manufacturerName = inventory.manufacturerName // 生产厂家
      this.dataGrid.currentRow.originName = inventory.originName // 产地
      this.dataGrid.currentRow.unitsName = inventory.goodsUnitsName // 销售单位
      this.dataGrid.currentRow.retailPrice = inventory.retailPrice // 零售价
      this.dataGrid.currentRow.actualRetailPrice = inventory.retailPrice // 实收单价
      this.dataGrid.currentRow.purchaseTaxRate = inventory.purchaseTaxRate // 进货税率
      this.dataGrid.currentRow.sellTaxRate = inventory.sellTaxRate // 销售税率
      this.dataGrid.currentRow.discountable = inventory.discountable // 是否可打折
      this.dataGrid.currentRow.lossable = inventory.lossable // 是否倒挂品种
      this.dataGrid.currentRow.iymInventoryId = inventory.id // 库存记录ID
      this.dataGrid.currentRow.ph = inventory.ph // 批号
      this.dataGrid.currentRow.pch = inventory.pch // 批次号
      this.dataGrid.currentRow.splitQuantity = inventory.splitQuantity // 拆零系数
      // this.dataGrid.currentRow.quantity = 0 // 销售数量 [编辑表单已赋值]
      this.dataGrid.currentRow.inventoryQuantity = inventory.quantity // 库存数量
      this.dataGrid.currentRow.costPrice = inventory.costPrice // 成本价
      this.dataGrid.currentRow.producedDate = inventory.producedDate // 生产日期
      this.dataGrid.currentRow.expiryDate = inventory.expiryDate // 有效期至
      this.dataGrid.currentRow.pemSupplierId = inventory.pemSupplierId // 供应商ID
      this.dataGrid.currentRow.iymInventoryAddId = inventory.iymInventoryAddId // 入库记录ID

      // 计算零售总价
      this.sumActualRetailPrice()
    },

    /**
     * 计算零售总价
     */
    sumActualRetailPrice () {
      this.totalPrice = 0
      this.dataGrid.data.forEach(item => {
        if (item.quantity && item.actualRetailPrice) {
          this.totalPrice += item.quantity * item.actualRetailPrice
        }
      })
      this.totalPrice = this.totalPrice.toFixed(2) * 1
    },

    /**
     * 编辑一行
     */
    dataGridEditRow (row, column, event) {
      // 如果是当前行且在编辑状态则不继续执行
      if (row.editable) {
        return
      }
      // 如果目标行未完成编辑则询问是否放弃该行
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
      // 设置当前行
      this.dataGrid.currentRow = this.dataGrid.data[this.dataGrid.data.length - 1]
      // 计算处方总价
      this.sumActualRetailPrice()
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
        this.dataGridReset()
      }).catch(() => {})
    },

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * 检索会员
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     * @param keyword
     */
    queryMember (keyword) {
      if (keyword.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/member/getEnabledLikeByKeyword`
          let params = {keyword}
          this.$http.get(url, {params}).then((res) => {
            this.selectData.memberList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.memberList ? 0 : 500))
      }
    },

    /**
     * 获取选中会员
     * @param id
     */
    memberSelected (id) {
      this.editForm.member = this.selectData.memberList.find(item => {
        return item.id === id
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 当折扣率发生变化时执行的操作
     */
    discountRateChange () {
      this.discountData()
    },

    /**
     * 整单打折
     */
    discountData () {
      // 判断是否有打折的明细
      if (this.dataGrid.data.length === 0) {
        return
      }

      // 判断折扣率是否合法
      if (!Number(this.discountRate)) {
        this.$message.error('折扣率为 [1 - 99]')
        return
      }

      // 计算折扣后的实收金额
      this.dataGrid.data.forEach(row => {
        if (row.discountable) {
          const discountPrice = row.retailPrice * (this.discountRate < 10 ? (this.discountRate / 10) : (this.discountRate / 100))
          if ((discountPrice > row.costPrice) || row.lossable) {
            row.actualRetailPrice = discountPrice.toFixed(4)
          }
        }
      })

      // 重新计算合计金额
      this.sumActualRetailPrice()
      this.$message.success('打折已完成')
    },
    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * 验证所有行是否有效
     */
    hasSubmitRow () {
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
        } else {
          // 如果该行验证通过则停止编辑状态
          row.editable = false
        }
      }

      return this.dataGrid.data.length !== 0
    },

    /**
     * 获取提交的数据信息
     */
    getSubmitData () {
      // 初始化销售记录
      this.dataGrid.sellRecordList = []

      // 获取提交数据
      this.dataGrid.data.forEach(item => {
        let sellRecord = {}

        // 过滤不提交的属性
        for (let key in item) {
          if (item.hasOwnProperty(key)) {
            if (key !== 'index' && key !== 'editable' && key !== 'showCostPrice' && key !== 'id') {
              sellRecord[key] = item[key]
            }
          }
        }

        // 添加会员和销售人员属性
        sellRecord.mrmMemberId = this.editForm.mrmMemberId // 会员ID
        sellRecord.mrmMemberOid = this.editForm.mrmMemberId ? this.editForm.member.oid : null // 会员编码 [收费小票使用]
        sellRecord.mrmMemberName = this.editForm.mrmMemberId ? this.editForm.member.name : null // 会员姓名 [收费小票使用]
        sellRecord.genderName = this.editForm.mrmMemberId ? this.editForm.member.genderName : null // 会员性别 [收费小票使用]
        sellRecord.phone = this.editForm.mrmMemberId ? this.editForm.member.phone : null // 会员联系电话 [收费小票使用]
        sellRecord.memberDiscountRate = this.editForm.mrmMemberId ? this.editForm.member.discountRate : null // 会员折扣率
        sellRecord.sellerId = this.editForm.sellerId // 销售员ID
        // sellRecord.operatorId = ''

        this.dataGrid.sellRecordList.push(sellRecord)
      })
    },

    /**
     * 开启收费界面
     */
    dialogOpen () {
      if (!this.hasSubmitRow()) {
        return false
      }

      // 验证合计金额是否有效
      if ((!Number(this.totalPrice) || this.totalPrice < 0) && this.totalPrice !== 0) {
        this.$message.error('应收金额无效')
        return false
      }

      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }
        this.getSubmitData()
        this.dialog.visible = true
      })
    },

    /**
     * 关闭收费界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
