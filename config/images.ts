/**
 * Bütün demo şəkilləri bu faylda saxlanılır.
 * Real şəkillərə keçəndə yalnız buradakı URL-ləri dəyişmək (və ya `/public` yoluna yönəltmək) kifayətdir —
 * məlumat faylları şəkilləri açar adı ilə (məs. `"poolResort"`) istinad edir.
 *
 * Qeyd: hazırda konkret məhsul şəkilləri (dərman qabları, filtrlər, robotlar) yoxdur,
 * mövzuya yaxın atmosfer şəkilləri istifadə olunur. Real kataloqda əvəz edilməlidir.
 */

// Mənbə ölçüsü məhdudlaşdırılır: orijinal fayllar 5+ MB-dır və next/image optimizatoru onları yükləyərkən vaxtı bitir
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

export const images = {
  // Hovuz və villa
  heroPoolGarden: unsplash("1576013551627-0cc20b96c2a7"),
  poolResort: unsplash("1572331165267-854da2b10ccc"),
  poolModern: unsplash("1613490493576-7fde63acd811"),
  poolHouse: unsplash("1582268611958-ebfd161ef9cf"),
  poolInfinity: unsplash("1575429198097-0414ec08e8cd"),
  poolWater: unsplash("1530053969600-caed2596d242"),
  poolVilla: unsplash("1600596542815-ffad4c1539a9"),
  poolWhiteHouse: unsplash("1564013799919-ab600027ffc6"),
  palmResort: unsplash("1563911302283-d2bc129e7570"),

  // Bağ və həyət
  houseGarden: unsplash("1600585154340-be6161a56a0c"),
  houseLawn: unsplash("1558036117-15d82a90b9b1"),
  lawn: unsplash("1558904541-efa843a96f01"),
  gardenPath: unsplash("1585320806297-9794b3e4eeae"),
  lushGarden: unsplash("1598902108854-10e335adac99"),
  gardenBed: unsplash("1591857177580-dc82b9ac4e1e"),
  fields: unsplash("1563514227147-6d2ff665a6a0"),

  // Bitkilər
  bonsaiBougainvillea: unsplash("1599598425947-5202edd56bdb"),
  topiary: unsplash("1520412099551-62b6bafeb5bb"),
  plantsShelf: unsplash("1592150621744-aca64f48394a"),
  houseplants: unsplash("1604762524889-3e2fcc145683"),
  plantSprout: unsplash("1501004318641-b39e6451bec6"),
  succulent: unsplash("1485955900006-10f4d324d411"),
  orangeTree: unsplash("1536657464919-892534f60d6e"),
  pruning: unsplash("1617576683096-00fc8eecb3af"),

  // Torpaq, ting, əkin
  soilScoop: unsplash("1416879595882-3373a0480b5b"),
  soilHands: unsplash("1590682680695-43b964a3ae17"),
  seedlingTray: unsplash("1466692476868-aef1dfb1e735"),
  seedlingPots: unsplash("1523348837708-15d4a09cfac2"),
  seedlingSoil: unsplash("1625246333195-78d9c38ad449"),
  seedlingHand: unsplash("1615671524827-c1fe3973b648"),
  planting: unsplash("1530836369250-ef72a3f5cda8"),
  plantingHands: unsplash("1622383563227-04401ab4e5ea"),
  farmerPlanting: unsplash("1589923188900-85dae523342b"),

  // Su və quraşdırma
  technician: unsplash("1621905252507-b35492cc74b4"),
  technicianTools: unsplash("1621905251189-08b45d6a269e"),
  bathroom: unsplash("1584622650111-993a426fbf0a"),

  // Müştəri avatarları (rəylər, hero)
  avatar1: unsplash("1494790108377-be9c29b29330"),
  avatar2: unsplash("1507003211169-0a1dd7228f2d"),
  avatar3: unsplash("1438761681033-6461ffad8d80"),
  avatar4: unsplash("1500648767791-00dcc994a43e"),
} as const;

export type ImageKey = keyof typeof images;

export function img(key: ImageKey): string {
  return images[key];
}
