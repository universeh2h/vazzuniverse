// URL yang benar untuk validasi nickname Mobile Legends
export const BASE_URL_VALIDATE_NICKNAME = 'https://api.isan.eu.org/nickname';

interface Result {
  success: boolean;
  game?: string;
  id?: number | string;
  server?: string | number;
  name?: string;
  message?: string;
}

export type GameType =
  | 'genshin-impact'
  | 'honkai-star-rail'
  | 'league-of-legends'
  | 'arena-of-valor'
  | 'UNDAWN'
  | 'call-of-duty-mobile'
  | 'fc-mobile'
  | 'metal-slug-awakening'
  | 'eggy-party'
  | 'blood-strike'
  | 'Love-and-Deepspace'
  | 'stumble-guys'
  | 'black-clover-m'
  | 'infinite-borders'
  | 'laplace-m'
  | 'hago'
  | 'speed-drifters'
  | 'au2-mobile'
  | 'eternal-city'
  | 'Sky-Children-of-the-Light'
  | 'Farlight-84'
  | 'Draconia-Saga'
  | 'Tarisland'
  | 'aether-gazer'
  | 'lifeafter'
  | 'point-blank'
  | 'punishing-gray-raven'
  | 'sausage-man'
  | 'super-sus'
  | 'valorant'
  | 'zenless-zone-zero'
  | 'free-fire'
  | 'mobile-legend';

export interface CheckNickNameReq {
  userId: string;
  serverId?: string;
  type: GameType;
}

export function validateCheckNickNameReq(data: CheckNickNameReq): boolean {
  if (!data.userId || typeof data.userId !== 'string') return false;
  if (data.serverId && typeof data.serverId !== 'string') return false;
  if (!data.type || !isValidGameType(data.type)) return false;
  return true;
}

function isValidGameType(type: string): type is GameType {
  return [
    'genshin-impact',
    'honkai-star-rail',
    'league-of-legends',
    'arena-of-valor',
    'UNDAWN',
    'call-of-duty-mobile',
    'fc-mobile',
    'metal-slug-awakening',
    'eggy-party',
    'blood-strike',
    'Love-and-Deepspace',
    'stumble-guys',
    'black-clover-m',
    'infinite-borders',
    'laplace-m',
    'hago',
    'speed-drifters',
    'au2-mobile',
    'eternal-city',
    'Sky-Children-of-the-Light',
    'Farlight-84',
    'Draconia-Saga',
    'Tarisland',
    'aether-gazer',
    'lifeafter',
    'point-blank',
    'punishing-gray-raven',
    'sausage-man',
    'super-sus',
    'valorant',
    'zenless-zone-zero',
    'free-fire',
    'mobile-legend',
  ].includes(type);
}

export async function CheckNickName(
  request: CheckNickNameReq
): Promise<Result> {
  if (!validateCheckNickNameReq(request)) {
    throw new Error('Invalid request data');
  }

  console.log('Request data:', request);

  let url = `${BASE_URL_VALIDATE_NICKNAME}/default?id=${request.userId}`;

  // Kasus khusus untuk Mobile Legends
  if (request.type === 'mobile-legend') {
    url = `${BASE_URL_VALIDATE_NICKNAME}/ml?id=${parseInt(
      request.userId
    )}&server=${request.serverId}`;
  } else if (request.type === 'genshin-impact') {
    url = `${BASE_URL_VALIDATE_NICKNAME}/gi?id=${parseInt(request.userId)}`;
  } else if (request.type === 'honkai-star-rail') {
    url = `${BASE_URL_VALIDATE_NICKNAME}/hsr?id=${parseInt(request.userId)}`;
  } else if (request.type === 'free-fire') {
    url = `${BASE_URL_VALIDATE_NICKNAME}/ff?id=${parseInt(request.userId)}`;
  } else if (request.type === 'valorant') {
    url = `${BASE_URL_VALIDATE_NICKNAME}/valo?id=${encodeURIComponent(
      parseInt(request.userId)
    )}`;
  }

  console.log('Fetching URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET', // Gunakan GET untuk validasi nickname, bukan POST
    });

    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    // Transformasi respons ke format Result
    return {
      success: data.success || false,
      game: request.type,
      id: request.userId,
      server: request.serverId,
      name: data.name || null,
      message: data.message || null,
    };
  } catch (error) {
    console.error('Error checking nickname:', error);
    return {
      success: false,
      message: `Error checking nickname: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
