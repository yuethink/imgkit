<template>
  <div class="space-y-3">
    <!-- 比例 + 尺寸 合并 -->
    <UCard class="card-glass border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50" :ui="{ body: 'p-3' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-rectangle-group" class="w-4 h-4 text-emerald-500" />
          <h3 class="font-semibold text-sm">{{ $t('settings.ratio_size_title') }}</h3>
        </div>
      </template>

      <!-- 比例选择 - 更紧凑的4列布局 -->
      <div class="grid grid-cols-4 gap-1.5 mb-3">
        <!-- 自由比例 -->
        <UButton :color="isFreeRatio ? 'primary' : 'neutral'" :variant="isFreeRatio ? 'solid' : 'soft'" size="xs"
          class="justify-center text-xs" @click="selectFreeRatio">
          {{ $t('settings.free_ratio') }}
        </UButton>
        <!-- 预设比例 -->
        <UButton v-for="ratio in ratioPresets" :key="ratio.ratio"
          :color="selectedRatio?.ratio === ratio.ratio ? 'primary' : 'neutral'"
          :variant="selectedRatio?.ratio === ratio.ratio ? 'solid' : 'soft'" size="xs" class="justify-center text-xs"
          @click="selectRatio(ratio)">
          {{ ratio.ratio }}
        </UButton>
        <!-- 自定义比例按钮 -->
        <UButton :color="isCustomRatioMode ? 'primary' : 'neutral'" :variant="isCustomRatioMode ? 'solid' : 'soft'"
          size="xs" class="justify-center text-xs" @click="toggleCustomRatioMode">
          {{ $t('settings.custom_ratio') }}
        </UButton>
      </div>

      <!-- 自定义比例输入 -->
      <div v-if="isCustomRatioMode" class="flex items-center gap-2 mb-3">
        <UInput v-model.number="customRatioWidth" type="number" size="xs" :placeholder="$t('settings.width_short')"
          class="w-16 text-center" min="1" max="100" />
        <span class="text-gray-400">:</span>
        <UInput v-model.number="customRatioHeight" type="number" size="xs" :placeholder="$t('settings.height_short')"
          class="w-16 text-center" min="1" max="100" />
        <UButton size="xs" color="primary" @click="applyCustomRatio">
          {{ $t('settings.apply') }}
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
      <!-- 尺寸输入 -->
      <div class="grid grid-cols-2 gap-2">
        <UFormField :label="$t('settings.width')">
          <UInput type="number" size="sm" :model-value="inputWidth" @update:model-value="handleWidthInput"
            @focus="onInputFocus" @blur="onInputBlur" />
        </UFormField>
        <UFormField :label="$t('settings.height')">
          <UInput type="number" size="sm" :model-value="inputHeight" @update:model-value="handleHeightInput"
            @focus="onInputFocus" @blur="onInputBlur" />
        </UFormField>
      </div>

      <!-- 质量指示器 -->
      <div v-if="actualCropWidth && actualCropHeight" class="mt-2 text-xs space-y-1">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span>{{ $t('settings.crop_area') }}: {{ actualCropWidth }}×{{ actualCropHeight }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span :class="qualityIndicator.class">
            {{ qualityIndicator.icon }} {{ qualityIndicator.text }}
          </span>
        </div>
      </div>
    </UCard>

    <!-- 输出设置 - 更紧凑 -->
    <UCard class="card-glass border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50" :ui="{ body: 'p-3' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 text-violet-500" />
          <h3 class="font-semibold text-sm">{{ $t('settings.output_title') }}</h3>
        </div>
      </template>

      <div class="space-y-3">
        <!-- 格式 + 质量 一行 -->
        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="$t('settings.format')">
            <USelect v-model="localFormat" :items="formatOptions" size="sm" />
          </UFormField>
          <UFormField :label="$t('settings.quality')">
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
        <UFormField :label="$t('settings.filename')">
          <UInput v-model="localFilename" size="sm" :placeholder="defaultFilename">
            <template #trailing>
              <span class="text-gray-400 text-xs">.{{ localFormat }}</span>
            </template>
          </UInput>
        </UFormField>

        <!-- 按钮组 (垂直布局) -->
        <div class="flex flex-col gap-2">
          <!-- 下载按钮 (主操作) -->
          <UButton block size="md" color="primary" :loading="loading"
            class="bg-linear-to-r! from-emerald-500! to-blue-500! hover:from-emerald-600! hover:to-blue-600! font-bold"
            @click="handleDownload">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 mr-1" />
            <span class="text-base">{{ $t('settings.download_btn') }}</span>
          </UButton>

          <!-- 另存为按钮 (次操作) -->
          <UButton block size="md" color="neutral" variant="outline" :ui="{ rounded: 'rounded-md' }" :loading="loading"
            class="justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="handleSaveAs">
            <UIcon name="i-heroicons-folder-open" class="w-4 h-4 mr-1" />
            {{ $t('settings.save_as_btn') }}
          </UButton>
        </div>
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
  actualCropWidth?: number
  actualCropHeight?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ImageSettings]
  'ratio-change': [ratio: number | undefined]
  'size-change': []
  'edit-start': []
  'edit-end': []
  'download': []
  'save-as': []
}>()

const { t } = useI18n()

// 比例预设 - 精简版
const ratioPresets = computed<RatioPreset[]>(() => [
  {
    ratio: '16:9', scene: t('settings.scenes.video'), value: 16 / 9, sizes: [
      { label: t('settings.presets.fhd'), width: 1920, height: 1080 },
      { label: t('settings.presets.hd'), width: 1280, height: 720 },
      { label: t('settings.presets.web'), width: 800, height: 450 },
    ]
  },
  {
    ratio: '4:3', scene: t('settings.scenes.screen'), value: 4 / 3, sizes: [
      { label: t('settings.presets.standard'), width: 1024, height: 768 },
      { label: t('settings.presets.web'), width: 800, height: 600 },
    ]
  },
  {
    ratio: '3:2', scene: t('settings.scenes.camera'), value: 3 / 2, sizes: [
      { label: t('settings.presets.large_image'), width: 1200, height: 800 },
      { label: t('settings.presets.medium_image'), width: 900, height: 600 },
    ]
  },
  {
    ratio: '1:1', scene: t('settings.scenes.square'), value: 1, sizes: [
      { label: t('settings.presets.large'), width: 1080, height: 1080 },
      { label: t('settings.presets.medium'), width: 800, height: 800 },
    ]
  },
  {
    ratio: '2:3', scene: t('settings.scenes.poster'), value: 2 / 3, sizes: [
      { label: t('settings.presets.poster'), width: 800, height: 1200 },
      { label: t('settings.presets.card'), width: 600, height: 900 },
    ]
  },
  {
    ratio: '9:16', scene: t('settings.scenes.mobile'), value: 9 / 16, sizes: [
      { label: t('settings.presets.fullscreen'), width: 1080, height: 1920 },
      { label: t('settings.presets.story'), width: 720, height: 1280 },
    ]
  },
  {
    ratio: '21:9', scene: t('settings.scenes.ultrawide'), value: 21 / 9, sizes: [
      { label: t('settings.scenes.ultrawide'), width: 2560, height: 1080 },
    ]
  },
  {
    ratio: t('settings.scenes.wechat_mp'), scene: t('settings.presets.cover'), value: 900 / 383, sizes: [
      { label: t('settings.presets.standard'), width: 900, height: 383 },
      { label: t('settings.presets.hd'), width: 1080, height: 460 },
    ]
  },
])

const formatOptions = [
  { label: 'WebP', value: 'webp' },
  { label: 'AVIF', value: 'avif' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'PNG', value: 'png' }
]

const qualityPresets = computed(() => [
  { label: t('quality.low'), value: 60 },
  { label: t('quality.recommended'), value: 80 },
  { label: t('quality.high'), value: 95 },
])

// 本地状态
const selectedRatio = ref<RatioPreset | null>(null)
const isCustomRatio = ref(false)
const isFreeRatio = ref(true) // 默认自由比例
const isCustomRatioMode = ref(false) // 自定义比例输入模式
const customRatioWidth = ref(16)
const customRatioHeight = ref(9)
const localWidth = ref(props.modelValue.width || 800)
const localHeight = ref(props.modelValue.height || 450)
const localFormat = ref(props.modelValue.format)
const localQuality = ref(80)
const localFilename = ref('')

// 计算属性
const defaultFilename = computed(() => `image_${localWidth.value}x${localHeight.value}`)

// 实际裁剪尺寸（从 props 获取）
const actualCropWidth = computed(() => props.actualCropWidth || 0)
const actualCropHeight = computed(() => props.actualCropHeight || 0)

// 质量指示器
const qualityIndicator = computed(() => {
  const { t } = useI18n()

  if (!actualCropWidth.value || !actualCropHeight.value) {
    return { icon: '', text: '', class: '' }
  }

  // 计算缩放比例（基于宽度）
  const scaleRatio = localWidth.value / actualCropWidth.value
  const percentage = Math.round(scaleRatio * 100)

  if (scaleRatio <= 1) {
    // 缩小或原尺寸 - 质量好
    return {
      icon: '🟢',
      text: percentage === 100 ? t('settings.quality_original') : t('settings.quality_shrink', { percent: percentage }),
      class: 'text-emerald-500'
    }
  } else if (scaleRatio <= 1.5) {
    // 轻微放大 - 质量一般
    return {
      icon: '🟡',
      text: t('settings.quality_enlarge_mild', { percent: percentage }),
      class: 'text-yellow-500'
    }
  } else {
    // 大幅放大 - 质量差
    return {
      icon: '🔴',
      text: t('settings.quality_enlarge_heavy', { percent: percentage }),
      class: 'text-red-500'
    }
  }
})

// 方法
// 选择自由比例（无锁定）
const selectFreeRatio = () => {
  isFreeRatio.value = true
  selectedRatio.value = null
  isCustomRatioMode.value = false
  isCustomRatio.value = false
  emit('ratio-change', undefined)
  emit('size-change')
}

// 切换自定义比例输入模式
const toggleCustomRatioMode = () => {
  isCustomRatioMode.value = !isCustomRatioMode.value
  if (isCustomRatioMode.value) {
    isFreeRatio.value = false
    selectedRatio.value = null
  }
}

// 应用自定义比例
const applyCustomRatio = () => {
  if (customRatioWidth.value > 0 && customRatioHeight.value > 0) {
    const ratio = customRatioWidth.value / customRatioHeight.value
    isFreeRatio.value = false
    selectedRatio.value = null
    isCustomRatio.value = true
    emit('ratio-change', ratio)
    emit('size-change')
  }
}

const selectRatio = (ratio: RatioPreset) => {
  selectedRatio.value = ratio
  isFreeRatio.value = false
  isCustomRatioMode.value = false
  isCustomRatio.value = false
  emit('ratio-change', ratio.value)
  if (ratio.sizes.length > 0 && ratio.sizes[0]) {
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

// 输入框聚焦状态
const isInputFocused = ref(false)
// 显示用的代理值 (允许为空字符串，避免输入时被强制回弹)
const inputWidth = ref<string | number>(localWidth.value)
const inputHeight = ref<string | number>(localHeight.value)

const onInputFocus = () => {
  isInputFocused.value = true
  emit('edit-start')
}

const onInputBlur = () => {
  isInputFocused.value = false
  // 失焦时，如果输入无效(如为空)，则恢复为当前实际值
  if (inputWidth.value === '' || isNaN(Number(inputWidth.value))) {
    inputWidth.value = localWidth.value
  }
  if (inputHeight.value === '' || isNaN(Number(inputHeight.value))) {
    inputHeight.value = localHeight.value
  }
  syncToParent()

  // 延迟 100ms 再通知父组件编辑结束，防止 onCrop 立即覆盖用户输入
  setTimeout(() => {
    emit('edit-end')
  }, 100)
}

// 防抖处理
let updateTimer: NodeJS.Timeout | null = null
const debounceUpdate = (fn: () => void, delay = 500) => {
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(fn, delay)
}

// 处理宽度输入变化
const handleWidthInput = (val: string | number) => {
  inputWidth.value = val
  const num = typeof val === 'string' ? parseInt(val) : val

  if (!isNaN(num) && num > 0) {
    // 立即更新本地数值以便逻辑运算（虽然可能尚未同步到父组件）
    // 注意：不要直接赋值给 localWidth 引发 watcher 循环，逻辑由 updateWidthLogic 处理
    debounceUpdate(() => {
      updateWidthLogic(num)
    }, 200)
  }
}

// 处理高度输入变化
const handleHeightInput = (val: string | number) => {
  inputHeight.value = val
  const num = typeof val === 'string' ? parseInt(val) : val

  if (!isNaN(num) && num > 0) {
    debounceUpdate(() => {
      updateHeightLogic(num)
    }, 200)
  }
}

// 核心更新逻辑：手动输入时自动切换到自由模式
const updateWidthLogic = (num: number) => {
  localWidth.value = num

  // 手动输入时，自动切换到自由比例模式（不联动高度）
  if (selectedRatio.value) {
    emit('ratio-change', undefined)
    selectedRatio.value = null
  }
  isFreeRatio.value = true
  isCustomRatio.value = false
  isCustomRatioMode.value = false

  syncToParent()
  emit('size-change')
}

// 核心更新逻辑：手动输入时自动切换到自由模式
const updateHeightLogic = (num: number) => {
  localHeight.value = num

  // 手动输入时，自动切换到自由比例模式（不联动宽度）
  if (selectedRatio.value) {
    emit('ratio-change', undefined)
    selectedRatio.value = null
  }
  isFreeRatio.value = true
  isCustomRatio.value = false
  isCustomRatioMode.value = false

  syncToParent()
  emit('size-change')
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

// 另存为
const handleSaveAs = () => {
  syncToParent()
  emit('save-as')
}

const handleDownload = () => {
  syncToParent()
  emit('download')
}

// 监听 localWidth/Height 变化以同步 inputWidth/Height (当非聚焦时)
// 这通常发生在：1. 拖动裁剪框 -> props update -> local update; 2. 选择了预设尺寸
watch(localWidth, (val) => {
  if (!isInputFocused.value) inputWidth.value = val
})
watch(localHeight, (val) => {
  if (!isInputFocused.value) inputHeight.value = val
})

// 监听 props 变化
watch(() => props.modelValue, (val) => {
  if (isInputFocused.value) return

  if (val.width !== localWidth.value) localWidth.value = val.width
  if (val.height !== localHeight.value) localHeight.value = val.height
}, { deep: true })

watch([localFormat, localQuality], () => {
  syncToParent()
})
</script>
