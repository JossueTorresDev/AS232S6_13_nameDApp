import { writable } from 'svelte/store';

export type SidebarSection =
  | 'dashboard'
  | 'wallet'
  | 'transactions'
  | 'activity'
  | 'security'
  | 'watchonly';

export const sidebarStore = writable<SidebarSection>('dashboard');
