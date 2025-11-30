
import { WheelEntry, User, AdminSettings, DEFAULT_ADMIN_SETTINGS, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'wol_users',
  WHEEL_HISTORY: 'wol_history',
  SETTINGS: 'wol_settings',
  CURRENT_USER: 'wol_current_user'
};

// --- User Management ---
export interface RegisterData {
  name: string;
  mobile: string;
  age: number;
  email: string;
}

export const registerUser = (data: RegisterData): User => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  // Check if user exists by mobile (username)
  let user = users.find(u => u.username === data.mobile);
  
  if (user) {
    // Update existing user info
    user.name = data.name;
    user.age = data.age;
    user.email = data.email;
    // Don't change role or id
  } else {
    // Create new user
    user = {
      id: crypto.randomUUID(),
      username: data.mobile,
      name: data.name,
      mobile: data.mobile,
      age: data.age,
      email: data.email,
      role: data.mobile === '09120000000' || data.name.includes('admin') ? UserRole.ADMIN : UserRole.USER,
    };
    users.push(user);
  }
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
};

// Kept for backward compatibility or direct login if needed
export const loginUser = (username: string): User => {
    // This simple login is deprecated in favor of registerUser for the lead form,
    // but we'll keep it functional by finding the user or creating a partial one.
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    let user = users.find(u => u.username === username);
    if (!user) {
         user = {
            id: crypto.randomUUID(),
            username,
            name: username,
            mobile: username,
            age: 0,
            email: '',
            role: username.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER,
          };
          users.push(user);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
}

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return u ? JSON.parse(u) : null;
};

export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
}

// --- Wheel Data ---
export const saveWheelEntry = (entry: WheelEntry) => {
  const histStr = localStorage.getItem(STORAGE_KEYS.WHEEL_HISTORY);
  let history: WheelEntry[] = histStr ? JSON.parse(histStr) : [];
  history.push(entry);
  localStorage.setItem(STORAGE_KEYS.WHEEL_HISTORY, JSON.stringify(history));
};

export const getUserHistory = (userId: string): WheelEntry[] => {
  const histStr = localStorage.getItem(STORAGE_KEYS.WHEEL_HISTORY);
  const history: WheelEntry[] = histStr ? JSON.parse(histStr) : [];
  return history.filter(h => h.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllHistory = (): WheelEntry[] => {
  const histStr = localStorage.getItem(STORAGE_KEYS.WHEEL_HISTORY);
  return histStr ? JSON.parse(histStr) : [];
};

// --- Settings ---
export const getSettings = (): AdminSettings => {
  const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return s ? JSON.parse(s) : DEFAULT_ADMIN_SETTINGS;
};

export const saveSettings = (settings: AdminSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};
