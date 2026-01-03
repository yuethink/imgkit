<template>
  <div
    class="upload-zone relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group"
    :class="[
      isDragging
        ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]'
        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-500/5'
    ]" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
    @click="triggerFileInput">
    <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFileChange">

    <div class="flex flex-col items-center gap-4 text-center p-6">
      <!-- Icon with gradient background -->
      <div class="relative">
        <div
          class="w-20 h-20 rounded-2xl bg-linear-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 text-emerald-500" />
        </div>
        <!-- Animated ring -->
        <div
          class="absolute inset-0 rounded-2xl border-2 border-emerald-500/30 animate-ping opacity-0 group-hover:opacity-100">
        </div>
      </div>

      <div v-if="!modelValue" class="space-y-2">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          点击或拖拽上传图片
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          支持 JPG, PNG, WebP, AVIF 格式
        </p>
        <div class="flex items-center justify-center gap-2 mt-3">
          <span
            class="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            最大 20MB
          </span>
        </div>
      </div>

      <div v-else class="flex items-center gap-2 text-emerald-500 font-medium">
        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
        <span>已选择图片，点击更换</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: File | null
}>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

const handleFile = (file: File) => {
  if (file && file.type.startsWith('image/')) {
    emit('update:modelValue', file)
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  // Reset input so same file can be selected again
  if (input) input.value = ''
}

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>
