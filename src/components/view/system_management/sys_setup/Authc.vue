<template>
  <el-card shadow="never" :style="`height: ${$store.getters.dataGridHeight + 120}px;`">
    <el-row>
      <el-col :span="5">
        <el-select
          v-model="roleName"
          placeholder="请选择角色"
          size="small"
          @change="treeCheckRoleAuthc">
          <el-option v-for="item in select.roles" :key="item.id" :value="item.id" :label="item.name"/>
        </el-select>
      </el-col>
      <el-col :span="5" style="padding-left: 20px;">
        <el-button type="primary" size="small" @click="treeUpdateRoleNames">更新权限</el-button>
      </el-col>
      <el-col :span="14" align="right">
        <div class="el-tree-body">
          <el-tree
            ref="authcTree"
            :data="data"
            :show-checkbox="roleName !== null"
            node-key="id"
            :check-on-click-node="true"
            :default-expand-all="false"/>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      roleName: null,
      filterText: '',
      data: [],
      select: {
        roles: []
      }
    }
  },

  mounted () {
    {
      // 初始化角色选择列表
      const url = '/chisAPI/role/getEnabled'
      this.$http.get(url).then((res) => {
        this.select.roles = res.data
      })
    }

    // 初始化权限树
    this.treeLoadData()
  },

  methods: {
    /**
     * 载入权限树数据
     */
    treeLoadData () {
      const url = '/chisAPI/authc/getTree'
      this.$http.get(url).then((res) => {
        this.data = res.data
        if (this.roleName) {
          this.treeCheckRoleAuthc(this.roleName)
        }
      })
    },

    /***
     * 载入选中角色权限
     * @returns {boolean}
     */
    treeCheckRoleAuthc (roleName) {
      // 清空所有权限树节点
      this.$refs.authcTree.setCheckedKeys([])

      // 如果选中角色无效则不继续执行
      if (!roleName) {
        return false
      }

      // 需要进行选中的权限树节点数组[存放节点树的 ID 值]
      let keys = []

      // 获取默认权限的 key 并将角色已有的权限树的 key 进行记录
      for (let [key, roleNames] of this.treeGetLeafNodeMap()) {
        if (this.treeIsContain(roleName, roleNames)) {
          keys.push(key)
        }
      }

      // 选中对应的权限树节点
      this.$refs.authcTree.setCheckedKeys(keys)
    },

    /**
     * 获取权限树所有的叶子节点 Map[叶子节点的id, 叶子节点的roleNames]
     * @param roleName
     */
    treeGetLeafNodeMap () {
      let leafNodeMap = new Map()
      let leve1 = this.data
      for (let i = 0; i < leve1.length; i++) {
        let leve2 = leve1[i].children

        for (let j = 0; j < leve2.length; j++) {
          let leve3 = leve2[j].children

          for (let k = 0; k < leve3.length; k++) {
            let id = leve3[k].id
            let roleNames = leve3[k].roleNames
            leafNodeMap.set(id, roleNames)
          }
        }
      }

      return leafNodeMap
    },

    /**
     * roleNames 是否包含 roleName
     * @param roleName
     * @param roleNames
     */
    treeIsContain (roleName, roleNames) {
      // 因为 roleNames 类型为 String 所以 roleName 也必须为 String 类型
      roleName = roleName.toString()
      let roleNameArray = roleNames.split(',')
      for (let i = 0; i < roleNameArray.length; i++) {
        if (roleName === roleNameArray[i]) {
          return true
        }
      }
      return false
    },

    /**
     * 更新角色权限
     */
    treeUpdateRoleNames () {
      if (this.roleName) {
        this.$loading()
        let url = '/chisAPI/authc/updateRoleNames'
        let method = 'PUT'
        let params = {
          roleName: this.roleName,
          checkedAuthcJson: JSON.stringify(this.$refs.authcTree.getCheckedKeys(true))
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.treeLoadData()
          }
          this.$loading().close()
        })
      }
    }
  }
}
</script>

<style scoped>
  .el-tree-body {
    width: 500px;
    border: #cccccc 1px solid;
    padding: 15px;
    height: 88vh;
    overflow: auto;
  }
</style>
