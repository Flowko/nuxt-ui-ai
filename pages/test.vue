<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="flex flex-col items-center justify-center w-64 h-64 bg-white shadow-lg rounded-lg">
      <UIcon name="i-heroicons-musical-note-solid" class="text-4xl text-gray-700" />
      <div class="mt-4 text-center">
        <p class="text-lg font-medium text-gray-700">Song Title</p>
        <p class="text-sm text-gray-500">Song Artist</p>
      </div>
      <div class="mt-6 flex items-center justify-center space-x-4">
        <UIcon name="i-heroicons-play-pause" class="text-2xl text-gray-700 cursor-pointer" />
        <UIcon name="i-heroicons-musical-note-20-solid" class="text-2xl text-gray-700 cursor-pointer" />
        <UIcon name="i-heroicons-play-pause-solid" class="text-2xl text-gray-700 cursor-pointer" />
      </div>
      <div class="mt-6">
        <UIcon name="i-heroicons-speaker-wave" class="text-2xl text-gray-700" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const playing = ref(false);

const togglePlay = () => {
  playing.value = !playing.value;
};
</script>