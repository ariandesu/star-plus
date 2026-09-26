import { UserSession, Role } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { AppState } from './store';

export const authService = {
  login(username: string, password: string): { success: boolean; session?: UserSession; error?: string } {
    const user = DEMO_USERS.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!user) {
      return { success: false, error: 'Invalid username. Try astronaut01, medical01, or control01.' };
    }
    if (password !== user.password && password !== 'demo123') {
      return { success: false, error: 'Invalid password. (Default demo password: demo123)' };
    }

    const session: UserSession = {
      username: user.username,
      role: user.role,
      name: user.name,
      title: user.title,
      avatarUrl: user.avatarUrl,
      isAuthenticated: true
    };

    AppState.setSession(session);
    return { success: true, session };
  },

  logout(): void {
    AppState.setSession(null);
  },

  getCurrentSession(): UserSession | null {
    return AppState.getSession();
  },

  getSession(): UserSession | null {
    return AppState.getSession();
  },

  getRoleDefaultRoute(role: Role): string {
    switch (role) {
      case 'astronaut':
        return '/astronaut';
      case 'medical':
        return '/medical';
      case 'mission-control':
        return '/mission-control';
      default:
        return '/';
    }
  }
};
