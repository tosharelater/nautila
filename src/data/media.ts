/**
 * Illustrative photos (Unsplash licence, hotlinked) until Nautila's own shoots exist.
 * Brand Book p.10 — replace with real homes: grazing 5 pm light, linen, light wood, brass.
 */
export const IMG = {
  oceanLiving: 'photo-1778137736743-e649b1e954d3',
  sunBedroom: 'photo-1783990350684-71c38af04a8a',
  windowOcean: 'photo-1606135330566-90d791d50604',
  plantDetail: 'photo-1778764988229-8325d74dfbfe',
  woodLiving: 'photo-1772797583328-f83bc3f94f80',
  loftKitchen: 'photo-1783990349147-906f62b882c1',
  bigWindow: 'photo-1649429710616-dad56ce9a076',
  chairWindow: 'photo-1631510390389-c1e4fb20ff31',
  sofa: 'photo-1541194577687-8c63bf9e7ee3',
  olive: 'photo-1788823524741-fdb436ca937b',
  lamps: 'photo-1778880707611-d1f09e32b4e2',
  bedLinen: 'photo-1549638441-b787d2e11f14',
  pillows: 'photo-1576354302919-96748cb8299e',
  towels: 'photo-1790148574034-1d1756d1fcbf',
  foldedCloth: 'photo-1781695579237-c78e99e22fbb',
  phoneDoor: 'photo-1558002038-1055907df827',
  keyDoor: 'photo-1733244766159-f58f4184fd38',
  keys: 'photo-1643804926339-e94f0a655185',
  waves: 'photo-1706203644201-67b62fbd62c6',
  sunsetOcean: 'photo-1707349312470-bb47ecb72575',
  fortress: 'photo-1763838546113-81c013af03b4',
  coastFlowers: 'photo-1777806665249-d1a7d03fcff1',
  kitchenWood: 'photo-1622372738946-62e02505feb3',
  kitchenIsland: 'photo-1502005097973-6a7082348e28',
  whiteHouseSea: 'photo-1785804552865-291b58904ae9',
} as const;

export type ImgKey = keyof typeof IMG;

export const img = (key: ImgKey, w = 1200) =>
  `https://images.unsplash.com/${IMG[key]}?auto=format&fit=crop&w=${w}&q=72`;

export const srcset = (key: ImgKey) => [600, 1000, 1600].map((w) => `${img(key, w)} ${w}w`).join(', ');
