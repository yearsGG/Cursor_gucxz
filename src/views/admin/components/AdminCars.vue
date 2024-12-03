<template>
  <div class="admin-cars">
    <div class="header">
      <h2>车辆管理</h2>
      <el-button type="primary" @click="showAddDialog">
        添加车辆
      </el-button>
    </div>

    <el-table :data="cars" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="图片" width="120">
        <template #default="{ row }">
          <img 
            :src="row.images?.split(',')[0]" 
            class="car-image"
            alt="车辆图片"
          >
        </template>
      </el-table-column>
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="model" label="型号" width="120" />
      <el-table-column prop="price" label="价格">
        <template #default="{ row }">
          ¥{{ row.price?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'available' ? 'success' : 'info'">
            {{ row.status === 'available' ? '有货' : '已下架' }}
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
              :type="row.status === 'discontinued' ? 'success' : 'warning'"
              @click="handleStatusChange(row)"
            >
              {{ row.status === 'discontinued' ? '上架' : '下架' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑车辆对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="60%"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <el-form 
        ref="formRef"
        :model="carForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="品牌" prop="brand_id">
          <el-select v-model="carForm.brand_id" placeholder="请选择品牌">
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="型号" prop="model">
          <el-input v-model="carForm.model" />
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number 
            v-model="carForm.price" 
            :min="0"
            :step="1000"
            :precision="2"
          />
        </el-form-item>

        <el-form-item label="年份" prop="year">
          <el-input-number 
            v-model="carForm.year" 
            :min="1900"
            :max="new Date().getFullYear() + 1"
          />
        </el-form-item>

        <el-form-item label="颜色" prop="color">
          <el-input v-model="carForm.color" />
        </el-form-item>

        <el-form-item label="里程" prop="mileage">
          <el-input-number 
            v-model="carForm.mileage" 
            :min="0"
          />
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number 
            v-model="carForm.stock" 
            :min="0"
          />
        </el-form-item>

        <el-form-item label="发动机" prop="engine_type">
          <el-input v-model="carForm.engine_type" />
        </el-form-item>

        <el-form-item label="变速箱" prop="transmission">
          <el-select v-model="carForm.transmission">
            <el-option label="手动" value="manual" />
            <el-option label="自动" value="auto" />
            <el-option label="DCT双离合" value="dct" />
            <el-option label="CVT无级变速" value="cvt" />
          </el-select>
        </el-form-item>

        <el-form-item label="燃料类型" prop="fuel_type">
          <el-select v-model="carForm.fuel_type">
            <el-option label="汽油" value="gasoline" />
            <el-option label="柴油" value="diesel" />
            <el-option label="电动" value="electric" />
            <el-option label="混合动力" value="hybrid" />
          </el-select>
        </el-form-item>

        <el-form-item label="图片" prop="images">
          <el-upload
            action="/api/admin/upload"
            list-type="picture-card"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :on-error="handleUploadError"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input 
            type="textarea" 
            v-model="carForm.description"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-select v-model="carForm.status">
            <el-option label="有货" value="available" />
            <el-option label="已下架" value="discontinued" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 表格数据
const cars = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('添加车辆')
const isEdit = ref(false)
const formRef = ref(null)
const submitting = ref(false)

// 品牌列表
const brands = ref([])

// 表单数据
const carForm = reactive({
  brand_id: '',
  model: '',
  price: 0,
  year: new Date().getFullYear(),
  color: '',
  mileage: 0,
  stock: 0,
  description: '',
  images: '',
  engine_type: '',
  transmission: '',
  fuel_type: '',
  status: 'available'
})

// 表单验证规则
const rules = {
  brand_id: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  transmission: [{ required: true, message: '请选择变速箱类型', trigger: 'change' }],
  fuel_type: [{ required: true, message: '请选择燃料类型', trigger: 'change' }]
}

// 获取用户 store
const userStore = useUserStore()

// 上传请求头
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${userStore.token}`
}))

// 添加上传错误处理
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error(error.message || '上传失败')
}

// 获取车辆列表
const fetchCars = async () => {
  try {
    const response = await axios.get('/api/admin/cars', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    cars.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取车辆列表失败')
  }
}

// 获取品牌列表
const fetchBrands = async () => {
  try {
    const response = await axios.get('/api/brands')
    brands.value = response.data
  } catch (error) {
    ElMessage.error('获取品牌列表失败')
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCars()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCars()
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加车辆'
  Object.keys(carForm).forEach(key => {
    carForm[key] = ''
  })
  carForm.year = new Date().getFullYear()
  carForm.price = 0
  carForm.mileage = 0
  carForm.stock = 0
  carForm.status = 'available'
  dialogVisible.value = true
}

// 显示编辑对话框
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑车辆'
  // 深拷贝防止直接修改原数据
  Object.assign(carForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.brand} ${row.model} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.delete(`/api/admin/cars/${row.id}`)
    ElMessage.success('删除成功')
    fetchCars()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true

    // 确保数值类型正确
    const submitData = {
      ...carForm,
      price: Number(carForm.price),
      year: Number(carForm.year),
      mileage: Number(carForm.mileage),
      stock: Number(carForm.stock)
    }

    if (isEdit.value) {
      const response = await axios.put(`/api/admin/cars/${carForm.id}`, submitData)
      ElMessage.success('更新成功')
      // 如果状态被自动更新，更新本地数据
      if (response.data.status) {
        carForm.status = response.data.status
      }
    } else {
      await axios.post('/api/admin/cars', submitData)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchCars()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    }
  } finally {
    submitting.value = false
  }
}

// 图片上传相关
const handleUploadSuccess = (response) => {
  carForm.images = response.url
}

const handleRemove = () => {
  carForm.images = ''
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  return isImage
}

// 获取状态类型
const getStatusType = (status) => {
  return status === 'available' ? 'success' : 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  return status === 'available' ? '有货' : '已下架'
}

// 处理状态变更
const handleStatusChange = async (row) => {
  try {
    const newStatus = row.status === 'discontinued' ? 'available' : 'discontinued'
    const response = await axios.put(`/api/admin/cars/${row.id}/status`, {
      status: newStatus
    })
    
    // 更新本地状态
    if (response.data.status) {
      row.status = response.data.status
    }
    
    ElMessage.success(newStatus === 'discontinued' ? '下架成功' : '上架成功')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

// 处理补货
const handleRestock = async (row) => {
  try {
    const { value: stock } = await ElMessageBox.prompt('请输入补货数量', '补货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'number',
      inputValue: 1,
      inputValidator: (value) => {
        const num = Number(value);
        return num > 0 && Number.isInteger(num);
      },
      inputErrorMessage: '请输入大于0的整数'
    });
    
    const response = await axios.put(`/api/admin/cars/${row.id}/restock`, {
      stock: Number(stock)
    });

    // 更新本地数据
    if (response.data.status) {
      row.status = response.data.status;
    }
    if (response.data.stock !== undefined) {
      row.stock = response.data.stock;
    }

    ElMessage.success('补货成功');
    // 刷新列表以获取最新数据
    fetchCars();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('补货失败:', error);
      ElMessage.error(error.response?.data?.message || '补货失败');
    }
  }
}

// 初始化
onMounted(() => {
  fetchCars()
  fetchBrands()
})
</script>

<style scoped>
.admin-cars {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.car-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-upload {
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}
</style> 