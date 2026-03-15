<template>
    <section class="portfolio-gallery">
        <div v-if="status === 'pending'" class="gallery-state">Loading images…</div>
        <div v-else-if="error" class="gallery-state">Unable to load images.</div>
        <div v-else-if="!images.length" class="gallery-state">No images found.</div>
        <div v-else class="gallery-grid">
            <figure v-for="img in images" :key="img.filename" class="gallery-card">
                <img :src="img.url" :alt="img.filename" loading="lazy" decoding="async" />
            </figure>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';

interface ImageEntry {
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
}

interface PortfolioResponse {
    images: ImageEntry[];
}

const { data, error, pending, refresh } = await useFetch<PortfolioResponse>('/portfolio/index.json', {
    // disable auto client-side refresh, but let SSR fetch it
    server: true,
    lazy: false,
});

const images = computed(() => (data.value?.images ?? []) as ImageEntry[]);
const status = computed(() => (pending.value ? 'pending' : (error.value ? 'error' : 'ready')));

// expose refresh for possible client usage
const refreshIndex = () => refresh();

defineExpose({ refreshIndex });
</script>

<style scoped></style>
