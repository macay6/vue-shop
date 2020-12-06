<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!-- 提示区域 -->
      <el-alert show-icon :closable="false"
                title="添加商品信息"
                type="info"
                center>
      </el-alert>
      <!--步骤条-->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addGoodForm" :rules="addGoodFormRules" ref="addGoodFormRef" label-width="100px"
               label-position="top">
        <!--左侧tab拦-->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="handleBeforeLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addGoodForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addGoodForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addGoodForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!--级联选择框-->
              <!-- options 用来指定数据源 -->
              <!-- props 用来指定配置对象 -->
              <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="categoryList"
                :props="cascaderProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item" v-for="(item, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--文件上传-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器-->
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <!--添加按钮-->
            <el-button type="primary" class="addButton" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览对话框-->
    <el-dialog
      title="图片预览"
      :visible.sync="picDialogVisible"
      width="50%">
      <img :src="previewPath" alt="" class="preview">
    </el-dialog>
  </div>
</template>
<script>
// 导入深拷贝依赖
import _ from 'lodash'

export default {
  data () {
    return {
      // 当前激活的index
      activeIndex: '0',
      // 添加商品的表单对象
      addGoodForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 分类列表
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品简介
        goods_introduce: '',
        attrs: []
      },
      // 商品分类列表
      categoryList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 商品动态参数列表
      manyTableData: [],
      // 商品静态属性列表
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片的真实路径
      previewPath: '',
      // 控制图片预览效果对话框的显示与隐藏
      picDialogVisible: false,
      // 由于图片上传组件内部没有使用axios发送请求，所以我们配置的axios拦截器挂载token就不会生效，
      // 这里需要使用组件的属性手动添加一下新的header
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 添加商品表单对象的校验规则
      addGoodFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }]
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    // 查询商品分类列表
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类列表失败')
      }
      this.categoryList = res.data
      console.log(this.categoryList)
    },
    // 级联选中后触发的事件
    handleChange () {
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = []
      }
    },
    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换
    // activeName 即将进入的标签页名字
    // oldActiveName 即将离开的标签页名字
    handleBeforeLeave (activeName, oldActiveName) {
      console.log(oldActiveName)
      console.log(this.addGoodForm.goods_cat.length)
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.warning('请选择商品分类')
        return false
      }
    },
    // tab 被选中时触发
    async tabClicked () {
      // 证明选中的是动态参数面板
      if (this.activeIndex === '1') {
        // 获取商品的动态参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取动态参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        // 获取商品的静态属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取静态属性失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.picDialogVisible = true
    },
    // 处理图片移除的效果
    handleRemove (file) {
      // console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const index = this.addGoodForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addGoodForm.pics.splice(index, 1)
      console.log(this.addGoodForm)
    },
    // 处理文件上传成功的事件,将文件的临时存放路径提交到表单数据
    handleSuccess (response) {
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象，push 到pics数组中
      this.addGoodForm.pics.push(picInfo)
    },
    // 添加商品
    addGood () {
      this.$refs.addGoodFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写必要的表单项')
        }
        // 执行添加的业务逻辑
        // 此处使用了深拷贝，原因是addGoodForm.goods_cat这个数据有两处被用到了，在data中它是一个数组，
        // 但是这里我们要提交表单数据按接口定义是一个用，分割的字符串，如果在这里直接使用字符串拼接，在分类选择框那里就会报错，
        // 所以这里使用深拷贝拷贝一个新的表单对象，我们操作新的对象，不影响老对象的数据
        const from = _.cloneDeep(this.addGoodForm)
        from.goods_cat = from.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addGoodForm.attrs.push(newInfo)
        })
        // 处理静态态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodForm.attrs.push(newInfo)
        })
        // 赋值
        from.attrs = this.addGoodForm.attrs
        // 发起添加商品的请求
        // 商品名称必须 是唯一的
        const { data: res } = await this.$http.post('goods', from)
        if (res.meta.status !== 201) {
          this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取选中的三级分类的ID
    cateId () {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.preview {
  width: 100%;
}

.addButton {
  margin-top: 15px;
}
</style>
