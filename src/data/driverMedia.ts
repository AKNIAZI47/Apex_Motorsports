import f1CarImg from '../assets/images/f1_race_car_1788850884206.jpg';
import motogpBikeImg from '../assets/images/motogp_race_bike_1788850931100.jpg';
import wecHypercarImg from '../assets/images/wec_hypercar_1788850954631.jpg';
import wsbkBikeImg from '../assets/images/wsbk_superbike_1788850993985.jpg';
import wrcCarImg from '../assets/images/wrc_rally_car_1788850973744.jpg';
import indyCarImg from '../assets/images/indycar_race_car_1788851016993.jpg';
import supercarsCarImg from '../assets/images/supercars_v8_car_1788851039075.jpg';
import dtmCarImg from '../assets/images/dtm_gt3_car_1788851060359.jpg';
import driftCarImg from '../assets/images/drift_car_smoke_1788850905989.jpg';
import { Driver, MotorsportCategory } from '../types';

export interface DriverMediaInfo {
  headshotUrl: string;
  rideImageUrl: string;
  rideModel: string;
  rideEngine: string;
  chassisCode?: string;
  transmission?: string;
  tyrePartner?: string;
}

const CATEGORY_DEFAULT_RIDES: Record<MotorsportCategory, { image: string; model: string; engine: string }> = {
  F1: {
    image: f1CarImg,
    model: 'Formula 1 FIA 2026 Turbo-Hybrid',
    engine: '1.6L V6 Turbo Hybrid + 350kW MGU-K (1,020 HP)',
  },
  MOTOGP: {
    image: motogpBikeImg,
    model: 'MotoGP 1000cc Factory Prototype',
    engine: '1000cc 90° V4 / Inline-4 Desmodromic (295+ BHP, 18,500 RPM)',
  },
  WSBK: {
    image: wsbkBikeImg,
    model: 'FIM Superbike Homologated Spec',
    engine: '999cc – 1103cc Inline-4 / 90° V4 (245+ BHP)',
  },
  WEC: {
    image: wecHypercarImg,
    model: 'FIA WEC Le Mans Hypercar (LMH / LMDh)',
    engine: 'Twin-Turbo V6 / V8 Hybrid + Front Axle 200kW MGU (680 HP capped)',
  },
  WRC: {
    image: wrcCarImg,
    model: 'FIA Rally1 AWD Hybrid Spaceframe',
    engine: '1.6L Direct Injection Turbo + 100kW Compact Battery (500+ BHP boost)',
  },
  INDYCAR: {
    image: indyCarImg,
    model: 'Dallara IR-18 Safety Aeroscreen IndyCar',
    engine: '2.2L Twin-Turbocharged V6 + EMPEL Supercapacitor Hybrid (750+ BHP)',
  },
  SUPERCARS: {
    image: supercarsCarImg,
    model: 'Gen3 Touring V8 Supercar',
    engine: '5.4L – 5.7L Naturally Aspirated Quad-Cam V8 (600+ BHP)',
  },
  DTM: {
    image: dtmCarImg,
    model: 'FIA GT3 Homologation Championship Racer',
    engine: '4.0L – 5.2L Twin-Turbo V8 / Naturally Aspirated V10 (550 – 600 BHP)',
  },
  DRIFT: {
    image: driftCarImg,
    model: 'Formula DRIFT Pro Spec Competition Build',
    engine: 'RTR Spec Twin-Turbo V8 / 2JZ-GTE / VR38DETT (1,000 – 1,200 BHP on Nitrous)',
  },
  GTWORLD: {
    image: dtmCarImg,
    model: 'FIA GT3 & GT4 Homologated Competition Machine',
    engine: '3.0L Twin-Turbo I6 / 4.2L Flat-6 / 6.2L V8 / 5.2L V10 (500 – 600 BHP)',
  },
};

// Curated headshots for key competitors
const DRIVER_HEADSHOTS: Record<string, string> = {
  // F1
  hamilton: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png',
  verstappen: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png',
  max_verstappen: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png',
  norris: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png',
  leclerc: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png',
  piastri: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png',
  russell: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png',
  antonelli: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KIMANT01_Kimi_Antonelli/kimant01.png.transform/2col/image.png',
  alonso: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png',
  sainz: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png',
  albon: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/2col/image.png',
  gasly: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col/image.png',
  tsunoda: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/2col/image.png',
  ocon: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col/image.png',
  hulkenberg: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col/image.png',
  lawson: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/2col/image.png',
  bearman: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/2col/image.png',
  bortoleto: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/2col/image.png',
  doohan: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png.transform/2col/image.png',
  hadjar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/2col/image.png',

  // MotoGP
  marquez: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Marc_M%C3%A1rquez_2019_MotoGP_Sepang.jpg/440px-Marc_M%C3%A1rquez_2019_MotoGP_Sepang.jpg',
  bagnaia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Francesco_Bagnaia_2019_MotoGP_Sepang.jpg/440px-Francesco_Bagnaia_2019_MotoGP_Sepang.jpg',
  martin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Jorge_Mart%C3%ADn_2019_MotoGP_Sepang.jpg/440px-Jorge_Mart%C3%ADn_2019_MotoGP_Sepang.jpg',
  acosta: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pedro_Acosta_2022_Moto2_Sepang.jpg/440px-Pedro_Acosta_2022_Moto2_Sepang.jpg',
  bastianini: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Enea_Bastianini_2019_MotoGP_Sepang.jpg/440px-Enea_Bastianini_2019_MotoGP_Sepang.jpg',
  binder: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Brad_Binder_2019_MotoGP_Sepang.jpg/440px-Brad_Binder_2019_MotoGP_Sepang.jpg',
  quartararo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Fabio_Quartararo_2019_MotoGP_Sepang.jpg/440px-Fabio_Quartararo_2019_MotoGP_Sepang.jpg',
  vinales: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Maverick_Vi%C3%B1ales_2019_MotoGP_Sepang.jpg/440px-Maverick_Vi%C3%B1ales_2019_MotoGP_Sepang.jpg',

  // WSBK
  razgatlioglu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Toprak_Razgatlioglu_2019_WorldSBK_Misano.jpg/440px-Toprak_Razgatlioglu_2019_WorldSBK_Misano.jpg',
  bulega: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Nicol%C3%B2_Bulega_2019_Moto2_Sepang.jpg/440px-Nicol%C3%B2_Bulega_2019_Moto2_Sepang.jpg',
  bautista: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/%C3%81lvaro_Bautista_2019_WorldSBK_Misano.jpg/440px-%C3%81lvaro_Bautista_2019_WorldSBK_Misano.jpg',

  // WEC
  estre: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/K%C3%A9vin_Estre_2019.jpg/440px-K%C3%A9vin_Estre_2019.jpg',
  fuoco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Antonio_Fuoco_2018_Formula_2.jpg/440px-Antonio_Fuoco_2018_Formula_2.jpg',
  hartley: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Brendon_Hartley_2018_Malaysia.jpg/440px-Brendon_Hartley_2018_Malaysia.jpg',
  kobayashi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Kamui_Kobayashi_2014_Malaysia.jpg/440px-Kamui_Kobayashi_2014_Malaysia.jpg',

  // WRC
  rovanpera: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Kalle_Rovanper%C3%A4_2020.jpg/440px-Kalle_Rovanper%C3%A4_2020.jpg',
  neuville: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Thierry_Neuville_2019.jpg/440px-Thierry_Neuville_2019.jpg',
  tanak: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Ott_T%C3%A4nak_2019.jpg/440px-Ott_T%C3%A4nak_2019.jpg',
  ogier: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/S%C3%A9bastien_Ogier_2019.jpg/440px-S%C3%A9bastien_Ogier_2019.jpg',

  // IndyCar
  palou: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Alex_Palou_2021_Portland.jpg/440px-Alex_Palou_2021_Portland.jpg',
  oward: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Pato_O%27Ward_2021_Portland.jpg/440px-Pato_O%27Ward_2021_Portland.jpg',
  dixon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Scott_Dixon_2021_Portland.jpg/440px-Scott_Dixon_2021_Portland.jpg',
  newgarden: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Josef_Newgarden_2021_Portland.jpg/440px-Josef_Newgarden_2021_Portland.jpg',

  // Supercars
  brown: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Will_Brown_2021_Sydney.jpg/440px-Will_Brown_2021_Sydney.jpg',
  mostert: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chaz_Mostert_2021_Sydney.jpg/440px-Chaz_Mostert_2021_Sydney.jpg',
  feeney: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Broc_Feeney_2021_Sydney.jpg/440px-Broc_Feeney_2021_Sydney.jpg',

  // DTM
  bortolotti: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Mirko_Bortolotti_2019_ADAC_GT_Masters.jpg/440px-Mirko_Bortolotti_2019_ADAC_GT_Masters.jpg',
  preining: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Thomas_Preining_2019_ADAC_GT_Masters.jpg/440px-Thomas_Preining_2019_ADAC_GT_Masters.jpg',

  // Drift
  deane: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/James_Deane_Formula_Drift.jpg/440px-James_Deane_Formula_Drift.jpg',
  aasbo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Fredric_Aasbo_Formula_Drift.jpg/440px-Fredric_Aasbo_Formula_Drift.jpg',

  // GT World Challenge
  vanthoor_d: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Dries_Vanthoor_2019.jpg/440px-Dries_Vanthoor_2019.jpg',
  vanthoor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Dries_Vanthoor_2019.jpg/440px-Dries_Vanthoor_2019.jpg',
  marciello_gt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raffaele_Marciello_2015_Malaysia.jpg/440px-Raffaele_Marciello_2015_Malaysia.jpg',
  marciello: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raffaele_Marciello_2015_Malaysia.jpg/440px-Raffaele_Marciello_2015_Malaysia.jpg',
  rossi_gt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Valentino_Rossi_2019_MotoGP_Sepang.jpg/440px-Valentino_Rossi_2019_MotoGP_Sepang.jpg',
  rossi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Valentino_Rossi_2019_MotoGP_Sepang.jpg/440px-Valentino_Rossi_2019_MotoGP_Sepang.jpg',
  fuoco_gt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Antonio_Fuoco_2018_Formula_2.jpg/440px-Antonio_Fuoco_2018_Formula_2.jpg',
  thiim_gt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Nicki_Thiim_2019.jpg/440px-Nicki_Thiim_2019.jpg',
  thiim: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Nicki_Thiim_2019.jpg/440px-Nicki_Thiim_2019.jpg',
};

/**
 * Returns complete visual & machinery media for a driver or rider
 */
export function getDriverMedia(driver: Driver, category: MotorsportCategory = 'F1'): DriverMediaInfo {
  const catDefaults = CATEGORY_DEFAULT_RIDES[category] || CATEGORY_DEFAULT_RIDES.F1;
  const key = driver.driverId.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const headshot = driver.headshotUrl || DRIVER_HEADSHOTS[key] || DRIVER_HEADSHOTS[driver.familyName.toLowerCase()] || '';

  return {
    headshotUrl: headshot,
    rideImageUrl: catDefaults.image,
    rideModel: driver.constructorName ? `${driver.constructorName} Competition Spec` : catDefaults.model,
    rideEngine: catDefaults.engine,
    tyrePartner: category === 'F1' ? 'Pirelli P Zero' : category === 'MOTOGP' ? 'Michelin MotoGP' : category === 'WEC' ? 'Michelin Pilot Sport' : category === 'INDYCAR' ? 'Firestone Firehawk' : category === 'GTWORLD' ? 'Pirelli P Zero DHF' : 'Championship Spec',
  };
}
