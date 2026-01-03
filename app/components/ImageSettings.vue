<template>
  <div class="space-y-3">
    <!-- 比例 + 尺寸 合并 -->
    <UCard class="card-glass border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50" :ui="{ body: 'p-3' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-rectangle-group" class="w-4 h-4 text-emerald-500" />
          <h3 class="font-semibold text-sm">比例 & 尺寸</h3>
        </div>
      </template>

      <!-- 比例选择 - 更紧凑的4列布局 -->
      <div class="grid grid-cols-4 gap-1.5 mb-3">
        <UButton v-for="ratio in ratioPresets" :key="ratio.ratio"
          :color="selectedRatio?.ratio === ratio.ratio ? 'primary' : 'neutral'"
          :variant="selectedRatio?.ratio === ratio.ratio ? 'solid' : 'soft'" size="xs" class="justify-center text-xs"
          @click="selectRatio(ratio)">
          {{ ratio.ratio }}
        </UButton>
      </div>

      <!-- 预设尺寸 -->
      <div v-if="selectedRatio" class="flex flex-wrap gap-1.5 mb-3">
        <UButton v-for="size in selectedRatio.sizes" :key="size.label"
          :color="isSelectedSize(size) ? 'primary' : 'neutral'" :variant="isSelectedSize(size) ? 'solid' : 'soft'"
          size="xs" @click="selectSize(size)">
          {{ size.label }} {{ size.width }}×{{ size.height }}
        </UButton>
      </div>

      <!-- 尺寸输入 -->
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="宽度">
          <UInput type="number" size="sm" :model-value="localWidth" @update:model-value="updateWidth" />
        </UFormField>
        <UFormField label="高度">
          <UInput type="number" size="sm" :model-value="localHeight" @update:model-value="updateHeight" />
        </UFormField>
      </div>
    </UCard>

    <!-- 输出设置 - 更紧凑 -->
    <UCard class="card-glass border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50" :ui="{ body: 'p-3' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 text-violet-500" />
          <h3 class="font-semibold text-sm">输出设置</h3>
        </div>
      </template>

      <div class="space-y-3">
        <!-- 格式 + 质量 一行 -->
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="格式">
            <USelect v-model="localFormat" :items="formatOptions" size="sm" />
          </UFormField>
          <UFormField label="质量">
            <div class="flex gap-1">
              <UButton v-for="q in qualityPresets" :key="q.value"
                :color="localQuality === q.value ? 'primary' : 'neutral'"
                :variant="localQuality === q.value ? 'solid' : 'soft'" size="xs" class="flex-1 justify-center"
                @click="localQuality = q.value">
                {{ q.label }}
              </UButton>
            </div>
          </UFormField>
        </div>

        <!-- 文件名 -->
        <UFormField label="文件名">
          <UInput v-model="localFilename" size="sm" :placeholder="defaultFilename">
            <template #trailing>
              <span class="text-gray-400 text-xs">.{{ localFormat }}</span>
            </template>
          </UInput>
        </UFormField>

        <!-- 下载按钮 -->
        <UButton block size="md" color="primary" :loading="loading"
          class="bg-linear-to-r! from-emerald-500! to-blue-500! hover:from-emerald-600! hover:to-blue-600!"
          @click="handleDownload">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
          处理并下载
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
export interface ImageSettings {
  width: number
  height: number
  format: 'webp' | 'jpeg' | 'png' | 'avif'
  quality: number
  filename: string
}

interface RatioPreset {
  ratio: string
  scene: string
  value: number
  sizes: { label: string; width: number; height: number }[]
}

const props = defineProps<{
  modelValue: ImageSettings
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ImageSettings]
  'ratio-change': [ratio: number | undefined]
  'size-change': []
  'download': []
}>()

// 比例预设 - 精简版
const ratioPresets: RatioPreset[] = [
  {
    ratio: '16:9', scene: '视频', value: 16 / 9, sizes: [
      { label: '全高清', width: 1920, height: 1080 },
      { label: '高清', width: 1280, height: 720 },
      { label: '网页', width: 800, height: 450 },
    ]
  },
  {
    ratio: '4:3', scene: '屏幕', value: 4 / 3, sizes: [
      { label: '标准', width: 1024, height: 768 },
      { label: '网页', width: 800, height: 600 },
    ]
  },
  {
    ratio: '3:2', scene: '相机', value: 3 / 2, sizes: [
      { label: '大图', width: 1200, height: 800 },
      { label: '中图', width: 900, height: 600 },
    ]
  },
  {
    ratio: '1:1', scene: '方形', value: 1, sizes: [
      { label: '大', width: 1080, height: 1080 },
      { label: '中', width: 800, height: 800 },
    ]
  },
  {
    ratio: '2:3', scene: '海报', value: 2 / 3, sizes: [
      { label: '海报', width: 800, height: 1200 },
      { label: '卡片', width: 600, height: 900 },
    ]
  },
  {
    ratio: '9:16', scene: '手机', value: 9 / 16, sizes: [
      { label: '全屏', width: 1080, height: 1920 },
      { label: '故事', width: 720, height: 1280 },
    ]
  },
  {
    ratio: '21:9', scene: '超宽', value: 21 / 9, sizes: [
      { label: '超宽', width: 2560, height: 1080 },
    ]
  },
  {
    ratio: '公众号', scene: '封面', value: 900 / 383, sizes: [
      { label: '标准', width: 900, height: 383 },
      { label: '高清', width: 1080, height: 460 },
    ]
  },
]

const formatOptions = [
  { label: 'WebP', value: 'webp' },
  { label: 'AVIF', value: 'avif' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'PNG', value: 'png' }
]

const qualityPresets = [
  { label: '小', value: 60 },
  { label: '推荐', value: 80 },
  { label: '高清', value: 95 },
]

// 本地状态
const selectedRatio = ref<RatioPreset | null>(null)
const isCustomRatio = ref(false)
const localWidth = ref(props.modelValue.width || 800)
const localHeight = ref(props.modelValue.height || 450)
const localFormat = ref(props.modelValue.format)
const localQuality = ref(80)
const localFilename = ref('')

// 计算属性
const defaultFilename = computed(() => `image_${localWidth.value}x${localHeight.value}`)

// 方法
const selectRatio = (ratio: RatioPreset) => {
  selectedRatio.value = ratio
  isCustomRatio.value = false
  emit('ratio-change', ratio.value)
  if (ratio.sizes.length > 0) {
    selectSize(ratio.sizes[0])
  }
}

const selectSize = (size: { width: number; height: number }) => {
  localWidth.value = size.width
  localHeight.value = size.height
  syncToParent()
  emit('size-change')
}

const isSelectedSize = (size: { width: number; height: number }) => {
  return localWidth.value === size.width && localHeight.value === size.height
}

const updateWidth = (val: string | number) => {
  const num = typeof val === 'string' ? parseInt(val) : val
  if (!isNaN(num) && num > 0) {
    localWidth.value = num
    isCustomRatio.value = true
    selectedRatio.value = null
    syncToParent()
    emit('size-change')
  }
}

const updateHeight = (val: string | number) => {
  const num = typeof val === 'string' ? parseInt(val) : val
  if (!isNaN(num) && num > 0) {
    localHeight.value = num
    isCustomRatio.value = true
    selectedRatio.value = null
    syncToParent()
    emit('size-change')
  }
}

const syncToParent = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    width: localWidth.value,
    height: localHeight.value,
    format: localFormat.value,
    quality: localQuality.value,
    filename: localFilename.value || defaultFilename.value
  })
}

const handleDownload = () => {
  syncToParent()
  emit('download')
}

// 监听
watch(() => props.modelValue, (val) => {
  if (val.width !== localWidth.value) localWidth.value = val.width
  if (val.height !== localHeight.value) localHeight.value = val.height
}, { deep: true })

watch([localFormat, localQuality], () => {
  syncToParent()
})
</script>
