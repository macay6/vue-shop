<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <el-row :gutter="25">
        <!--搜索区域-->
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable
                      @clear="queryUsersList">
              <el-button slot="append" icon="el-icon-search" @click="queryUsersList"></el-button>
            </el-input>
          </div>
        </el-col>
        <!--添加区域-->
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!--表格-->
      <el-table
        :data="userList"
        border
        stripe>
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="prop">
            <el-switch
              v-model="prop.row.mg_state" @change="userStateChange(prop.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作" width="180px">
          <template slot-scope="prop">
            <!--编辑按钮-->
            <el-tooltip class="item" effect="dark" content="编辑用户" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUser(prop.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip class="item" effect="dark" content="删除用户" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(prop.row.id)"></el-button>
            </el-tooltip>
            <!--分配角色按钮-->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotRole(prop.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户的对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="addUserDialogClose">
      <!--内容主体区域-->
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
       </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editUserDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="editUserDialogClose">
      <!--内容主体区域-->
      <el-form :model="editUserFrom" :rules="editUserFromRules" ref="editUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
       </span>
    </el-dialog>
    <!--用户分配角色的对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="setRoleDialogClose">
      <!--内容主体区域-->
      <p>当前的用户：{{ this.userInfo.username }}</p>
      <p>当前的角色：{{ this.userInfo.role_name }}</p>
      <p>分配新角色：</p>
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
       </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义邮箱的校验规则
    var checkEmail = (rule, value, cb) => {
      // 校验邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱！'))
    }
    // 自定义手机号的校验规则
    var checkMobile = (rule, value, cb) => {
      // 校验手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号！'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addUserDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editUserDialogVisible: false,
      // 添加用户表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户校验规则
      addUserRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 8,
            message: '长度在 5 到 8 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 修改用户的信息对象
      editUserFrom: {},
      editUserFromRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制设置用户角色的对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 角色列表
      rolesList: [],
      // 已选中角色的ID
      selectedRoleId: ''
    }
  },
  created () {
    this.queryUsersList()
  },
  methods: {
    // 获取用户列表
    async queryUsersList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryUsersList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.queryUsersList()
    },
    // 监听 switch 开关状态的改变
    async userStateChange (userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 修改失败后让状态复原
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功！')
    },
    // 监听添加用户对话框的关闭，重置表单数据
    addUserDialogClose () {
      this.$refs.addUserRef.resetFields()
    },
    // 用户添加功能
    addUser () {
      // 表单预校验
      this.$refs.addUserRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 校验成功，发起添加用户的请求
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 关闭添加用户对话框
        this.addUserDialogVisible = false
        // 刷新用户列表
        this.queryUsersList()
      })
    },
    // 展示修改用户功能的对话框
    async editUser (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('获取用户信息失败')
      }
      this.editUserFrom = res.data
      this.editUserDialogVisible = true
    },
    // 关闭修改用户的对话框
    editUserDialogClose () {
      this.$refs.editUserRef.resetFields()
    },
    // 修改用户信息预验证并提交
    editUserInfo () {
      this.$refs.editUserRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 发起修改用户的请求
        const { data: res } = await this.$http.put('users/' + this.editUserFrom.id, {
          email: this.editUserFrom.email,
          mobile: this.editUserFrom.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败')
        }
        // 关闭对话框
        this.editUserDialogVisible = false
        // 刷新用户列表
        this.queryUsersList()
        // 更新用户成功提示
        this.$message.success('更新用户信息成功')
      })
    },
    // 根据ID删除对应的用户
    async deleteUser (id) {
      // 弹框询问是否删除用户
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果确认了删除，返回的是一个字符串'confirm'
      // 如果取消了删除，返回的是一个字符串'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除操作')
      }
      // 发起删除用户的请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // 刷新用户列表
      this.queryUsersList()
    },
    // 给用户分配角色
    async allotRole (userInfo) {
      // 获取当前用户的信息
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
      // 获取所以角色信息
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 点击确定，保存用户的新角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      // 发起更新用户角色的请求
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        this.$message.error('更新用户角色失败')
      }
      this.$message.success('更新用户角色成功')
      // 更新用户列表
      this.queryUsersList()
      this.setRoleDialogVisible = false
    },
    // 关闭分配角色的对话框
    setRoleDialogClose () {
      this.userInfo = {}
      this.selectedRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>

</style>
