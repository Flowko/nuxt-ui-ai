<template>
  <div class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white shadow-md" v-if="showBanner">
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center">
        <p class="text-sm text-gray-600">
          We use cookies to ensure you get the best experience on our website.
          <a href="#" class="text-indigo-600 underline">Learn More</a>
        </p>
      </div>
      <div class="flex items-center">
        <button class="text-sm text-indigo-600 underline mr-4" @click="showBanner = false">Dismiss</button>
        <button class="bg-indigo-600 text-white text-sm py-1 px-2 rounded" @click="showBanner = false">I Agree</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showBanner = ref(true)
</script>