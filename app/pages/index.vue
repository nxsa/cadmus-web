<template>
    <div class="pg-index">
        <UMain class="content-grid min-h-screen">
            <div class="content-col">
                <header class="pg-header">
                    <NuxtLink to="/" class="index-link">
                        <NuxtImg src="/logo/cadmus-logo.svg" width="140" alt="Cadmus Design Studio" fit="contain" />
                    </NuxtLink>
                </header>
                <section class="content-section">
                    <div class="ct-grid">
                        <h1 class="ct-title">Thoughtful product design from concept to launch.</h1>
                        <div class="ct-desc">
                            <p class="desc-item">Cadmus is a product design studio helping early-stage founders turn
                                complex ideas into intuitive, market-ready products that move the needle.<br><br>
                                I partner with early-stage teams to go from napkin sketch to polished launch.
                                <br><br>
                                From web apps and mobile products to marketing sites and the occasional brand design,
                                I'd love to hear more about what you're building.
                            </p>
                        </div>
                        <div class="ct-actions  mt-3">
                            <UButton to="mailto:nos.onaiwu@gmail.com" color="primary" size="lg"
                                class="btn bg-stone-950 px-4 hover:bg-stone-800 hover:shadow-[0_0_0_4px_var(--color-stone-300)] active:bg-stone-800">
                                Start a project
                            </UButton>
                        </div>
                    </div>
                </section>
            </div>
            <div class="image-col">
                <PortfolioGallery />
            </div>
        </UMain>
    </div>
</template>

<script setup lang="ts">

</script>
