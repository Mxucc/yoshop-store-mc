<template>
  <a-modal
    title="编辑文件分组"
    :width="720"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="分组名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['name', { rules: [{ required: true, min: 2, message: '请输入至少2个字符' }] }]"
          />
        </a-form-item>
        <a-form-item label="上级分组" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-tree-select
            :treeData="groupListTree"
            :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
            allowClear
            v-decorator="['parent_id']"
          ></a-tree-select>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="数字越小越靠前">
          <a-input-number
            :min="0"
            v-decorator="['sort', { initialValue: 100, rules: [{ required: true, message: '请输入至少1个数字' }] }]"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import * as Api from '@/api/files/group'
import _ from 'lodash'

export default {
  props: {
    // 分组列表
    groupList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      // 对话框标题
      title: '',
      // 标签布局属性
      labelCol: {
        span: 7
      },
      // 输入框布局属性
      wrapperCol: {
        span: 13
      },
      // modal(对话框)是否可见
      visible: false,
      // modal(对话框)确定按钮 loading
      confirmLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),

      // 当前记录
      record: {},
      // 上级分组列表
      groupListTree: []
    }
  },
  methods: {

    // 显示对话框
    edit (record) {
      // 显示窗口
      this.visible = true
      // 当前分组记录
      this.record = record
      // 获取分组列表
      this.getGroupList()
      // 设置默认值
      this.setFieldsValue()
    },

    // 设置默认值
    setFieldsValue () {
      const { $nextTick, form: { setFieldsValue } } = this
      $nextTick(() => {
        setFieldsValue(_.pick(this.record, ['name', 'parent_id', 'sort']))
      })
    },

    // 获取分组列表
    getGroupList () {
      const { groupList } = this
      // 格式化分组列表
      const selectList = this.formatTreeData(groupList)
      // 顶级分组
      selectList.unshift({
        title: '顶级分组',
        key: 0,
        value: 0
      })
      this.groupListTree = selectList
    },

    // 格式化分组列表
    formatTreeData (list, disabled = false) {
      const data = []
      list.forEach(item => {
        // 新的元素
        const newItem = {
          title: item.name,
          key: item.group_id,
          value: item.group_id
        }
        // 禁用的分组
        if (
          [item.group_id, item.parent_id].includes(this.record.group_id) ||
          disabled === true
        ) {
          newItem.disabled = true
        }
        // 递归整理子集
        if (item.children && item.children.length) {
          newItem['children'] = this.formatTreeData(item['children'], newItem.disabled)
        }
        data.push(newItem)
      })
      return data
    },

    // 确认按钮
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        // 提交到后端api
        if (!errors) {
          this.onFormSubmit(values)
        }
      })
    },

    // 关闭对话框事件
    handleCancel () {
      this.visible = false
      this.form.resetFields()
    },

    // 提交到后端api
    onFormSubmit (values) {
      this.confirmLoading = true
      Api.edit({ groupId: this.record['group_id'], form: values })
        .then(result => {
           // 显示成功
          this.$message.success(result.message, 1.5)
          // 关闭对话框事件
          this.handleCancel()
          // 通知父端组件提交完成了
          this.$emit('handleSubmit', values)
        })
        .finally(result => {
          this.confirmLoading = false
        })
    }

  }
}
</script>
