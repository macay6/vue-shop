<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <el-row :gutter="25">
        <!--搜索区域-->
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input v-model='queryGoodInfo.query' placeholder="请输入内容" class="input-with-select" clearable
                      @clear="getGoodList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
            </el-input>
          </div>
        </el-col>
        <!--添加区域-->
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button type="primary"  @click="addGoods">添加商品</el-button>
          </div>
        </el-col>
      </el-row>
      <!--表格-->
      <el-table
        :data="goodList"
        style="width: 100%"
        border
        stripe>
        <el-table-column
          type="index"
          label="序号">
        </el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称">
        </el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格（元）"
          width="80px">
        </el-table-column>
        <el-table-column
          prop="goods_number"
          label="商品数量"
          width="80px">
        </el-table-column>
        <el-table-column
          prop="add_time"
          label="创建时间"
          width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGood(scope.row.goods_id)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryGoodInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryGoodInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询商品的参数对象
      queryGoodInfo: {
        query: '',
        // 页码数
        pagenum: 1,
        // 分页条数
        pagesize: 5
      },
      // 商品列表
      goodList: [],
      // 商品总数
      total: 0
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    // 根据分页参数获取商品列表数据
    async getGoodList () {
      console.log(this.queryGoodInfo)
      const { data: res } = await this.$http.get('goods', { params: this.queryGoodInfo })
      if (res.meta.status !== 200) {
        this.$message.error('查询商品列表失败')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    // 监听pageSize变化
    handleSizeChange (newSize) {
      this.queryGoodInfo.pagesize = newSize
      this.getGoodList()
    },
    // 监听pageNum变化
    handleCurrentChange (pageNum) {
      this.queryGoodInfo.pagenum = pageNum
      this.getGoodList()
    },
    // 通过Id删除商品
    async deleteGood (id) {
      // 是否删除询问提示框
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (result !== 'confirm') {
        return this.$message.info('取消删除操作')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodList()
    },
    // 点击按钮添加商品
    addGoods () {
      // 编程式导航跳转页面
      this.$router.push('/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 10px;
}

</style>
