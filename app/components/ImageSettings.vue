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
        <UFormField :label="$t('settings.width')">
          <UInput type="number" size="sm" :model-value="localWidth" @update:model-value="updateWidth" />
        </UFormField>
        <UFormField :label="$t('settings.height')">
          <UInput type="number" size="sm" :model-value="localHeight" @update:model-value="updateHeight" />
        </UFormField>
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

        <!-- 下载按钮 -->
        <UButton block size="md" color="primary" :loading="loading"
          class="bg-linear-to-r! from-emerald-500! to-blue-500! hover:from-emerald-600! hover:to-blue-600!"
          @click="handleDownload">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
          {{ $t('settings.download_btn') }}
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
      { label: t('settings.presets.ultrawide'), width: 2560, height: 1080 },
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
