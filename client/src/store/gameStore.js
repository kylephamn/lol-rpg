import { create } from 'zustand';
import { api } from '../utils/api';

export const useGameStore = create((set, get) => ({
  campaign: null,
  players: [],
  myCharacter: null,
  history: [],
  champions: [],
  regions: [],
  items: [],
  loading: false,
  actionLoading: false,
  error: null,

  // ── Reference data ────────────────────────────────────────────────────────
  loadChampions: async () => {
    try {
      const champions = await api.getChampions();
      set({ champions });
    } catch (err) {
      console.error('Failed to load champions:', err);
    }
  },

  loadRegions: async () => {
    try {
      const regions = await api.getRegions();
      set({ regions });
    } catch (err) {
      console.error('Failed to load regions:', err);
    }
  },

  loadItems: async () => {
    try {
      const items = await api.getItems();
      set({ items });
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  },

  // ── Campaign ──────────────────────────────────────────────────────────────
  loadCampaign: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getCampaign(id);
      set({
        campaign: data,
        players: data.players || [],
        loading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  createCampaign: async (name, regionId, hardcore = false) => {
    set({ loading: true, error: null });
    try {
      const campaign = await api.createCampaign({ name, region_id: regionId, hardcore });
      set({ loading: false });
      return campaign;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  joinCampaign: async (campaignId, championId) => {
    set({ loading: true, error: null });
    try {
      await api.joinCampaign(campaignId, championId);
      const data = await api.getCampaign(campaignId);
      set({ campaign: data, players: data.players || [], loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  startCampaign: async (campaignId) => {
    set({ loading: true, error: null });
    try {
      const result = await api.startCampaign(campaignId);
      const data = await api.getCampaign(campaignId);
      set({ campaign: data, players: data.players || [], loading: false });
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  // ── History ───────────────────────────────────────────────────────────────
  loadHistory: async (campaignId) => {
    try {
      const history = await api.getHistory(campaignId);
      set({ history });
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  },

  appendHistory: (entry) => {
    set(state => ({ history: [...state.history, entry] }));
  },

  // ── Main action dispatch ──────────────────────────────────────────────────
  submitAction: async (campaignId, action) => {
    set({ actionLoading: true, error: null });
    try {
      const result = await api.submitAction(campaignId, action);

      // Update local campaign state optimistically
      set(state => ({
        actionLoading: false,
        campaign: state.campaign ? {
          ...state.campaign,
          state: result.campaign_state,
          combat_state: result.combat_state,
          current_scene: {
            description: result.narrative,
            available_actions: result.available_actions,
          },
        } : null,
        history: [
          ...state.history,
          { type: 'narrative', content: result.narrative, created_at: new Date().toISOString() },
        ],
      }));

      // Update my character stats from response
      if (result.player) {
        set(state => ({
          players: state.players.map(p =>
            p.user_id === state.campaign?.dm_user_id || true
              ? { ...p, ...result.player }
              : p
          ),
        }));
      }

      return result;
    } catch (err) {
      set({ error: err.message, actionLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ campaign: null, players: [], myCharacter: null, history: [] }),
}));
