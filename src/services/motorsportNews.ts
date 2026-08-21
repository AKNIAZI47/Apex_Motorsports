import { NewsArticle, MotorsportCategory } from '../types';

export const MotorsportNewsService = {
  async fetchLatestNews(discipline?: MotorsportCategory | 'ALL'): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [
      // 1. WEC & 24H ENDURANCE
      {
        id: 'wec-1',
        title: '24 Hours of Le Mans: Ferrari 499P Defends Hypercar Crown in Rain-Soaked Midnight Stint',
        summary: 'AF Corse Ferrari triumphed at Circuit de la Sarthe following an epic tactical duel against the Porsche 963 and Toyota GR010, executing sub-second pit stops during safety car rain transitions.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        source: 'WEC Official / Le Mans',
        url: 'https://www.fiawec.com',
        category: 'ENDURANCE',
        discipline: 'WEC',
        imageUrl: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'wec-2',
        title: 'Nürburgring 24 Hours: Manthey EMA "Grello" Porsche 911 GT3 R Dominates the Green Hell',
        summary: 'Battling thick Eifel fog and torrential sudden downpours across the 25.3km Nordschleife, the Manthey EMA crew navigated 170 corners to claim a historic victory.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
        source: '24h Nürburgring Wire',
        url: 'https://www.24h-rennen.de',
        category: 'ENDURANCE',
        discipline: 'WEC',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      },

      // 2. FORMULA DRIFT
      {
        id: 'drift-1',
        title: 'Formula DRIFT Irwindale: James Deane Clinches Record 4th Championship with 75° High-Wall Slide',
        summary: 'In front of a sold-out House of Drift crowd, James Deane wheeled his 1,115-hp Ford Mustang RTR to victory, locking in a flawless 98-point qualifying lead run with tire smoke completely enveloping the grandstands.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        source: 'Formula DRIFT Official',
        url: 'https://www.formulad.com',
        category: 'DRIFT',
        discipline: 'DRIFT',
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'drift-2',
        title: 'Drift Telemetry Analysis: How Steering Angle Knuckles & Dual-Caliper Handbrakes Create 100mph Entries',
        summary: 'An engineering breakdown of 72-degree steering lock geometry, quick-change rear diff ratios, and anti-lag turbo setups generating instant torque for aggressive chase transitions.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
        source: 'Apex Drift Tech',
        url: 'https://www.formulad.com/news',
        category: 'TECH',
        discipline: 'DRIFT',
        imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
      },

      // 3. WRC RALLY
      {
        id: 'wrc-1',
        title: 'Rally Finland: Kalle Rovanperä Sends GR Yaris Airborne Over Legendary Ouninpohja Crests at 200 km/h',
        summary: 'Toyota Gazoo Racing dominated the fastest rally in the world, averaging over 126 km/h through gravel forest roads with massive 50-meter jumps and millimetric pacenote precision.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        source: 'WRC.com',
        url: 'https://www.wrc.com',
        category: 'RALLY',
        discipline: 'WRC',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'wrc-2',
        title: 'FIA Ratifies 2026 WRC Technical Overhaul: Spaceframe Chassis & 100% Sustainable Bio-Fuels',
        summary: 'The World Motor Sport Council confirmed simplified aerodynamic wings and cost-capped mechanical drivetrains designed to attract new automotive factory manufacturers.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
        source: 'DirtFish Rally',
        url: 'https://dirtfish.com',
        category: 'TECH',
        discipline: 'WRC',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      },

      // 4. MOTOGP & WSBK
      {
        id: 'motogp-1',
        title: 'MotoGP Mugello: Jorge Martín Sets 366.1 km/h Speed Record Down San Donato Crest',
        summary: 'Ducati Desmosedici GP24 showcased blistering straight-line telemetry and 65-degree cornering angles to hold off Francesco Bagnaia and Marc Márquez in a photo-finish thriller.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
        source: 'MotoGP.com',
        url: 'https://www.motogp.com',
        category: 'BIKES',
        discipline: 'MOTOGP',
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'wsbk-1',
        title: 'WorldSBK: Toprak Razgatlıoğlu Delivers Record 13-Race Win Streak on BMW M1000RR',
        summary: 'The Turkish superstar redefined late-braking physics with trademark nose-wheelie stoppie entries into Turn 1, securing BMW Motorrad historic manufacturer leadership.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        source: 'WorldSBK.com',
        url: 'https://www.worldsbk.com',
        category: 'BIKES',
        discipline: 'WSBK',
        imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      },

      // 5. DTM & GT3
      {
        id: 'dtm-1',
        title: 'DTM Norisring: Mirko Bortolotti Takes Bumper-to-Bumper GT3 Street Victory for Lamborghini',
        summary: 'Navigating the brutal concrete barriers of Nuremberg Grundig Hairpin, SSR Performance claimed victory after a double-file safety car restart battle with Schubert BMW.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
        source: 'DTM Motorsport',
        url: 'https://www.dtm.com',
        category: 'RACE',
        discipline: 'DTM',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      },

      // 6. FORMULA 1
      {
        id: 'f1-1',
        title: 'FIA Confirms 2026 Engine Overhaul: 350kW MGU-K Power & Active Aerodynamic Dual Modes',
        summary: 'Formula 1 prepares for its biggest powertrain transition in a decade, tripling electrical battery output while eliminating MGU-H and implementing straight-line low drag modes.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        source: 'Formula1.com',
        url: 'https://www.formula1.com',
        category: 'TECH',
        discipline: 'F1',
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      },

      // 7. SUPERCARS & INDYCAR
      {
        id: 'supercars-1',
        title: 'Bathurst 1000: Triple Eight Camaro Conquers Mount Panorama in 161-Lap Thriller',
        summary: 'Will Brown and Scott Pye conquered the Mountain, surviving the high-speed Skyline and 300 km/h Conrod Straight to take the Great Race Peter Brock Trophy.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 280).toISOString(),
        source: 'Supercars.com',
        url: 'https://www.supercars.com',
        category: 'RACE',
        discipline: 'SUPERCARS',
        imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'indy-1',
        title: 'IndyCar: Alex Palou Clinches Championship as Hybrid 2.2L Twin-Turbo Era Takes Flight',
        summary: 'Chip Ganassi Racing executed a masterclass strategy, balancing supercapacitor energy discharge and tire compound wear across superspeedways and road courses.',
        publishedAt: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
        source: 'IndyCar.com',
        url: 'https://www.indycar.com',
        category: 'RACE',
        discipline: 'INDYCAR',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      },
    ];

    if (!discipline || discipline === 'ALL') {
      return allArticles;
    }

    return allArticles.filter((a) => a.discipline === discipline);
  },
};
