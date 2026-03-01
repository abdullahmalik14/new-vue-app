<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">

            <!-- PAGE TITLE -->
            <div class="text-center">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">🧩 Component Showcase</h1>
                <p class="mt-2 text-gray-500 dark:text-gray-400 text-lg">All components with ~10 variations each</p>
            </div>

            <!-- ===== SECTION: InputComponentDashboard ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputComponentDashboard" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <InputComponentDashboard v-model="vals.icd1" placeholder="Enter text..." showLabel
                            labelText="Username" />
                    </DemoCard>
                    <!-- 2. With left icon -->
                    <DemoCard label="With Left Icon">
                        <InputComponentDashboard v-model="vals.icd2" placeholder="Search..." showLabel
                            labelText="Search" :leftIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 3. With right icon -->
                    <DemoCard label="With Right Icon">
                        <InputComponentDashboard v-model="vals.icd3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                    </DemoCard>
                    <!-- 4. Required (*) -->
                    <DemoCard label="Required (*)">
                        <InputComponentDashboard v-model="vals.icd4" placeholder="Required field" showLabel
                            labelText="Full Name" requiredDisplay="*" />
                    </DemoCard>
                    <!-- 5. Required italic text -->
                    <DemoCard label="Required (italic-text)">
                        <InputComponentDashboard v-model="vals.icd5" placeholder="Enter..." showLabel labelText="Email"
                            requiredDisplay="italic-text" requiredDisplayText="Required" />
                    </DemoCard>
                    <!-- 6. With description -->
                    <DemoCard label="With Description">
                        <InputComponentDashboard v-model="vals.icd6" placeholder="your@email.com" showLabel
                            labelText="Email" description="We'll never share your email." />
                    </DemoCard>
                    <!-- 7. With errors -->
                    <DemoCard label="With Errors">
                        <InputComponentDashboard v-model="vals.icd7" placeholder="Enter..." showLabel
                            labelText="Password" showErrors
                            :errors="[{ error: 'Must be at least 8 characters' }, { error: 'Must contain a number' }]" />
                    </DemoCard>
                    <!-- 8. With success -->
                    <DemoCard label="With Success">
                        <InputComponentDashboard v-model="vals.icd8" placeholder="Enter..." showLabel
                            labelText="Username" onSuccess :success="[{ message: 'Username is available!' }]" />
                    </DemoCard>
                    <!-- 9. Left span (prefix) -->
                    <DemoCard label="Left Span (Prefix)">
                        <InputComponentDashboard v-model="vals.icd9" placeholder="amount" showLabel labelText="Price"
                            leftSpan leftSpanText="USD" leftSpanClass="text-gray-500" />
                    </DemoCard>
                    <!-- 10. Right span (suffix) -->
                    <DemoCard label="Right Span (Suffix)">
                        <InputComponentDashboard v-model="vals.icd10" placeholder="0.00" showLabel labelText="Weight"
                            rightSpan rightSpanText="kg" rightSpanClass="text-gray-500" />
                    </DemoCard>
                    <!-- 11. Textarea -->
                    <DemoCard label="Textarea">
                        <InputComponentDashboard v-model="vals.icd11" type="textarea" showLabel labelText="Bio"
                            placeholder="Write something..." />
                    </DemoCard>
                    <!-- 12. Required error text -->
                    <DemoCard label="Required Error Text">
                        <InputComponentDashboard v-model="vals.icd12" placeholder="Enter..." showLabel labelText="Phone"
                            requiredDisplay="required-text-error" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: BaseInput ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="BaseInput" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default text -->
                    <DemoCard label="Default Text">
                        <BaseInput v-model="vals.bi1" placeholder="Enter text..." label="Name"
                            labelClass="block text-sm font-medium text-gray-700"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label">
                        <BaseInput v-model="vals.bi2" placeholder="john@example.com" label="Email Address"
                            labelFor="email-base"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </DemoCard>
                    <!-- 3. Disabled -->
                    <DemoCard label="Disabled">
                        <BaseInput v-model="vals.bi3" placeholder="Disabled input" label="Disabled" :disabled="true"
                            inputClass="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
                    </DemoCard>
                    <!-- 4. Number with controls -->
                    <DemoCard label="Number with Controls">
                        <BaseInput v-model="vals.bi4" type="number" label="Quantity" :showControls="true"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
                    </DemoCard>
                    <!-- 5. With max length counter -->
                    <DemoCard label="With Character Counter">
                        <BaseInput v-model="vals.bi5" placeholder="Max 50 chars..." label="Title" :maxLength="50"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
                    </DemoCard>
                    <!-- 6. Textarea mode -->
                    <DemoCard label="Textarea Mode">
                        <BaseInput v-model="vals.bi6" type="textarea" label="Description"
                            placeholder="Enter description..." :rows="3"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none resize-none" />
                    </DemoCard>
                    <!-- 7. Textarea with max length -->
                    <DemoCard label="Textarea + Counter">
                        <BaseInput v-model="vals.bi7" type="textarea" label="Bio" placeholder="Your bio..." :rows="3"
                            :maxLength="200"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none resize-none" />
                    </DemoCard>
                    <!-- 8. Error style -->
                    <DemoCard label="Error State">
                        <BaseInput v-model="vals.bi8" placeholder="Wrong value" label="Email"
                            inputClass="w-full border border-red-400 bg-red-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </DemoCard>
                    <!-- 9. Success style -->
                    <DemoCard label="Success State">
                        <BaseInput v-model="vals.bi9" placeholder="valid@email.com" label="Email"
                            inputClass="w-full border border-green-400 bg-green-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </DemoCard>
                    <!-- 10. Number no controls -->
                    <DemoCard label="Number (No Controls)">
                        <BaseInput v-model="vals.bi10" type="number" label="Age" :showControls="false"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: InputAuthComponent ===== -->
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

            <!-- ===== SECTION: InputDefaultComponent ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputDefaultComponent" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <InputDefaultComponent v-model="vals.id1" placeholder="Enter text..." showLabel
                            labelText="Name" />
                    </DemoCard>
                    <!-- 2. With left icon -->
                    <DemoCard label="With Left Icon">
                        <InputDefaultComponent v-model="vals.id2" placeholder="Search..." showLabel labelText="Search"
                            :leftIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 3. With right icon -->
                    <DemoCard label="With Right Icon">
                        <InputDefaultComponent v-model="vals.id3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                    </DemoCard>
                    <!-- 4. Error state -->
                    <DemoCard label="Error State">
                        <InputDefaultComponent v-model="vals.id4" placeholder="Enter email" showLabel labelText="Email"
                            :error="true" errorMessage="Invalid email address." />
                    </DemoCard>
                    <!-- 5. Required -->
                    <DemoCard label="Required (*)">
                        <InputDefaultComponent v-model="vals.id5" placeholder="Required" showLabel
                            labelText="Required Field" requiredDisplay="*" />
                    </DemoCard>
                    <!-- 6. Optional label -->
                    <DemoCard label="Optional Label">
                        <InputDefaultComponent v-model="vals.id6" placeholder="Optional..." showLabel
                            labelText="Nickname" isOptional />
                    </DemoCard>
                    <!-- 7. Textarea -->
                    <DemoCard label="Textarea">
                        <InputDefaultComponent v-model="vals.id7" type="textarea" showLabel labelText="Description" />
                    </DemoCard>
                    <!-- 8. Number type -->
                    <DemoCard label="Number Type">
                        <InputDefaultComponent v-model="vals.id8" type="number" showLabel labelText="Amount"
                            placeholder="0" />
                    </DemoCard>
                    <!-- 9. Left span prefix -->
                    <DemoCard label="Left Span Prefix">
                        <InputDefaultComponent v-model="vals.id9" placeholder="0.00" showLabel labelText="Price"
                            leftSpan leftSpanText="$" />
                    </DemoCard>
                    <!-- 10. With description -->
                    <DemoCard label="With Description">
                        <InputDefaultComponent v-model="vals.id10" placeholder="username" showLabel labelText="Username"
                            description="Only letters and numbers allowed." />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: CodeInputAuthComponent ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CodeInputAuthComponent" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-800 p-6 rounded-xl">
                    <!-- 1. Default -->
                    <DemoCard label="Default" dark>
                        <CodeInputAuthComponent v-model="vals.ci1" />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label" dark>
                        <CodeInputAuthComponent v-model="vals.ci2" showLabel labelText="Enter OTP" />
                    </DemoCard>
                    <!-- 3. Required display -->
                    <DemoCard label="Required (*)" dark>
                        <CodeInputAuthComponent v-model="vals.ci3" showLabel labelText="Verification Code"
                            requiredDisplay="*" />
                    </DemoCard>
                    <!-- 4. Disabled -->
                    <DemoCard label="Disabled" dark>
                        <CodeInputAuthComponent v-model="vals.ci4" showLabel labelText="Disabled" :disabled="true" />
                    </DemoCard>
                    <!-- 5. With errors -->
                    <DemoCard label="With Errors" dark>
                        <CodeInputAuthComponent v-model="vals.ci5" showLabel labelText="Enter Code" showErrors
                            :errors="[{ error: 'Invalid OTP code. Please try again.' }]" />
                    </DemoCard>
                    <!-- 6. Submitting state -->
                    <DemoCard label="Submitting State" dark>
                        <CodeInputAuthComponent v-model="vals.ci6" showLabel labelText="Verifying..."
                            :isSubmitting="true" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: CheckboxGroup ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CheckboxGroup" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <CheckboxGroup v-model="vals.cg1" label="Subscribe to newsletter" />
                    </DemoCard>
                    <!-- 2. Checked -->
                    <DemoCard label="Checked">
                        <CheckboxGroup v-model="vals.cg2" label="I agree to terms" />
                    </DemoCard>
                    <!-- 3. Disabled -->
                    <DemoCard label="Disabled">
                        <CheckboxGroup v-model="vals.cg3" label="Disabled option" :disabled="true" />
                    </DemoCard>
                    <!-- 4. With meta text -->
                    <DemoCard label="With Meta Text">
                        <CheckboxGroup v-model="vals.cg4" label="Premium feature" metaText="Pro only" />
                    </DemoCard>
                    <!-- 5. With tags -->
                    <DemoCard label="With Tags">
                        <CheckboxGroup v-model="vals.cg5" label="New feature"
                            :tags="[{ text: 'NEW', variant: '#07f468', class: 'text-black' }]" />
                    </DemoCard>
                    <!-- 6. Custom styles -->
                    <DemoCard label="Custom Styles">
                        <CheckboxGroup v-model="vals.cg6" label="Remember me" checkboxClass="accent-purple-600"
                            labelClass="text-purple-700 font-medium" />
                    </DemoCard>
                    <!-- 7. With image -->
                    <DemoCard label="With Mid Image">
                        <CheckboxGroup v-model="vals.cg7" label="Visa"
                            midImg="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" />
                    </DemoCard>
                    <!-- 8. Multiple items group -->
                    <DemoCard label="Multiple Checkboxes">
                        <div class="flex flex-col gap-2">
                            <CheckboxGroup v-model="vals.cg8a" label="Option A" />
                            <CheckboxGroup v-model="vals.cg8b" label="Option B" />
                            <CheckboxGroup v-model="vals.cg8c" label="Option C" />
                        </div>
                    </DemoCard>
                    <!-- 9. Wrapper class (row layout) -->
                    <DemoCard label="Row Layout">
                        <CheckboxGroup v-model="vals.cg9" label="Enable notifications"
                            wrapperClass="flex items-center justify-between p-3 border border-gray-200 rounded-lg" />
                    </DemoCard>
                    <!-- 10. Two tags -->
                    <DemoCard label="Multiple Tags">
                        <CheckboxGroup v-model="vals.cg10" label="Beta feature"
                            :tags="[{ text: 'BETA', variant: '#3B82F6', class: 'text-white' }, { text: 'FREE', variant: '#07f468', class: 'text-black' }]" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: CheckboxSwitch ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CheckboxSwitch" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default OFF -->
                    <DemoCard label="Default (Off)">
                        <CheckboxSwitch v-model="vals.cs1" label="Dark mode" id="cs1" version="" />
                    </DemoCard>
                    <!-- 2. Default ON -->
                    <DemoCard label="Default (On)">
                        <CheckboxSwitch v-model="vals.cs2" label="Notifications" id="cs2" version="" />
                    </DemoCard>
                    <!-- 3. With wrapper label -->
                    <DemoCard label="With Wrapper Label">
                        <CheckboxSwitch v-model="vals.cs3" label="Enable feature" id="cs3" version="" showWrapperLabel
                            wrapperLabel="Feature Settings" />
                    </DemoCard>
                    <!-- 4. Custom track color -->
                    <DemoCard label="Custom Track (Green)">
                        <CheckboxSwitch v-model="vals.cs4" label="Active" id="cs4" version=""
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-green-500"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem]" />
                    </DemoCard>
                    <!-- 5. Custom track color Blue -->
                    <DemoCard label="Custom Track (Blue)">
                        <CheckboxSwitch v-model="vals.cs5" label="Sync" id="cs5" version=""
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-blue-500"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem]" />
                    </DemoCard>
                    <!-- 6. Custom track color Red -->
                    <DemoCard label="Custom Track (Red)">
                        <CheckboxSwitch v-model="vals.cs6" label="Alert mode" id="cs6" version=""
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-red-500"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem]" />
                    </DemoCard>
                    <!-- 7. Large size -->
                    <DemoCard label="Large Switch">
                        <CheckboxSwitch v-model="vals.cs7" label="Large toggle" id="cs7" version=""
                            switchWrapperClass="w-12 h-6"
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-[#101828]"
                            knobClass="w-5 h-5 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1.5rem]" />
                    </DemoCard>
                    <!-- 8. Custom label style -->
                    <DemoCard label="Custom Label Style">
                        <CheckboxSwitch v-model="vals.cs8" label="Premium feature" id="cs8" version=""
                            labelClass="text-purple-600 font-semibold text-sm" />
                    </DemoCard>
                    <!-- 9. Multiple switches -->
                    <DemoCard label="Multiple Switches">
                        <div class="flex flex-col gap-3">
                            <CheckboxSwitch v-model="vals.cs9a" label="Email alerts" id="cs9a" version="" />
                            <CheckboxSwitch v-model="vals.cs9b" label="SMS alerts" id="cs9b" version="" />
                            <CheckboxSwitch v-model="vals.cs9c" label="Push alerts" id="cs9c" version="" />
                        </div>
                    </DemoCard>
                    <!-- 10. With bold label -->
                    <DemoCard label="Bold Label">
                        <CheckboxSwitch v-model="vals.cs10" label="Auto-renew subscription" id="cs10" version=""
                            labelClass="text-gray-800 font-bold text-sm" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: ButtonComponent ===== -->
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

            <!-- ===== SECTION: MediaCardV1 ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="MediaCardV1" />
                <p class="text-xs text-gray-400 -mt-4">
                    🖱 Hover over <strong>grid variant</strong> cards to see the <strong>zoom-in effect</strong>
                </p>

                <!-- Non-zoom variants in DemoCard -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DemoCard label="Default">
                        <MediaCardV1 :media="demoMedia.default" variant="default" />
                    </DemoCard>
                    <DemoCard label="Resume">
                        <MediaCardV1 :media="demoMedia.resume" variant="resume" />
                    </DemoCard>
                    <DemoCard label="Purchased">
                        <MediaCardV1 :media="demoMedia.purchased" variant="purchased" />
                    </DemoCard>
                    <DemoCard label="Latest">
                        <div class="w-[19rem]">
                            <MediaCardV1 :media="demoMedia.latest" variant="latest" />
                        </div>
                    </DemoCard>
                    <DemoCard label="Image Type">
                        <MediaCardV1 :media="demoMedia.image" variant="default" />
                    </DemoCard>
                    <DemoCard label="Custom Title Color">
                        <MediaCardV1 :media="demoMedia.default" variant="default" titleColor="#6366f1" />
                    </DemoCard>
                </div>

                <!-- Grid variant (hover zoom) — needs overflow-visible parent -->
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Grid Variant (Hover for Zoom ✨)
                </p>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 relative">
                    <div class="relative overflow-visible">
                        <span class="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-medium">Grid —
                            Video</span>
                        <MediaCardV1 :media="demoMedia.grid" variant="grid" />
                    </div>
                    <div class="relative overflow-visible">
                        <span class="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-medium">Grid +
                            Buy Label</span>
                        <MediaCardV1 :media="demoMedia.grid2" variant="grid" buyLabel="Buy Now"
                            actionLabel="Subscribe" />
                    </div>
                    <div class="relative overflow-visible">
                        <span class="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-medium">Grid —
                            Gallery</span>
                        <MediaCardV1 :media="demoMedia.gallery" variant="grid" />
                    </div>
                    <div class="relative overflow-visible">
                        <span class="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-medium">Grid —
                            No Footer</span>
                        <MediaCardV1 :media="demoMedia.grid" variant="grid" :showFooter="false" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: MediaCardV2 ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="MediaCardV2" />
                <p class="text-xs text-gray-400 -mt-4">
                    🖱 Hover each card to see the <strong>expand / zoom-in effect</strong> (works at xl breakpoint)
                </p>

                <!-- Labels row -->
                <div
                    class="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    <span>Video</span>
                    <span>Image</span>
                    <span>Free Tag (Green)</span>
                    <span>Sub Only (Pink)</span>
                </div>

                <!-- V2 cards — must be direct children of ul for hover expand to work -->
                <ul class="grid grid-cols-2 sm:grid-cols-4 gap-1 overflow-visible relative" style="z-index: 0;">
                    <MediaCardV2 :media="demoMedia.v2_video" />
                    <MediaCardV2 :media="demoMedia.v2_image" />
                    <MediaCardV2 :media="demoMedia.v2_tagged_green" />
                    <MediaCardV2 :media="demoMedia.v2_tagged_pink" />
                </ul>

                <!-- Second row -->
                <div
                    class="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    <span>Gallery</span>
                    <span>Locked Content</span>
                    <span>Subscribe Tag</span>
                    <span>Free Tag</span>
                </div>

                <ul class="grid grid-cols-2 sm:grid-cols-4 gap-1 overflow-visible relative" style="z-index: 0;">
                    <MediaCardV2 :media="demoMedia.v2_gallery" />
                    <MediaCardV2 :media="demoMedia.v2_locked" />
                    <MediaCardV2
                        :media="{ ...demoMedia.v2_video, showTag: true, tagText: 'Subscribe', tagColor: 'pink', title: 'Subscribe to Watch' }" />
                    <MediaCardV2
                        :media="{ ...demoMedia.v2_image, showTag: true, tagText: 'Free', tagColor: 'green', title: 'Free Content' }" />
                </ul>
            </section>

            <!-- ===== SECTION: Heading ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="Heading" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. h1 defaultPrimary -->
                    <DemoCard label="h1 — defaultPrimaryHeading">
                        <Heading text="Primary H1" tag="h1" theme="defaultPrimaryHeading" version="basic" />
                    </DemoCard>
                    <!-- 2. h2 defaultSecondary -->
                    <DemoCard label="h2 — defaultSecondaryHeading">
                        <Heading text="Secondary H2" tag="h2" theme="defaultSecondaryHeading" version="basic" />
                    </DemoCard>
                    <!-- 3. h3 sectionHeading -->
                    <DemoCard label="h3 — sectionHeading">
                        <Heading text="Section H3" tag="h3" theme="sectionHeading" version="basic" />
                    </DemoCard>
                    <!-- 4. dashboardHeading -->
                    <DemoCard label="h2 — dashboardHeading">
                        <Heading text="Dashboard Title" tag="h2" theme="dashboardHeading" version="basic" />
                    </DemoCard>
                    <!-- 5. AuthHeading -->
                    <DemoCard label="h2 — AuthHeading" dark>
                        <div class="bg-gray-800 p-4 rounded-lg">
                            <Heading text="Login" tag="h2" theme="AuthHeading" version="basic" />
                        </div>
                    </DemoCard>
                    <!-- 6. formHeading -->
                    <DemoCard label="h4 — formHeading">
                        <Heading text="Profile Settings" tag="h4" theme="formHeading" version="basic" />
                    </DemoCard>
                    <!-- 7. demoHeadings h1 -->
                    <DemoCard label="h1 — demoHeadings">
                        <Heading text="Demo H1 Bold" tag="h1" theme="demoHeadings" version="basic" />
                    </DemoCard>
                    <!-- 8. demoHeadings h3 -->
                    <DemoCard label="h3 — demoHeadings">
                        <Heading text="Demo H3 Medium" tag="h3" theme="demoHeadings" version="basic" />
                    </DemoCard>
                    <!-- 9. With left icon -->
                    <DemoCard label="With Left Icon">
                        <Heading text="With Icon" tag="h3" theme="defaultSecondaryHeading" version="basic"
                            :leftIcon="StarIcon" />
                    </DemoCard>
                    <!-- 10. orderHeading -->
                    <DemoCard label="h1 — orderHeading">
                        <Heading text="Order #1234" tag="h1" theme="orderHeading" version="basic" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: Paragraph ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="Paragraph" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <Paragraph text="This is a default paragraph with standard styling." />
                    </DemoCard>
                    <!-- 2. Small font -->
                    <DemoCard label="Small (text-sm)">
                        <Paragraph text="Small text paragraph for captions." fontSize="text-sm" />
                    </DemoCard>
                    <!-- 3. Large font -->
                    <DemoCard label="Large (text-xl)">
                        <Paragraph text="Large paragraph text." fontSize="text-xl" />
                    </DemoCard>
                    <!-- 4. Bold -->
                    <DemoCard label="Bold">
                        <Paragraph text="Bold paragraph text." fontWeight="font-bold" />
                    </DemoCard>
                    <!-- 5. Custom color -->
                    <DemoCard label="Custom Color (Blue)">
                        <Paragraph text="Blue paragraph text." fontColor="text-blue-600" />
                    </DemoCard>
                    <!-- 6. Error color -->
                    <DemoCard label="Error Red">
                        <Paragraph text="This field is required." fontColor="text-red-500" fontSize="text-sm" />
                    </DemoCard>
                    <!-- 7. Success color -->
                    <DemoCard label="Success Green">
                        <Paragraph text="Action successful!" fontColor="text-green-600" fontWeight="font-medium" />
                    </DemoCard>
                    <!-- 8. Italic -->
                    <DemoCard label="Italic">
                        <Paragraph text="Italic paragraph text for notes." fontFamily="italic"
                            fontColor="text-gray-500" />
                    </DemoCard>
                    <!-- 9. With left icon -->
                    <DemoCard label="With Left Icon">
                        <Paragraph text="Info message here" :leftIcon="InformationCircleIcon" fontSize="text-sm"
                            fontColor="text-blue-600" />
                    </DemoCard>
                    <!-- 10. Extra small xs -->
                    <DemoCard label="Extra Small (text-xs)">
                        <Paragraph text="Helper text displayed below the input field." fontSize="text-xs"
                            fontColor="text-gray-400" />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: NotificationCard ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="NotificationCard" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <!-- 1. Notice -->
                    <DemoCard label="Notice">
                        <NotificationCard variant="notice" title="Notice"
                            description="This is a notice notification card." v-model="notifOpen.notice" />
                    </DemoCard>
                    <!-- 2. Alert -->
                    <DemoCard label="Alert">
                        <NotificationCard variant="alert" title="Alert" description="Something needs your attention."
                            v-model="notifOpen.alert" />
                    </DemoCard>
                    <!-- 3. Success -->
                    <DemoCard label="Success">
                        <NotificationCard variant="success" title="Success"
                            description="Your operation was completed successfully." v-model="notifOpen.success" />
                    </DemoCard>
                    <!-- 4. Error -->
                    <DemoCard label="Error">
                        <NotificationCard variant="error" title="Error"
                            description="Something went wrong. Please try again." v-model="notifOpen.error" />
                    </DemoCard>
                    <!-- 5. Warning -->
                    <DemoCard label="Warning">
                        <NotificationCard variant="warning" title="Warning"
                            description="Please review before continuing." v-model="notifOpen.warning" />
                    </DemoCard>
                    <!-- 6. Info -->
                    <DemoCard label="Info">
                        <NotificationCard variant="info" title="Info" description="Here is some useful information."
                            v-model="notifOpen.info" />
                    </DemoCard>
                    <!-- 7. Limit Exceeded -->
                    <DemoCard label="Limit Exceeded">
                        <NotificationCard variant="limit-exceeded" title="Limit Exceeded"
                            description="You have exceeded your monthly upload limit."
                            v-model="notifOpen.limitExceeded" />
                    </DemoCard>
                    <!-- 8. No icon -->
                    <DemoCard label="No Icon">
                        <NotificationCard variant="notice" title="Without Icon"
                            description="This card has no left icon." :showIcon="false" v-model="notifOpen.noIcon" />
                    </DemoCard>
                    <!-- 9. Not closable -->
                    <DemoCard label="Not Closable">
                        <NotificationCard variant="success" title="Persistent"
                            description="This notification cannot be dismissed." :closable="false"
                            v-model="notifOpen.notClosable" />
                    </DemoCard>
                    <!-- 10. With link -->
                    <DemoCard label="With Link">
                        <NotificationCard variant="info" title="New Update" description="A new version is available."
                            linkLabel="See what's new" linkHref="#" v-model="notifOpen.withLink" />
                    </DemoCard>
                </div>
                <!-- Reopen buttons -->
                <div class="flex flex-wrap gap-2 mt-2">
                    <button v-for="key in Object.keys(notifOpen)" :key="key"
                        class="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 capitalize transition"
                        @click="notifOpen[key] = true">
                        Reopen {{ key }}
                    </button>
                </div>
            </section>

            <!-- ===== SECTION: QuillEditor ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="QuillEditor" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <QuillEditor v-model="vals.q1" />
                    </DemoCard>
                    <!-- 2. Custom placeholder -->
                    <DemoCard label="Custom Placeholder">
                        <QuillEditor v-model="vals.q2" placeholder="Write your bio here..." />
                    </DemoCard>
                    <!-- 3. With initial content -->
                    <DemoCard label="With Initial Content">
                        <QuillEditor v-model="vals.q3" />
                    </DemoCard>
                    <!-- 4. Announcement content -->
                    <DemoCard label="Announcement Draft">
                        <QuillEditor v-model="vals.q4" placeholder="Write your announcement..." />
                    </DemoCard>
                </div>
            </section>

            <!-- ===== SECTION: SubscriptionCard ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="SubscriptionCard" />
                <p class="text-xs text-gray-400 -mt-4">Each card uses <code>order=3</code> (center position). The card
                    renders as an absolute-positioned &lt;li&gt; inside a relative &lt;ul&gt;.</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">

                    <!-- 1. Basic / Upgrade -->
                    <DemoCard label="Basic — Upgrade Action">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[0]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="4.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 2. Current Subscription -->
                    <DemoCard label="Current Subscription (Pink Border + Yellow Price)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[1]" :order="3" :isCurrent="true"
                                    :currentSubscriptionPrice="19.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 3. Featured (gray badge) -->
                    <DemoCard label="Featured (Gray Badge)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[2]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="19.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 4. Downgrade -->
                    <DemoCard label="Downgrade Action (Cheaper than Current)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[3]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="19.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 5. Free Tier (no features) -->
                    <DemoCard label="Free Tier (No Features List)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[4]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="0" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 6. Premium (long features) -->
                    <DemoCard label="Premium — Many Features (Featured)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[5]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="19.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 7. Budget / Lite -->
                    <DemoCard label="Budget / Lite Plan">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[6]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="0" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 8. Agency / Business -->
                    <DemoCard label="Agency / Business Tier (Very High Price)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[7]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="19.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 9. Featured + Current (edge case) -->
                    <DemoCard label="Featured + Current Subscription (Edge Case)">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[8]" :order="3" :isCurrent="true"
                                    :currentSubscriptionPrice="29.99" />
                            </ul>
                        </div>
                    </DemoCard>

                    <!-- 10. Bundle Deal -->
                    <DemoCard label="Bundle Deal">
                        <div class="relative w-full overflow-hidden" style="height: 34rem;">
                            <ul class="relative w-full h-full">
                                <SubscriptionCard :cardData="subCards[9]" :order="3" :isCurrent="false"
                                    :currentSubscriptionPrice="19.99" />
                            </ul>
                        </div>
                    </DemoCard>

                </div>
            </section>

            <!-- ===== SECTION: VueDatePicker ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="VueDatePicker" />
                <p class="text-xs text-gray-400 -mt-4">All pickers are always-visible (inline) calendars. Config-driven:
                    <code>mode</code>, <code>enableTime</code>, <code>blockedDates</code>, <code>minDate/maxDate</code>,
                    <code>style.theme</code>, <code>style.rounded</code>, <code>startOfWeek</code> and more.
                </p>

                <!-- === GROUP 1: Basic Modes === -->
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Basic Modes</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <DemoCard label="Single Date (Default)">
                        <VueDatePicker v-model="dp.single" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.single || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Range Selection (Max 7 days)">
                        <VueDatePicker v-model="dp.range"
                            :config="{ mode: 'range', maxRangeDays: 7, style: { theme: 'indigo' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.range?.start || '—' }} → {{ dp.range?.end
                            || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Green Theme + Circle Today">
                        <VueDatePicker v-model="dp.green"
                            :config="{ style: { theme: 'green', todayStyle: 'circle', shadow: 'shadow-2xl' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.green || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Blocked Dates (+2 & +5 days)">
                        <VueDatePicker v-model="dp.blocked" :config="{
                            style: { theme: 'red' },
                            blockedDates: [
                                new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
                                new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
                            ]
                        }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.blocked || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="With Time Picker (Dark Theme)">
                        <VueDatePicker v-model="dp.withTime"
                            :config="{ enableTime: true, format: 'DD/MM/YYYY HH:mm', style: { theme: 'dark' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.withTime || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Background Today Style (Blue)">
                        <VueDatePicker v-model="dp.todayBg"
                            :config="{ style: { theme: 'blue', todayStyle: 'background' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.todayBg || '—' }}</p>
                    </DemoCard>

                </div>

                <!-- === GROUP 2: Advanced Styling === -->
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-4">Advanced Styling</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <DemoCard label="Custom Header (Teal) + Blue Theme">
                        <VueDatePicker v-model="dp.tealHeader"
                            :config="{ style: { headerClass: 'bg-teal-600 text-white', theme: 'blue' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.tealHeader || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Compact (text-xs, no shadow)">
                        <VueDatePicker v-model="dp.compact"
                            :config="{ style: { customClass: 'text-xs', rounded: 'rounded-sm', shadow: 'shadow-none border border-gray-300' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.compact || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Large Rounded + Green + Shadow-2xl">
                        <VueDatePicker v-model="dp.largeRounded"
                            :config="{ style: { theme: 'green', rounded: 'rounded-3xl', shadow: 'shadow-2xl' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.largeRounded || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="No Border (Floaty shadow-xl)">
                        <VueDatePicker v-model="dp.noBorder"
                            :config="{ style: { border: 'border-0', shadow: 'shadow-xl' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.noBorder || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Square (rounded-none + Background Today)">
                        <VueDatePicker v-model="dp.square"
                            :config="{ style: { rounded: 'rounded-none', todayStyle: 'background' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.square || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Error State (Red Border)">
                        <VueDatePicker v-model="dp.error"
                            :config="{ style: { border: 'border-2 border-red-500', shadow: 'shadow-red-100', rounded: 'rounded-md' }, placeholder: 'Required Field!' }" />
                        <p class="text-xs mt-2 text-red-400 font-mono">{{ dp.error || 'No date selected' }}</p>
                    </DemoCard>

                </div>

                <!-- === GROUP 3: Time Picker Combinations === -->
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-4">Time Picker Combinations
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <DemoCard label="Range + Time (Indigo)">
                        <VueDatePicker v-model="dp.rangeTime"
                            :config="{ mode: 'range', enableTime: true, style: { theme: 'indigo' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.rangeTime?.start || '—' }} → {{
                            dp.rangeTime?.end || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Custom Format: MM/DD/YYYY @ HH:mm">
                        <VueDatePicker v-model="dp.customFmt"
                            :config="{ enableTime: true, format: 'MM/DD/YYYY @ HH:mm', style: { theme: 'red' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.customFmt || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Appointment: MMM DD, YYYY at HH:mm">
                        <VueDatePicker v-model="dp.appt"
                            :config="{ enableTime: true, format: 'MMM DD, YYYY at HH:mm A', style: { theme: 'blue', rounded: 'rounded-2xl' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.appt || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Time + Blocked Dates">
                        <VueDatePicker v-model="dp.timeBlocked"
                            :config="{ enableTime: true, blockedDates: ['2026-03-15', '2026-03-16'], style: { theme: 'dark' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.timeBlocked || '—' }}</p>
                    </DemoCard>

                </div>

                <!-- === GROUP 4: Edge Cases === -->
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-4">Edge Cases &amp;
                    Validation</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <DemoCard label="Max Range: 1 Day (Strict)">
                        <VueDatePicker v-model="dp.maxRange1"
                            :config="{ mode: 'range', maxRangeDays: 1, style: { theme: 'red' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.maxRange1?.start || '—' }} → {{
                            dp.maxRange1?.end || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Min Date: 2026-01-01 (No past dates)">
                        <VueDatePicker v-model="dp.minDate"
                            :config="{ minDate: '2026-01-01', placeholder: 'Try selecting 2025...' }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.minDate || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Max Date: 2026-12-31 (No 2027+)">
                        <VueDatePicker v-model="dp.maxDate"
                            :config="{ maxDate: '2026-12-31', placeholder: 'No 2027 allowed' }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.maxDate || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Start of Week: Monday (ISO)">
                        <VueDatePicker v-model="dp.mondayStart"
                            :config="{ startOfWeek: 1, style: { theme: 'blue' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.mondayStart || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Past Only (Max = yesterday)">
                        <VueDatePicker v-model="dp.pastOnly" :config="{
                            maxDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                            placeholder: 'Select past date...',
                            style: { theme: 'dark' }
                        }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.pastOnly || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Future Only (Min = tomorrow)">
                        <VueDatePicker v-model="dp.futureOnly" :config="{
                            minDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            placeholder: 'Future dates only'
                        }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.futureOnly || '—' }}</p>
                    </DemoCard>

                </div>

                <!-- === GROUP 5: Business Use Cases === -->
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-4">Business Use Cases &amp;
                    Effects</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <DemoCard label="Trip Planner (Tomorrow → +30 days)">
                        <VueDatePicker v-model="dp.trip" :config="{
                            mode: 'range',
                            minDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            style: { theme: 'indigo', rounded: 'rounded-xl' }
                        }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.trip?.start || '—' }} → {{ dp.trip?.end ||
                            '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Minimalist Mono (Black/White, Sharp)">
                        <VueDatePicker v-model="dp.mono"
                            :config="{ style: { theme: 'dark', rounded: 'rounded-none', shadow: 'shadow-none border-2 border-black', headerClass: 'bg-black text-white' } }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.mono || '—' }}</p>
                    </DemoCard>

                    <DemoCard label="Debug Mode (Hidden Input Visible)">
                        <VueDatePicker v-model="dp.debug" :config="{ style: { debug: true } }" />
                    </DemoCard>

                    <DemoCard label="Range (Max 30 Days) + Blocked Weekend">
                        <VueDatePicker v-model="dp.rangeBlocked" :config="{
                            mode: 'range',
                            maxRangeDays: 30,
                            blockedDates: ['2026-03-07', '2026-03-08', '2026-03-14', '2026-03-15'],
                            style: { theme: 'green' }
                        }" />
                        <p class="text-xs mt-2 text-gray-400 font-mono">{{ dp.rangeBlocked?.start || '—' }} → {{
                            dp.rangeBlocked?.end || '—' }}</p>
                    </DemoCard>

                </div>

                <!-- Glassmorphism standalone card -->
                <div
                    class="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 flex flex-col gap-4 items-center">
                    <p class="text-xs font-semibold text-white/80 uppercase tracking-widest">Glassmorphism Effect</p>
                    <VueDatePicker v-model="dp.glass" :config="{
                        style: {
                            customClass: 'bg-white/20 backdrop-blur-lg border border-white/30 text-white',
                            headerClass: 'bg-transparent text-white border-white/20',
                            shadow: 'shadow-2xl',
                            theme: 'blue'
                        }
                    }" />
                    <p class="text-xs text-white/70 font-mono">{{ dp.glass || '—' }}</p>
                </div>

            </section>

            <!-- ===== SECTION: CountryStateDemo ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CountryStateDemo (Embedded)" />
                <div
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <CountryStateDemo />
                </div>
            </section>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// Components
import InputComponentDashboard from '@/components/input/InputComponentDashboard.vue';
import BaseInput from '@/components/input/BaseInput.vue';
import InputAuthComponent from '@/components/input/InputAuthComponent.vue';
import InputDefaultComponent from '@/components/input/InputDefaultComponent.vue';
import CodeInputAuthComponent from '@/components/input/CodeInputAuthComponent.vue';
import CheckboxGroup from '@/components/checkbox/CheckboxGroup.vue';
import CheckboxSwitch from '@/components/checkbox/CheckboxSwitch.vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import MediaCardV1 from '@/components/mediaCardsVariations/MediaCardV1.vue';
import MediaCardV2 from '@/components/mediaCardsVariations/MediaCardV2.vue';
import Heading from '@/components/default/Heading.vue';
import Paragraph from '@/components/default/Paragraph.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import QuillEditor from '@/components/input/QuillEditor.vue';
import SubscriptionCard from '@/templates/profileAbdullah/components/SubscriptionCard.vue';
import CountryStateDemo from '@/templates/dev/CountryStateDemo.vue';
import VueDatePicker from '@/components/datePicker/VueDatePicker.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

// Heroicons
import { MagnifyingGlassIcon, EnvelopeIcon, UserIcon, InformationCircleIcon, StarIcon, ArrowDownTrayIcon, ArrowRightIcon, ShareIcon, CheckIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline';

// ===== Reactive model values =====
const vals = reactive({
    // InputComponentDashboard
    icd1: '', icd2: '', icd3: '', icd4: '', icd5: '', icd6: '',
    icd7: '', icd8: '', icd9: '', icd10: '', icd11: '', icd12: '',
    // BaseInput
    bi1: '', bi2: '', bi3: 'Readonly Text', bi4: 5, bi5: '', bi6: '', bi7: '', bi8: 'bad@', bi9: 'good@email.com', bi10: '',
    // InputAuthComponent
    ia1: '', ia2: '', ia3: '', ia4: '', ia5: '', ia6: '', ia7: 'disabled text', ia8: '', ia9: '', ia10: '',
    // InputDefaultComponent
    id1: '', id2: '', id3: '', id4: 'bademail', id5: '', id6: '', id7: '', id8: 0, id9: '', id10: '',
    // CodeInput
    ci1: '', ci2: '', ci3: '', ci4: '', ci5: '', ci6: '',
    // CheckboxGroup
    cg1: false, cg2: true, cg3: false, cg4: true, cg5: false, cg6: false, cg7: true,
    cg8a: true, cg8b: false, cg8c: true, cg9: false, cg10: false,
    // CheckboxSwitch
    cs1: false, cs2: true, cs3: false, cs4: true, cs5: false, cs6: true, cs7: false, cs8: true,
    cs9a: true, cs9b: false, cs9c: true, cs10: false,
    // QuillEditor
    q1: '', q2: '', q3: '<p><strong>Hello World!</strong> This is pre-loaded content.</p>', q4: '',
});

// ===== NotificationCard open states =====
const notifOpen = reactive({
    notice: true,
    alert: true,
    success: true,
    error: true,
    warning: true,
    info: true,
    limitExceeded: true,
    noIcon: true,
    notClosable: true,
    withLink: true,
});

// ===== VueDatePicker refs =====
const dp = reactive({
    // Basic
    single: null,
    range: { start: null, end: null },
    green: null,
    blocked: null,
    withTime: null,
    todayBg: null,
    // Advanced styling
    tealHeader: null,
    compact: null,
    largeRounded: null,
    noBorder: null,
    square: null,
    error: null,
    // Time combos
    rangeTime: { start: null, end: null },
    customFmt: null,
    appt: null,
    timeBlocked: null,
    // Edge cases
    maxRange1: { start: null, end: null },
    minDate: null,
    maxDate: null,
    mondayStart: null,
    pastOnly: null,
    futureOnly: null,
    // Business
    trip: { start: null, end: null },
    mono: null,
    debug: null,
    rangeBlocked: { start: null, end: null },
    glass: null,
});

// ===== Media data =====
const AVATAR = 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp';
const POSTER = 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp';

const demoMedia = {
    default: { type: 'video', videoUrl: '', poster: POSTER, title: 'Default Media Card Title', duration: '5:23', timeAgo: '2d', likes: '1.2K', views: '8.4K', creatorName: 'Creator Name', avatar: AVATAR },
    resume: { type: 'video', videoUrl: '', poster: POSTER, title: 'Resume Watching', duration: '12:45', timeAgo: '1w', likes: '3.5K', views: '22K', creatorName: 'Creator Name', avatar: AVATAR },
    purchased: { type: 'video', videoUrl: '', poster: POSTER, title: 'Purchased Content Title', duration: '45:00', timeAgo: '3d', likes: '900', views: '5K', creatorName: 'Creator Name', avatar: AVATAR },
    latest: { type: 'video', videoUrl: '', poster: POSTER, title: 'Latest Upload Title', duration: '3:10', timeAgo: '1h', likes: '221', views: '1.1K', creatorName: 'Creator Name', avatar: AVATAR },
    grid: { type: 'video', videoUrl: '', poster: POSTER, title: 'Grid View Card Title', duration: '7:30', timeAgo: '5d', likes: '450', views: '3.3K', creatorName: 'Creator Name', avatar: AVATAR },
    grid2: { type: 'video', videoUrl: '', poster: POSTER, title: 'Buy & Subscribe Card', duration: '10:00', timeAgo: '2d', likes: '800', views: '4K', creatorName: 'Creator Name', avatar: AVATAR },
    image: { type: 'image', poster: POSTER, title: 'Image Type Card', duration: '', timeAgo: '4d', likes: '300', views: '2K', creatorName: 'Creator Name', avatar: AVATAR },
    gallery: { type: 'gallery', poster: POSTER, title: 'Gallery Type Card', duration: '', timeAgo: '1d', likes: '600', views: '5.5K', creatorName: 'Creator Name', avatar: AVATAR },
    // MediaCardV2
    v2_video: { type: 'video', videoUrl: '', poster: POSTER, title: 'V2 Video Card', duration: '6:00', timeAgo: '2h', likes: '300', views: '1.2K', showTag: false },
    v2_image: { type: 'image', poster: POSTER, title: 'V2 Image Card', duration: '', timeAgo: '1d', likes: '150', views: '800', showTag: false },
    v2_tagged_green: { type: 'video', videoUrl: '', poster: POSTER, title: 'Free Video', duration: '3:30', timeAgo: '3d', likes: '100', views: '500', showTag: true, tagText: 'Free', tagColor: 'green' },
    v2_tagged_pink: { type: 'video', videoUrl: '', poster: POSTER, title: 'Subscriber Only', duration: '8:45', timeAgo: '1w', likes: '500', views: '3K', showTag: true, tagText: 'Sub Only', tagColor: 'pink' },
    v2_gallery: { type: 'gallery', poster: POSTER, title: 'Gallery', duration: '', timeAgo: '2d', likes: '80', views: '300', showTag: false, galleryCount: 7 },
    v2_locked: { type: 'image', poster: POSTER, title: 'Locked Content', duration: '', timeAgo: '5d', likes: '200', views: '1K', showTag: false, isLocked: true },
};

// ===== Subscription card data =====
const subCards = [
    // 0 — Basic / Upgrade
    {
        title: 'Starter', price: '9.99', oldPrice: '49.99', videos: 15, photos: 30, mediaCount: 45,
        isFeatured: false, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Access to basic tier content including weekly posts and exclusive behind-the-scenes footage.',
        features: ['15 Videos / month', '30 Photos / month', 'HD quality', 'Cancel anytime'],
    },
    // 1 — Current subscription (pink border + yellow price)
    {
        title: 'Pro', price: '19.99', oldPrice: '99.99', videos: 50, photos: 100, mediaCount: 150,
        isFeatured: false, isCurrentSubscription: true,
        image: POSTER,
        fullDescription: 'Current plan — Full access to all content including live streams and early releases.',
        features: ['50 Videos / month', '100 Photos / month', '4K quality', 'Priority support', 'Live streams'],
    },
    // 2 — Featured (gray badge)
    {
        title: 'Elite', price: '39.99', oldPrice: '199.99', videos: 120, photos: 300, mediaCount: 420,
        isFeatured: true, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Most popular tier with full access, 1-on-1 sessions, and merchandise discounts.',
        features: ['Unlimited Videos', 'Unlimited Photos', '4K quality', '1-on-1 Sessions', 'Merch discount'],
    },
    // 3 — Downgrade (cheaper than current)
    {
        title: 'Basic', price: '4.99', oldPrice: '24.99', videos: 5, photos: 10, mediaCount: 15,
        isFeatured: false, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Entry-level plan with limited content access. Perfect for casual fans.',
        features: ['5 Videos / month', '10 Photos / month', 'SD quality'],
    },
    // 4 — No features list (minimal)
    {
        title: 'Free Tier', price: '0.00', oldPrice: '0.00', videos: 2, photos: 5, mediaCount: 7,
        isFeatured: false, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Free access to limited public content with ads.',
        features: [],
    },
    // 5 — Many features (long list)
    {
        title: 'Premium', price: '59.99', oldPrice: '299.99', videos: 500, photos: 1000, mediaCount: 1500,
        isFeatured: true, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Complete VIP access with every benefit available on the platform, plus exclusive creator meetups.',
        features: ['Unlimited Videos', 'Unlimited Photos', '8K streaming', '1-on-1 monthly call', 'Physical merch', 'Early access', 'Discord VIP'],
    },
    // 6 — Budget (very low price)
    {
        title: 'Lite', price: '2.99', oldPrice: '14.99', videos: 3, photos: 8, mediaCount: 11,
        isFeatured: false, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Minimum spend to support your favourite creator and get a few exclusives.',
        features: ['3 Videos / month', '8 Photos / month', 'SD quality'],
    },
    // 7 — Agency / Business tier
    {
        title: 'Agency', price: '149.99', oldPrice: '749.99', videos: 999, photos: 9999, mediaCount: 9999,
        isFeatured: false, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'Business-level access for agencies and brands wanting full commercial licensing and bulk seats.',
        features: ['Commercial license', 'Bulk seats (10)', 'Dedicated manager', 'API access', 'White-label'],
    },
    // 8 — Featured AND current (edge case)
    {
        title: 'Champion', price: '29.99', oldPrice: '149.99', videos: 80, photos: 200, mediaCount: 280,
        isFeatured: true, isCurrentSubscription: true,
        image: POSTER,
        fullDescription: 'You are on the most popular plan! Enjoy full creator access with priority support.',
        features: ['80 Videos / month', '200 Photos / month', '4K quality', 'Priority support'],
    },
    // 9 — Bundle deal
    {
        title: 'Bundle', price: '34.99', oldPrice: '174.99', videos: 100, photos: 250, mediaCount: 350,
        isFeatured: false, isCurrentSubscription: false,
        image: POSTER,
        fullDescription: 'A bundle deal combining Pro + Elite benefits at a discounted rate for loyal fans.',
        features: ['100 Videos / month', '250 Photos / month', '4K quality', 'Live stream access', 'Merch 10% off'],
    },
];
</script>

<style scoped>
/* Smooth section transitions */
section {
    animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
