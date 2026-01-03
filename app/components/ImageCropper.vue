<template>
  <div class="relative w-full h-full flex flex-col">
    <!-- Cropper 区域 -->
    <div class="flex-1 bg-neutral-900 rounded-lg overflow-hidden">
      <ClientOnly>
        <Cropper ref="cropperRef" class="w-full h-full" :src="src" :auto-zoom="true" :stencil-size="stencilSize"
          :stencil-props="{
            handlers: {},
            movable: false,
            resizable: false,
            aspectRatio: computedAspectRatio
          }" :resize-image="{
            adjustStencil: false,
            wheel: {
              ratio: 0.05
            }
          }" image-restriction="stencil" @change="onChange" @ready="onReady" />
        <template #fallback>
          <div class="flex items-center justify-center h-full text-neutral-400">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 缩放控制条 -->
    <div class="flex items-center justify-center gap-3 py-3 bg-neutral-900/50 rounded-b-lg">
      <UButton
        icon="i-heroicons-minus"
        size="sm"
        color="neutral"
        variant="soft"
        :disabled="sliderValue <= 0.5"
        @click="zoomOut"
      />
      <div class="relative w-32 flex items-center">
        <input
          type="range"
          v-model.number="sliderValue"
          min="0.5"
          max="3"
          step="0.05"
          class="w-full h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer
                 [&::-webkit-slider-thumb]:appearance-none
                 [&::-webkit-slider-thumb]:w-4
                 [&::-webkit-slider-thumb]:h-4
                 [&::-webkit-slider-thumb]:rounded-full
                 [&::-webkit-slider-thumb]:bg-emerald-500
                 [&::-webkit-slider-thumb]:cursor-pointer
                 [&::-moz-range-thumb]:w-4
                 [&::-moz-range-thumb]:h-4
                 [&::-moz-range-thumb]:rounded-full
                 [&::-moz-range-thumb]:bg-emerald-500
                 [&::-moz-range-thumb]:border-0
                 [&::-moz-range-thumb]:cursor-pointer"
          @input="onSliderInput"
          @change="onSliderChange"
        />
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="sm"
        color="neutral"
        variant="soft"
        :disabled="sliderValue >= 3"
        @click="zoomIn"
      />
      <span class="text-sm text-neutral-400 w-12 text-center tabular-nums">
        {{ Math.round(sliderValue * 100) }}%
      </span>
      <UButton
        icon="i-heroicons-arrow-path"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="resetZoom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps<{
  src: string
  aspectRatio?: number
  stencilWidth?: number
  stencilHeight?: number
}>()

const emit = defineEmits<{
  ready: [cropper: any]
  crop: [data: { width: number; height: number; x: number; y: number }]
}>()

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

// 计算 aspectRatio：优先使用传入的，否则从宽高计算
const computedAspectRatio = computed(() => {
  if (props.aspectRatio) {
    return props.aspectRatio
  }
  if (props.stencilWidth && props.stencilHeight) {
    return props.stencilWidth / props.stencilHeight
  }
  return undefined
})

// 计算 stencil 显示尺寸，保持合理大小
const stencilSize = computed(() => {
  const ratio = computedAspectRatio.value || 1
  const maxWidth = 500
  const maxHeight = 350

  let width, height
  if (ratio >= 1) {
    // 宽比例（如16:9, 21:9）
    width = Math.min(maxWidth, maxHeight * ratio)
    height = width / ratio
  } else {
    // 高比例（如2:3, 9:16）
    height = Math.min(maxHeight, maxWidth / ratio)
    width = height * ratio
  }

  return { width, height }
})

const onReady = () => {
  // 记录初始可视区域用于计算缩放比例
  nextTick(() => {
    const cropper = cropperRef.value
    if (cropper) {
      const result = cropper.getResult()
      if (result.visibleArea) {
        initialVisibleAreaWidth.value = result.visibleArea.width
      }
    }
  })

  emit('ready', {
    // 获取裁剪结果
    getCroppedCanvas: async (options?: { width?: number; height?: number }) => {
      const cropper = cropperRef.value
      if (!cropper) return null
      const result = cropper.getResult()
      if (!result.canvas) return null

      if (options?.width || options?.height) {
        const targetWidth = options.width || result.canvas.width
        const targetHeight = options.height || result.canvas.height
        const newCanvas = document.createElement('canvas')
        newCanvas.width = targetWidth
        newCanvas.height = targetHeight
        const ctx = newCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(result.canvas, 0, 0, targetWidth, targetHeight)
        }
        return newCanvas
      }
      return result.canvas
    },
    // 重置到初始状态
    reset: () => {
      const cropper = cropperRef.value
      if (cropper) {
        cropper.reset()
      }
    },
    // 设置剪切框尺寸
    setCoordinates: (width: number, height: number) => {
      const cropper = cropperRef.value
      if (cropper) {
        cropper.setCoordinates([
          ({ imageSize }: any) => ({
            width,
            height,
          }),
          ({ coordinates, imageSize }: any) => ({
            left: imageSize.width / 2 - coordinates.width / 2,
            top: imageSize.height / 2 - coordinates.height / 2
          })
        ])
      }
    },
    // 获取当前坐标
    getData: () => {
      const cropper = cropperRef.value
      if (!cropper) return { x: 0, y: 0, width: 0, height: 0 }
      const { coordinates } = cropper.getResult()
      return {
        x: coordinates?.left || 0,
        y: coordinates?.top || 0,
        width: coordinates?.width || 0,
        height: coordinates?.height || 0
      }
    },
    // 刷新布局
    refresh: () => {
      const cropper = cropperRef.value
      if (cropper) {
        cropper.refresh()
      }
    }
  })
}

const onChange = ({ coordinates, visibleArea }: any) => {
  if (coordinates) {
    emit('crop', {
      width: coordinates.width,
      height: coordinates.height,
      x: coordinates.left,
      y: coordinates.top
    })
  }

  // 根据 visibleArea 计算并同步当前缩放级别（仅在非滑块拖动时）
  if (visibleArea && initialVisibleAreaWidth.value > 0 && !isDraggingSlider.value) {
    const currentZoom = initialVisibleAreaWidth.value / visibleArea.width
    const clampedZoom = Math.max(0.5, Math.min(3, currentZoom))
    const roundedZoom = Math.round(clampedZoom * 20) / 20 // 保留到 0.05
    
    if (Math.abs(sliderValue.value - roundedZoom) > 0.02) {
      sliderValue.value = roundedZoom
    }
  }
}

// ===== 缩放控制逻辑 =====
const initialVisibleAreaWidth = ref(0)
const sliderValue = ref(1) // 滑块显示值（独立于实际缩放）
const isDraggingSlider = ref(false) // 是否正在拖动滑块
let zoomThrottleTimer: ReturnType<typeof setTimeout> | null = null

// 放大 10%
const zoomIn = () => {
  const targetLevel = Math.min(sliderValue.value + 0.1, 3)
  sliderValue.value = Math.round(targetLevel * 10) / 10
  applyZoomToLevel(sliderValue.value)
}

// 缩小 10%
const zoomOut = () => {
  const targetLevel = Math.max(sliderValue.value - 0.1, 0.5)
  sliderValue.value = Math.round(targetLevel * 10) / 10
  applyZoomToLevel(sliderValue.value)
}

// 重置缩放
const resetZoom = () => {
  const cropper = cropperRef.value
  if (cropper) {
    cropper.reset()
    sliderValue.value = 1
    nextTick(() => {
      const result = cropper.getResult()
      if (result.visibleArea) {
        initialVisibleAreaWidth.value = result.visibleArea.width
      }
    })
  }
}

// 滑块拖动中（节流应用缩放）
const onSliderInput = () => {
  isDraggingSlider.value = true
  
  // 节流：每 50ms 最多执行一次缩放
  if (!zoomThrottleTimer) {
    zoomThrottleTimer = setTimeout(() => {
      applyZoomToLevel(sliderValue.value)
      zoomThrottleTimer = null
    }, 50)
  }
}

// 滑块拖动结束
const onSliderChange = () => {
  // 清除节流定时器，立即执行最终缩放
  if (zoomThrottleTimer) {
    clearTimeout(zoomThrottleTimer)
    zoomThrottleTimer = null
  }
  applyZoomToLevel(sliderValue.value)
  
  // 延迟解除拖动标记，让 onChange 有机会同步
  setTimeout(() => {
    isDraggingSlider.value = false
  }, 100)
}

// 将缩放应用到指定级别
const applyZoomToLevel = (targetLevel: number) => {
  const cropper = cropperRef.value
  if (!cropper || initialVisibleAreaWidth.value <= 0) return

  const result = cropper.getResult()
  if (!result.visibleArea) return

  const currentZoom = initialVisibleAreaWidth.value / result.visibleArea.width
  const factor = targetLevel / currentZoom

  if (Math.abs(factor - 1) > 0.01) {
    cropper.zoom(factor)
  }
}
</script>

<style>
/* Vue Advanced Cropper 自定义样式 */
.vue-advanced-cropper {
  background-color: #1a1a1a;
}

.vue-advanced-cropper__background {
  background-color: rgba(0, 0, 0, 0.6);
}

.vue-advanced-cropper__foreground {
  background-color: transparent;
}

/* 剪切预览区域 - 添加网格线 */
.vue-rectangle-stencil__preview {
  /* 九宫格网格线 */
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 33.333% 33.333%;
}

/* 剪切框边框 */
.vue-simple-line {
  background-color: rgba(255, 255, 255, 0.8) !important;
}

/* 剪切框角落手柄 - Static 模式下隐藏 */
.vue-simple-handler {
  display: none;
}

/* 剪切框外框 - 毛玻璃遮罩效果 */
.vue-rectangle-stencil {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

/* 毛玻璃背景 */
.vue-advanced-cropper__background {
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
