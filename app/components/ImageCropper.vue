<template>
  <div class="relative w-full h-full flex flex-col">
    <!-- Cropper 区域 -->
    <div class="flex-1 bg-neutral-900 rounded-lg overflow-hidden">
      <ClientOnly>
        <Cropper ref="cropperRef" class="w-full h-full" :src="src" :stencil-props="{ aspectRatio }"
          :resize-image="{ adjustStencil: false, wheel: { ratio: 0.05 } }" image-restriction="stencil"
          @change="onChange" @ready="onReady" />
        <template #fallback>
          <div class="flex items-center justify-center h-full text-neutral-400">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 缩放控制条 -->
    <div class="flex items-center justify-center gap-3 py-3 bg-neutral-900/50 rounded-b-lg">
      <UButton icon="i-heroicons-minus" size="sm" color="neutral" variant="soft" :disabled="zoom <= 0.1"
        @click="zoomOut" />
      <input type="range" v-model.number="zoom" min="0.1" max="3" step="0.05" class="w-32 h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500" @change="applyZoom" />
      <UButton icon="i-heroicons-plus" size="sm" color="neutral" variant="soft" :disabled="zoom >= 3" @click="zoomIn" />
      <span class="text-sm text-neutral-400 w-12 text-center tabular-nums">{{ Math.round(zoom * 100) }}%</span>
      <UButton icon="i-heroicons-arrow-path" size="xs" color="neutral" variant="ghost" @click="reset" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps<{
  src: string
  aspectRatio?: number
}>()

const emit = defineEmits<{
  ready: [instance: CropperInstance]
  crop: [data: { width: number; height: number; left: number; top: number }]
}>()

// 暴露给父组件的接口
interface CropperInstance {
  setCoordinates: (coords: any) => void
  getResult: () => any
  reset: () => void
  getCanvas: (options?: { width?: number; height?: number }) => HTMLCanvasElement | null
}

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const zoom = ref(1)
const baseVisibleWidth = ref(0)

// 高质量缩放函数：使用分步缩放避免大比例缩放产生噪点
const highQualityResize = (source: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
  // 如果目标尺寸更大或相近，直接缩放
  if (targetWidth >= source.width * 0.5) {
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight)
    return canvas
  }

  // 分步缩放：每次缩小一半，直到接近目标尺寸
  let currentCanvas = source
  let currentWidth = source.width
  let currentHeight = source.height

  while (currentWidth * 0.5 > targetWidth) {
    const halfWidth = Math.round(currentWidth * 0.5)
    const halfHeight = Math.round(currentHeight * 0.5)

    const stepCanvas = document.createElement('canvas')
    stepCanvas.width = halfWidth
    stepCanvas.height = halfHeight
    const ctx = stepCanvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(currentCanvas, 0, 0, halfWidth, halfHeight)

    currentCanvas = stepCanvas
    currentWidth = halfWidth
    currentHeight = halfHeight
  }

  // 最后一步缩放到目标尺寸
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = targetWidth
  finalCanvas.height = targetHeight
  const ctx = finalCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight)

  return finalCanvas
}

// 初始化完成
const onReady = () => {
  nextTick(() => {
    const cropper = cropperRef.value
    if (cropper) {
      const result = cropper.getResult()
      baseVisibleWidth.value = result.visibleArea?.width || 0
    }
  })

  // 暴露简洁的 API
  emit('ready', {
    setCoordinates: (coords: any) => cropperRef.value?.setCoordinates(coords),
    getResult: () => cropperRef.value?.getResult(),
    reset: () => {
      cropperRef.value?.reset()
      zoom.value = 1
    },
    getCanvas: (options?: { width?: number; height?: number }) => {
      const result = cropperRef.value?.getResult()
      if (!result?.canvas) return null

      const sourceCanvas = result.canvas as HTMLCanvasElement

      // 如果指定了输出尺寸，创建新 canvas 并高质量缩放
      if (options?.width && options?.height) {
        // 使用分步缩放算法，避免大比例缩放产生噪点
        return highQualityResize(sourceCanvas, options.width, options.height)
      }

      return sourceCanvas
    }
  })
}

// 裁剪区域变化时通知父组件
const onChange = ({ coordinates, visibleArea }: any) => {
  if (coordinates) {
    emit('crop', {
      width: coordinates.width,
      height: coordinates.height,
      left: coordinates.left,
      top: coordinates.top
    })
  }
  // 同步缩放滑块
  if (visibleArea && baseVisibleWidth.value > 0) {
    zoom.value = Math.round((baseVisibleWidth.value / visibleArea.width) * 20) / 20
  }
}

// 缩放控制
const applyZoom = () => {
  const cropper = cropperRef.value
  if (!cropper || baseVisibleWidth.value <= 0) return
  const result = cropper.getResult()
  if (!result.visibleArea) return
  const currentZoom = baseVisibleWidth.value / result.visibleArea.width
  cropper.zoom(zoom.value / currentZoom)
}

const zoomIn = () => {
  zoom.value = Math.min(3, Math.ceil((zoom.value + 0.05) * 10) / 10)
  applyZoom()
}

const zoomOut = () => {
  zoom.value = Math.max(0.1, Math.floor((zoom.value - 0.05) * 10) / 10)
  applyZoom()
}

const reset = () => {
  cropperRef.value?.reset()
  zoom.value = 1
  nextTick(() => {
    const result = cropperRef.value?.getResult()
    baseVisibleWidth.value = result?.visibleArea?.width || 0
  })
}

// 监听比例变化时重置
watch(() => props.aspectRatio, () => {
  cropperRef.value?.reset()
})
</script>

<style>
.vue-advanced-cropper {
  background-color: #1a1a1a;
}

.vue-advanced-cropper__background {
  background-color: rgba(0, 0, 0, 0.6);
}

.vue-rectangle-stencil__preview {
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 33.333% 33.333%;
}

.vue-simple-line {
  background-color: rgba(255, 255, 255, 0.8) !important;
}

.vue-rectangle-stencil {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}
</style>
