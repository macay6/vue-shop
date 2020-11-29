<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--表格数据区域-->
      <el-table
        :data="rolesList"
        border
        stripe>
        <!--展开列-->
        <el-table-column
          type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id"
                    :class="['vcenter','bdBottom', index1 ===0 ? 'bdTop' : '']">
              <!--一级菜单区域-->
              <el-col :span="5">
                <el-tag closable
                        @close="deleteRoleById(scope.row, item1.id)">{{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级、三级菜单区域-->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row :class="[index2 === 0 ? '' : 'bdTop','vcenter']" v-for="(item2, index2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable
                            @close="deleteRoleById(scope.row, item2.id)">{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable
                            @close="deleteRoleById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称">
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述">
        </el-table-column>
        <el-table-column
          label="操作" width="300px">
          <template slot-scope="prop">
            <!--编辑按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUser(prop.row.id)">编辑</el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(prop.row.id)">删除</el-button>
            <!--分配权限按钮-->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRolesDiaLog(prop.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--权限分配的对话框-->
    <el-dialog
      title="分配角色权限"
      :visible.sync="showSetRoleVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="clearRolesDialog">
      <!--内容主体区域-->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id"
               :default-checked-keys="defaultKeys" ref="treeRef"></el-tree>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
       </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      showSetRoleVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展示的节点列表
      defaultKeys: [],
      // 保存当前分配权限的角色的ID
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色权限列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色权限列表失败')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 根据ID删除角色权限
    async deleteRoleById (role, rightId) {
      // 弹框询问是否删除角色
      const confirmResult = await this.$confirm('此操作将永久删除该角色的权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除角色权限操作')
      }
      // 删除某个角色下的某个权限
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除角色权限失败')
      }
      this.$message.success('删除角色权限成功')
      // 给角色权限重新赋值
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRolesDiaLog (role) {
      // 保存当前打开对话框的角色ID
      this.roleId = role.id
      // 获取所以权限的数据（tree）
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      // 获取角色下所有三级权限的id，并保存到 defKeys 数组中
      role.children.forEach(item => {
        item.children.forEach(item1 => {
          item1.children.forEach(item2 => {
            this.defaultKeys.push(item2.id)
          })
        })
      })
      this.showSetRoleVisible = true
    },
    // 监听分配权限对话框的关闭事件
    clearRolesDialog () {
      this.defaultKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      // 这里用到了ES6的新语法，合并俩个数组
      const keys = [
        ...this.$refs.treeRef.getHalfCheckedKeys(),
        ...this.$refs.treeRef.getCheckedKeys()
      ]
      // 将数组转化为字符串
      const idStr = keys.join(',')
      // 发送分配角色的请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        this.$message.error('分配角色权限失败')
      }
      this.$message.success('分配角色权限成功')
      // 刷新角色权限列表
      this.getRolesList()
      // 关闭dialog窗口
      this.showSetRoleVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdTop {
  border-top: 1px solid #eee
}

.bdBottom {
  border-bottom: 1px solid #eee
}

//纵向居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>
