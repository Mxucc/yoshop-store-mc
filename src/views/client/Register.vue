<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-spin :spinning="isLoading">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item label="默认登录/注册方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['registerMethod', { rules: [{ required: true }] }]">
            <a-radio :value="10">手机号 + 短信验证码</a-radio>
          </a-radio-group>
          <div class="form-item-help">
            <p class="extra">
              <small>发送短信服务需要先配置</small>
              <router-link target="_blank" :to="{ path: '/setting/sms' }">短信通知设置</router-link>
            </p>
            <p class="extra">使用手机号注册可以实现多种客户端的账号统一，例如H5、微信小程序、APP，是目前最主流的方案</p>
          </div>
        </a-form-item>

        <!-- v-show="form.getFieldValue('isOauthMpweixin') == 1 && form.getFieldValue('isForceBindMpweixin') == 0" -->
        <a-form-item label="手动绑定手机号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['isManualBind', { rules: [{ required: true }] }]">
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">不显示</a-radio>
          </a-radio-group>
          <div class="form-item-help">
            <small>用户在个人中心页可以手动操作绑定手机号（仅未绑定手机号时显示）</small>
            <a-popover :title="false">
              <template slot="content">
                <img
                  class="bg-image"
                  style="width: 300px"
                  src="static/img/client/register/isManualBind.png"
                />
              </template>
              <a href="javascript:;">查看示例</a>
              <!-- 隐藏图片: 目的是预加载 -->
              <img class="hiden" src="static/img/client/register/isManualBind.png" />
            </a-popover>
          </div>
        </a-form-item>

        <div v-show="$module('client-mpWeixin')">
          <a-divider orientation="left">微信小程序授权登录</a-divider>
          <a-form-item label="一键授权登录/注册" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-radio-group v-decorator="['isOauthMpweixin', { rules: [{ required: true }] }]">
              <a-radio :value="1">
                <span>开启</span>
                <a-tag class="ml-5" color="green">推荐</a-tag>
              </a-radio>
              <a-radio :value="0">关闭</a-radio>
            </a-radio-group>
            <div class="form-item-help">
              <p class="extra">开启后在微信小程序端一键获取用户授权并登录和注册（请先配置微信小程序设置）</p>
              <p
                v-show="form.getFieldValue('isOauthMpweixin') == 0"
                class="extra c-red"
              >关闭后微信小程序端将无法获取用户的openid，同时无法使用微信支付</p>
            </div>
          </a-form-item>

          <a-form-item
            v-show="form.getFieldValue('isOauthMpweixin') == 1"
            label="填写微信头像和昵称"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-radio-group v-decorator="['isPersonalMpweixin', { rules: [{ required: true }] }]">
              <a-radio :value="1">开启</a-radio>
              <a-radio :value="0">
                <span>关闭</span>
                <a-tag class="ml-5" color="green">推荐</a-tag>
              </a-radio>
            </a-radio-group>
            <div class="form-item-help">
              <p class="extra">开启后在微信小程序端一键授权注册时要求用户填写微信头像和昵称，仅首次注册时弹出</p>
            </div>
          </a-form-item>

          <a-form-item
            v-show="form.getFieldValue('isOauthMpweixin') == 1"
            label="注册时绑定手机号"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-radio-group v-decorator="['isForceBindMpweixin', { rules: [{ required: true }] }]">
              <a-radio :value="1">
                <span>强制绑定</span>
                <a-tag class="ml-5" color="green">推荐</a-tag>
              </a-radio>
              <a-radio :value="0">不绑定</a-radio>
            </a-radio-group>
            <div class="form-item-help">
              <p class="extra">开启后在微信小程序端一键授权注册时强制绑定手机号，仅首次注册时弹出</p>
              <p
                v-show="form.getFieldValue('isForceBindMpweixin') == 0"
                class="extra c-red"
              >如果不强制绑定手机号，会造成多端情况下同一个用户注册多个账户，强烈推荐绑定手机号</p>
            </div>
          </a-form-item>

          <a-form-item
            v-show="form.getFieldValue('isOauthMpweixin') == 1 && form.getFieldValue('isForceBindMpweixin') == 1"
            label="一键获取微信手机号"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-radio-group v-decorator="['isOauthMobileMpweixin', { rules: [{ required: true }] }]">
              <a-radio :value="1">
                <span>开启</span>
                <a-tag class="ml-5" color="green">推荐</a-tag>
              </a-radio>
              <a-radio :value="0">关闭</a-radio>
            </a-radio-group>
            <div class="form-item-help">
              <p class="extra">
                <small>开启后在微信小程序端授权获取微信用户的手机号并登录和注册（请先配置微信小程序设置）</small>
                <a-popover :title="false">
                  <template slot="content">
                    <img
                      class="bg-image"
                      style="width: 300px"
                      src="static/img/client/register/isOauthMobileMpweixin.png"
                    />
                  </template>
                  <a href="javascript:;">查看示例</a>
                  <!-- 隐藏图片: 目的是预加载 -->
                  <img class="hiden" src="static/img/client/register/isOauthMobileMpweixin.png" />
                </a-popover>
              </p>
              <p v-show="form.getFieldValue('isOauthMobileMpweixin') == 1" class="extra c-red">
                <span>微信官方将于2023年8月26日起对该接口功能收费，每次成功调用收费0.03元；详情 </span>
                <a href="https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html" target="_blank">查看文档</a>
              </p>
            </div>
          </a-form-item>
        </div>

        <a-form-item :wrapperCol="{ span: wrapperCol.span, offset: labelCol.span }">
          <a-button type="primary" html-type="submit">提交</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import { isEmpty, assignment } from '@/utils/util'
import * as Api from '@/api/setting/store'
import SettingSmsSceneEnum from '@/common/enum/setting/sms/Scene'

export default {
  data () {
    return {
      SettingSmsSceneEnum,
      // 当前设置项的key
      key: 'register',
      // 标签布局属性
      labelCol: { span: 4 },
      // 输入框布局属性
      wrapperCol: { span: 10 },
      // loading状态
      isLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 当前记录详情
      record: {}
    }
  },
  beforeCreate () {
    assignment(this, { isEmpty })
  },
  // 初始化数据
  created () {
    // 获取当前详情记录
    this.getDetail()
  },
  methods: {

    // 获取当前详情记录
    getDetail () {
      this.isLoading = true
      Api.detail(this.key)
        .then(result => {
          // 当前记录
          this.record = result.data.values
          // 设置默认值
          this.setFieldsValue()
        })
        .finally(() => this.isLoading = false)
    },

    // 设置默认值
    setFieldsValue () {
      const { record, $nextTick, form } = this
      !isEmpty(form.getFieldsValue()) && $nextTick(() => {
        form.setFieldsValue(pick(record, [
          'registerMethod', 'isManualBind',
          'isOauthMpweixin', 'isPersonalMpweixin', 'isForceBindMpweixin', 'isOauthMobileMpweixin'
        ]))
      })
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

    // 提交到后端api
    onFormSubmit (values) {
      this.isLoading = true
      Api.update(this.key, { form: values })
        .then(result => this.$message.success(result.message, 1.5))
        .finally(() => this.isLoading = false)
    }

  }
}
</script>
<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 15px;
}
/deep/.ant-form-item-control {
  padding-left: 10px;

  .ant-form-item-control {
    padding-left: 0;
  }
}
.ant-divider {
  margin-top: 50px !important;
}
</style>
