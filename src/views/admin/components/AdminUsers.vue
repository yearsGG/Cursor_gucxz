<template>
  <div class="admin-users">
    <h2>用户管理</h2>
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="头像" width="100">
        <template #default="{ row }">
          <el-avatar 
            :size="32"
            :src="getAvatarUrl(row.avatar)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : ''">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="row.role === 'admin'"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select 
            v-model="userForm.role"
            :disabled="currentUser?.role === 'admin'"
          >
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const users = ref([])
const dialogVisible = ref(false)
const currentUser = ref(null)
const formRef = ref(null)
const submitting = ref(false)

const userForm = reactive({
  email: '',
  phone: '',
  role: 'user'
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/admin/users')
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const handleEdit = (row) => {
  currentUser.value = row
  Object.assign(userForm, {
    email: row.email,
    phone: row.phone,
    role: row.role
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await axios.put(`/api/admin/users/${currentUser.value.id}`, userForm)
    
    ElMessage.success('更新成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.username} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.delete(`/api/admin/users/${row.id}`)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 获取头像URL的方法
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return '/images/default-avatar.png'
  }
  // 确保不会有重复的路径前缀
  const cleanPath = avatar.replace('/uploads/avatars/', '')
  return `/uploads/avatars/${cleanPath}`
}

fetchUsers()
</script>

<style scoped>
.admin-users {
  padding: 20px;
}

.el-tag {
  text-transform: capitalize;
}

.el-form-item {
  margin-bottom: 20px;
}
</style> 