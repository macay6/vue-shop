<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <tree-table :data="categoryList" :columns="columns" :selection-type="false" :expand-type="false" show-index
                  border :show-row-hover="false" class="tree-table">
        <!--是否有效-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateFromReset">
      <!--内容主体区域-->
      <el-form :model="addCateFrom" :rules="addCateFromRules" ref="addCateFromRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!--级联选择框-->
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="fartherCateList"
            :props="cascaderProps"
            learable
            @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
       </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取商品分类的查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      categoryList: [],
      // 商品类别的数目
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模版列
          type: 'template',
          // 表示当前这一列使用模版名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模版列
          type: 'template',
          // 表示当前这一列使用模版名称
          template: 'order'
        }, {
          label: '操作',
          // 表示将当前列定义为模版列
          type: 'template',
          // 表示当前这一列使用模版名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的展示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateFrom: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 校验分类名称的规则
      addCateFromRules: {
        cat_name: [
          {
            required: true,
            message: '请输入商品分类名称',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 8,
            message: '长度在 5 到 8 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类的列表
      fartherCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    // 查询商品分类列表
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类列表失败')
      }
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 监听pagenum的改变
    handleCurrentChange (pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getCategoryList()
    },
    // 点击按钮，展示添加分类对话框
    showAddCateDialog () {
      // 先获取父级分类列表的数据
      this.getFartherCateList()
      // 再展示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表数据
    async getFartherCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类列表失败')
      }
      this.fartherCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChange () {
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateFrom.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateFrom.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击提交按钮
    addCate () {
      this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('categories', this.addCateFrom)
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCategoryList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭添加分类对话框后重置数据
    addCateFromReset () {
      this.$refs.addCateFromRef.resetFields()
      this.selectedKeys = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    }
  }
}
</script>

<style lang="less">
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 90%;
}

.el-cascader-panel {
  height: 300px;
}
</style>
