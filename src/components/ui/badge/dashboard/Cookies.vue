<script setup>
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue';
import BaseHeading from '@/components/ui/typography/BaseHeading.vue';
import BaseParagraph from '@/components/ui/typography/BaseParagraph.vue';

</script>

<template>
    <div class="p-4 bg-gray-500/50 [caret-color:transparent] w-[300px] sm:w-[400px] rounded-lg flex flex-col gap-4">
    <BaseHeading text="This website uses cookies." tag="h4" theme="AuthHeading" />
     <BaseParagraph
              text="We use cookies to analyze website traffic and optmize your website experience. By accepting our use of cookies, your data will be aggregated with all other user data."
              font-size="text-base"
              font-weight="font-[400]"
              font-color="text-white"
            />
    
    <PrimaryButton text="Accept" variant="authPink" size="lg" />
    
    </div>
</template>