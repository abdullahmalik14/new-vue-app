<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="ButtonComponent" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <!-- 1. Primary -->
                    <DemoCard label="Primary">
                        <ButtonComponent text="Primary Button" variant="primary" version=""
                            customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 2. Secondary -->
                    <DemoCard label="Secondary">
                        <ButtonComponent text="Secondary Button" variant="secondary" version=""
                            customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 3. Success -->
                    <DemoCard label="Success">
                        <ButtonComponent text="Confirm" variant="success" version="" customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 4. Danger -->
                    <DemoCard label="Danger">
                        <ButtonComponent text="Delete" variant="danger" version="" customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 5. Warning -->
                    <DemoCard label="Warning">
                        <ButtonComponent text="Warning" variant="warning" version="" customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 6. Outline -->
                    <DemoCard label="Outline">
                        <ButtonComponent text="Cancel" variant="outline" version="" customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 7. Disabled -->
                    <DemoCard label="Disabled">
                        <ButtonComponent text="Disabled" variant="primary" version="" :disabled="true"
                            customClass="px-4 py-2.5 w-full" />
                    </DemoCard>

                    <!-- 8. Small -->
                    <DemoCard label="Small (sm)">
                        <ButtonComponent text="Small Button" variant="primary" size="sm" version=""
                            customClass="px-3 py-1.5 w-full" />
                    </DemoCard>

                    <!-- 9. Large -->
                    <DemoCard label="Large (lg)">
                        <ButtonComponent text="Large Button" variant="primary" size="lg" version=""
                            customClass="px-6 py-3 w-full" />
                    </DemoCard>

                    <!-- 10. Left Icon — Primary -->
                    <DemoCard label="Left Icon (Primary)">
                        <ButtonComponent text="Download" variant="primary" version="" customClass="px-4 py-2.5 w-full"
                            leftIcon="https://api.iconify.design/heroicons:arrow-down-tray.svg?color=%23ffffff"
                            leftIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 11. Right Icon — Primary -->
                    <DemoCard label="Right Icon (Primary)">
                        <ButtonComponent text="Next Step" variant="primary" version="" customClass="px-4 py-2.5 w-full"
                            rightIcon="https://api.iconify.design/heroicons:arrow-right.svg?color=%23ffffff"
                            rightIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 12. Left + Right Icons — Outline -->
                    <DemoCard label="Left + Right Icon (Outline)">
                        <ButtonComponent text="Share" variant="outline" version="" customClass="px-4 py-2.5 w-full"
                            leftIcon="https://api.iconify.design/heroicons:share.svg?color=%23374151"
                            leftIconClass="w-4 h-4 inline-block align-middle"
                            rightIcon="https://api.iconify.design/heroicons:arrow-right.svg?color=%23374151"
                            rightIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 13. Left Icon — Success -->
                    <DemoCard label="Left Icon (Success)">
                        <ButtonComponent text="Save Changes" variant="success" version=""
                            customClass="px-4 py-2.5 w-full"
                            leftIcon="https://api.iconify.design/heroicons:check.svg?color=%23ffffff"
                            leftIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 14. Left Icon — Danger -->
                    <DemoCard label="Left Icon (Danger)">
                        <ButtonComponent text="Delete Item" variant="danger" version="" customClass="px-4 py-2.5 w-full"
                            leftIcon="https://api.iconify.design/heroicons:trash.svg?color=%23ffffff"
                            leftIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 15. Right Icon — External -->
                    <DemoCard label="Right Icon (External Link)">
                        <ButtonComponent text="Open Link" variant="outline" version="" customClass="px-4 py-2.5 w-full"
                            rightIcon="https://api.iconify.design/heroicons:arrow-top-right-on-square.svg?color=%23374151"
                            rightIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 16. Left Icon — Warning -->
                    <DemoCard label="Left Icon (Warning)">
                        <ButtonComponent text="Report Issue" variant="warning" version=""
                            customClass="px-4 py-2.5 w-full"
                            leftIcon="https://api.iconify.design/heroicons:exclamation-triangle.svg?color=%23000000"
                            leftIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 17. Polygon Left — Green -->
                    <DemoCard label="Polygon Left (Green)">
                        <ButtonComponent text="Subscribe" variant="polygonLeft" version="" btnBg="#07f468"
                            btnHoverBg="#000" btnText="#000" btnHoverText="#07f468" />
                    </DemoCard>

                    <!-- 18. Polygon Left — Pink -->
                    <DemoCard label="Polygon Left (Pink)">
                        <ButtonComponent text="Join Now" variant="polygonLeft" version="" btnBg="#FF0066"
                            btnHoverBg="#000" btnText="#fff" btnHoverText="#FF0066" />
                    </DemoCard>

                    <!-- 19. Polygon Right -->
                    <DemoCard label="Polygon Right">
                        <ButtonComponent text="Explore" variant="polygonRight" version="" />
                    </DemoCard>

                    <!-- 20. BG Green -->
                    <DemoCard label="BG Green (Hover Black)">
                        <ButtonComponent text="Get Started" variant="bgGreen" version="" />
                    </DemoCard>

                    <!-- 21. Retry Action -->
                    <DemoCard label="Retry Action">
                        <ButtonComponent text="Try Again" variant="retryAction" version=""
                            leftIcon="https://api.iconify.design/heroicons:arrow-path.svg?color=%2307f468"
                            leftIconClass="w-4 h-4 inline-block align-middle" />
                    </DemoCard>

                    <!-- 22. simpleBtn -->
                    <DemoCard label="Simple Button (Custom Colors)">
                        <ButtonComponent text="Custom" variant="simpleBtn" version="" btnBg="#6366f1"
                            btnHoverBg="#4f46e5" btnText="#fff" btnHoverText="#fff" />
                    </DemoCard>

                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
</script>
