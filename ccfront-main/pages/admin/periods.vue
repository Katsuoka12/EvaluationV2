<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
          จัดการรอบการประเมิน (Evaluation Periods)
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          สร้างและกำหนดช่วงเวลารอบการประเมินผลการปฏิบัติงานบุคลากรในแต่ละช่วง
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-95 transition-all self-start sm:self-auto"
        @click="showCreateModal = true"
      >
        <AppIcon name="plus" size="16" />
        <span>เพิ่มรอบการประเมินใหม่</span>
      </button>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="actionMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 animate-fade-in"
    >
      <AppIcon name="check" size="18" class="text-emerald-500" />
      <span>{{ actionMsg }}</span>
    </div>

    <!-- Periods Grid / Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div v-if="loading" class="py-20 text-center text-slate-400">
        <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p class="text-sm">กำลังโหลดรอบการประเมิน...</p>
      </div>

      <div v-else-if="periods.length === 0" class="py-16 text-center text-slate-400">
        <AppIcon name="calendar" size="40" class="mx-auto text-slate-300 mb-2" />
        <p class="text-sm font-semibold text-slate-700">ยังไม่มีรอบการประเมินในระบบ</p>
        <p class="text-xs text-slate-400 mt-1">กดปุ่ม "เพิ่มรอบการประเมินใหม่" เพื่อสร้างรอบแรก</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-6">รหัส (ID)</th>
              <th class="py-3.5 px-6">ชื่อรอบการประเมิน (Period Name)</th>
              <th class="py-3.5 px-6">วันเริ่มต้น (Start Date)</th>
              <th class="py-3.5 px-6">วันสิ้นสุด (End Date)</th>
              <th class="py-3.5 px-6">สถานะ (Status)</th>
              <th class="py-3.5 px-6 text-right">การจัดการ (Actions)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="p in periods"
              :key="p.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-4 px-6 text-xs font-mono text-slate-400">
                #{{ p.id }}
              </td>
              <td class="py-4 px-6 font-semibold text-slate-900">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <AppIcon name="calendar" size="16" />
                  </div>
                  <span>{{ p.name }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-xs text-slate-600">
                {{ p.startDate }}
              </td>
              <td class="py-4 px-6 text-xs text-slate-600">
                {{ p.endDate }}
              </td>
              <td class="py-4 px-6">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  :class="statusBadgeClasses(p.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClasses(p.status)" />
                  <span>{{ statusLabel(p.status) }}</span>
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  type="button"
                  class="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="ลบรอบการประเมิน"
                  @click="handleDeletePeriod(p.id, p.name)"
                >
                  <AppIcon name="trash" size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Period Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/20 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center">
              <AppIcon name="calendar" size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900">เพิ่มรอบการประเมินใหม่</h3>
              <p class="text-xs text-slate-500">กำหนดชื่อและช่วงวันในการประเมินผล</p>
            </div>
          </div>
          <button
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            @click="showCreateModal = false"
          >
            <AppIcon name="x" size="20" />
          </button>
        </div>

        <form @submit.prevent="handleCreatePeriod" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อรอบการประเมิน (Period Name) *
            </label>
            <input
              v-model="newPeriod.name"
              type="text"
              required
              placeholder="เช่น รอบการประเมินประจำปี 2568 รอบที่ 1"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                วันเริ่มต้น (Start Date) *
              </label>
              <input
                v-model="newPeriod.startDate"
                type="date"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                วันสิ้นสุด (End Date) *
              </label>
              <input
                v-model="newPeriod.endDate"
                type="date"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              สถานะรอบการประเมิน (Status)
            </label>
            <select
              v-model="newPeriod.status"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="draft">แบบร่าง (Draft)</option>
              <option value="active">เปิดใช้งาน (Active)</option>
              <option value="closed">ปิดรอบการประเมิน (Closed)</option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              @click="showCreateModal = false"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-60"
            >
              <span>{{ creating ? 'กำลังบันทึก...' : 'สร้างรอบการประเมิน' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getPeriods, createPeriod, deletePeriod } = useEvaluation();

const loading = ref(true);
const creating = ref(false);
const showCreateModal = ref(false);
const actionMsg = ref('');
const periods = ref<any[]>([]);

const newPeriod = reactive({
  name: '',
  startDate: '',
  endDate: '',
  status: 'active'
});

onMounted(async () => {
  await loadPeriods();
});

const loadPeriods = async () => {
  loading.value = true;
  try {
    periods.value = await getPeriods();
  } catch (err) {
    console.error('Error fetching periods:', err);
  } finally {
    loading.value = false;
  }
};

const statusBadgeClasses = (s: string) => {
  switch (s) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'closed':
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    default:
      return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
};

const statusDotClasses = (s: string) => {
  switch (s) {
    case 'active':
      return 'bg-emerald-500 animate-pulse';
    case 'closed':
      return 'bg-slate-400';
    default:
      return 'bg-amber-500';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'active':
      return 'เปิดใช้งาน (Active)';
    case 'closed':
      return 'ปิดรอบแล้ว (Closed)';
    default:
      return 'แบบร่าง (Draft)';
  }
};

const handleCreatePeriod = async () => {
  creating.value = true;
  try {
    const created = await createPeriod({
      name: newPeriod.name,
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
      status: newPeriod.status
    });

    periods.value.unshift(created);
    showCreateModal.value = false;
    actionMsg.value = `สร้างรอบการประเมิน "${newPeriod.name}" สำเร็จ!`;
    setTimeout(() => {
      actionMsg.value = '';
    }, 4000);

    newPeriod.name = '';
    newPeriod.startDate = '';
    newPeriod.endDate = '';
    newPeriod.status = 'active';
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการสร้างรอบการประเมิน');
  } finally {
    creating.value = false;
  }
};

const handleDeletePeriod = async (id: number, name: string) => {
  if (!confirm(`คุณต้องการลบรอบการประเมิน "${name}" ใช่หรือไม่?`)) return;

  try {
    await deletePeriod(id);
    periods.value = periods.value.filter((p) => p.id !== id);
    actionMsg.value = `ลบรอบการประเมินเรียบร้อยแล้ว`;
    setTimeout(() => {
      actionMsg.value = '';
    }, 4000);
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการลบรอบการประเมิน');
  }
};
</script>
