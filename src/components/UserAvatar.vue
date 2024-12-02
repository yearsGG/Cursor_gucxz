<template>
  <div class="user-avatar">
    <img 
      :src="avatarUrl || '/default-avatar.png'" 
      :alt="username"
      class="avatar-image"
    >
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'UserAvatar',
  props: {
    username: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const avatarUrl = ref('')

    const fetchAvatar = async () => {
      try {
        const response = await axios.get(`/api/users/${props.username}/avatar`)
        avatarUrl.value = response.data.avatarUrl
      } catch (error) {
        console.error('获取头像失败:', error)
      }
    }

    onMounted(() => {
      fetchAvatar()
    })

    return {
      avatarUrl
    }
  }
}
</script>

<style scoped>
.user-avatar {
  display: inline-block;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
</style> 