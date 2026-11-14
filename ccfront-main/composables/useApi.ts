export const useApi = () => {
  const config = useRuntimeConfig();

  const apiFetch = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const baseURL = config.public.apiBase || 'http://localhost:3333/api';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const headers: Record<string, string> = {
      ...(options.headers || {})
    };

    // ดึง token ล่าสุดจาก cookie เสมอ ณ เวลาที่ยิง request หรือจาก options
    const cookieToken = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 7, path: '/' });
    const activeToken = options.token || cookieToken.value;

    if (activeToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const response = await $fetch<T>(`${baseURL}${cleanEndpoint}`, {
        ...options,
        headers
      });
      return response;
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?._data?.message || err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';

      if (status === 401 && process.client) {
        const route = useRoute();
        // ถ้าไม่ได้อยู่หน้า login หรือไม่ได้กำลังเรียก endpoint auth จึงเคลียร์ session
        if (route.path !== '/login' && !cleanEndpoint.startsWith('/auth/')) {
          cookieToken.value = null;
          useCookie('auth_role', { path: '/' }).value = null;
          useCookie('auth_username', { path: '/' }).value = null;
          navigateTo('/login');
        }
      }

      throw new Error(message);
    }
  };

  return {
    apiFetch
  };
};

