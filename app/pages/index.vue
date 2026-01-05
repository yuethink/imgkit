<template>
  <div
    class="min-h-screen relative overflow-hidden bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

    <!-- Decorative Blobs -->
    <div
      class="bg-blob w-96 h-96 rounded-full bg-emerald-400/20 top-0 left-0 -translate-x-1/2 -translate-y-1/2 blur-3xl">
    </div>
    <div class="bg-blob w-96 h-96 rounded-full bg-blue-500/20 bottom-0 right-0 translate-x-1/3 translate-y-1/3 blur-3xl"
      style="animation-delay: -5s"></div>

    <!-- Header -->
    <header
      class="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo.svg" alt="ImgKit" class="h-8" />
        </div>
        <div class="flex items-center gap-2">
          <!-- Language Switcher -->
          <UDropdownMenu :items="langItems">
            <UButton color="neutral" variant="ghost" icon="i-heroicons-language"
              :label="locale === 'zh' ? '中' : 'EN'" />
          </UDropdownMenu>

          <UButton icon="i-heroicons-moon" color="neutral" variant="ghost" class="dark:hidden hover:bg-gray-100/50"
            @click="$colorMode.preference = 'dark'" />
          <UButton icon="i-heroicons-sun" color="neutral" variant="ghost" class="hidden dark:flex hover:bg-gray-800/50"
            @click="$colorMode.preference = 'light'" />

          <!-- GitHub -->
          <UButton to="https://github.com/yuethink/imgkit" target="_blank" icon="i-simple-icons-github" color="neutral"
            variant="ghost" />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-10 relative z-10">
      <div class="max-w-6xl mx-auto space-y-8 animate-enter">

        <!-- Upload Section -->
        <div v-if="!selectedFile" class="max-w-2xl mx-auto py-10">
          <div class="text-center mb-10 space-y-4">
            <div class="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/10 mb-2">
              <span class="text-emerald-500 text-xs font-medium px-2">{{ $t('app.features.simple_efficient_safe')
                }}</span>
            </div>
            <h2
              class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-linear-to-r from-emerald-500 via-blue-500 to-violet-500 bg-clip-text text-transparent pb-1">
              {{ $t('app.title') }}
            </h2>
            <p class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {{ $t('app.description') }}
            </p>
          </div>
          <UCard class="card-glass border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
            <ImageUploader v-model="selectedFile" />
          </UCard>
        </div>

        <!-- Editor Section -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-enter">
          <!-- Left: Preview & Cropper -->
          <div class="lg:col-span-2 space-y-4">
            <UCard class="card-glass border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden">
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-lg">{{ $t('editor.preview_title') }}</h3>
                  <div class="flex gap-2">
                    <UButton v-if="cropper" color="neutral" variant="soft" size="xs" icon="i-heroicons-arrow-uturn-left"
                      @click="resetCropper">
                      {{ $t('editor.reset_original') }}
                    </UButton>
                    <UButton v-if="selectedFile" color="neutral" variant="soft" size="xs" icon="i-heroicons-x-mark"
                      @click="clearFile">
                      {{ $t('editor.reupload') }}
                    </UButton>
                  </div>
                </div>
              </template>

              <div class="h-[450px] rounded-xl overflow-hidden">
                <ClientOnly>
                  <ImageCropper v-if="previewUrl" ref="cropperRef" :src="previewUrl" :aspect-ratio="cropperAspectRatio"
                    :stencil-width="settings.width" :stencil-height="settings.height" @ready="onCropperReady"
                    @crop="onCrop" />
                  <template #fallback>
                    <div class="flex items-center justify-center h-full text-gray-400">
                      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
                    </div>
                  </template>
                </ClientOnly>
              </div>

              <template #footer>
                <div class="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-photo" class="w-4 h-4" />
                    <span>{{ $t('editor.original_size') }}: <strong>{{ originalDimensions }}</strong></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-document" class="w-4 h-4" />
                    <span>{{ $t('editor.original_file_size') }}: <strong>{{ formatSize(selectedFile?.size || 0)
                        }}</strong></span>
                  </div>
                </div>
              </template>
            </UCard>
          </div>

          <!-- Right: Settings (Sticky) -->
          <div class="lg:sticky lg:top-24 space-y-4">
            <ImageSettings v-model="settings" :loading="processing" @ratio-change="onRatioChange"
              @size-change="onSizeChange" @download="handleDownload" />
          </div>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200/50 dark:border-gray-800/50 mt-12 py-6">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          © {{ new Date().getFullYear() }}
          <a href="https://www.yuethink.com" target="_blank" rel="noopener"
            class="text-emerald-500 hover:text-emerald-600 transition-colors">
            {{ $t('footer.company') }}
          </a>
          · {{ $t('footer.rights') }}
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t, locale, setLocale } = useI18n()

// SEO Meta configuration
useSeoMeta({
  title: t('meta.title'),
  ogTitle: t('meta.title'),
  description: t('meta.description'),
  ogDescription: t('meta.description'),
  ogImage: 'https://imgkit.yuethink.com/og-image.jpg',
  twitterCard: 'summary_large_image',
})

const selectedFile = ref<File | null>(null)
const previewUrl = ref('')

// Language Switcher Items
const langItems = [
  [{
    label: '简体中文',
    icon: 'i-heroicons-globe-asia-australia',
    onSelect: () => setLocale('zh')
  }, {
    label: 'English',
    icon: 'i-heroicons-globe-americas',
    onSelect: () => setLocale('en')
  }]
]

const originalDimensions = ref(t('editor.calculating'))

// Create preview URL when file changes
watch(selectedFile, (file) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  if (file) {
    previewUrl.value = URL.createObjectURL(file)

    // Get dimensions and init settings with actual image size
    const img = new Image()
    img.onload = () => {
      originalDimensions.value = `${img.width} x ${img.height}`
      // 初始化设置为图片实际尺寸，剪切框按图片比例生成
      settings.value.width = img.width
      settings.value.height = img.height
    }
    img.src = previewUrl.value
  } else {
    previewUrl.value = ''
    originalDimensions.value = ''
  }
})

const clearFile = () => {
  selectedFile.value = null
}

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        selectedFile.value = file
      }
      return
    }
  }
}

onMounted(() => {
  window.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})

// Settings State
const settings = ref({
  width: 800,
  height: 450,
  format: 'webp' as 'webp' | 'jpeg' | 'png' | 'avif',
  quality: 80,
  filename: ''
})

const processing = ref(false)
const cropperAspectRatio = ref<number | undefined>(undefined)
const cropper = ref<any>(null)
const cropperRef = ref(null)

const onCropperReady = (instance: any) => {
  cropper.value = instance
  // Init settings with natural dimensions
  const data = instance.getData()
  settings.value.width = Math.round(data.width)
  settings.value.height = Math.round(data.height)
}

// Static 模式下 onCrop 不需要同步尺寸（剪切框固定）
const onCrop = (_data: { width: number; height: number }) => {
  // 剪切框尺寸由设置决定，不需要同步回来
}

// 重置裁剪器到初始状态
const resetCropper = () => {
  if (cropper.value) {
    cropper.value.reset()
  }
}

const onRatioChange = (ratio: number | undefined) => {
  cropperAspectRatio.value = ratio
  // 切换比例后重置 cropper
  nextTick(() => {
    if (cropper.value) {
      cropper.value.reset()
    }
  })
}

// 切换尺寸后重置 cropper
const onSizeChange = () => {
  nextTick(() => {
    if (cropper.value) {
      cropper.value.reset()
    }
  })
}



const handleDownload = async () => {
  if (!selectedFile.value || !cropper.value) return

  processing.value = true
  try {
    // 获取裁剪后的 canvas

    // 1. Get cropped canvas
    // v2 wrapper returns a promise for getCroppedCanvas
    const canvas = await cropper.value.getCroppedCanvas({
      width: settings.value.width,
      height: settings.value.height
      // Note: passing width/height here resizes the output
    })

    // 使用 JPEG 格式发送给服务端，减少传输量
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    })

    if (!blob) throw new Error('Canvas is empty')

    // 3. Send to server for optimization
    const formData = new FormData()
    formData.append('image', blob, selectedFile.value?.name)
    formData.append('quality', String(settings.value.quality))
    formData.append('format', settings.value.format)

    const response = await $fetch('/api/process', {
      method: 'POST',
      body: formData,
      responseType: 'blob'
    })

    // 4. Download
    const url = window.URL.createObjectURL(response as unknown as Blob)
    const link = document.createElement('a')
    link.href = url
    // 文件名带真实尺寸
    const ext = settings.value.format
    const defaultName = `image_${settings.value.width}x${settings.value.height}`
    const name = settings.value.filename || defaultName
    link.download = `${name}.${ext}`
    link.click()
    window.URL.revokeObjectURL(url)

  } catch (error) {
    console.error(error)
    alert(t('editor.error_processing'))
  } finally {
    processing.value = false
  }
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
