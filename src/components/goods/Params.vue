<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon :closable="false"
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col class="cate_opt">
          <span>选择商品分类：</span>
          <!--级联选择框-->
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            clearable
            @change="cateChange"></el-cascader>
        </el-col>
      </el-row>
      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!--添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <!--动态参数添加按钮-->
          <el-button type="primary" size="small" :disabled="isButtonDisabled" @click="addParamsDialogVisible = true">
            添加参数
          </el-button>
          <!--动态参数表格-->
          <el-table
            :data="manyTableData"
            style="width: 100%"
            border>
            <!--展开行-->
            <el-table-column
              type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                        @close="handleClose(scope.row,index)">{{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              label="序号"
              width="80px">
            </el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称">
            </el-table-column>
            <el-table-column
              label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDislog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="isButtonDisabled" @click="addParamsDialogVisible = true">
            静态属性
          </el-button>
          <!--静态参数表格-->
          <el-table
            :data="onlyTableData"
            style="width: 100%"
            border>
            <!--展开列-->
            <el-table-column
              type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                        @close="handleClose(scope.row,index)">{{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              label="序号"
              width="80px">
            </el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称">
            </el-table-column>
            <el-table-column
              label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDislog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!--添加属性的对话框-->
      <el-dialog
        :title="'添加'+ titleText"
        :visible.sync="addParamsDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="addParamsDialogClose">
        <!--内容主体区域-->
        <el-form :model="addParamsFrom" :rules="addParamsFromRules" ref="addParamsRef" label-width="70px">
          <el-form-item :label="titleText" prop="attr_name" label-width="80px">
            <el-input v-model="addParamsFrom.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
       </span>
      </el-dialog>
      <!--修改属性的对话框-->
      <el-dialog
        :title="'修改'+ titleText"
        :visible.sync="editParamsDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="editParamsDialogClose">
        <!--内容主体区域-->
        <el-form :model="editParamsFrom" :rules="editParamsFromRules" ref="editParamsRef" label-width="70px">
          <el-form-item :label="titleText" prop="attr_name" label-width="80px">
            <el-input v-model="editParamsFrom.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
       </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 级联选择框双向绑定到的数组
      selectedKeys: [],
      // 默认展示的页签
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加参数对话框的显示与隐藏
      addParamsDialogVisible: false,
      // 添加参数对象
      addParamsFrom: {
        attr_name: ''
      },
      // 添加参数表单验证规则
      addParamsFromRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }]
      },
      // 控制修改参数对话框的显示与隐藏
      editParamsDialogVisible: false,
      // 修改参数对象
      editParamsFrom: {
        attr_name: '',
        attr_id: ''
      },
      // 添加修改表单验证规则
      editParamsFromRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }]
      }
      // 这两个值被每一行共用，不能这么定义，在挂载数据的方法中为每一行数据单独添加
      // // 控制输入框和添加按钮之间的显示与隐藏
      // inputVisible: false,
      // // 输入框信息
      // inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      }
      this.cateList = res.data
    },
    // 级联选择框选中项变化，会触发这个函数
    cateChange () {
      this.getParamsData()
    },
    // 点击切换页签触发的事件
    handleClick () {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData () {
      // 证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选中的是三级分类,获取分类的参数列表
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        this.$message.error('获取分类参数失败')
      }
      console.log(res.data)
      // 将字符串转换为数组便于展示
      res.data.forEach(item => {
        // 如果不为null则转换，否则为[]
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制输入框和添加按钮之间的显示与隐藏
        item.inputVisible = false
        // 输入框信息
        item.inputValue = ''
      })
      // 根据数据类型挂载到对应的数据上
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      }
      this.onlyTableData = res.data
    },
    // 提交添加参数表单
    addParams () {
      this.$refs.addParamsRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsFrom.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addParamsDialogVisible = false
        this.getParamsData()
      })
    },
    // 添加参数对话框关闭
    addParamsDialogClose () {
      this.$refs.addParamsRef.resetFields()
    },
    // 展示修改参数对话框
    async showEditDislog (attrId) {
      this.editParamsDialogVisible = true
      // 获取当前参数信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/` + attrId, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取参数信息失败')
      }
      this.editParamsFrom.attr_name = res.data.attr_name
      this.editParamsFrom.attr_id = res.data.attr_id
    },
    // 提交修改参数表单
    editParams () {
      this.$refs.editParamsRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsFrom.attr_id}`, {
          attr_name: this.editParamsFrom.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editParamsDialogVisible = false
      })
    },
    // 修改参数对话框关闭
    editParamsDialogClose () {
      this.editParamsDialogVisible = false
    },
    // 点击删除按钮，删除参数
    async deleteParams (attrId) {
      // 是否删除询问提示框
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (result !== 'confirm') {
        return this.$message.info('取消删除参数')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除参数失败')
      }
      this.getParamsData()
      this.$message.success('删除参数成功')
    },
    // 控制输入框的显示与隐藏
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点，来自官方文档
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 当键盘输入enter或者光标离开时触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }
      // 则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      console.log(row.attr_vals)
      row.inputValue = ''
      row.inputVisible = false
      // 将数据持久化到数据库
      this.saveAttrValues(row)
    },
    // 删除标签的操作
    handleClose (row, i) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValues(row)
    },
    // 持久化参数结果到数据库
    async saveAttrValues (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        this.$message.error('添加参数失败')
      }
      this.$message.success('添加参数成功')
    }
  },
  computed: {
    // 如果添加参数或属性的按钮需要被禁用则返回true,否则则返回falss
    isButtonDisabled () {
      if (this.selectedKeys.length === 3) {
        return false
      } else {
        return true
      }
    },
    // 获取当前选中分类的Id
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    },
    // 获取title
    titleText () {
      if (this.activeName === 'many') {
        return '动态属性'
      } else {
        return '静态参数'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cate_opt {
  margin: 15px 0;
}

.el-tag {
  margin-right: 15px;
}

.input-new-tag {
  width: 120px;
}
</style>
