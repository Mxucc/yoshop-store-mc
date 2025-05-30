<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-spin :spinning="isLoading">
      <a-form :form="form" @submit="handleSubmit" :selfUpdate="true">
        <a-tabs :activeKey="tabKey" :tabBarStyle="{ marginBottom: '30px' }" @change="handleTabs">
          <a-tab-pane :key="0" tab="基本信息"></a-tab-pane>
          <a-tab-pane :key="1" tab="规格/库存"></a-tab-pane>
          <a-tab-pane :key="2" tab="商品详情"></a-tab-pane>
          <a-tab-pane :key="3" tab="更多设置"></a-tab-pane>
        </a-tabs>
        <div class="tabs-content">
          <!-- 基本信息 -->
          <div class="tab-pane" v-show="tabKey == 0">
            <a-form-item label="商品类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <GoodsType
                :onlyShowChecked="true"
                v-decorator="['goods_type', { rules: [{ required: true }] }]"
                @change="onForceUpdate(true)"
              />
            </a-form-item>
            <a-form-item label="商品名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                placeholder="请输入商品名称"
                v-decorator="['goods_name', { rules: [{ required: true, min: 2, message: '请输入至少2个字符' }] }]"
              />
            </a-form-item>
            <a-form-item label="商品分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-tree-select
                placeholder="请选择商品分类"
                :dropdownStyle="{ maxHeight: '500px', overflow: 'auto' }"
                :treeData="formData.categoryList"
                treeCheckable
                treeCheckStrictly
                allowClear
                v-decorator="['categorys', { rules: [{ required: true, message: '请至少选择1个商品分类' }] }]"
              ></a-tree-select>
              <div class="form-item-help">
                <router-link target="_blank" :to="{ path: '/goods/category/index' }">去新增</router-link>
                <a href="javascript:;" @click="onReloadCategoryList">刷新</a>
              </div>
            </a-form-item>
            <a-form-item
              label="商品图片"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              extra="建议尺寸：750*750像素, 最多上传10张, 可拖拽图片调整顺序, 第1张将作为商品首图"
            >
              <SelectImage
                multiple
                :maxNum="10"
                :defaultList="formData.goods.goods_images"
                v-decorator="['imagesIds', { rules: [{ required: true, message: '请至少上传1张商品图片' }] }]"
              />
            </a-form-item>
            <a-form-item label="商品编码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入商品编码" v-decorator="['goods_no']" />
            </a-form-item>
            <a-form-item
              v-if="form.getFieldValue('goods_type') == 10"
              v-show="false"
              label="配送方式"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-radio-group
                v-decorator="['is_ind_delivery_type', { initialValue: 0, rules: [{ required: true }] }]"
                @change="onForceUpdate()"
              >
                <a-radio :value="0">系统默认</a-radio>
                <a-radio :value="1">单独配置</a-radio>
              </a-radio-group>
              <div v-show="form.getFieldValue('is_ind_delivery_type')">
                <a-form-item extra="需在 [设置 - 配送方式] 中，开启支持的配送方式才可生效">
                  <a-checkbox-group
                    :options="[{ label: '快递配送', value: 10 }]"
                    v-decorator="['delivery_type', { initialValue: [10], rules: [{ required: true, message: '配送方式至少选择一个' }] }]"
                  />
                </a-form-item>
              </div>
            </a-form-item>
            <a-form-item
              v-if="form.getFieldValue('goods_type') == 10"
              label="运费模板"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select
                style="width: 300px"
                v-decorator="['delivery_id', { rules: [{ required: true, message: '请选择运费模板' }] }]"
                placeholder="请选择运费模板"
              >
                <a-select-option
                  v-for="(item, index) in formData.deliveryList"
                  :key="index"
                  :value="item.delivery_id"
                >{{ item.name }}</a-select-option>
              </a-select>
              <div class="form-item-help">
                <router-link
                  target="_blank"
                  :to="{ path: '/setting/delivery/template/create' }"
                >新增模板</router-link>
                <a href="javascript:;" @click="onReloadDeliveryList">刷新</a>
              </div>
            </a-form-item>
            <a-form-item label="商品状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                v-decorator="['status', { initialValue: 10, rules: [{ required: true }] }]"
              >
                <a-radio :value="10">上架</a-radio>
                <a-radio :value="20">下架</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="商品排序" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="数字越小越靠前">
              <a-input-number
                :min="0"
                v-decorator="['sort', { initialValue: 100, rules: [{ required: true }] }]"
              />
            </a-form-item>
          </div>

          <!-- 规格/库存 -->
          <div class="tab-pane" v-show="tabKey == 1">
            <a-form-item label="规格类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                v-decorator="['spec_type', { initialValue: 10, rules: [{ required: true }] }]"
                @change="onForceUpdate()"
              >
                <a-radio :value="10" :disabled="formData.goods.isSpecLocked">单规格</a-radio>
                <a-radio :value="20" :disabled="formData.goods.isSpecLocked">多选多规格</a-radio>
                <a-radio :value="30" :disabled="formData.goods.isSpecLocked">单选多规格</a-radio>
              </a-radio-group>
              <p v-if="formData.goods.isSpecLocked" class="form-item-help">
                <small class="c-red">注：该商品当前正在参与其他活动，商品规格不允许更改</small>
              </p>
            </a-form-item>
            <!-- 多规格的表单内容 -->
            <div v-if="form.getFieldValue('spec_type') == 20 || form.getFieldValue('spec_type') == 30">
              <MultiSpec
                ref="MultiSpec"
                :isSpecLocked="formData.goods.isSpecLocked"
                :defaultSpecList="formData.goods.specList"
                :defaultSkuList="formData.goods.skuList"
              />
            </div>
            <!-- 单规格的表单内容 -->
            <div v-if="form.getFieldValue('spec_type') == 10">
              <a-form-item
                label="商品价格"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="商品的实际购买金额，最低0.01"
              >
                <a-input-number
                  :min="0.01"
                  :precision="2"
                  v-decorator="['goods_price', { rules: [{ required: true, message: '请输入商品价格' }] }]"
                />
                <span class="ml-10">元</span>
              </a-form-item>
              <a-form-item
                label="划线价"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="划线价仅用于商品页展示"
              >
                <a-input-number :min="0" :precision="2" v-decorator="['line_price']" />
                <span class="ml-10">元</span>
              </a-form-item>
              <a-form-item
                label="当前库存数量"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="商品的实际库存数量，为0时用户无法下单"
              >
                <a-input-number
                  :min="0"
                  :precision="0"
                  v-decorator="['stock_num', { initialValue: 100, rules: [{ required: true, message: '请输入库存数量' }] }]"
                />
                <span class="ml-10">件</span>
              </a-form-item>
              <a-form-item
                label="商品重量"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="商品的实际重量，用于计算运费"
              >
                <a-input-number
                  :min="0"
                  v-decorator="['goods_weight', { initialValue: 0, rules: [{ required: true, message: '请输入库存数量' }] }]"
                />
                <span class="ml-10">千克 (Kg)</span>
              </a-form-item>
            </div>
            <a-form-item label="库存计算方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                v-decorator="['deduct_stock_type', { initialValue: 10, rules: [{ required: true }] }]"
              >
                <a-radio :value="10">下单减库存</a-radio>
                <a-radio :value="20">付款减库存</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item
              label="商品限购"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              extra="用于限制每人购买该商品的数量"
            >
              <a-radio-group
                v-decorator="['is_restrict', { initialValue: 0, rules: [{ required: true }] }]"
                @change="onForceUpdate()"
              >
                <a-radio :value="0">关闭</a-radio>
                <a-radio :value="1">开启</a-radio>
              </a-radio-group>
              <div class="mt-10" v-if="form.getFieldValue('is_restrict')">
                <a-form-item>
                  <span class="mr-10">总限购</span>
                  <a-input-number
                    :min="1"
                    :precision="0"
                    v-decorator="['restrict_total', { rules: [{ required: true, message: '请输入总限购数量' }] }]"
                  />
                  <span class="ml-10">件/人</span>
                </a-form-item>
                <a-form-item>
                  <span class="mr-10">每单限购</span>
                  <a-input-number
                    :min="1"
                    :precision="0"
                    v-decorator="['restrict_single', { rules: [{ required: true, message: '请输入每单限购数量' }] }]"
                  />
                  <span class="ml-10">件/人</span>
                </a-form-item>
              </div>
            </a-form-item>
          </div>
          <!-- 商品详情 -->
          <div class="tab-pane" v-show="tabKey == 2">
            <a-form-item label="固定详情内容" :labelCol="labelCol" :wrapperCol="{span: 16}">
              <Ueditor
                v-model="content.text"
                :config="{}"
              />
            </a-form-item>
            <a-form-item label="分段内容" :labelCol="labelCol" :wrapperCol="{span: 16}">
              <div v-for="(section, index) in content.list" :key="index" class="content-section">
                <div class="section-header" style="margin-bottom: 15px;">
                  <a-input
                    v-model="section.title"
                    placeholder="请输入分段标题"
                    style="width: 200px; margin-right: 10px;"
                  />
                  <a-button
                    type="link"
                    icon="delete"
                    @click="removeSection(index)"
                    v-if="content.list.length > 1"
                  >删除分段</a-button>
                </div>
                <Ueditor
                  v-model="section.content"
                  :config="{}"
                />
              </div>
              <div style="margin-top: 15px;">
                <a-button type="dashed" block @click="addSection">
                  <a-icon type="plus" />添加分段
                </a-button>
              </div>
            </a-form-item>
            <a-form-item label="尾部声明" :labelCol="labelCol" :wrapperCol="{span: 16}">
              <Ueditor
                v-model="content.end"
                :config="{}"
              />
            </a-form-item>
          </div>

          <!-- 更多设置 -->
          <div class="tab-pane" v-show="tabKey == 3">
            <a-form-item
              label="主图视频"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              extra="建议视频宽高比16:9，建议时长8-45秒"
            >
              <SelectVideo
                :multiple="false"
                :defaultList="formData.goods.video ? [formData.goods.video] : []"
                v-decorator="['video_id']"
              />
            </a-form-item>
            <a-form-item
              label="视频封面"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              extra="建议尺寸：750像素*750像素"
            >
              <SelectImage
                :multiple="false"
                :defaultList="formData.goods.videoCover ? [formData.goods.videoCover] : []"
                v-decorator="['video_cover_id']"
              />
            </a-form-item>
            <a-form-item
              label="商品卖点"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              extra="一句话简述，例如：此款商品美观大方 性价比较高 不容错过"
            >
              <a-input placeholder="请输入商品卖点" v-decorator="['selling_point']" />
            </a-form-item>
            <a-form-item label="服务与承诺" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select
                v-if="formData.serviceList"
                mode="multiple"
                v-decorator="['serviceIds']"
                placeholder="请选择服务与承诺"
              >
                <a-select-option
                  v-for="(item, index) in formData.serviceList"
                  :key="index"
                  :value="item.service_id"
                >{{ item.name }}</a-select-option>
              </a-select>
              <div class="form-item-help">
                <router-link target="_blank" :to="{ path: '/goods/service/index' }">去新增</router-link>
                <a href="javascript:;" @click="onReloadServiceList">刷新</a>
              </div>
            </a-form-item>
            <a-form-item
              label="初始销量"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              extra="用户端展示的销量 = 初始销量 + 实际销量"
            >
              <a-input-number v-decorator="['sales_initial', { initialValue: 0}]" />
            </a-form-item>

            <div v-show="$module('market-points')">
              <a-divider orientation="left">积分设置</a-divider>
              <a-form-item
                label="积分赠送"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="开启后用户购买此商品将获得积分"
              >
                <a-radio-group
                  v-decorator="['is_points_gift', { initialValue: 1, rules: [{ required: true }] }]"
                >
                  <a-radio :value="1">开启</a-radio>
                  <a-radio :value="0">关闭</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="积分抵扣"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="开启后用户购买此商品可以使用积分进行抵扣"
              >
                <a-radio-group
                  v-decorator="['is_points_discount', { initialValue: 1, rules: [{ required: true }] }]"
                >
                  <a-radio :value="1">开启</a-radio>
                  <a-radio :value="0">关闭</a-radio>
                </a-radio-group>
              </a-form-item>
            </div>

            <div v-show="$module('user-grade')">
              <a-divider orientation="left">会员折扣设置</a-divider>
              <a-form-item
                label="会员折扣"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                extra="开启后会员折扣，会员购买此商品可以享受会员等级折扣价"
              >
                <a-radio-group
                  v-decorator="['is_enable_grade', { initialValue: 1, rules: [{ required: true }] }]"
                  @change="onForceUpdate(true)"
                >
                  <a-radio :value="1">开启</a-radio>
                  <a-radio :value="0">关闭</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                v-show="form.getFieldValue('is_enable_grade')"
                label="会员折扣设置"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-radio-group
                  v-decorator="['is_alone_grade', { initialValue: 0, rules: [{ required: true }] }]"
                  @change="onForceUpdate(true)"
                >
                  <a-radio :value="0">默认等级折扣</a-radio>
                  <a-radio :value="1">单独设置折扣</a-radio>
                </a-radio-group>
                <!-- 会员等级列表 -->
                <div v-show="form.getFieldValue('is_alone_grade')">
                  <a-form-item v-for="item in formData.userGradeList" :key="item.grade_id">
                    <InputNumberGroup
                      :addonBefore="item.name"
                      addonAfter="折"
                      :inputProps="{ min: 0, max: 9.9 }"
                      v-decorator="[`alone_grade_equity[grade_id:${item.grade_id}]`, {
                      initialValue: formData.defaultUserGradeValue[item.grade_id], rules: [{ required: true, message: '折扣率不能为空'}]
                    }]"
                    />
                  </a-form-item>
                </div>
                <div class="form-item-help">
                  <p
                    class="extra"
                    v-if="form.getFieldValue('is_alone_grade')"
                  >单独折扣：折扣率范围0.0-9.9，例如: 9.8代表98折，0代表不折扣</p>
                  <p class="extra" v-else>默认折扣：默认为用户所属会员等级的折扣率</p>
                </div>
              </a-form-item>
            </div>
          </div>
        </div>
        <a-form-item class="mt-20" :wrapperCol="{ span: wrapperCol.span, offset: labelCol.span }">
          <a-button type="primary" html-type="submit" :loading="isBtnLoading">提交</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-card>
</template>

<script>
import * as GoodsApi from '@/api/goods'
import { SelectImage, SelectVideo, Ueditor, InputNumberGroup } from '@/components'
import GoodsModel from '@/common/model/goods/Index'
import { GoodsType, MultiSpec } from './modules'
import { isEmptyObject } from '@/utils/util'

export default {
  name: 'GoodsUpdate',
  components: {
    GoodsType,
    SelectImage,
    SelectVideo,
    Ueditor,
    InputNumberGroup,
    MultiSpec
  },
  data () {
    return {
      // 默认的标签索引
      tabKey: 0,
      // 标签布局属性
      labelCol: { span: 3 },
      // 输入框布局属性
      wrapperCol: { span: 10 },
      // loading状态
      isLoading: false,
      isBtnLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 商品ID
      goodsId: null,
      // 商品详情
      content: {
        text: '', // 固定详情内容
        list: [{ // 分段内容
          title: '',
          content: ''
        }],
        end: '' // 尾部声明
      },
      // 表单数据
      formData: GoodsModel.formData
    }
  },
  created () {
    // 初始化数据
    this.initData()
  },
  beforeDestroy () {
    // 销毁商品详情
    GoodsModel.formData.goods = {}
  },
  methods: {
    // 添加新的内容分段
    addSection () {
      this.content.list.push({
        title: '',
        content: ''
      })
    },

    // 删除内容分段
    removeSection (index) {
      this.content.list.splice(index, 1)
    },

    // 获取所有内容
    getcontent () {
      return {
        text: this.content.text,
        list: this.content.list.map(section => ({
          title: section.title,
          content: section.content
        })),
        end: this.content.end
      }
    },

    // 初始化数据
    initData () {
      // 记录商品ID
      this.goodsId = this.$route.query.goodsId
      // 获取form所需的数据
      this.isLoading = true
      GoodsModel.getFromData(this.goodsId)
        .then(() => {
          // 初始化商品详情内容
          if (GoodsModel.formData.goods.content) {
            // 处理旧数据格式兼容
            if (Array.isArray(GoodsModel.formData.goods.content)) {
              this.content = {
                text: '',
                list: GoodsModel.formData.goods.content,
                end: ''
              }
            } else {
              this.content = GoodsModel.formData.goods.content
            }
          }
          // 商品表单数据
          if (!isEmptyObject(this.form.getFieldsValue())) {
            // 第一次赋值
            this.form.setFieldsValue(GoodsModel.getFieldsValue())
            // 第二次赋值 (适用于动态渲染的form-item)
            this.$nextTick(() => {
              this.form.setFieldsValue(GoodsModel.getFieldsValue2())
              this.onForceUpdate()
            })
          }
          this.isLoading = false
        })
    },

    // 手动强制更新页面
    onForceUpdate (bool = false) {
      this.$forceUpdate()
      // bool为true时再执行一次 $forceUpdate, 特殊情况下需执行两次，原因如下：
      // 第一次执行 $forceUpdate时, 新元素绑定v-decorator无法获取到form.getFieldValue
      bool && setTimeout(() => {
        this.$forceUpdate()
      }, 10)
    },

    // 切换tab选项卡
    handleTabs (key) {
      this.tabKey = key
    },

    // 刷新分类列表
    onReloadCategoryList () {
      this.isLoading = true
      GoodsModel.getCategoryList().then(() => {
        this.isLoading = false
      })
    },

    // 刷新服务与承诺列表
    onReloadServiceList () {
      this.isLoading = true
      GoodsModel.getServiceList().then(() => {
        this.isLoading = false
      })
    },

    // 刷新配送模板列表
    onReloadDeliveryList () {
      this.isLoading = true
      GoodsModel.getDeliveryList().then(() => {
        this.isLoading = false
      })
    },

    // 确认按钮
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        // 定位到错误的tab选项卡
        if (errors) {
          this.onTargetTabError(errors)
          return false
        }
        // 验证多规格
        if (values.spec_type === 20 || values.spec_type === 30) {
          const MultiSpec = this.$refs.MultiSpec
          if (!MultiSpec.verifyForm()) {
            this.tabKey = 1
            return false
          }
          // 记录多规格数据
          values.specData = MultiSpec.getFromSpecData()
        }
        // 验证商品详情分段
        if (this.content.list.length === 0) {
          this.$message.error('请至少添加一个商品详情分段')
          this.tabKey = 2
          return false
        }
        // 检查每个分段是否有内容
        const emptySection = this.content.list.find(section => !section.content)
        if (emptySection) {
          this.$message.error('商品详情分段内容不能为空')
          this.tabKey = 2
          return false
        }
        // 处理商品详情内容
        values.content = {
          text: this.content.text || '',
          list: this.content.list.map(section => ({
            title: section.title || '',
            content: section.content || ''
          })),
          end: this.content.end || ''
        }
        // 整理商品分类ID集
        values.categoryIds = values.categorys.map(item => item.value)
        delete values.categorys
        // 提交到后端api
        this.onFormSubmit(values)
        return true
      })
    },

    // 定位到错误的tab选项卡
    onTargetTabError (errors) {
      // 表单字段与tabKey对应关系
      // 只需要必填字段就可
      const tabsFieldsMap = [
        ['goods_type', 'goods_name', 'categorys', 'imagesIds', 'delivery_id', 'is_ind_delivery_type', 'delivery_type'],
        ['spec_type', 'goods_price', 'is_restrict', 'restrict_total', 'restrict_single'],
        ['content'],
        ['alone_grade_equity', 'first_money', 'second_money', 'third_money']
      ]
      const field = Object.keys(errors).shift()
      for (const key in tabsFieldsMap) {
        if (tabsFieldsMap[key].indexOf(field) > -1) {
          this.tabKey = parseInt(key)
          break
        }
      }
    },

    // 提交到后端api
    onFormSubmit (values) {
      this.isLoading = true
      this.isBtnLoading = true
      GoodsApi.edit({ goodsId: this.goodsId, form: values })
        .then(result => {
          // 显示提示信息
          this.$message.success(result.message, 1.5)
          // 跳转到列表页
          setTimeout(() => {
            this.$router.push('./index')
          }, 1500)
        })
        .catch(() => {
          this.isBtnLoading = false
        })
        .finally(() => this.isLoading = false)
    }

  }
}

</script>
<style lang="less" scoped>
@import './style.less';
</style>