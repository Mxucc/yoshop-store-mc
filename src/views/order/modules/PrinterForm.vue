<template>
  <a-modal
    :title="title"
    :width="560"
    :visible="visible"
    :isLoading="isLoading"
    :confirmLoading="isLoading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="isLoading">
      <a-form :form="form">
        <a-form-item label="选择打印机" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            v-decorator="['printerId', { rules: [{ required: true, message: '请选择小票打印机' }] }]"
            placeholder="请选择小票打印机"
          >
            <a-select-option
              v-for="(item, index) in printerList"
              :key="index"
              :value="item.printer_id"
            >
              <span>{{ item.printer_name }}</span>
            </a-select-option>
          </a-select>
          <div class="form-item-help">
            <router-link target="_blank" :to="{ path: '/setting/printer/index' }">小票打印机管理</router-link>
          </div>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import * as Api from '@/api/order/event'
import * as PrinterApi from '@/api/setting/printer'

export default {
  data () {
    return {
      // 对话框标题
      title: '小票打印',
      // 标签布局属性
      labelCol: { span: 7 },
      // 输入框布局属性
      wrapperCol: { span: 13 },
      // modal(对话框)是否可见
      visible: false,
      // modal(对话框)确定按钮 loading
      isLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 打印机列表
      printerList: [],
      // 当前记录
      record: {}
    }
  },
  created () {
    // 获取打印机列表
    this.getPrinterList()
  },
  methods: {

    // 显示对话框
    show (record) {
      // 显示窗口
      this.visible = true
      // 当前记录
      this.record = record
    },

    // 获取打印机列表
    getPrinterList () {
      this.isLoading = true
      PrinterApi.all()
        .then(result => {
          this.printerList = result.data.list
        })
        .finally(() => this.isLoading = false)
    },

    // 确认按钮
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        // 提交到后端api
        !errors && this.onFormSubmit(values)
      })
    },

    // 关闭对话框事件
    handleCancel () {
      this.visible = false
      this.form.resetFields()
    },

    // 提交到后端api
    onFormSubmit (values) {
      this.isLoading = true
      Api.printer({ orderId: this.record.order_id, form: values })
        .then(result => {
          // 显示成功
          this.$message.success(result.message, 1.5)
          // 关闭对话框事件
          this.handleCancel()
          // 通知父端组件提交完成了
          this.$emit('handleSubmit', values)
        })
        .finally(() => this.isLoading = false)
    }

  }
}
</script>
