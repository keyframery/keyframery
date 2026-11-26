<script setup lang="ts">
// Round avatar
// `shape="circle"` with `aspectRatio={1}` and `mode="frame"` fixes the circle and moves the photo under it, the way profile photos work. The slider zooms.

import { ImageCropper, ImageCropperImage, ImageCropperSelection, ImageCropperViewport, ImageCropperZoom } from "@/components/keyframery/image-cropper"
</script>

<template>
  <ImageCropper
    src="/demo/face-2.jpg"
    shape="circle"
    :aspect-ratio="1"
    mode="frame"
    :max-zoom="3"
    aria-label="Profile photo"
    class="w-full max-w-[300px]"
  >
    <ImageCropperViewport>
      <ImageCropperImage alt="" />
      <ImageCropperSelection />
    </ImageCropperViewport>
    <ImageCropperZoom aria-label="Zoom" />
  </ImageCropper>
</template>
