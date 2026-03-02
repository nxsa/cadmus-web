<template>
    <div class="pg-index">
        <UMain class="content-grid min-h-screen">
            <div class="content-col">
                <header class="pg-header">
                    <NuxtLink to="/" class="index-link">
                        <NuxtImg src="/logo/cadmus-logo.svg" width="100" alt="Cadmus Design Studio" fit="contain" />
                    </NuxtLink>
                </header>
                <section class="content-section">
                    <div class="ct-grid">
                        <h3 class="ct-meta">Product design with an engineering mindset</h3>
                        <h1 class="ct-title">From idea to design and, sometimes, all the way to launch. Thoughtfully.
                        </h1>
                        <div class="ct-desc">
                            <p class="desc-item">Cadmus is my space on the web where I design and build products that
                                actually move things forward.
                                <br><br>
                                I enjoy working with early stage teams and founders, helping turn ideas into real
                                products
                                and figuring out what comes next.
                                <br><br>
                                If you're building something new, whether it's a marketing site or a full app for web or
                                mobile, let's talk and bring it to life.
                            </p>
                        </div>
                        <div class="ct-actions  mt-3">
                            <UButton to="mailto:nos.onaiwu@gmail.com" color="primary" size="lg"
                                class="btn bg-stone-950 px-4 hover:bg-stone-800 hover:shadow-[0_0_0_4px_var(--color-stone-300)] active:bg-stone-800">
                                Get in Touch
                            </UButton>
                        </div>
                    </div>
                </section>
            </div>
            <div class="image-col"></div>
        </UMain>
    </div>
</template>

<script setup lang="ts">

</script>
