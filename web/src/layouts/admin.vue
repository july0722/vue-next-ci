<template>
  <el-container>
    <el-header>Header</el-header>
    <el-container :class="{ collapse }">
      <el-aside></el-aside>
      <el-aside>
        <el-menu default-active="1-4-1" :collapse="collapse">
          <el-submenu index="1">
            <template #title>
              <i class="el-icon-location"></i>
              <span>导航一</span>
            </template>
            <el-menu-item-group>
              <template #title>分组一</template>
              <el-menu-item index="1-1">选项1</el-menu-item>
              <el-menu-item index="1-2">选项2</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="1-3">选项3</el-menu-item>
            </el-menu-item-group>
            <el-submenu index="1-4">
              <template #title>选项4</template>
              <el-menu-item index="1-4-1">选项1</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <template #title>导航二</template>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <template #title>导航三</template>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <template #title>导航四</template>
          </el-menu-item>
        </el-menu>
        <div>
          <i :class="[`el-icon-s-${collapse ? 'un' : ''}fold`]" @click="$store.commit('app/collapse')"></i>
        </div>
      </el-aside>
      <el-main><slot /></el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('app', ['collapse'])
  }
}
</script>

<style lang="scss" scoped>
.el-header {
  background: #3d89fa;
  color: #fff;
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 10;
  height: $layout-header-height !important;
  + .el-container {
    background: #fafbfd;
    width: 100%;
    padding-top: $layout-header-height;
    bottom: 0;
  }
}
.el-aside {
  width: $layout-aside-width !important;
  transition: 0.2s;
  + .el-aside {
    display: flex;
    flex-direction: column;
    overflow-x: hidden !important;
    border-right: 1px solid #e6e6e6;
    background: #fff;
    box-sizing: content-box;
    position: fixed;
    top: $layout-header-height;
    bottom: 0;
  }
  > .el-menu {
    border-right: none;
    flex: 1;
    + div {
      padding: 10px;
      text-align: center;
      i {
        cursor: pointer;
        font-size: 20px;
      }
    }
  }
  .collapse & {
    width: $layout-aside-collapse-width !important;
  }
}
</style>
