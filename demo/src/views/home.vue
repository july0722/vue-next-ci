<template>
  <div>
    <base-grid v-bind="grid">
      <template #operate>
        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" :disabled="!row.editable" @click="visit(row)">编辑</el-button>
            <el-button type="text" :disabled="row.editable" @click="visit(row)">查看</el-button>
          </template>
        </el-table-column>
      </template>
    </base-grid>
  </div>
</template>

<script>
import { list } from '@/api/test'

export default {
  setup() {
    return {
      grid: {
        params: [
          { prop: 'params1', placeholder: 'params1' },
          {
            prop: 'params2',
            component: 'select',
            placeholder: 'params2',
            options: [
              { label: 'l1', value: 'v1' },
              { label: 'l2', value: 'v2' },
            ],
          },
        ],
        // source: [
        //   { prop1: '1-1', prop2: '1-2', prop3: '1-3', prop4: '1-4' },
        //   { prop1: '2-1', prop2: '2-2', prop3: '2-3', prop4: '2-4' },
        // ],
        source: (p) => list(p),
        columns: [
          { slot: 'index' },
          { prop: 'prop1', label: '字段1', 'show-overflow-tooltip': false },
          { prop: 'prop2', label: '字段2' },
          { prop: 'prop3', label: '字段3' },
          { prop: 'prop4', label: '字段4' },
          { slot: 'operate' },
        ],
        beforeFetch: (params) => {
          console.log(params)
        },
        afterFetch: (data) => {
          console.log(data)
          data.forEach((item) => {
            item.editable = true
          })
        },
      },
    }
  },
  async created() {
    console.log(this.$api)
  },
}
</script>
