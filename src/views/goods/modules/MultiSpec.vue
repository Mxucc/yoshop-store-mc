<template>
  <div>
    <a-form-item label="商品规格" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <div class="form-item-help" style="line-height: 36px">
        <small>最多添加3个商品规格组，生成的SKU数量不能超出50个</small>

      </div>
      <!-- 规格组 -->
      <div class="spec-group" v-for="(item, index) in multiSpecData.specList" :key="index">
        <div class="spec-group-item clearfix">
          <a-input
            class="group-item-input"
            v-model="item.spec_name"
            :readOnly="isSpecLocked"
            placeholder="请输入规格名称"
            @change="onChangeSpecGroupIpt"
          />
          <a-select
            v-if="!isSpecLocked"
            class="group-item-type"
            v-model="item.spec_type"
            @change="onChangeSpecType(index)"
          >
            <a-select-option value="text">文本</a-select-option>
            <a-select-option value="date">日期</a-select-option>
          </a-select>
          <a
            v-if="!isSpecLocked"
            class="group-item-delete"
            href="javascript:;"
            @click="handleDeleteSpecGroup(index)"
          >删除规格组</a>
        </div>
        <div class="spec-value clearfix">
          <div class="spec-value-item" v-for="(itm, idx) in item.valueList" :key="idx">
            <!-- 根据规格类型显示不同的输入控件 -->
            <template v-if="item.spec_type === 'date'">
              <a-range-picker
                class="value-item-input"
                v-model="itm.spec_date_range"
                :disabled="isSpecLocked"
                @change="(dates, dateStrings) => onChangeDateRangePicker(dates, dateStrings, itm)"
                format="YYYY-MM-DD"
                :placeholder="['出售开始日期', '出售截止日期']"
              />
            </template>
            <template v-else>
              <a-input
                class="value-item-input"
                v-model="itm.spec_value"
                :readOnly="isSpecLocked"
                placeholder="请输入规格值"
                @change="onChangeSpecValueIpt"
              />
            </template>
            <a-icon
              v-if="!isSpecLocked"
              class="icon-close"
              theme="filled"
              type="close-circle"
              @click="handleDeleteSpecValue(index, idx)"
            />
          </div>
          <div v-if="!isSpecLocked && item.spec_type != 'date'" class="spec-value-add">
            <a
              class="group-item-delete"
              href="javascript:;"
              @click="handleAddSpecValue(index)"
            >新增规格值</a>
          </div>
        </div>
      </div>
      <!-- 添加规格按钮 -->
      <a-button
        v-if="!isSpecLocked && multiSpecData.specList.length < 3"
        class="spec-group-add-btn"
        icon="plus"
        @click="handleAddSpecGroup"
      >添加规格组</a-button>
    </a-form-item>
    <a-form-item
      v-show="multiSpecData.skuList.length"
      label="SKU列表"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <!-- 批量设置 -->
      <div v-if="multiSpecData.skuList && multiSpecData.skuList.length > 1" class="sku-batch">
        <span class="title">批量设置:</span>
        <a-input-number
          v-model="multiSpecData.skuBatchForm.goods_price"
          placeholder="商品价格"
          :min="0.01"
          :precision="2"
        />
        <a-input-number
          v-if="item.spec_type === 'date'"
          v-model="multiSpecData.skuBatchForm.holiday_price"
          placeholder="节假日价格"
          :min="0"
          :precision="2"
        />
        <a-input-number
          v-model="multiSpecData.skuBatchForm.line_price"
          placeholder="划线价格"
          :min="0"
          :precision="2"
        />
        <a-input-number
          v-model="multiSpecData.skuBatchForm.stock_num"
          placeholder="库存数量"
          :min="0"
          :precision="0"
        />
        <a-input-number
          v-model="multiSpecData.skuBatchForm.goods_weight"
          placeholder="商品重量"
          :min="0"
          :precision="2"
        />
        <a-input v-model="multiSpecData.skuBatchForm.goods_sku_no" placeholder="sku编码" />
        <a-button @click="handleSkuBatch">立即设置</a-button>
      </div>
      <!-- sku列表table -->
      <a-table
        class="sku-list"
        :columns="multiSpecData.skuColumns"
        :dataSource="multiSpecData.skuList"
        :scroll="{ x: true }"
        :pagination="false"
        bordered
      >
        <!-- 预览图 -->
        <template slot="image" slot-scope="text, item">
          <SelectImage
            v-model="item.image_id"
            :defaultList="(item.image_id > 0 && item.image) ? [item.image] : []"
            :width="50"
          />
        </template>
        <!-- 商品价格 -->
        <template slot="goods_price" slot-scope="text, item">
          <a-input-number v-model="item.goods_price" size="small" :min="0.01" :precision="2" />
        </template>
        <!-- 节假日价格 -->
        <template slot="holiday_price" slot-scope="text, item">
          <a-input-number v-model="item.holiday_price" size="small" :min="0" :precision="2" />
        </template>
        <!-- 划线价格 -->
        <template slot="line_price" slot-scope="text, item">
          <a-input-number v-model="item.line_price" size="small" :min="0" :precision="2" />
        </template>
        <!-- 库存数量 -->
        <template slot="stock_num" slot-scope="text, item">
          <a-input-number v-model="item.stock_num" size="small" :min="0" :precision="0" />
        </template>
        <!-- 商品重量 -->
        <template slot="goods_weight" slot-scope="text, item">
          <a-input-number v-model="item.goods_weight" size="small" :min="0" :precision="2" />
        </template>
        <!-- sku编码 -->
        <template slot="goods_sku_no" slot-scope="text, item">
          <a-input v-model="item.goods_sku_no" size="small" />
        </template>
      </a-table>
    </a-form-item>
  </div>
</template>

<script>
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import MultiSpecModel from '@/common/model/goods/MultiSpec'
import { SelectImage } from '@/components'

export default {
  components: {
    SelectImage
  },
  props: {
    // 默认的规格列表
    defaultSpecList: PropTypes.array.def([]),
    // 默认的SKU列表
    defaultSkuList: PropTypes.array.def([]),
    // 商品规格是否锁定(锁定状态下不允许编辑规格)
    isSpecLocked: PropTypes.bool.def(false),
    // 规格类型（20:多选多规格，30:单选多规格）
    specType: PropTypes.number.def(20)
  },
  data () {
    return {
      // 标签布局属性
      labelCol: { span: 3 },
      // 输入框布局属性
      wrapperCol: { span: 21 },
      // 商品多规格模型
      MultiSpecModel: new MultiSpecModel(),
      // MultiSpecModel: Object,
      multiSpecData: {
        // 规格列表
        specList: [],
        // SKU列表
        skuList: []
      }
    }
  },
  watch: {
    defaultSpecList (val) {
      if (val.length && this.MultiSpecModel.isEmpty()) {
        this.getData()
      }
    }
  },
  // 初始化数据
  created () {
    // 获取规格及SKU信息
    this.getData()
  },
  methods: {

    // 获取规格及SKU信息(展示)
    getData () {
      const { defaultSpecList, defaultSkuList, specType } = this
      this.multiSpecData = this.MultiSpecModel.getData(defaultSpecList, defaultSkuList)
      // 根据规格类型设置是否多选
      this.multiSpecData.isMulti = specType === 20
      // 更新规格类型
      this.$emit('update:specType', this.multiSpecData.isMulti ? 20 : 30)
      // 处理日期类型规格的spec_date_range
      this.multiSpecData.specList.forEach(specGroup => {
        if (specGroup.spec_type === 'date') {
          specGroup.valueList.forEach(item => {
            // 如果spec_value存在且包含日期范围格式（开始日期~结束日期）
            if (item.spec_value && item.spec_value.includes('~')) {
              const dateRange = item.spec_value.split('~')
              // 确保spec_date_range是数组类型
              if (!Array.isArray(item.spec_date_range)) {
                item.spec_date_range = []
              }
              // 设置日期范围值
              item.spec_date_range = dateRange
            }
          })
        }
      })
    },
    // 规格类型变化事件
    onChangeSpecType (groupIndex) {
      const specGroup = this.multiSpecData.specList[groupIndex]
      // 如果切换到日期类型，为每个规格值添加spec_date_range属性
      if (specGroup.spec_type === 'date') {
        specGroup.valueList.forEach(item => {
          // 确保spec_date_range是数组类型
          if (!Array.isArray(item.spec_date_range)) {
            item.spec_date_range = []
          }
          // 如果spec_value已经存在且包含日期范围格式，解析并设置到spec_date_range
          if (item.spec_value && item.spec_value.includes('~')) {
            const dateRange = item.spec_value.split('~')
            item.spec_date_range = dateRange
          }
        })
      }
      // 更新skuList
      this.MultiSpecModel.onUpdate(true)
    },
    // 单选/多选模式变化事件
    onChangeMultiMode () {
      // 更新规格类型
      this.$emit('update:specType', this.multiSpecData.isMulti ? 20 : 30)
      // 更新skuList
      this.MultiSpecModel.onUpdate(true)
    },
    // 日期选择器变化事件
    onChangeDatePicker (date, dateString, item) {
      // 将日期字符串赋值给spec_value，确保与现有逻辑兼容
      item.spec_value = dateString
      // 更新skuList
      this.MultiSpecModel.onUpdate(true)
    },
    // 日期范围选择器变化事件
    onChangeDateRangePicker (dates, dateStrings, item) {
      // 将日期范围字符串拼接后赋值给spec_value，确保与现有逻辑兼容
      // 格式：开始日期~结束日期
      item.spec_value = dateStrings[0] + '~' + dateStrings[1]
      // 更新skuList
      this.MultiSpecModel.onUpdate(true)
    },

    // 获取规格及SKU信息(表单提交)
    getFromSpecData () {
      return this.MultiSpecModel.getFromSpecData()
    },

    // 添加规格组
    handleAddSpecGroup () {
      if (this.checkSkuMaxNum()) {
        this.MultiSpecModel.handleAddSpecGroup()
      }
    },

    // 删除规格组
    handleDeleteSpecGroup (groupIndex) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该规格组吗?',
        content: '删除后不可恢复',
        onOk () {
          // 删除元素
          app.MultiSpecModel.handleDeleteSpecGroup(groupIndex)
          // 关闭对话框
          modal.destroy()
        }
      })
    },

    // 新增规格值
    handleAddSpecValue (groupIndex) {
      if (this.checkSkuMaxNum()) {
        this.MultiSpecModel.handleAddSpecValue(groupIndex)
      }
    },

    // 删除规格值
    handleDeleteSpecValue (groupIndex, valueIndex) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该规格值吗?',
        content: '删除后不可恢复',
        onOk () {
          // 删除元素
          app.MultiSpecModel.handleDeleteSpecValue(groupIndex, valueIndex)
          // 关闭对话框
          modal.destroy()
        }
      })
    },

    // 规格组输入框change事件
    onChangeSpecGroupIpt () {
      // 更新skuList
      this.MultiSpecModel.onUpdate(true)
    },

    // 规格值输入框change事件
    onChangeSpecValueIpt (event, itm) {
      // 更新skuList
      this.MultiSpecModel.onUpdate(true)
    },

    // 验证最大sku数量
    checkSkuMaxNum () {
      const skuList = this.multiSpecData.skuList
      if (skuList.length >= 50) {
        this.$message.error(`生成的sku列表数量不能大于50个，当前数量：${skuList.length}个`, 2.5)
        return false
      }
      return true
    },

    // 批量设置sku事件
    handleSkuBatch () {
      this.MultiSpecModel.handleSkuBatch()
    },

    // 验证多规格表单
    verifyForm () {
      if (!this.MultiSpecModel.verifyForm()) {
        this.$message.error(this.MultiSpecModel.getError(), 2)
        return false
      }
      return true
    }

  }
}

</script>
<style lang="less" scoped>
// 商品多规格
.spec-group {
  width: 895px;
  margin-bottom: 15px;
  line-height: normal;

  .ant-input {
    height: 28px;
    padding: 4px 11px;
    font-size: @font-size-base;
    line-height: 1.5;

    &::placeholder {
      font-size: @font-size-base;
    }
  }

  .form-item-help {
    line-height: 36px;
  }

  .spec-group-item {
    background: #f4f5f9;
    padding: 7px 12px;
    line-height: 28px;

    .group-item-input {
      float: left;
      width: 180px;
    }
    .group-item-type {
      float: left;
      width: 100px;
      margin-left: 10px;
    }

    .group-item-delete {
      font-size: 12px;
      float: right;
    }
  }

  .spec-value {
    background: #fbfbfb;
    padding: 8px 35px;

    .spec-value-add,
    .spec-value-item {
      float: left;
      margin-bottom: 6px;
      margin-top: 6px;
    }

    .spec-value-add {
      height: 28px;
      line-height: 28px;

      a {
        font-size: 12px;
      }
    }

    .spec-value-item {
      position: relative;
      margin-right: 20px;

      .value-item-input {
        width: 186px;
      }

      &:hover {
        .icon-close {
          display: block;
        }
      }

      .icon-close {
        display: none;
        position: absolute;
        top: -8px;
        right: -8px;
        cursor: pointer;
        font-size: 16px;
        color: #7d7d7d;
      }
    }
  }
}

// 添加规格按钮
.spec-group-add-btn {
  font-size: @font-size-base;
}

// 批量设置sku
.sku-batch {
  line-height: 40px;
  margin-bottom: 12px;
  .title {
    line-height: 28px;
    margin-right: 15px;
    font-size: @font-size-base;
  }
  /deep/.ant-input,
  /deep/.ant-input-number {
    width: 120px;
    margin-right: 15px;
  }
  /deep/.ant-input {
    width: 140px;
  }
}

// sku列表
.sku-list {
  width: 895px;
  /deep/.ant-table-thead > tr > th,
  /deep/.ant-table-tbody > tr > td {
    white-space: nowrap;
  }
  /deep/.ant-table-tbody > tr > td {
    padding: 12px 18px;
  }

  /deep/.ant-input-sm,
  /deep/.ant-input-number-sm {
    height: 28px;
  }
  /deep/.ant-input-number-sm input {
    height: 26px;
  }
}
</style>
