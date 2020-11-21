<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 清空token，跳转只登陆页面
    logout () {
      window.sessionStorage.clear()
      this.$router.push('login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
