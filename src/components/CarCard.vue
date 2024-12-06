// 修改状态显示逻辑
const getStatusText = (car) => {
  if (car.stock === 0) {
    return '无货';
  }
  if (car.stock < 6) {
    return '库存紧张';
  }
  return '';  // 正常库存不显示状态标签
}

const getStatusType = (car) => {
  if (car.stock === 0) {
    return 'danger';
  }
  if (car.stock < 6) {
    return 'warning';
  }
  return '';  // 正常库存不显示标签
} 