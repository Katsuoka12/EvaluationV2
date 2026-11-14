export interface UserProfile {
  full_name: string;
  email: string;
  position: string;
  avatar_url: string;
}

export const useAuth = () => {
  const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 7, path: '/' });
  const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 7, path: '/' });
  const usernameCookie = useCookie<string | null>('auth_username', { maxAge: 60 * 60 * 24 * 7, path: '/' });

  const profile = useState<UserProfile>('auth_profile', () => ({
    full_name: '',
    email: '',
    position: '',
    avatar_url: ''
  }));

  const { apiFetch } = useApi();

  const isAuthenticated = computed(() => !!tokenCookie.value);
  const role = computed(() => roleCookie.value || 'user');
  const username = computed(() => usernameCookie.value || 'ผู้ใช้งาน');

  const isAdmin = computed(() => role.value === 'admin');
  const isAssessor = computed(() => role.value === 'assessor');
  const isUser = computed(() => role.value === 'user');

  const roleNameTh = computed(() => {
    switch (role.value) {
      case 'admin':
        return 'ผู้ดูแลระบบ (Admin)';
      case 'assessor':
        return 'ผู้ประเมินผล (Assessor)';
      case 'user':
        return 'บุคลากร/ผู้รับการประเมิน (Staff)';
      default:
        return 'ผู้ใช้งาน';
    }
  });

  const login = async (userAccount: string, pass: string) => {
    const res = await apiFetch<{ token: string; role: string }>('/auth/login', {
      method: 'POST',
      body: { username: userAccount, password: pass }
    });

    tokenCookie.value = res.token;
    roleCookie.value = res.role;
    usernameCookie.value = userAccount;

    // Fetch profile after login with the token directly
    try {
      await fetchProfile(res.token);
    } catch {
      // Profile might not exist yet, which is fine
    }

    return res;
  };

  const register = async (userAccount: string, pass: string, userRole: string = 'user') => {
    return await apiFetch<{ message: string }>('/auth/register', {
      method: 'POST',
      body: { username: userAccount, password: pass, role: userRole }
    });
  };

  const logout = () => {
    tokenCookie.value = null;
    roleCookie.value = null;
    usernameCookie.value = null;
    profile.value = {
      full_name: '',
      email: '',
      position: '',
      avatar_url: ''
    };
    navigateTo('/login');
  };

  const fetchProfile = async (explicitToken?: string) => {
    const activeToken = explicitToken || tokenCookie.value;
    if (!activeToken) return profile.value;
    try {
      const data = await apiFetch<UserProfile>('/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      if (data) {
        profile.value = {
          full_name: data.full_name || '',
          email: data.email || '',
          position: data.position || '',
          avatar_url: data.avatar_url || ''
        };
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
    return profile.value;
  };


  const saveProfile = async (data: Partial<UserProfile>) => {
    const res = await apiFetch<{ message: string }>('/profile', {
      method: 'PUT',
      body: data
    });
    profile.value = {
      ...profile.value,
      ...data
    };
    return res;
  };

  const displayName = computed(() => {
    return profile.value.full_name || usernameCookie.value || 'ผู้ใช้งาน';
  });

  return {
    token: tokenCookie,
    role,
    roleNameTh,
    username,
    profile,
    displayName,
    isAuthenticated,
    isAdmin,
    isAssessor,
    isUser,
    login,
    register,
    logout,
    fetchProfile,
    saveProfile
  };
};
