<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputAuthComponent" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-800 p-6 rounded-xl">
                    <!-- 1. Default -->
                    <DemoCard label="Default" dark>
                        <InputAuthComponent v-model="vals.ia1" placeholder="Enter text..." />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label" dark>
                        <InputAuthComponent v-model="vals.ia2" placeholder="Email" showLabel
                            labelText="Email Address" />
                    </DemoCard>
                    <!-- 3. Password type -->
                    <DemoCard label="Password Type" dark>
                        <InputAuthComponent v-model="vals.ia3" type="password" placeholder="••••••••" showLabel
                            labelText="Password" />
                    </DemoCard>
                    <!-- 4. With left icon -->
                    <DemoCard label="With Left Icon" dark>
                        <InputAuthComponent v-model="vals.ia4" placeholder="Username" showLabel labelText="Username"
                            :leftIcon="UserIcon" />
                    </DemoCard>
                    <!-- 5. With right icon -->
                    <DemoCard label="With Right Icon" dark>
                        <InputAuthComponent v-model="vals.ia5" placeholder="Search..."
                            :rightIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 6. Required (*) -->
                    <DemoCard label="Required (*)" dark>
                        <InputAuthComponent v-model="vals.ia6" placeholder="Enter..." showLabel labelText="Username"
                            requiredDisplay="*" />
                    </DemoCard>
                    <!-- 7. Disabled -->
                    <DemoCard label="Disabled" dark>
                        <InputAuthComponent v-model="vals.ia7" placeholder="Disabled..." showLabel
                            labelText="Disabled Field" :disabled="true" />
                    </DemoCard>
                    <!-- 8. With errors -->
                    <DemoCard label="With Errors" dark>
                        <InputAuthComponent v-model="vals.ia8" placeholder="Enter email..." showLabel labelText="Email"
                            showErrors :errors="[{ error: 'Invalid email format' }]" />
                    </DemoCard>
                    <!-- 9. With success -->
                    <DemoCard label="With Success" dark>
                        <InputAuthComponent v-model="vals.ia9" placeholder="Username..." showLabel labelText="Username"
                            onSuccess :success="[{ message: 'Available!' }]" />
                    </DemoCard>
                    <!-- 10. Custom label color -->
                    <DemoCard label="Custom Label Color" dark>
                        <InputAuthComponent v-model="vals.ia10" placeholder="Enter..." showLabel labelText="Field Label"
                            labelColor="text-yellow-400" textColor="text-yellow-100"
                            placeholderColor="placeholder:text-yellow-200" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import InputAuthComponent from '@/components/input/InputAuthComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
import { UserIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

const vals = reactive({
    ia1: '', ia2: '', ia3: '', ia4: '', ia5: '', ia6: '', ia7: 'disabled text', ia8: '', ia9: '', ia10: ''
});
</script>
