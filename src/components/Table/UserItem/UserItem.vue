<template>
  <div v-if="user" class="user-info clearfix">
    <div class="in-left">
      <a-tooltip>
        <template v-if="user.user_id" slot="title">会员ID: {{ user.user_id }}</template>
        <img
          v-if="user.avatar_url || user.avatar"
          :src="user.avatar_url || user.avatar.preview_url"
          alt="会员头像"
        />
        <img v-else src="~@/assets/img/default-avatar.png" alt="会员头像" />
      </a-tooltip>
    </div>
    <div class="in-right flex flex-dir-column flex-x-center">
      <p class="user-name oneline-hide">{{ user.nick_name }}</p>
      <p class="user-platform">
        <platform-icon :name="user.platform" :showTips="true" />
      </p>
    </div>
  </div>
</template>

<script>
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import PlatformIcon from '@/components/PlatformIcon'

// Table内容元素: 会员信息
export default {
  name: 'UserItem',
  components: {
    PlatformIcon
  },
  props: {
    // 会员信息
    user: PropTypes.object.def()
  },
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
// 会员信息
.user-info {
  width: 160px;
  height: 40px;
  line-height: 1.3;

  .in-left {
    float: left;
    margin-right: 10px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }

  .in-right {
    float: left;
    width: 100px;
    height: 100%;

    .user-name {
      margin-bottom: 2px;
    }
  }
}
</style>
