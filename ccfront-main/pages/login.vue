<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Ambient Background Lighting -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

    <div class="w-full max-w-md relative z-10">
      <!-- Brand Logo & Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand text-white shadow-xl shadow-brand-500/30 mb-4 transform hover:scale-105 transition-transform">
          <AppIcon name="award" size="36" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ระบบประเมินผลบุคลากร
        </h1>
        <p class="text-sm text-slate-300 mt-1.5">
          Personnel Performance Appraisal & KPI System
        </p>
      </div>

      <!-- Main Card -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <!-- Auth Tabs (Login / Register) -->
        <div class="flex p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            class="flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all"
            :class="isRegisterMode ? 'text-slate-600 hover:text-slate-900' : 'bg-white text-brand-700 shadow-sm'"
            @click="isRegisterMode = false"
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all"
            :class="isRegisterMode ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            @click="isRegisterMode = true"
          >
            สมัครสมาชิก (Register)
          </button>
        </div>

        <!-- Alert Message -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake"
        >
          <AppIcon name="alert-circle" size="18" class="text-rose-500 shrink-0 mt-0.5" />
          <span>{{ errorMessage }}</span>
        </div>

        <div
          v-if="successMessage"
          class="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <AppIcon name="check" size="18" class="text-emerald-500 shrink-0 mt-0.5" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- Login / Register Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div class="relative">
              <input
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                placeholder="กรอกชื่อผู้ใช้งาน"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                class="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                @click="showPassword = !showPassword"
              >
                <AppIcon :name="showPassword ? 'eye-off' : 'eye'" size="18" />
              </button>
            </div>
          </div>

          <!-- Role selection when registering -->
          <div v-if="isRegisterMode">
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              บทบาท / สิทธิ์การใช้งาน (Role)
            </label>
            <select
              v-model="form.role"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            >
              <option value="user">บุคลากร / ผู้รับการประเมิน (User/Staff)</option>
              <option value="assessor">ผู้ประเมินผล / หัวหน้างาน (Assessor)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 py-3.5 px-4 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:opacity-95 active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{{ isRegisterMode ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบ' }}</span>
          </button>
        </form>

        <!-- Quick Test Accounts Helper -->
        <div class="mt-6 pt-5 border-t border-slate-100">
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            คลิกเลือกบัญชีทดสอบด่วน (รหัสผ่าน: 1234)
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              class="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-center transition-all group"
              @click="fillTestAccount('test', '1234', 'admin')"
            >
              <p class="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600">Admin</p>
              <p class="text-[10px] text-slate-500 font-mono">test</p>
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-center transition-all group"
              @click="fillTestAccount('testUser', '1234', 'assessor')"
            >
              <p class="text-[11px] font-bold text-slate-800 group-hover:text-amber-600">Assessor</p>
              <p class="text-[10px] text-slate-500 font-mono">testUser</p>
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-center transition-all group"
              @click="fillTestAccount('user', '1234', 'user')"
            >
              <p class="text-[11px] font-bold text-slate-800 group-hover:text-emerald-600">Staff 1</p>
              <p class="text-[10px] text-slate-500 font-mono">user</p>
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-center transition-all group"
              @click="fillTestAccount('testuser01', '1234', 'user')"
            >
              <p class="text-[11px] font-bold text-slate-800 group-hover:text-emerald-600">Staff 2</p>
              <p class="text-[10px] text-slate-500 font-mono">testuser01</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
});

const { login, register } = useAuth();

const isRegisterMode = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
  username: '',
  password: '',
  role: 'user'
});

watch(isRegisterMode, () => {
  errorMessage.value = '';
  successMessage.value = '';
});

const fillTestAccount = (u: string, p: string, r: string) => {
  isRegisterMode.value = false;
  form.username = u;
  form.password = p;
  form.role = r;
  errorMessage.value = '';
  successMessage.value = '';
};

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    if (isRegisterMode.value) {
      const res = await register(form.username.trim(), form.password, form.role);
      successMessage.value = res.message || 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ';
      isRegisterMode.value = false;
    } else {
      await login(form.username.trim(), form.password);
      await navigateTo('/', { replace: true });
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง';
  } finally {
    isLoading.value = false;
  }
};
</script>
