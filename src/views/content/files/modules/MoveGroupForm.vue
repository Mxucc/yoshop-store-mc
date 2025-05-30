<template>
  <a-modal
    :title="title"
    :width="420"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <div class="group-tree">
        <a-tree
          v-if="groupTreeData.length"
          :selectable="true"
          :blockNode="true"
          :treeData="groupTreeData"
          :autoExpandParent="true"
          @select="onSelect"
        />
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import * as Api from '@/api/files'

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
      title: '移动到分组',
      // 标签布局属性
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      // 输入框布局属性
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      // modal(对话框)是否可见
      visible: false,
      // modal(对话框)确定按钮 loading
      confirmLoading: false,
      // 当前表单
      form: this.$form.createForm(this),

      // 文件ID集
      filesIds: {},
      // 分组列表 树状结构
      groupTreeData: [],
      // 选中的分组
      selectedKeys: []
    }
  },

  methods: {

    // 新增操作权限
    show (filesIds) {
      // 显示窗口
      this.visible = true
      this.filesIds = filesIds
      // 获取分组列表
      this.getList()
    },

    // 获取分组列表
    getList () {
      this.groupTreeData = [{
        title: '未分组',
        key: 0,
        value: 0
      }].concat(this.groupList)
    },

    // 记录选中项
    onSelect (selectedKeys) {
      this.selectedKeys = selectedKeys
    },

    // 确认按钮
    handleSubmit (e) {
      e.preventDefault()
      if (this.selectedKeys.length) {
        // 提交到后端api
        this.onFormSubmit()
      } else {
        // 关闭对话框
        this.handleCancel()
      }
    },

    // 取消按钮
    handleCancel () {
      this.visible = false
      this.form.resetFields()
    },

    // 提交到后端api
    onFormSubmit () {
      this.confirmLoading = true
      // 数据提交
      Api.moveGroup({ groupId: this.selectedKeys[0], fileIds: this.filesIds })
        .then(result => {
          // 显示成功
          this.$message.success(result.message)
          // 关闭对话框
          this.handleCancel()
          // 通知父端组件提交完成了
          this.$emit('handleSubmit')
        })
        .finally(() => this.confirmLoading = false)
    }

  }
}
</script>

<style lang="less" scoped>
// 分组列表
.group-tree {
  // width: 150px;
  height: 440px;
  overflow-y: auto;

  /deep/.ant-tree {
    display: inline-block;
    min-width: 100%;
    max-height: 380px;
    width: auto;
  }
}
</style>