<template>
  <div class="base-grid">
    <div class="base-grid__search">
      <div class="base-grid__toolbar" v-if="$slots.toolbar">
        <slot name="toolbar"></slot>
      </div>
      <el-form
        size="medium"
        ref="form"
        :model="form"
        v-if="params.length > 0 || $slots['toolbar-right']"
        inline
        @submit.prevent
      >
        <template v-for="(item, index) in params" :key="`params${index}`">
          <el-form-item :label="item.label" :prop="item.prop" v-if="!item.hidden">
            <el-select
              v-if="item.component === 'select'"
              clearable
              v-bind="omit(item, 'options')"
              v-model="form[item.prop]"
              :style="{ width: `${item.width}px` }"
              v-on="pickBy(item, val => typeof val === 'function')"
            >
              <el-option
                v-for="(option, oInedx) in item.options"
                :key="`${item.prop}${oInedx}`"
                v-bind="option"
              ></el-option>
            </el-select>
            <el-radio-group v-else-if="item.component === 'radio'" v-model="form[item.prop]">
              <el-radio v-for="option in item.options" :key="option.value" :label="option.value">{{
                option.label
              }}</el-radio>
            </el-radio-group>
            <el-date-picker
              v-else-if="item.component === 'date-picker'"
              :ref="item.prop"
              v-model="form[item.prop]"
              v-bind="omit(item)"
              :style="{ width: `${item.width}px` }"
              @hook:mounted="
                ;($refs[item.prop][0].pickerVisible = true),
                  $nextTick(() => {
                    $refs[item.prop][0].pickerVisible = false
                  })
              "
            >
            </el-date-picker>
            <component
              v-else-if="item.component !== undefined"
              :is="typeof item.component === 'string' ? `el-${item.component}` : item.component"
              v-bind="omit(item)"
              v-model="form[item.prop]"
              :style="{ width: `${item.width}px` }"
            ></component>
            <el-input
              v-else
              clearable
              v-bind="omit(item)"
              v-model.trim="form[item.prop]"
              @keyup.enter="reload"
              :style="{ width: `${item.width}px` }"
            ></el-input>
          </el-form-item>
        </template>
        <el-form-item v-if="params.length > 0">
          <el-button type="primary" @click="reload">查询</el-button>
        </el-form-item>
        <el-form-item v-if="$slots['toolbar-right']">
          <slot name="toolbar-right"></slot>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-grid__area">
      <header>
        <slot name="header"></slot>
      </header>
      <el-table ref="table" v-bind="$attrs" :data="data">
        <template v-for="(column, index) in columns" :key="index">
          <template v-if="!column.hidden">
            <el-table-column
              v-if="column.slot === 'selection'"
              type="selection"
              width="50"
              v-bind="omit(column, 'slot')"
            ></el-table-column>
            <el-table-column
              v-else-if="column.slot === 'index'"
              label="序号"
              type="index"
              :index="column.index || (index => index + 1 + (pagination.currentPage - 1) * pagination.pageSize)"
              v-bind="omit(column, 'slot')"
            ></el-table-column>
            <slot v-else-if="column.slot" :name="column.slot" :column="column"></slot>
            <component v-else-if="column.component" :is="column.component" v-bind="column"></component>
            <el-table-column show-overflow-tooltip v-else-if="column.prop" v-bind="column">
              <template v-slot="{ row }">{{
                {
                  undefined: () => get(row, column.prop),
                  function: () => column.convert(get(row, column.prop), row),
                  string: () => $root.$options.filters[column.convert](get(row, column.prop))
                }[typeof column.convert]()
              }}</template>
            </el-table-column>
          </template>
        </template>
      </el-table>
      <div class="base-grid__pagination" v-if="page">
        <el-pagination
          :layout="pagination.layout"
          :page-sizes="pagination.pageSizes"
          :page-size="pagination.pageSize"
          :current-page="pagination.currentPage"
          :total="pagination.total"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { get, omit, pickBy, cloneDeep } from 'lodash'

export default {
  name: 'base-grid',
  inheritAttrs: false,
  props: {
    source: {
      type: [Function, Array]
    },
    columns: {
      type: Array,
      default() {
        return []
      }
    },
    params: {
      type: Array,
      default() {
        return []
      }
    },
    page: {
      type: Boolean,
      default: true
    },
    beforeFetch: {
      type: Function
    },
    afterFetch: {
      type: Function
    },
    autoFetch: {
      type: Boolean,
      default: true
    },
    paginationOption: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {},
      data: [],
      pagination: {
        layout: this.paginationOption.layout || 'total, prev, pager, next, jumper, sizes',
        total: 0,
        currentPage: 1,
        pageSize: this.paginationOption.pageSize || 10,
        pageSizes: this.paginationOption.pageSizes || [10, 20, 50]
      }
    }
  },
  computed: {
    isServer() {
      return typeof this.source === 'function'
    }
  },
  watch: {
    source() {
      this.fetch()
    }
  },
  created() {
    this.params.forEach(x => (this.form[x.prop] = x.value || ''))
    this.autoFetch && this.columns.length > 0 && this.fetch()
  },
  methods: {
    pickBy(object, func) {
      return pickBy(object, func)
    },
    get(object, key) {
      return get(object, key)
    },
    omit(object, ...rest) {
      return omit(object, 'prop', 'component', 'width', rest)
    },
    onSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.currentPage = 1
      this.fetch()
    },
    onCurrentChange(currentPage) {
      this.pagination.currentPage = currentPage
      this.fetch()
    },
    async fetch() {
      let _data = this.source
      let _params = cloneDeep(this.form)
      let _beforeFetch = this.beforeFetch ? this.beforeFetch(_params) : undefined
      if (_beforeFetch === false) {
        return
      }
      if (this.isServer) {
        let { data } = await this.source({
          ...(_beforeFetch || _params),
          pageSize: this.page ? this.pagination.pageSize : undefined,
          pageNum: this.page ? this.pagination.currentPage : undefined
        })
        if (this.page) {
          _data = get(data, 'data')
          this.pagination.total = get(data, 'pageBean.count')
        } else {
          _data = get(data, 'data') || data
        }
      } else {
        if (this.page) {
          _data = this.source.slice(
            (this.pagination.currentPage - 1) * this.pagination.pageSize,
            this.pagination.currentPage * this.pagination.pageSize
          )
          this.pagination.total = this.source.length
        }
      }
      const _afterFetch = this.afterFetch ? this.afterFetch(_data) : undefined
      this.data = _afterFetch || _data
    },
    reload() {
      this.pagination.currentPage = 1
      this.fetch()
    }
  }
}
</script>

<style lang="scss">
.base-grid {
  .el-button {
    margin-right: 0;
  }
  .clickable {
    cursor: pointer;
    color: #3d89fa;
    &:hover {
      color: #2160c1;
    }
  }
  &__toolbar {
    height: 100%;
    padding: 5px 0;
    .el-alert {
      font-size: 0;
      height: 36px;
    }
  }
  &__search {
    &:not(:empty) {
      background: #fff;
      padding: 7px 12px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
    .el-button {
      height: 36px;
      line-height: 36px;
      padding: 0 20px;
      border-radius: 4px;
      margin-right: 0;
    }
    .el-form {
      flex: 1;
      text-align: right;
      .el-form-item {
        margin: 5px 0 5px 10px !important;
        &:first-of-type {
          margin-left: 0;
        }
      }
    }
  }
  &__area {
    background: #fff;
    padding: 12px;
    .el-button {
      border-radius: 4px;
    }
    > header:not(:empty) {
      margin-bottom: 12px;
    }
  }
  .el-table {
    &::before {
      height: 0;
    }
  }
  .el-table__empty-block {
    min-height: 50px;
  }
  .el-table__empty-text {
    line-height: 50px;
  }
  .cell {
    .el-button {
      overflow: visible;
      padding: 0;
      background: transparent;
      color: #3d89fa;
      &:hover {
        color: #2160c1;
      }
      &.is-disabled {
        color: #c0c4cc !important;
        background: transparent;
      }
    }
  }
  .el-range-editor--medium.el-input__inner {
    height: 36px;
  }
  &__pagination {
    display: flex;
    justify-content: flex-end;
    .el-pagination {
      margin-top: 12px;
      padding: 0;
      .el-pagination__jump {
        margin-left: 10px;
      }
      .el-select .el-input {
        margin-right: 0;
      }
    }
    .el-pager li.active + li {
      border: solid 1px #dcdfe6;
    }
    .el-pager li.active {
      color: #3d89fa;
      border: solid 1px;
    }
    .el-pager li,
    .el-pagination .btn-prev,
    .el-pagination .btn-next {
      padding: 0 4px;
      font-size: 12px;
      width: 30px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      text-align: center;
      font-weight: 100;
      border: solid 1px #dcdfe6;
      margin: 0px 4px;
      border-radius: 2px;
    }
    .el-pagination__sizes {
      margin-right: 0;
    }
  }
}
</style>
