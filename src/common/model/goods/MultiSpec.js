
import _ from 'lodash'
import { debounce, isEmpty } from '@/utils/util'

// 默认的sku字段属性
const defaultColumns = [
  {
    title: '预览图',
    dataIndex: 'image',
    width: 90,
    scopedSlots: { customRender: 'image' }
  },
  {
    title: '商品价格',
    dataIndex: 'goods_price',
    width: 120,
    scopedSlots: { customRender: 'goods_price' }
  },
  {
    title: '划线价格',
    dataIndex: 'line_price',
    width: 120,
    scopedSlots: { customRender: 'line_price' }
  },
  {
    title: '库存数量',
    dataIndex: 'stock_num',
    width: 120,
    scopedSlots: { customRender: 'stock_num' }
  },
  {
    title: '商品重量 (KG)',
    dataIndex: 'goods_weight',
    width: 120,
    scopedSlots: { customRender: 'goods_weight' }
  },
  {
    title: 'SKU编码',
    dataIndex: 'goods_sku_no',
    width: 140,
    scopedSlots: { customRender: 'goods_sku_no' }
  }
]

// 默认的sku记录值
const defaultSkuItemData = {
  image_id: 0,
  image: {},
  // imageList: [],
  goods_price: '',
  line_price: '',
  stock_num: '',
  goods_weight: '',
  goods_sku_no: ''
}

// const demoSpecList = [
//   {
//     key: 0,
//     spec_name: '颜色',
//     valueList: [
//       { key: 0, groupKey: 0, /* spec_value_id: 10001, */ spec_value: '红色' },
//       { key: 1, groupKey: 0, spec_value: '白色' },
//       { key: 2, groupKey: 0, spec_value: '蓝色' }
//     ]
//   },
//   {
//     key: 1,
//     spec_name: '尺码',
//     valueList: [
//       { key: 0, groupKey: 1, spec_value: 'XXL' },
//       { key: 1, groupKey: 1, spec_value: 'XL' }
//     ]
//   }
// ]

/**
 * 商品 model类
 * GoodsModel
 */
export default class MultiSpec {
  // 商品多规格数据
  multiSpecData = {}

  // 错误信息
  error = '';

  /**
   * 构造方法
   * @param {array} specList 规格列表
   * @param {array} skuList SKU列表
   */
  constructor () {
    this.multiSpecData = {
      // 是否是多选规格
      isMulti: false,
      // 规格列表
      specList: [],
      // SKU列表
      skuList: [],
      // SKU字段
      skuColumns: _.cloneDeep(defaultColumns),
      // 批量设置sku
      skuBatchForm: _.cloneDeep(defaultSkuItemData)
    }
  }

  // 生成并获取多规格数据
  getData (specList = [], skuList = []) {
    if (specList.length) {
      this.multiSpecData.specList = _.cloneDeep(specList)
      this.multiSpecData.skuList = _.cloneDeep(skuList)
    }
    // 整理所有的规格组
    const specGroupArr = this.specGroupArr()
    // sku记录的规格属性集(生成笛卡尔积)
    const cartesianList = cartesianProductOf(specGroupArr)
    // 合并单元格
    const rowSpanArr = this.rowSpanArr(specGroupArr, cartesianList)
    // 生成sku字段名
    this.buildSkuColumns(rowSpanArr)
    // 生成sku列表数据
    this.buildSkuList(cartesianList)
    // 返回多规格数据
    return this.multiSpecData
  }

  // 数据是否为空
  isEmpty () {
    return this.multiSpecData.specList.length === 0
  }

  // 返回错误信息
  getError () {
    return this.error
  }

  // 整理所有的规格
  specGroupArr () {
    const specGroupArr = []
    this.multiSpecData.specList.forEach(specGroup => {
      const itemArr = []
      specGroup.valueList.forEach(value => {
        itemArr.push(value)
      })
      specGroupArr.push(itemArr)
    })
    return specGroupArr
  }

  // 合并单元格
  rowSpanArr (specGroupArr, cartesianList) {
    const rowSpanArr = []
    var rowSpan = cartesianList.length
    for (let i = 0; i < specGroupArr.length; i++) {
      rowSpanArr[i] = parseInt(rowSpan / specGroupArr[i].length)
      rowSpan = rowSpanArr[i]
    }
    return rowSpanArr
  }

  // 生成skuList
  buildSkuList (cartesianList) {
    // 生成新的skuList
    const newSkuList = []
    // 遍历规格组
    this.multiSpecData.specList.forEach((specGroup, groupIndex) => {
      // 遍历规格值
      specGroup.valueList.forEach((specValue, valueIndex) => {
        const newSkuItem = {
          ...defaultSkuItemData,
          key: newSkuList.length,
          // tempId用于合并旧记录
          tempId: `${specGroup.spec_name}_${specValue.spec_value}`,
          // skuKeys用于传参给后端
          skuKeys: [{
            groupKey: specGroup.key,
            valueKey: specValue.key
          }],
          spec_group_name: specGroup.spec_name,
          spec_value: specValue.spec_value
        }
        newSkuList.push(newSkuItem)
      })
    })
    // 兼容旧的sku数据
    this.multiSpecData.skuList = this.oldSkuList(newSkuList)
  }

  // 合并已存在的sku数据
  oldSkuList (newSkuList) {
    // const oldSkuList = _.cloneDeep(this.multiSpecData.skuList)
    const oldSkuList = this.multiSpecData.skuList.concat()
    if (!oldSkuList.length || !newSkuList.length) {
      return newSkuList
    }
    for (const index in newSkuList) {
      // 查找符合的旧记录
      let oldSkuItem = {}
      if (oldSkuList.length === newSkuList.length) {
        oldSkuItem = _.cloneDeep(oldSkuList[index])
      } else {
        oldSkuItem = oldSkuList.find(item => item.tempId === newSkuList[index].tempId)
      }
      // 写入新纪录
      if (oldSkuItem) {
        newSkuList[index] = {
          ...newSkuList[index],
          ..._.pick(oldSkuItem, Object.keys(defaultSkuItemData))
        }
        // console.log(newSkuList[index].image)
      }
    }
    return newSkuList
  }

  // 生成sku表格字段名
  buildSkuColumns (rowSpanArr) {
    const newColumns = [
      {
        title: '规格组',
        dataIndex: 'spec_group_name',
        width: 120
      },
      {
        title: '规格值',
        dataIndex: 'spec_value',
        width: 120
      },
      {
        title: '预览图',
        dataIndex: 'image',
        width: 90,
        scopedSlots: { customRender: 'image' }
      },
      {
        title: '商品价格',
        dataIndex: 'goods_price',
        width: 120,
        scopedSlots: { customRender: 'goods_price' }
      },
      {
        title: '划线价格',
        dataIndex: 'line_price',
        width: 120,
        scopedSlots: { customRender: 'line_price' }
      },
      {
        title: '库存数量',
        dataIndex: 'stock_num',
        width: 120,
        scopedSlots: { customRender: 'stock_num' }
      },
      {
        title: '商品重量 (KG)',
        dataIndex: 'goods_weight',
        width: 120,
        scopedSlots: { customRender: 'goods_weight' }
      },
      {
        title: 'SKU编码',
        dataIndex: 'goods_sku_no',
        width: 140,
        scopedSlots: { customRender: 'goods_sku_no' }
      }
    ]
    this.multiSpecData.skuColumns = newColumns
  }

  // 添加规格组
  handleAddSpecGroup () {
    const specList = this.multiSpecData.specList
    specList.push({
      key: specList.length || 0,
      spec_name: '',
      spec_type: 'text', // 默认为文本类型 多了个date类型
      valueList: []
    })
    // 默认规格值
    const groupIndex = specList.length - 1
    this.handleAddSpecValue(groupIndex)
  }

  // 添加规格值
  handleAddSpecValue (groupIndex) {
    const specGroupItem = this.multiSpecData.specList[groupIndex]
    const specValueList = specGroupItem.valueList
    const newSpecValue = {
      key: specValueList.length || 0,
      groupKey: specGroupItem.key,
      spec_value: ''
    }
    // 如果是日期类型，添加spec_date属性
    if (specGroupItem.spec_type === 'date') {
      newSpecValue.spec_date = null
    }
    specValueList.push(newSpecValue)
    // 刷新规格值的key
    this.onRefreshSpecValueKey(groupIndex)
  }

  // 删除规格组
  handleDeleteSpecGroup (groupIndex) {
    this.multiSpecData.specList.splice(groupIndex, 1)
    this.onUpdate(false)
  }

  // 删除规格值
  handleDeleteSpecValue (groupIndex, valueIndex) {
    // 将规格值移出
    this.multiSpecData.specList[groupIndex].valueList.splice(valueIndex, 1)
    // 刷新规格值的key
    this.onRefreshSpecValueKey(groupIndex)
    this.onUpdate(false)
  }

  // 刷新规格值的key
  onRefreshSpecValueKey (groupIndex) {
    const specGroupItem = this.multiSpecData.specList[groupIndex]
    const specValueList = specGroupItem.valueList
    specValueList.forEach((item, index) => {
      specValueList[index].key = index
    })
  }

  // 批量设置sku事件
  handleSkuBatch () {
    const skuBatchForm = this.getFilterObject(this.multiSpecData.skuBatchForm)
    const skuList = this.multiSpecData.skuList
    // if (!skuBatchForm.image_id) {
    //   delete skuBatchForm.image
    // }
    console.log('skuBatchForm', skuBatchForm)
    for (const index in skuList) {
      skuList[index] = { ...skuList[index], ...skuBatchForm }
    }
    this.onUpdate(false)
  }

  /**
   * 过滤对象的空元素
   * (仅支持一维对象)
   * @param {object} object 源对象
   * @returns {object}
   */
  getFilterObject (object) {
    const newObj = {}
    for (const key in object) {
      const value = object[key]
      // value === 0 可以不过滤image_id为0的情况
      // if (!isEmpty(value) || value === 0) {
      //   newObj[key] = value
      // }
      if (!isEmpty(value)) {
        newObj[key] = value
      }
    }
    return newObj
  }

  // 表单验证
  verifyForm () {
    // 验证规格
    if (!this.verifySpec()) {
      return false
    }
    // 验证sku
    if (!this.verifySkuList()) {
      return false
    }
    return true
  }

  // 验证sku
  verifySkuList () {
    const columns = [
      { field: 'goods_price', name: '商品价格' },
      { field: 'stock_num', name: '库存数量' },
      { field: 'goods_weight', name: '商品重量' }
    ]
    const skuList = this.multiSpecData.skuList
    for (const skuIndex in skuList) {
      const skuItem = skuList[skuIndex]
      for (const colIndex in columns) {
        const value = skuItem[columns[colIndex].field]
        if (value === '' || value === null) {
          this.error = `${columns[colIndex].name}不能为空`
          return false
        }
      }
    }
    return true
  }

  // 验证规格
  verifySpec () {
    const specList = this.multiSpecData.specList
    if (!specList.length) {
      this.error = '亲，还没有添加规格组~'
      return false
    }
    for (const index in specList) {
      // 验证规格组
      const specGroup = specList[index]
      if (isEmpty(specGroup.spec_name)) {
        this.error = '规格组名称不能为空~'
        return false
      }
      // 验证规格值
      const valueList = specGroup.valueList
      if (!valueList.length) {
        this.error = '还没有添加规格值~'
        return false
      }
      for (const i in valueList) {
        if (isEmpty(valueList[i].spec_value)) {
          this.error = '规格值不能为空~'
          return false
        }
      }
    }
    return true
  }

  // 获取规格及SKU信息(表单提交)
  getFromSpecData () {
    const { multiSpecData: { specList, skuList } } = this
    const specData = {
      specList: _.cloneDeep(specList),
      skuList: _.cloneDeep(skuList)
    }
    for (const skuIndex in specData.skuList) {
      const skuItem = specData.skuList[skuIndex]
      delete skuItem.image
      // delete skuItem.imageList
      delete skuItem.key
    }
    return specData
  }

  /**
   * 使用防抖节流方式刷新sku列表
   * @param {boolean} isDebounce 如果true则使用防抖函数
   */
  onUpdate (isDebounce = true) {
    if (isDebounce) {
      debounce(getDataForDebounce, 200)(this)
    } else {
      getDataForDebounce(this)
    }
  }
}

// onUpdate调用的逻辑方法
const getDataForDebounce = MultiSpecModel => {
  return MultiSpecModel.getData()
}

/**
 * 生成笛卡尔积数据
 * cartesianProductOf([arr1, arr2, arr3 ...])
 */
const cartesianProductOf = arrays => {
  if (!arrays.length) {
    return []
  }
  return Array.prototype.reduce.call(arrays, (arr1, arr2) => {
    var ret = []
    arr1.forEach(v1 => {
      arr2.forEach(v2 => {
        ret.push(v1.concat([v2]))
      })
    })
    return ret
  }, [[]])
}
