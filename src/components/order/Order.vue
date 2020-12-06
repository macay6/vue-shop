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
      <el-row>
        <el-col :span="8">
          <!--搜索框-->
          <div class="grid-content bg-purple">
            <el-input v-model='queryOrderInfo.query' placeholder="请输入内容" class="input-with-select" clearable
                      @clear="getOrderList">
              <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
            </el-input>
          </div>
        </el-col>
      </el-row>
      <!--表格区域-->
      <el-table
        :data="orderList"
        style="width: 100%"
        border
        stripe>
        <el-table-column
          type="index"
          label="序号"
          width="80px">
        </el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编码">
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="80px">
        </el-table-column>
        <el-table-column
          prop="pay_status"
          label="是否付款"
          width="80px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="80px">
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="下单时间"
          width="180px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200px">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showPositionDislog">编辑
            </el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProcessDislog">物流
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryOrderInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryOrderInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
    <!--修改地址的对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="editPositionDialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="editPositionFrom" :rules="editPositionFromRules" ref="editPositionFromRef" label-width="70px">
        <el-form-item label="省市/区" prop="address1" label-width="80px">
          <el-cascader
            :options="citydata"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2" label-width="80px">
          <el-input v-model="editPositionFrom.address2"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPositionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPositionDialogVisible = false">确 定</el-button>
       </span>
    </el-dialog>
    <!--展示物流的对话框-->
    <el-dialog
      title="物流信息"
      :visible.sync="showProgessDialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <!--时间线-->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progessInfo"
          :key="index"
          :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import citydata from '@/components/order/citydata'

export default {
  data () {
    return {
      queryOrderInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单列表信息
      orderList: [],
      // 订单总数
      total: 0,
      // 控制修改地址的对话框
      editPositionDialogVisible: false,
      // 地址表单信息
      editPositionFrom: {
        address1: [],
        address2: ''
      },
      citydata: citydata,
      // 表单验证规则
      editPositionFromRules: {
        address1: [
          {
            required: true,
            message: '请选择地址',
            trigger: 'blur'
          }],
        address2: [
          {
            required: true,
            message: '请输入详细地址',
            trigger: 'blur'
          }
        ]
      },
      // 展示物流对话框
      showProgessDialogVisible: false,
      // 物流信息
      progessInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      console.log(this.queryOrderInfo)
      const { data: res } = await this.$http.get('orders', { params: this.queryOrderInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取订单列表失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
      console.log(this.total)
    },
    // 监听pageSize变化
    handleSizeChange (newSize) {
      this.queryOrderInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听pageNum变化
    handleCurrentChange (pageNum) {
      this.queryOrderInfo.pagenum = pageNum
      this.getOrderList()
    },
    // 展示地址对话框
    showPositionDislog () {
      this.editPositionDialogVisible = true
    },
    // 展示物流对话框
    async showProcessDislog () {
      // 此接口有问题，会把接口调挂
      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      //
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流进度失败！')
      // }
      //
      // this.progessInfo = res.data

      this.showProgessDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped></style>
