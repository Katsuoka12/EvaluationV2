<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">ข้อมูลส่วนบุคคล (My Profile)</h1>
        <p class="text-xs sm:text-sm text-slate-500">จัดการข้อมูลประวัติ ตำแหน่ง และรูปภาพประจำตัวสำหรับใช้ในระบบประเมิน</p>
      </div>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="successMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3 animate-fade-in"
    >
      <AppIcon name="check" size="20" class="text-emerald-500" />
      <span>{{ successMsg }}</span>
    </div>

    <div
      v-if="errorMsg"
      class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3"
    >
      <AppIcon name="alert-circle" size="20" class="text-rose-500" />
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Profile Form Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Avatar Section -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            รูปภาพโปรไฟล์ (Profile Avatar)
          </label>
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <div class="relative group">
              <img
                v-if="form.avatar_url"
                :src="form.avatar_url"
                alt="Avatar"
                class="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-200 shadow-md"
              />
              <div
                v-else
                class="w-24 h-24 rounded-3xl gradient-brand text-white flex items-center justify-center font-bold text-3xl shadow-md"
              >
                {{ form.full_name ? form.full_name.charAt(0).toUpperCase() : 'U' }}
              </div>
            </div>

            <div class="flex-1 space-y-2 text-center sm:text-left">
              <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
                <label
                  class="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <AppIcon name="edit" size="14" />
                  <span>อัปโหลดรูปภาพ</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileUpload"
                  />
                </label>
                <button
                  v-if="form.avatar_url"
                  type="button"
                  @click="form.avatar_url = ''"
                  class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors"
                >
                  ลบรูปภาพ
                </button>
              </div>
              <p class="text-[11px] text-slate-400">
                รองรับไฟล์ PNG, JPG, GIF หรือ WebP (ระบบแปลงเป็นรูปภาพอัตโนมัติ)
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อ - นามสกุล (Full Name) *
            </label>
            <input
              v-model="form.full_name"
              type="text"
              required
              placeholder="เช่น สมชาย ใจดี"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              อีเมลติดต่อ (Email) *
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="example@company.com"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ตำแหน่งงาน / แผนก (Position) *
            </label>
            <input
              v-model="form.position"
              type="text"
              required
              placeholder="เช่น งานสารสนเทศ, การเงินและบัญชี"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              สิทธิ์ในระบบ (System Role)
            </label>
            <input
              :value="roleNameTh"
              type="text"
              disabled
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3 rounded-xl gradient-brand text-white font-semibold text-sm shadow-md hover:opacity-95 active:scale-95 disabled:opacity-60 transition-all flex items-center gap-2"
          >
            <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <AppIcon v-else name="check" size="18" />
            <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลส่วนบุคคล' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { profile, roleNameTh, fetchProfile, saveProfile } = useAuth();

const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const form = reactive({
  full_name: '',
  email: '',
  position: '',
  avatar_url: ''
});

onMounted(async () => {
  const p = await fetchProfile();
  form.full_name = p.full_name || '';
  form.email = p.email || '';
  form.position = p.position || '';
  form.avatar_url = p.avatar_url || '';
});

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('ขนาดรูปภาพต้องไม่เกิน 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    form.avatar_url = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async () => {
  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    await saveProfile({
      full_name: form.full_name,
      email: form.email,
      position: form.position,
      avatar_url: form.avatar_url
    });
    successMsg.value = 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว';
    setTimeout(() => {
      successMsg.value = '';
    }, 4000);
  } catch (err: any) {
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
  } finally {
    saving.value = false;
  }
};
</script>
