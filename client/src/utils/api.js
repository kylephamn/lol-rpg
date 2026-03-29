// /client/src/utils/api.js
const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('lol_rpg_token');

const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),

  // Auth
  register: (data)  => request('POST', '/auth/register', data),
  login:    (data)  => request('POST', '/auth/login', data),
  me:       ()      => request('GET',  '/auth/me'),

  // Data
  getChampions:   ()   => request('GET', '/data/champions'),
  getChampion:    (id) => request('GET', `/data/champions/${id}`),
  getItems:       ()   => request('GET', '/data/items'),
  getRegions:     ()   => request('GET', '/data/regions'),

  // Campaigns
  createCampaign:    (data)           => request('POST', '/campaigns', data),
  getCampaign:       (id)             => request('GET',  `/campaigns/${id}`),
  joinCampaign:      (id, championId) => request('POST', `/campaigns/${id}/join`, { champion_id: championId }),
  startCampaign:     (id)             => request('POST', `/campaigns/${id}/start`),
  submitAction:      (id, action)     => request('POST', `/campaigns/${id}/action`, { action }),
  startEncounter:    (id, enemies)    => request('POST', `/campaigns/${id}/encounter`, { enemies }),
  getHistory:        (id, page = 1)   => request('GET',  `/campaigns/${id}/history?page=${page}`),
};
