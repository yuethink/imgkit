<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
</script>
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Analytics />
    </ClientOnly>
  </UApp>
</template>
