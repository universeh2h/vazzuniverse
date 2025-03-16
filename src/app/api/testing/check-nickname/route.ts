import { NextResponse } from 'next/server';

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

// Fungsi untuk mendapatkan endpoint validasi yang benar untuk setiap game
function getValidationEndpoint(type: GameType): string {
  if (type === 'mobile-legend') {
    return '/validate-mobile-legends';
  } else if (type === 'free-fire') {
    return '/validate-free-fire';
  } else if (type === 'genshin-impact') {
    return '/validate-genshin';
  }
  // Tambahkan endpoint validasi untuk game lain sesuai kebutuhan
  // Format umum: `/validate-${gameCode}`
  return `/validate-${type}`;
}

export async function CheckNickName(
  request: CheckNickNameReq
): Promise<Result> {
  if (!validateCheckNickNameReq(request)) {
    throw new Error('Invalid request data');
  }

  console.log('Request data:', request);

  const endpoint = getValidationEndpoint(request.type);
  let url;

  // Kasus khusus untuk Mobile Legends
  if (request.type === 'mobile-legend') {
    url = `${BASE_URL_VALIDATE_NICKNAME}/ml?id=${parseInt(
      request.userId
    )}&server=${parseInt(request.serverId as string)}`;
  }
  // Kasus khusus untuk Genshin Impact
  else if (request.type === 'genshin-impact') {
    url = `${BASE_URL_VALIDATE_NICKNAME}${endpoint}?uid=${request.userId}&server=${request.serverId}`;
  }
  // Kasus khusus untuk Valorant
  else if (request.type === 'valorant') {
    url = `${BASE_URL_VALIDATE_NICKNAME}${endpoint}?riotId=${request.userId}`;
  }
  // Format umum untuk game lain
  else {
    url = `${BASE_URL_VALIDATE_NICKNAME}${endpoint}?userId=${request.userId}`;
    if (request.serverId) {
      url += `&serverId=${request.serverId}`;
    }
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
      name:
        data.username || data.nickname || data.displayName || data.name || null,
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

export async function GET(req: Request) {
  const request = await req.json();
  const { type, userId, serverId } = request.body();
  try {
    const data = await CheckNickName({
      type,
      userId,
      serverId,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API route error:', error);
    if (error instanceof Error) {
      return Response.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, message: 'internal server error' },
      { status: 500 }
    );
  }
}
