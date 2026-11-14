<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
          เกณฑ์การประเมินและตัวชี้วัด (KPI & Criteria)
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          กำหนดหัวข้อเกณฑ์หลักและข้อย่อยสำหรับใช้ในการประเมินผลการปฏิบัติงานของบุคลากร
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-95 transition-all self-start sm:self-auto"
        @click="openCreateModal"
      >
        <AppIcon name="plus" size="16" />
        <span>สร้างเกณฑ์ประเมินใหม่</span>
      </button>
    </div>

    <!-- Alert Message -->
    <div
      v-if="actionMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 animate-fade-in"
    >
      <AppIcon name="check" size="18" class="text-emerald-500" />
      <span>{{ actionMsg }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center text-slate-400">
      <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
      <p class="text-sm">กำลังโหลดรายการเกณฑ์การประเมิน...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="criteriaList.length === 0" class="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
      <AppIcon name="award" size="44" class="mx-auto text-slate-300 mb-3" />
      <h3 class="text-base font-bold text-slate-800">ยังไม่มีเกณฑ์การประเมิน</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
        คลิกปุ่ม "สร้างเกณฑ์ประเมินใหม่" ด้านบนเพื่อเริ่มกำหนดหัวข้อและตัวชี้วัด
      </p>
    </div>

    <!-- Criteria List Cards -->
    <div v-else class="space-y-5">
      <div
        v-for="(crit, idx) in criteriaList"
        :key="crit.id"
        class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5 hover:border-slate-300 transition-all"
      >
        <!-- Criteria Card Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
              {{ idx + 1 }}
            </span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base sm:text-lg font-bold text-slate-900">
                  {{ crit.name }}
                </h2>
                <span
                  v-if="crit.requiresEvidence"
                  class="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold flex items-center gap-1"
                >
                  <AppIcon name="file-text" size="11" />
                  <span>ต้องแนบเอกสาร</span>
                </span>
              </div>
              <p v-if="crit.description" class="text-xs text-slate-500 mt-1 leading-relaxed">
                {{ crit.description }}
              </p>
              <div v-if="crit.periodStart || crit.periodEnd" class="text-[11px] text-slate-400 mt-1">
                ช่วงเวลา: {{ crit.periodStart || '-' }} ถึง {{ crit.periodEnd || '-' }}
              </div>
            </div>
          </div>

          <!-- Controls for Criteria -->
          <div class="flex items-center gap-2 self-end sm:self-start">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors"
              @click="openAddSubitemModal(crit)"
            >
              <AppIcon name="plus" size="13" />
              <span>เพิ่มข้อย่อย</span>
            </button>

            <button
              type="button"
              class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="แก้ไขหัวข้อ"
              @click="openEditModal(crit)"
            >
              <AppIcon name="edit" size="15" />
            </button>

            <button
              type="button"
              class="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              title="ลบเกณฑ์นี้"
              @click="handleDeleteCriteria(crit.id, crit.name)"
            >
              <AppIcon name="trash" size="15" />
            </button>
          </div>
        </div>

        <!-- Subitems List -->
        <div>
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            ตัวชี้วัดย่อย (Subitems) - {{ crit.subItems?.length || 0 }} รายการ
          </p>

          <div v-if="!crit.subItems || crit.subItems.length === 0" class="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-400">
            ยังไม่มีข้อย่อยในหมวดนี้ คลิก "+ เพิ่มข้อย่อย" เพื่อเพิ่มตัวชี้วัด
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(sub, sIdx) in crit.subItems"
              :key="sub.id || sIdx"
              class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs hover:bg-slate-100/60 transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <span class="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {{ sIdx + 1 }}
                </span>
                <span class="font-medium text-slate-800">{{ sub.name }}</span>
              </div>

              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                :class="sub.type === 'document' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'"
              >
                {{ sub.type === 'document' ? 'เอกสาร/หลักฐาน' : 'คะแนน (1-5)' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Criteria Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/20 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center">
              <AppIcon name="award" size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900">สร้างเกณฑ์การประเมินหลัก</h3>
              <p class="text-xs text-slate-500">กำหนดชื่อและรายละเอียดของเกณฑ์</p>
            </div>
          </div>
          <button
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            @click="showCreateModal = false"
          >
            <AppIcon name="x" size="20" />
          </button>
        </div>

        <form @submit.prevent="handleCreateCriteria" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อเกณฑ์หลัก (Criteria Name) *
            </label>
            <input
              v-model="newCriteria.name"
              type="text"
              required
              placeholder="เช่น การประเมินผลการปฏิบัติงาน (Performance Appraisal)"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              คำอธิบายเกณฑ์ (Description)
            </label>
            <textarea
              v-model="newCriteria.description"
              rows="3"
              placeholder="ระบุคำอธิบายหรือแนวทางการให้คะแนน"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                วันเริ่มประเมิน
              </label>
              <input
                v-model="newCriteria.periodStart"
                type="date"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                วันสิ้นสุด
              </label>
              <input
                v-model="newCriteria.periodEnd"
                type="date"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input
              id="reqEvidence"
              v-model="newCriteria.requiresEvidence"
              type="checkbox"
              class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label for="reqEvidence" class="text-xs font-medium text-slate-700 cursor-pointer">
              กำหนดให้ต้องแนบเอกสารหลักฐานผลงาน (Requires Evidence)
            </label>
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
              :disabled="saving"
              class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-60"
            >
              <span>{{ saving ? 'กำลังบันทึก...' : 'สร้างเกณฑ์' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Subitem Modal -->
    <div
      v-if="showSubitemModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/20 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="font-bold text-base text-slate-900">เพิ่มตัวชี้วัดย่อย</h3>
            <p class="text-xs text-slate-500">หมวด: {{ activeCriteriaForSubitem?.name }}</p>
          </div>
          <button
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            @click="showSubitemModal = false"
          >
            <AppIcon name="x" size="20" />
          </button>
        </div>

        <form @submit.prevent="handleAddSubitem" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อตัวชี้วัดย่อย (Subitem Name) *
            </label>
            <input
              v-model="newSubitem.name"
              type="text"
              required
              placeholder="เช่น คุณภาพและผลสำเร็จของงาน"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ประเภทการให้คะแนน (Item Type)
            </label>
            <select
              v-model="newSubitem.type"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="score">ประเมินระดับคะแนน (Score 1-5)</option>
              <option value="document">ตรวจสอบเอกสารหลักฐาน (Document Evidence)</option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              @click="showSubitemModal = false"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-60"
            >
              <span>{{ saving ? 'กำลังเพิ่ม...' : 'เพิ่มข้อย่อย' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Criteria Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/20 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="font-bold text-base text-slate-900">แก้ไขเกณฑ์การประเมิน</h3>
            <p class="text-xs text-slate-500">ปรับปรุงรายละเอียดและตัวชี้วัดย่อย</p>
          </div>
          <button
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            @click="showEditModal = false"
          >
            <AppIcon name="x" size="20" />
          </button>
        </div>

        <form @submit.prevent="handleUpdateCriteria" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อเกณฑ์หลัก *
            </label>
            <input
              v-model="editForm.name"
              type="text"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              คำอธิบาย
            </label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              id="editReqEvidence"
              v-model="editForm.requiresEvidence"
              type="checkbox"
              class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label for="editReqEvidence" class="text-xs font-medium text-slate-700 cursor-pointer">
              กำหนดให้ต้องแนบเอกสารหลักฐานผลงาน
            </label>
          </div>

          <!-- Edit Subitems list -->
          <div class="pt-3 border-t border-slate-100">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold text-slate-700">รายการข้อย่อย (Subitems)</label>
              <button
                type="button"
                class="text-xs text-brand-600 font-semibold hover:underline"
                @click="editForm.subItems.push({ name: '', type: 'score' })"
              >
                + เพิ่มแถว
              </button>
            </div>

            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="(item, i) in editForm.subItems"
                :key="i"
                class="flex items-center gap-2"
              >
                <input
                  v-model="item.name"
                  type="text"
                  placeholder="ชื่อข้อย่อย"
                  class="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                  v-model="item.type"
                  class="w-28 px-2 py-1.5 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="score">คะแนน</option>
                  <option value="document">เอกสาร</option>
                </select>
                <button
                  type="button"
                  class="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"
                  @click="editForm.subItems.splice(i, 1)"
                >
                  <AppIcon name="x" size="16" />
                </button>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              @click="showEditModal = false"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-60"
            >
              <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getCriteria, createCriteria, updateCriteria, deleteCriteria, addSubitem } = useEvaluation();

const loading = ref(true);
const saving = ref(false);
const actionMsg = ref('');
const criteriaList = ref<any[]>([]);

const showCreateModal = ref(false);
const showSubitemModal = ref(false);
const showEditModal = ref(false);

const activeCriteriaForSubitem = ref<any>(null);

const newCriteria = reactive({
  name: '',
  description: '',
  requiresEvidence: false,
  periodStart: '',
  periodEnd: ''
});

const newSubitem = reactive({
  name: '',
  type: 'score' as 'score' | 'document'
});

const editForm = reactive({
  id: 0,
  name: '',
  description: '',
  requiresEvidence: false,
  periodStart: '',
  periodEnd: '',
  subItems: [] as any[]
});

onMounted(async () => {
  await loadCriteria();
});

const loadCriteria = async () => {
  loading.value = true;
  try {
    criteriaList.value = await getCriteria();
  } catch (err) {
    console.error('Error fetching criteria:', err);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  newCriteria.name = '';
  newCriteria.description = '';
  newCriteria.requiresEvidence = false;
  newCriteria.periodStart = '';
  newCriteria.periodEnd = '';
  showCreateModal.value = true;
};

const handleCreateCriteria = async () => {
  saving.value = true;
  try {
    const created = await createCriteria({
      name: newCriteria.name,
      description: newCriteria.description,
      requiresEvidence: newCriteria.requiresEvidence,
      periodStart: newCriteria.periodStart || undefined,
      periodEnd: newCriteria.periodEnd || undefined
    });

    criteriaList.value.push(created);
    showCreateModal.value = false;
    actionMsg.value = `สร้างเกณฑ์ "${newCriteria.name}" สำเร็จ!`;
    setTimeout(() => {
      actionMsg.value = '';
    }, 4000);
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการสร้างเกณฑ์');
  } finally {
    saving.value = false;
  }
};

const openAddSubitemModal = (crit: any) => {
  activeCriteriaForSubitem.value = crit;
  newSubitem.name = '';
  newSubitem.type = 'score';
  showSubitemModal.value = true;
};

const handleAddSubitem = async () => {
  if (!activeCriteriaForSubitem.value) return;

  saving.value = true;
  try {
    const created = await addSubitem(activeCriteriaForSubitem.value.id, {
      name: newSubitem.name,
      type: newSubitem.type
    });

    if (!activeCriteriaForSubitem.value.subItems) {
      activeCriteriaForSubitem.value.subItems = [];
    }
    activeCriteriaForSubitem.value.subItems.push(created);

    showSubitemModal.value = false;
    actionMsg.value = `เพิ่มข้อย่อยสำเร็จ!`;
    setTimeout(() => {
      actionMsg.value = '';
    }, 4000);
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อย่อย');
  } finally {
    saving.value = false;
  }
};

const openEditModal = (crit: any) => {
  editForm.id = crit.id;
  editForm.name = crit.name;
  editForm.description = crit.description || '';
  editForm.requiresEvidence = !!crit.requiresEvidence;
  editForm.periodStart = crit.periodStart || '';
  editForm.periodEnd = crit.periodEnd || '';
  editForm.subItems = (crit.subItems || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    type: s.type || 'score'
  }));
  showEditModal.value = true;
};

const handleUpdateCriteria = async () => {
  saving.value = true;
  try {
    const updated = await updateCriteria(editForm.id, {
      name: editForm.name,
      description: editForm.description,
      requiresEvidence: editForm.requiresEvidence,
      subItems: editForm.subItems,
      periodStart: editForm.periodStart || undefined,
      periodEnd: editForm.periodEnd || undefined
    });

    const idx = criteriaList.value.findIndex((c) => c.id === editForm.id);
    if (idx !== -1) {
      criteriaList.value[idx] = updated;
    }

    showEditModal.value = false;
    actionMsg.value = `อัปเดตเกณฑ์เรียบร้อยแล้ว!`;
    setTimeout(() => {
      actionMsg.value = '';
    }, 4000);
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการแก้ไขเกณฑ์');
  } finally {
    saving.value = false;
  }
};

const handleDeleteCriteria = async (id: number, name: string) => {
  if (!confirm(`คุณต้องการลบเกณฑ์ "${name}" และตัวชี้วัดย่อยทั้งหมดใช่หรือไม่?`)) return;

  try {
    await deleteCriteria(id);
    criteriaList.value = criteriaList.value.filter((c) => c.id !== id);
    actionMsg.value = 'ลบเกณฑ์การประเมินเรียบร้อยแล้ว';
    setTimeout(() => {
      actionMsg.value = '';
    }, 4000);
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการลบเกณฑ์');
  }
};
</script>
