export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token');
  const role = useCookie<string | null>('auth_role');

  const isPublicPage = to.path === '/login';

  if (!token.value && !isPublicPage) {
    return navigateTo('/login');
  }

  if (token.value && isPublicPage) {
    return navigateTo('/');
  }

  // Admin-only protection
  if (to.path.startsWith('/admin') && role.value !== 'admin') {
    return navigateTo('/');
  }
});
