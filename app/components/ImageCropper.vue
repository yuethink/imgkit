<template>
  <div class="relative w-full h-full bg-neutral-900 rounded-lg overflow-hidden">
    <ClientOnly>
      <Cropper ref="cropperRef" class="w-full h-full" :src="src" :auto-zoom="true" :stencil-size="stencilSize"
        :stencil-props="{
          handlers: {},
          movable: false,
          resizable: false,
          aspectRatio: computedAspectRatio
        }" :resize-image="{
          adjustStencil: false
        }" image-restriction="stencil" @change="onChange" @ready="onReady" />
      <template #fallback>
        <div class="flex items-center justify-center h-full text-neutral-400">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        </div>
      </template>
    </ClientOnly>
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

const onChange = ({ coordinates }: any) => {
  if (coordinates) {
    emit('crop', {
      width: coordinates.width,
      height: coordinates.height,
      x: coordinates.left,
      y: coordinates.top
    })
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
