<template>
  <el-container class="home_container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">
          |||
        </div>
        <!--侧边栏菜单区域-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router>
          <!--一级菜单区域-->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <!--图标-->
              <i :class="iconObj[item.id]"></i>
              <!--文本-->
              <span>{{ item.authName }}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/'+ menuItem.path" v-for="menuItem in item.children" :key="menuItem.id">
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{ menuItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧主体区域-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      isCollapse: false,
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      }
    }
  },
  // 生命周期函数的使用，页面加载时调用
  created () {
    this.getMenuList()
  },
  methods: {
    // 清空token，跳转只登陆页面
    logout () {
      window.sessionStorage.clear()
      this.$router.push('login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res.data)
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;

    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  padding-right: 10px;
}

</style>
