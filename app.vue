<script setup lang="ts"></script>

<template>
  <div class="h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
  </div>
</template>

<style lang="scss">
#__nuxt {
  @apply h-full;
}
</style>
