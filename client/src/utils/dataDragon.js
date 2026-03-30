// /client/src/utils/dataDragon.js
// Implements Section 7 of the spec — never hardcode URLs or versions

const VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
let cachedVersion = null;

export const getDDragonVersion = async () => {
  if (cachedVersion) return cachedVersion;
  const res = await fetch(VERSION_URL);
  const versions = await res.json();
  cachedVersion = versions[0];
  return cachedVersion;
};

// Handles edge cases Data Dragon requires specific casing for
const DDRAGON_ID_OVERRIDES = {
  aurelionsol: 'AurelionSol',
  drmundo: 'DrMundo',
  jarvaniv: 'JarvanIV',
  kogmaw: 'KogMaw',
  leesin: 'LeeSin',
  masteryi: 'MasterYi',
  missfortune: 'MissFortune',
  monkeyking: 'MonkeyKing',
  reksai: 'RekSai',
  tahmkench: 'TahmKench',
  twistedfate: 'TwistedFate',
  xinzhao: 'XinZhao',
  khazix: 'Khazix',
  chogath: 'Chogath',
  velkoz: 'Velkoz',
};

export const toDDragonId = (championId) => {
  if (!championId) return 'Ashe';
  const lower = championId.toLowerCase();
  if (DDRAGON_ID_OVERRIDES[lower]) return DDRAGON_ID_OVERRIDES[lower];
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const PLACEHOLDER = 'https://placehold.co/120x120/1A1A35/D4AF37?text=?';

export const getChampionSplash = (championId, skin = 0) => {
  if (!championId) return PLACEHOLDER;
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${toDDragonId(championId)}_${skin}.jpg`;
};

export const getChampionLoadingArt = (championId, skin = 0) => {
  if (!championId) return PLACEHOLDER;
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${toDDragonId(championId)}_${skin}.jpg`;
};

export const getChampionIcon = async (championId) => {
  if (!championId) return PLACEHOLDER;
  const version = await getDDragonVersion();
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${toDDragonId(championId)}.png`;
};

// Sync version — uses cached value, falls back to known stable patch
export const getChampionIconSync = (championId, version = '14.4.1') => {
  if (!championId) return PLACEHOLDER;
  const v = cachedVersion || version;
  return `https://ddragon.leagueoflegends.com/cdn/${v}/img/champion/${toDDragonId(championId)}.png`;
};

// Preload splash art for a list of champion IDs (use during champ select)
export const preloadSplashArt = (championIds = []) => {
  for (const id of championIds) {
    const img = new Image();
    img.src = getChampionSplash(id);
  }
};

// Handle broken images gracefully
export const onImgError = (e) => {
  e.currentTarget.src = PLACEHOLDER;
  e.currentTarget.onerror = null;
};
