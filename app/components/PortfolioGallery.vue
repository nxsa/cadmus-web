<template>
    <section class="portfolio-gallery">
        <div v-if="status === 'pending' || !data" class="gallery-state">Loading images…</div>
        <div v-else-if="error" class="gallery-state">Unable to load images.</div>
        <div v-else-if="!images.length" class="gallery-state">No images found.</div>
        <TransitionGroup v-else name="gallery" tag="div" class="gallery-grid">
            <figure v-for="(img, index) in images" :key="img.filename" class="gallery-card"
                :style="{ transitionDelay: `${Math.min(index * 40, 200)}ms` }">
                <img :src="img.url" :alt="img.filename" loading="lazy" decoding="async" />
            </figure>
        </TransitionGroup>
    </section>
</template>

<script setup lang="ts">
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
    // public assets are served by the browser, not as Nitro server routes
    server: false,
    lazy: false,
});

const images = computed(() => (data.value?.images ?? []) as ImageEntry[]);
const status = computed(() => (pending.value ? 'pending' : (error.value ? 'error' : 'ready')));

// expose refresh for possible client usage
const refreshIndex = () => refresh();

defineExpose({ refreshIndex });
</script>

<style scoped></style>
