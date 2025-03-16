export const dataServerGenshin = ['America', 'Europe', 'Asia', 'TW_HK_MO'];
export const getServerData = (code: string) => {
  switch (code) {
    case 'genshin-impact':
      return dataServerGenshin;
    case 'honkai-star-rail':
      return dataSeverHonkaiTarrail;
    case 'ragnarok-m':
      return ragnarokM;
    default:
      return undefined;
  }
};
export const dataServerHeroesEvolved = [
  'North America - LOST TEMPLE [NA]',
  'North America - NEW ORDER',
  'Europe - ASGARD [EU]',
  'Europe - OLYMPUS [EU]',
  'South America - AMAZON [SA]',
  'South America - EL DORADO [SA]',
  'Asia - SHANGRI-LA [AS]',
  'Asia - S1.ANGKOR [AS]',
  'Asia - S2.EL NIDO [AS]',
  'Asia - ไทย[TH]',
  'Asia - ไทยแลนด์[TH]',
];

export const dataShellFire = [
  {
    name: 'Android',
    value: 'android',
  },
  {
    name: 'IOS',
    value: 'ios',
  },
];
export const RagnarokForeverLove = [
  {
    name: 'ALL SERVER',
    value: 'allserver',
  },
];

export const ragnarokM = [
  {
    name: 'Eternal Love',
    value: '90001',
  },
  {
    name: 'Midnight Party',
    value: '90002',
  },
  {
    name: 'Memory Of Faith',
    value: '90002003',
  },
];
export const dataSeverHonkaiTarrail = [
  {
    name: 'America/USA',
    value: '|prod_official_usa',
  },
  {
    name: 'Europa',
    value: '|prod_official_eur',
  },
  {
    name: 'Asia',
    value: '|prod_official_asia',
  },
  {
    name: 'TW_HK_MO',
    value: '|prod_official_cht',
  },
];
