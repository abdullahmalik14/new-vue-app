<script setup>
import InputDefaultComponent from "@/components/input/InputDefaultComponent.vue";
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import CheckboxSwitch from "@/components/checkbox/CheckboxSwitch.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import BookingSectionsWrapper from "./BookingSectionsWrapper.vue";
import BaseInput from "@/components/input/BaseInput.vue";
</script>

<template>
  <form
    class="bg-white/50 shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] backdrop-blur-xl px-6 py-6 flex flex-col gap-6 relative"
  >
    <!-- header -->
    <div class="pb-2 bg-white/20 flex justify-between items-center">
      <div
        class="justify-start text-slate-700 text-base font-semibold font-['Poppins'] leading-normal"
      >
        1 on 1 Call Booking Schedule
      </div>
      <div class="w-6 h-6 relative overflow-hidden">
        <img src="https://i.ibb.co/G4Y3BB6c/Icon.png" alt="" />
      </div>
    </div>

    <!-- body -->

    <!-- section--1 -->
    <div class="self-stretch inline-flex justify-start items-start gap-4">
      <div class="w-6 h-6 relative overflow-hidden">
        <svg
          width="19"
          height="14"
          viewBox="0 0 19 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 5H1M18 1H1M18 9H1M14 13H1"
            stroke="#344054"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="flex-1 inline-flex flex-col justify-start items-start gap-4">
        <div class="self-stretch inline-flex justify-start items-start">
          <div
            class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
          >
            <div
              class="self-stretch flex flex-col justify-start items-start gap-1.5"
            >
              <BaseInput
                type="text"
                placeholder="Enter text"
                v-model="duration"
                inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
              />
            </div>
          </div>
          <div
            class="h-[49px] border-l border-gray-300 inline-flex flex-col justify-start items-start gap-1.5"
          >
            <div
              class="self-stretch flex-1 bg-white/50 p-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
            >
              Todo
            </div>
          </div>
        </div>

        <div class="w-full">
          <InputDefaultComponent
            id="input_8"
            type="textarea"
            placeholder="Enter multiline text"
            show-label
            richTextEditor
            v-model:content="name"
            label-text="Textarea with Quills library"
          />
        </div>

        <div
          class="self-stretch flex flex-col justify-start items-start gap-1.5"
        >
          <div
            class="self-stretch flex flex-col justify-start items-start gap-1.5"
          >
            <div
              class="justify-start text-slate-700 text-xs font-normal font-['Poppins'] leading-none"
            >
              Call Type
            </div>
            <div
              class="self-stretch bg-white/50 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
            >
              Todo
            </div>
          </div>
        </div>
        <div class="self-stretch inline-flex justify-start items-center gap-3">
          <div
            class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
          >
            <div
              class="self-stretch flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch bg-white/75 px-4 py-2 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                Todo
              </div>
            </div>
          </div>

          <div class="flex justify-start items-center gap-1">
            <img src="https://i.ibb.co/9kQ5CDty/Icon.png" alt="" />
            <div
              class="justify-start text-slate-700 text-sm font-medium font-['Poppins'] leading-tight"
            >
              Preview
            </div>
          </div>
        </div>
        <div
          class="self-stretch flex flex-col justify-start items-start gap-1.5"
        >
          <div class="justify-start">
            <span
              class="text-slate-700 text-xs font-normal font-['Poppins'] leading-none"
              >Event Image </span
            ><span
              class="text-gray-500 text-xs italic font-normal font-['Poppins'] leading-none"
              >Optional</span
            >
          </div>
          <div
            data-file-drag-and-drop="true"
            data-state="Default"
            class="self-stretch px-6 py-4 bg-black/5 rounded-xl outline-offset-[-1px] flex flex-col justify-start items-center gap-1"
          >
            <div
              class="self-stretch flex flex-col justify-start items-center gap-3"
            >
              <div
                class="w-10 h-10 relative bg-green-500 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
              >
                <div
                  class="w-5 h-5 left-[10px] top-[10px] absolute overflow-hidden"
                >
                  <img src="https://i.ibb.co/svVF081H/Icon-1.png" alt="" />
                </div>
              </div>
              <div
                class="self-stretch flex flex-col justify-start items-center gap-1"
              >
                <div
                  class="self-stretch inline-flex justify-center items-start gap-1"
                >
                  <div
                    class="flex justify-center items-center gap-1.5 overflow-hidden"
                  >
                    <div
                      class="justify-start text-gray-900 text-sm font-semibold font-['Poppins'] leading-tight"
                    >
                      Click to upload
                    </div>
                  </div>
                  <div
                    class="justify-start text-slate-600 text-sm font-normal font-['Poppins'] leading-tight"
                  >
                    or drag and drop
                  </div>
                </div>
                <div
                  class="self-stretch text-center justify-start text-slate-600 text-xs font-normal font-['Poppins'] leading-none"
                >
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <section--2> -->
    <BookingSectionsWrapper
      title="Session Duration"
      leftIcon="https://i.ibb.co/cSjDYSdk/Icon.png"
    >
      <div class="flex items-center gap-2 mt-3 mb-8">
        <BaseInput
          type="number"
          placeholder="15"
          v-model="duration"
          inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
        />
        <div
          class="justify-start text-black text-base font-medium font-['Poppins'] leading-normal"
        >
          Minutes
        </div>
      </div>
      <div class="self-stretch flex flex-col justify-center items-start gap-2">
        <CheckboxGroup
          v-model="rememberMe"
          label="Allow user to book longer sessions"
          checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
          labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
          wrapperClass="flex items-center gap-2"
        />
        <div class="inline-flex justify-start items-end gap-2 ml-5">
          <div class="opacity-50 flex justify-start items-end gap-2">
            <div class="inline-flex flex-col justify-start items-start gap-1.5">
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="w-full text-gray-500 text-sm font-medium font-['Poppins'] leading-tight"
                >
                  Maximum Session Allowed
                </div>

                <div class="mt-2">
                  <BaseInput
                    type="number"
                    placeholder="15"
                    v-model="duration"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                  />
                </div>
              </div>
            </div>
            <div class="h-10 inline-flex flex-col justify-between items-start">
              <div
                class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal"
              >
                Sessions
              </div>
              <div
                class="justify-center text-black text-xs font-medium font-['Poppins'] leading-none"
              >
                (15 minutes)
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- <section--3> -->
    <BookingSectionsWrapper
      title="Pricing Settings"
      leftIcon="https://i.ibb.co/F47R5CqG/Icon-1.png"
    >
      <div
        class="flex-1 inline-flex flex-col justify-start items-start gap-5 mt-4"
      >
        <div class="flex flex-col justify-start items-start gap-1.5">
          <div
            class="justify-start text-gray-500 text-sm font-medium font-['Poppins'] leading-tight"
          >
            Base Price
          </div>
          <div class="flex items-center gap-2">
            <BaseInput
              type="number"
              placeholder="15"
              v-model="duration"
              inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
            />
            <div class="flex gap-2 items-center">
              <span
                class="text-black text-base font-medium font-['Poppins'] leading-normal"
                >Tokens </span
              ><span
                class="text-black text-sm font-normal font-['Poppins'] leading-tight"
                >/session</span
              >
            </div>
          </div>
        </div>

        <div
          class="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <CheckboxGroup
            v-model="rememberMe"
            label="Enable discount price for longer sessions"
            checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
            labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
            wrapperClass="flex items-center gap-2 mb-3"
          />

          <div class="self-stretch inline-flex justify-start items-start gap-2">
            <div class="w-6 h-6" />
            <div class="inline-flex flex-col justify-start items-start gap-2">
              <div
                class="opacity-50 inline-flex justify-end items-center gap-2"
              >
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
                <div
                  class="h-10 inline-flex flex-col justify-between items-start"
                >
                  <div
                    class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal"
                  >
                    sessions minimum
                  </div>
                  <div
                    class="justify-center text-black text-xs font-medium font-['Poppins'] leading-none"
                  >
                    (2 x 15 minutes)
                  </div>
                </div>
              </div>
              <div
                class="opacity-50 inline-flex justify-end items-center gap-2"
              >
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
                <div
                  class="h-10 inline-flex flex-col justify-between items-start"
                >
                  <div
                    class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal"
                  >
                    % off base price
                  </div>
                  <div
                    class="justify-center text-black text-xs font-medium font-['Poppins'] leading-none"
                  >
                    (800 tokens/session)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div class="flex gap-2">
            <CheckboxGroup
              label="Enable booking fee"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2 mb-3"
            />

            <div class="mt-[2px]">
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
          </div>

          <div class="inline-flex justify-start items-start gap-2">
            <div class="w-6 h-10" />
            <div class="inline-flex flex-col justify-center items-start gap-2">
              <div
                class="opacity-50 inline-flex justify-start items-center gap-2"
              >
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
                <div
                  class="w-14 justify-start text-black text-base font-medium font-['Poppins'] leading-normal"
                >
                  Tokens
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            class="self-stretch flex flex-col justify-center items-start gap-2"
          >
            <div class="flex gap-2">
              <CheckboxGroup
                label="Allow instant booking"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 mt-[1px] text-[16px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3"
              />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>

            <div
              class="self-stretch inline-flex justify-start items-start gap-2"
            >
              <div class="w-6 h-6" />
              <div
                class="flex-1 opacity-50 inline-flex flex-col justify-start items-start gap-2"
              >
                <div
                  class="self-stretch inline-flex justify-end items-center gap-2"
                >
                  <div
                    class="flex-1 justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Approve sessions instantly after bookings.
                  </div>
                </div>

                <CheckboxGroup
                  label="Disable chat before call"
                  checkboxClass="m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded bg-transparent relative cursor-pointer checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.2rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45 "
                  labelClass="text-slate-700 text-[16px] leading-normal"
                  wrapperClass="flex items-center gap-2 mb-3 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          class="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            class="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div class="flex gap-2">
              <CheckboxGroup
                label="Enable reschedule  fee"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3"
              />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>

            <div
              class="self-stretch inline-flex justify-start items-start gap-2"
            >
              <div class="w-6 h-10" />
              <div
                class="opacity-50 inline-flex flex-col justify-start items-start"
              >
                <div class="inline-flex justify-end items-center gap-2">
                  <BaseInput
                    type="number"
                    placeholder="15"
                    v-model="duration"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                  />

                  <div
                    class="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Tokens
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            class="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div class="flex gap-2">
              <CheckboxGroup
                label="Enable cancellation fee"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3"
              />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>
            <div
              class="self-stretch inline-flex justify-start items-start gap-2"
            >
              <div class="w-6 h-10" />
              <div
                class="opacity-50 inline-flex flex-col justify-start items-start"
              >
                <div class="inline-flex justify-end items-center gap-2">
                  <BaseInput
                    type="number"
                    placeholder="15"
                    v-model="duration"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                  />
                  <div
                    class="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Tokens
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="ml-7 opacity-50 flex flex-col justify-start items-start gap-2"
          >
            <CheckboxGroup
              label="User can cancel in advance to void minimum charge"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2 mb-3"
            />
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2">
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />

                <div
                  class="bg-white/50 px-3 py-2 rounded-tl-sm outline-none rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                >
                  Todo
                </div>
              </div>
              <div
                class="justify-center text-slate-700 text-base font-normal leading-normal"
              >
                in advance
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- section--4 -->
    <BookingSectionsWrapper
      title="Off-hour Surcharge"
      leftIcon="https://i.ibb.co/k6kzjyCp/Icon-2.png"
      titleIcon="https://i.ibb.co/HD78k3Sf/Icon.png"
    >
      <div
        class="self-stretch inline-flex justify-start items-center gap-2 mt-5"
      >
        <CheckboxGroup
          label="Add"
          checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
          labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
          wrapperClass="flex items-center gap-2"
        />
        <div
          class="flex-1 opacity-50 inline-flex flex-col justify-start items-start"
        >
          <div class="inline-flex justify-end items-center gap-2">
            <BaseInput
              type="number"
              placeholder="15"
              v-model="duration"
              inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
            />
            <div class="h-10 inline-flex flex-col justify-between items-start">
              <div
                class="justify-center text-black text-base font-medium font-['Poppins'] leading-normal"
              >
                % from base price
              </div>
              <div
                class="justify-center text-black text-xs font-medium font-['Poppins'] leading-none"
              >
                (1,600 tokens/session)
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- section-5 -->
    <BookingSectionsWrapper
      title="Calendar Availability"
      leftIcon="https://i.ibb.co/Ldw310vp/Icon.png"
    >
      <div class="w-full flex flex-col gap-5 mt-5">
        <div class="flex flex-col gap-3 w-full">
          <div
            class="self-stretch justify-start text-gray-900 text-xs font-normal font-['Poppins'] leading-none"
          >
            GMT +8 Hong Kong Standard time
          </div>

          <BaseInput
            type="number"
            placeholder="15"
            v-model="duration"
            inputClass="bg-white/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
          />
          <div class="self-stretch inline-flex justify-start items-end">
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div class="justify-start">
                  <span
                    class="text-gray-500 text-sm font-medium font-['Poppins'] leading-tight"
                    >Duration </span
                  ><span
                    class="text-gray-500 text-xs italic font-normal font-['Poppins'] leading-none"
                    >Optional</span
                  >
                </div>
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-center gap-2"
                >
                  <div class="flex-1 flex justify-start items-center gap-2">
                    <img src="https://i.ibb.co/ntP5c3B/Icon-1.png" alt="" />
                    <div
                      class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                    >
                      From
                    </div>
                  </div>
                  <div class="w-4 h-4 relative" />
                </div>
              </div>
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-center gap-2"
                >
                  <div class="flex-1 flex justify-start items-center gap-2">
                    <img src="https://i.ibb.co/ntP5c3B/Icon-1.png" alt="" />

                    <div
                      class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                    >
                      To
                    </div>
                  </div>
                  <div class="w-4 h-4 relative" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4 w-full">
          <div
            class="self-stretch min-h-10 inline-flex justify-start items-center gap-3"
          >
            <div
              class="w-12 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Sun
            </div>
            <div
              class="flex-1 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Not Available
            </div>
            <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
          </div>
          <div
            class="self-stretch inline-flex justify-start items-center gap-1"
          >
            <div
              class="w-10 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Mon
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                >
                  <div
                    class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Todo
                  </div>
                </div>
              </div>
            </div>
            <div
              class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
            >
              -
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                <div
                  class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Todo
                </div>
              </div>
            </div>
            <div class="pl-1 flex justify-start items-center gap-2">
              <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
              <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
              <img src="https://i.ibb.co/xqh8KkBk/Icon-1.png" alt="" />
            </div>
          </div>
          <div class="self-stretch inline-flex justify-start items-start gap-1">
            <div
              class="w-10 h-10 justify-center text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Tue
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-center items-start gap-1"
            >
              <div
                class="self-stretch inline-flex justify-start items-center gap-1"
              >
                <div
                  class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
                >
                  <div
                    class="self-stretch flex flex-col justify-start items-start gap-1.5"
                  >
                    <div
                      class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                    >
                      <div
                        class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                      >
                        Todo
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
                >
                  -
                </div>
                <div
                  class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
                >
                  <div
                    class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                  >
                    <div
                      class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                    >
                      Todo
                    </div>
                  </div>
                </div>
                <div class="pl-1 flex justify-start items-center gap-2">
                  <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
                  <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
                  <img src="https://i.ibb.co/xqh8KkBk/Icon-1.png" alt="" />
                </div>
              </div>
              <div
                class="self-stretch inline-flex justify-start items-center gap-1"
              >
                <div
                  class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
                >
                  <div
                    class="self-stretch flex flex-col justify-start items-start gap-1.5"
                  >
                    <div
                      class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                    >
                      <div
                        class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                      >
                        Todo
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
                >
                  -
                </div>
                <div
                  class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
                >
                  <div
                    class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                  >
                    <div
                      class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                    >
                      Todo
                    </div>
                  </div>
                </div>
                <div
                  class="pl-1 relative flex justify-start items-center gap-2"
                >
                  <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
                  <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
                  <img src="https://i.ibb.co/xqh8KkBk/Icon-1.png" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div
            class="self-stretch inline-flex justify-start items-center gap-1"
          >
            <div
              class="w-10 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Wed
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                >
                  <div
                    class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Todo
                  </div>
                </div>
              </div>
            </div>
            <div
              class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
            >
              -
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                <div
                  class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Todo
                </div>
              </div>
            </div>
            <div class="pl-1 flex justify-start items-center gap-2">
              <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
              <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
              <img src="https://i.ibb.co/xqh8KkBk/Icon-1.png" alt="" />
            </div>
          </div>
          <div
            class="self-stretch inline-flex justify-start items-center gap-1"
          >
            <div
              class="w-10 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Thu
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                >
                  <div
                    class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Todo
                  </div>
                </div>
              </div>
            </div>
            <div
              class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
            >
              -
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                <div
                  class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Todo
                </div>
              </div>
            </div>
            <div class="pl-1 relative flex justify-start items-center gap-2">
              <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
              <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
              <img src="https://i.ibb.co/xqh8KkBk/Icon-1.png" alt="" />
            </div>
          </div>
          <div
            class="self-stretch inline-flex justify-start items-center gap-1"
          >
            <div
              class="w-10 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Fri
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                >
                  <div
                    class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Todo
                  </div>
                </div>
              </div>
            </div>
            <div
              class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
            >
              -
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                <div
                  class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Todo
                </div>
              </div>
            </div>
            <div class="pl-1 flex justify-start items-center gap-2">
              <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
              <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
              <img src="https://i.ibb.co/TqB49zLj/cloud-moon.png" alt="" />
            </div>
          </div>
          <div
            class="self-stretch inline-flex justify-start items-center gap-1"
          >
            <div
              class="w-10 justify-start text-gray-500 text-base font-normal font-['Poppins'] leading-normal"
            >
              Sat
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                >
                  <div
                    class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Todo
                  </div>
                </div>
              </div>
            </div>
            <div
              class="justify-start text-gray-500 text-base font-medium font-['Poppins'] leading-normal"
            >
              -
            </div>
            <div
              class="flex-1 inline-flex flex-col justify-start items-start gap-1.5"
            >
              <div
                class="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                <div
                  class="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Todo
                </div>
              </div>
            </div>
            <div class="pl-1 relative flex justify-start items-center gap-2">
              <img src="https://i.ibb.co/3yZjgcNV/Icon.png" alt="" />
              <img src="https://i.ibb.co/7J7qwz6H/Icon-3.png" alt="" />
              <img src="https://i.ibb.co/TqB49zLj/cloud-moon.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- line -->
    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <!-- <Section----6> -->
    <BookingSectionsWrapper
      title=" Call Settings"
      leftIcon="https://i.ibb.co/xq0ZdVmP/Icon.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png"
    >
      <div className="flex flex-col justify-start items-start gap-5 mt-5">
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div
              className="self-stretch inline-flex justify-start items-center gap-1"
            >
              <div
                className="justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
              >
                Offer discount if call starts late
              </div>
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
          </div>
          <div
            className="self-stretch flex flex-col justify-start items-start gap-1.5"
          >
            <div
              className="self-stretch flex flex-col justify-start items-start gap-1.5"
            >
              <div
                className="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
              >
                <div
                  className="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Todo
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div
              className="self-stretch justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
            >
              Call functions
            </div>

            <CheckboxGroup
              label="Disable chat during call"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2 mb-3 mt-2"
            />
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div
              className="self-stretch inline-flex justify-start items-center gap-1"
            >
              <div
                className="justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
              >
                Fan can request to extend session in call
              </div>
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
            <div className="inline-flex justify-start items-center gap-2">
              <CheckboxGroup
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2"
              />
              <div className="opacity-50 flex justify-start items-end gap-2">
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
                <div
                  className="h-10 inline-flex flex-col justify-between items-start"
                >
                  <div
                    className="justify-center text-black text-base font-medium font-['Poppins'] leading-normal"
                  >
                    sessions maximum
                  </div>
                  <div
                    className="justify-center text-black text-xs font-medium font-['Poppins'] leading-none"
                  >
                    (30 minutes)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- line -->
    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <!-- <Section----7> -->
    <BookingSectionsWrapper
      title=" Booking Settings"
      leftIcon="https://i.ibb.co/nNmmvwnf/Icon-1.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png"
    >
      <div className="flex flex-col justify-start items-start gap-5 mt-5">
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div
              className="self-stretch inline-flex justify-start items-center gap-1"
            >
              <div
                className="justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
              >
                Call reminder
              </div>
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
            <div
              className="self-stretch flex flex-col justify-start items-start"
            >
              <div className=" inline-flex justify-end items-center gap-2">
                <div
                  className="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Remind me
                </div>
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
                <div
                  className="flex-1 justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                >
                  minutes before a
                </div>
              </div>
              <div className="inline-flex justify-end items-center gap-2">
                <div
                  className="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                >
                  scheduled call.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div class="flex gap-2 items-center">
            <CheckboxGroup
              label="Set buffer time between booked appointments"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2"
            />

            <div class="mt-[2px]">
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
          </div>

          <div className="inline-flex justify-start items-center gap-2">
            <div className="w-6 h-6" />
            <div className="opacity-50 flex justify-start items-end gap-2">
              <BaseInput
                type="number"
                placeholder="15"
                v-model="duration"
                inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
              />

              <div
                className="w-44 inline-flex flex-col justify-start items-start gap-1.5"
              >
                <div
                  className="self-stretch flex flex-col justify-start items-start gap-1.5"
                >
                  <div
                    className="self-stretch px-3 py-2 bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
                  >
                    <div
                      className="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
                    >
                      Todo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div class="flex gap-2 items-center">
            <CheckboxGroup
              label="Set maximum bookings per day"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2"
            />

            <div class="mt-[2px]">
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
          </div>

          <div className="inline-flex justify-start items-center gap-2">
            <div className="w-6 h-6" />
            <div className="opacity-50 flex justify-start items-end gap-2">
              <BaseInput
                type="number"
                placeholder="15"
                v-model="duration"
                inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
              />
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div class="flex gap-2 items-center">
              <CheckboxGroup
                label="If booking slots are full, allow fans to join waitlist"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2"
              />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>
            <div
              className="self-stretch inline-flex justify-start items-start gap-2"
            >
              <div className="w-6 h-10" />
              <div
                className="opacity-50 inline-flex flex-col justify-start items-start"
              >
                <div className="inline-flex justify-end items-center gap-2">
                  <BaseInput
                    type="number"
                    placeholder="15"
                    v-model="duration"
                    inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                  />
                  <div
                    className="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    waitlist spots
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- line -->
        <div class="w-full bg-[#D0D5DD] h-[1px] mb-[80px] mt-[10px]"></div>
      </div>

      <div class="absolute right-0 bottom-0">
        <ButtonComponent
          text="Next"
          variant="polygonLeft"
          :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'"
          :rightIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0 invert-0   /* Default: black */
  group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
`"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
        />
      </div>
    </BookingSectionsWrapper>

    <!-- <Section----8> -->
    <div class="flex items-center gap-2">
      <img src="https://i.ibb.co/CsWd11xX/Icon-2.png" alt="" />
      <div class="text-[12px] font-medium">Back</div>
    </div>

    <BookingSectionsWrapper
      title="Additional Request"
      leftIcon="https://i.ibb.co/39kq5wcX/Icon-3.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png"
    >
      <div
        className="self-stretch inline-flex flex-col justify-start items-start gap-5 w-full mt-5"
      >
        <div
          className="self-stretch flex flex-col justify-center items-start gap-1"
        >
          <div class="flex gap-2 items-center">
            <CheckboxGroup
              label="Allow fan record the session"
              checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
              labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
              wrapperClass="flex items-center gap-2 mb-3"
            />

            <div class="mt-[2px]">
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
          </div>

          <div
            className="self-stretch inline-flex justify-start items-start gap-2"
          >
            <div className="w-6 self-stretch" />
            <div
              className="opacity-50 inline-flex flex-col justify-start items-start"
            >
              <div className="inline-flex justify-end items-center gap-2">
                <BaseInput
                  type="number"
                  placeholder="15"
                  v-model="duration"
                  inputClass="bg-white/50 w-44 px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
                <div
                  className="justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                >
                  Tokens
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-center items-start gap-1"
          >
            <div class="flex gap-2">
              <CheckboxGroup
                label="Allow personal request"
                checkboxClass="m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                labelClass="text-slate-700 text-[16px] mt-[1px] leading-normal"
                wrapperClass="flex items-center gap-2 mb-3"
              />

              <div class="mt-[2px]">
                <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
              </div>
            </div>

            <div
              className="self-stretch h-10 inline-flex justify-start items-center gap-2"
            >
              <div className="w-6 self-stretch" />
              <div
                className="flex-1 inline-flex flex-col justify-start items-start"
              >
                <div
                  className="self-stretch inline-flex justify-end items-center gap-2"
                >
                  <div
                    className="flex-1 justify-center text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
                  >
                    Let user add personal request in their booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-start items-start gap-4"
        >
          <div
            className="self-stretch justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
          >
            Customise your event with add-on service like offer to wear
            different outfits and do different actions in the call.
          </div>
          <div
            className="min-w-14 px-2 py-1 bg-gray-900 inline-flex justify-center items-center gap-2"
          >
            <div className="w-4 h-4 relative overflow-hidden">
              <div
                className="w-3 h-3 left-[2px] top-[2px] flex justify-center items-center rounded-sm absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-green-500 text-green-500"
              >
                +
              </div>
            </div>
            <div
              className="text-center justify-start text-green-500 text-xs font-semibold font-['Poppins'] capitalize tracking-tight"
            >
              add-on service
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- line -->
    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <!-- <Section----9> -->
    <BookingSectionsWrapper
      title="Audience Settings"
      leftIcon="https://i.ibb.co/5hNw0yjJ/Icon.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png"
    >
      <div className="flex flex-col justify-start items-start gap-5 mt-5">
        <div
          className="self-stretch flex flex-col justify-start items-start gap-1.5"
        >
          <div
            className="self-stretch flex flex-col justify-start items-start gap-1.5"
          >
            <div
              className="justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
            >
              Who can book a call?
            </div>
            <div
              className="self-stretch bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
            >
              <div
                className="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
              >
                Todo
              </div>
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-3"
        >
          <div
            className="self-stretch flex flex-col justify-start items-start gap-2"
          >
            <div
              className="self-stretch inline-flex justify-start items-center gap-1"
            >
              <div
                className="justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
              >
                Spending requirement
              </div>
              <img src="https://i.ibb.co/HD78k3Sf/Icon.png" alt="" />
            </div>
            <div
              className="self-stretch bg-white/50 rounded-tl-sm rounded-tr-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-b border-gray-300 inline-flex justify-start items-start"
            >
              <div
                className="flex-1 justify-start text-gray-900 text-base font-normal font-['Poppins'] leading-normal"
              >
                Todo
              </div>
            </div>
          </div>
          <div
            className="min-w-14 px-2 py-1 bg-gray-900 inline-flex justify-center items-center gap-2"
          >
            <img src="https://i.ibb.co/bRYvsTVs/Icon.png" alt="" />
            <div
              className="text-center justify-start text-green-500 text-xs font-semibold font-['Poppins'] capitalize tracking-tight"
            >
              Add product
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-start items-start gap-1.5"
        >
          <div
            className="self-stretch flex flex-col justify-start items-start gap-1.5"
          >
            <div
              className="justify-start text-slate-700 text-base font-normal font-['Poppins'] leading-normal"
            >
              Blocked user
            </div>
            <div class="w-full">
              <input
                id="input_b"
                placeholder="Search by username & email"
                v-model="name"
                label-text="Co-performer (Optional)"
                :left-icon="MagnifyingGlassIcon"
                optionalLabel
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- line -->
    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <!-- <Section----10> -->
    <BookingSectionsWrapper
      title="Co-performer"
      leftIcon="https://i.ibb.co/cKdNTc43/Icon-1.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png"
    >
      <div class="w-full mt-3">
        <InputComponentDashbaord
          id="input_b"
          placeholder="Search by username & email"
          v-model="name"
          label-text="Co-performer (Optional)"
          :left-icon="MagnifyingGlassIcon"
          optionalLabel
          class="w-full"
        />
      </div>
    </BookingSectionsWrapper>

    <!-- line -->
    <div class="w-full bg-[#D0D5DD] h-[1px]"></div>

    <!-- <Section----11> -->

    <BookingSectionsWrapper
      title="X Repost Settings"
      leftIcon="https://i.ibb.co/7t7vR7n8/Vector.png"
      accordionIcon="https://i.ibb.co/MD46QRZS/Frame-1410099649.png"
    >
      <div className="flex flex-col justify-start items-start gap-5 mt-5">
        <div
          className="self-stretch flex flex-col justify-center items-start gap-6"
        >
          <div
            className="self-stretch inline-flex justify-start items-start gap-2"
          >
            <CheckboxSwitch
              v-model="isChecked"
              label="Post to X when my booking schedule is live"
              version="dashboard"
              wrapper-label="Dark Mode"
            />
            <div className=" flex justify-end">
              <img src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-6"
        >
          <div
            className="self-stretch inline-flex justify-start items-start gap-2"
          >
            <CheckboxSwitch
              v-model="isChecked"
              label="Post to X when a booking is received"
              version="dashboard"
              wrapper-label="Dark Mode"
            />
            <div className=" flex justify-end">
              <img src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-6"
        >
          <div
            className="self-stretch inline-flex justify-start items-start gap-2"
          >
            <CheckboxSwitch
              v-model="isChecked"
              label="Post to X when I am in a session"
              version="dashboard"
              wrapper-label="Dark Mode"
            />
            <div className=" flex justify-end">
              <img src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-6"
        >
          <div
            className="self-stretch inline-flex justify-start items-start gap-2"
          >
            <CheckboxSwitch
              v-model="isChecked"
              label="Post to X when I am tipped in a session"
              version="dashboard"
              wrapper-label="Dark Mode"
            />
            <div className=" flex justify-end">
              <img src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
            </div>
          </div>
        </div>
        <div
          className="self-stretch flex flex-col justify-center items-start gap-6"
        >
          <div
            className="self-stretch inline-flex justify-start items-start gap-2"
          >
            <CheckboxSwitch
              v-model="isChecked"
              label="Post to X when someone made a purchase in a session"
              version="dashboard"
              wrapper-label="Dark Mode"
            />
            <div className=" flex justify-end">
              <img src="https://i.ibb.co/QFV4GNPF/Icon.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </BookingSectionsWrapper>

    <!-- line -->
    <div class="w-full bg-[#D0D5DD] h-[1px] mb-[80px]"></div>

    <div class="absolute right-0 bottom-0">
      <ButtonComponent
        text="PUBLISH SCHEDULE"
        variant="polygonLeft"
        :leftIcon="'https://i.ibb.co/S74jfvBw/Icon-1.png'"
        :leftIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0
  group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
`"
      />
    </div>
  </form>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1 !important;
  visibility: visible !important;
  -webkit-appearance: inner-spin-button !important;
}
</style>
