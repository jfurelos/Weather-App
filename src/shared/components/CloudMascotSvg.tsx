import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  G,
  Line,
  Circle,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';

export type MascotWeatherState =
  | 'soleado'
  | 'lluvioso'
  | 'frio'
  | 'ventoso'
  | 'caluroso'
  | 'tormenta'
  | 'nevado'
  | 'nublado';

export interface MascotMeta {
  state: MascotWeatherState;
  emoji: string;
  label: string;
  quote: string;
}

export const MASCOT_STATE_META: Record<MascotWeatherState, MascotMeta> = {
  soleado: {
    state: 'soleado',
    emoji: '☀️',
    label: 'Soleado',
    quote: '«¡Día perfecto para gafas de sol y paseo al aire libre!»',
  },
  lluvioso: {
    state: 'lluvioso',
    emoji: '☂️',
    label: 'Lluvioso',
    quote: '«Con mi paraguas ciruela ni una gota me quita la sonrisa.»',
  },
  frio: {
    state: 'frio',
    emoji: '🧣',
    label: 'Frío',
    quote: '«¡Brrr! Gorro de lana, bufanda y manoplas bien puestas.»',
  },
  ventoso: {
    state: 'ventoso',
    emoji: '🍃',
    label: 'Ventoso',
    quote: '«¡Sujetando firme el paraguas contra las ráfagas de viento!»',
  },
  caluroso: {
    state: 'caluroso',
    emoji: '🍦',
    label: 'Caluroso',
    quote: '«Abanico en mano y un helado fresco para llevar bien el calor.»',
  },
  tormenta: {
    state: 'tormenta',
    emoji: '⛈️',
    label: 'Tormenta',
    quote: '«¡Nube cargada y relámpagos dorados! Mejor resguardarse.»',
  },
  nevado: {
    state: 'nevado',
    emoji: '❄️',
    label: 'Nevado',
    quote: '«Atrapando copos de nieve con mis manoplas calentitas.»',
  },
  nublado: {
    state: 'nublado',
    emoji: '☁️',
    label: 'Nublado',
    quote: '«Rodeado de mis amigas nubes pensando qué plan hacer hoy.»',
  },
};

export function resolveMascotWeatherState(params: {
  weatherCode: number;
  temperature: number;
  windSpeed: number;
  precipitation?: number;
}): MascotWeatherState {
  const { weatherCode, temperature, windSpeed, precipitation = 0 } = params;

  if (weatherCode >= 95) return 'tormenta';
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return 'nevado';
  }
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    precipitation >= 2
  ) {
    return 'lluvioso';
  }
  if (windSpeed >= 38) return 'ventoso';
  if (temperature <= 7) return 'frio';
  if (temperature >= 30) return 'caluroso';
  if (weatherCode >= 2 && weatherCode <= 48) return 'nublado';
  return 'soleado';
}

interface CloudMascotSvgProps {
  state: MascotWeatherState;
  size?: number;
}

export const CloudMascotSvg: React.FC<CloudMascotSvgProps> = ({ state, size = 128 }) => {
  const isStorm = state === 'tormenta';
  const isWinter = state === 'frio' || state === 'nevado';
  const hasUmbrella = state === 'lluvioso' || state === 'ventoso' || state === 'tormenta';
  const isHot = state === 'caluroso';
  const isRain = state === 'lluvioso' || state === 'tormenta';
  const isSnow = state === 'frio' || state === 'nevado';
  const isWind = state === 'ventoso';
  const isCloudy = state === 'nublado';
  const isSunny = state === 'soleado';
  const isGrumpy = state === 'tormenta' || state === 'ventoso';
  const isHappy = !isGrumpy && state !== 'frio' && !isHot;

  const height = Math.round((size * 270) / 260);

  return (
    <Svg width={size} height={height} viewBox="0 0 260 270" accessibilityLabel="Mascota Nube del Clima">
      <Defs>
        <LinearGradient id="cloudBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#D7E7F5" />
          <Stop offset="70%" stopColor="#C4D9EC" />
          <Stop offset="100%" stopColor="#A8C4DF" />
        </LinearGradient>
        <LinearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#9BA8B7" />
          <Stop offset="100%" stopColor="#768494" />
        </LinearGradient>
      </Defs>

      {/* Sombra suave en el suelo */}
      <Ellipse cx="122" cy="252" rx="46" ry="7" fill="#D5CCB8" opacity="0.65" />

      {/* CAPA DE FONDO POR CLIMA */}
      {isSunny && (
        <G>
          <G stroke="#E5A93B" strokeWidth={3} strokeLinecap="round">
            <Line x1="215" y1="18" x2="215" y2="27" />
            <Line x1="215" y1="81" x2="215" y2="90" />
            <Line x1="179" y1="54" x2="188" y2="54" />
            <Line x1="242" y1="54" x2="251" y2="54" />
            <Line x1="190" y1="29" x2="196" y2="35" />
            <Line x1="234" y1="73" x2="240" y2="79" />
            <Line x1="240" y1="29" x2="234" y2="35" />
            <Line x1="196" y1="73" x2="190" y2="79" />
          </G>
          <Circle cx="215" cy="54" r="21" fill="#FAD165" stroke="#D99B26" strokeWidth={2.2} />
        </G>
      )}

      {isHot && (
        <G>
          <Circle cx="205" cy="58" r="32" fill="#FAD165" opacity="0.28" />
          <Circle cx="205" cy="58" r="22" fill="#FAD165" opacity="0.55" />
          <Circle cx="205" cy="58" r="14" fill="#F5B942" />
        </G>
      )}

      {isCloudy && (
        <G>
          <Path
            d="M 32,96 C 22,96 16,89 18,80 C 17,69 27,62 37,65 C 43,55 58,54 66,62 C 75,60 84,67 83,76 C 90,79 90,90 82,95 Z"
            fill="#D0D6DD"
            stroke="#28323E"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path
            d="M 162,115 C 153,115 147,108 149,99 C 149,89 158,83 168,85 C 174,76 188,75 195,83 C 204,81 212,88 211,96 C 218,99 218,109 210,114 Z"
            fill="#D0D6DD"
            stroke="#28323E"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </G>
      )}

      {isStorm && (
        <G>
          <Path
            d="M 34,76 C 23,76 17,68 20,58 C 19,46 30,39 41,42 C 48,31 64,30 73,39 C 83,37 92,45 91,55 C 99,58 99,70 90,75 Z"
            fill="#7D8B99"
            stroke="#28323E"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          <Polygon
            points="74,76 62,102 74,102 66,128 92,96 79,96 87,76"
            fill="#FAD165"
            stroke="#28323E"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </G>
      )}

      {/* CUERPO Y EXTREMIDADES */}
      <G>
        {/* Piernas */}
        <Rect x="103" y="206" width="9" height="34" rx="4.5" fill="#C4D9EC" stroke="#28323E" strokeWidth={2.3} />
        <Rect x="132" y="206" width="9" height="34" rx="4.5" fill="#C4D9EC" stroke="#28323E" strokeWidth={2.3} />

        {/* Calzado */}
        {!isWinter ? (
          <G>
            <Ellipse cx="104" cy="244" rx="14" ry="5.5" fill="#C4D9EC" stroke="#28323E" strokeWidth={2.3} />
            <Path d="M 97,243 Q 104,237 112,243" fill="none" stroke="#28323E" strokeWidth={2.2} strokeLinecap="round" />
            <Ellipse cx="140" cy="244" rx="14" ry="5.5" fill="#C4D9EC" stroke="#28323E" strokeWidth={2.3} />
            <Path d="M 132,243 Q 140,237 147,243" fill="none" stroke="#28323E" strokeWidth={2.2} strokeLinecap="round" />
          </G>
        ) : (
          <G>
            <Path
              d="M 94,226 L 113,226 L 113,246 L 90,246 C 90,239 94,237 94,234 Z"
              fill="#9E8872"
              stroke="#28323E"
              strokeWidth={2.3}
              strokeLinejoin="round"
            />
            <Path
              d="M 131,226 L 150,226 L 150,234 C 150,237 154,239 154,246 L 131,246 Z"
              fill="#9E8872"
              stroke="#28323E"
              strokeWidth={2.3}
              strokeLinejoin="round"
            />
          </G>
        )}

        {/* Pantalón corto estampado (sin rojo intenso: arena/melocotón suave + turquesa + dorado) */}
        <G>
          <Path
            d="M 96,177 L 148,177 L 152,211 L 125,211 L 122,199 L 119,211 L 92,211 Z"
            fill="#E8B89A"
            stroke="#28323E"
            strokeWidth={2.3}
            strokeLinejoin="round"
          />
          <Path d="M 96,184 Q 108,182 106,195 Q 96,197 95,190 Z" fill="#67B7B5" />
          <Path d="M 135,183 Q 147,183 148,194 Q 137,196 135,189 Z" fill="#FAD165" />
          <Circle cx="113" cy="202" r="5" fill="#FAD165" />
          <Circle cx="135" cy="203" r="4.5" fill="#67B7B5" />
          <Line x1="96" y1="181" x2="148" y2="181" stroke="#28323E" strokeWidth={1.6} />
        </G>

        {/* Camiseta color arena */}
        <Path
          d="M 101,134 L 108,134 C 112,143 132,143 136,134 L 143,134 L 147,178 L 97,178 Z"
          fill="#EADEC9"
          stroke="#28323E"
          strokeWidth={2.3}
          strokeLinejoin="round"
        />

        {/* Brazos según estado */}
        {!hasUmbrella && !isWinter && !isHot && (
          <G>
            <Path d="M 100,141 C 82,146 80,162 96,169" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 100,141 C 82,146 80,162 96,169" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
            <Path d="M 144,141 C 162,146 164,162 148,169" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 144,141 C 162,146 164,162 148,169" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
          </G>
        )}

        {hasUmbrella && (
          <G>
            <Path d="M 100,142 C 88,158 88,176 93,190" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 100,142 C 88,158 88,176 93,190" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
            <Path d="M 144,142 C 155,152 152,164 139,165" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 144,142 C 155,152 152,164 139,165" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
          </G>
        )}

        {isWinter && (
          <G>
            <Path d="M 100,144 C 90,155 96,165 113,164" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 100,144 C 90,155 96,165 113,164" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
            <Path d="M 144,144 C 154,155 148,165 131,164" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 144,144 C 154,155 148,165 131,164" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
            <Circle cx="114" cy="164" r="7.5" fill="#598791" stroke="#28323E" strokeWidth={2.2} />
            <Circle cx="130" cy="164" r="7.5" fill="#598791" stroke="#28323E" strokeWidth={2.2} />
          </G>
        )}

        {isHot && (
          <G>
            <Path d="M 100,142 C 84,148 79,138 83,128" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 100,142 C 84,148 79,138 83,128" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
            <Path d="M 144,142 C 158,148 164,139 162,129" fill="none" stroke="#28323E" strokeWidth={8} strokeLinecap="round" />
            <Path d="M 144,142 C 158,148 164,139 162,129" fill="none" stroke="#C4D9EC" strokeWidth={4.2} strokeLinecap="round" />
            <Path d="M 83,128 L 62,110 Q 76,97 93,107 Z" fill="#EADEC9" stroke="#28323E" strokeWidth={2} strokeLinejoin="round" />
            <Line x1="83" y1="128" x2="71" y2="104" stroke="#28323E" strokeWidth={1.3} />
            <Line x1="83" y1="128" x2="82" y2="102" stroke="#28323E" strokeWidth={1.3} />
            <Polygon points="157,124 167,124 162,141" fill="#D4A773" stroke="#28323E" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx="162" cy="119" r="7" fill="#FAD165" stroke="#28323E" strokeWidth={1.8} />
          </G>
        )}

        {/* Bufanda invierno */}
        {isWinter && (
          <G>
            <Rect x="97" y="131" width="50" height="13" rx="6.5" fill="#DFCCA8" stroke="#28323E" strokeWidth={2.2} />
            <Path d="M 126,143 L 136,143 L 139,166 L 128,166 Z" fill="#DFCCA8" stroke="#28323E" strokeWidth={2.2} strokeLinejoin="round" />
          </G>
        )}

        {/* Cabeza en forma de nube */}
        <Path
          d="M 76,133 C 58,133 48,119 52,104 C 52,88 66,77 81,81 C 88,62 114,57 129,71 C 143,66 159,75 161,89 C 175,91 183,105 178,119 C 174,129 164,133 153,133 Z"
          fill={isStorm ? 'url(#stormCloudGrad)' : 'url(#cloudBodyGrad)'}
          stroke="#28323E"
          strokeWidth={2.6}
          strokeLinejoin="round"
        />

        {/* Gorro de lana */}
        {isWinter && (
          <G>
            <Circle cx="116" cy="39" r="8" fill="#DFCCA8" stroke="#28323E" strokeWidth={2.2} />
            <Path d="M 88,69 C 89,45 143,45 144,69 Z" fill="#DFCCA8" stroke="#28323E" strokeWidth={2.3} strokeLinejoin="round" />
            <Rect x="85" y="65" width="62" height="12" rx="6" fill="#EADEC9" stroke="#28323E" strokeWidth={2.3} />
          </G>
        )}

        {/* EXPRESIONES FACIALES */}
        {isHappy && (
          <G>
            <Circle cx="104" cy="102" r="3.2" fill="#28323E" />
            <Circle cx="132" cy="102" r="3.2" fill="#28323E" />
            <Path d="M 100,94 Q 104,91 108,94" fill="none" stroke="#28323E" strokeWidth={2} strokeLinecap="round" />
            <Path d="M 128,94 Q 132,91 136,94" fill="none" stroke="#28323E" strokeWidth={2} strokeLinecap="round" />
            <Ellipse cx="95" cy="110" rx="5" ry="2.8" fill="#E8B89A" opacity="0.65" />
            <Ellipse cx="141" cy="110" rx="5" ry="2.8" fill="#E8B89A" opacity="0.65" />
            <Path d="M 112,111 Q 118,117 124,111" fill="none" stroke="#28323E" strokeWidth={2.3} strokeLinecap="round" />
          </G>
        )}

        {isSunny && (
          <G>
            <Path
              d="M 89,95 L 147,95 L 144,108 C 142,114 128,114 125,107 L 122,100 L 114,100 L 111,107 C 108,114 94,114 92,108 Z"
              fill="#28323E"
              stroke="#28323E"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Line x1="95" y1="98" x2="103" y2="106" stroke="#7EA7CC" strokeWidth={2} strokeLinecap="round" />
            <Line x1="128" y1="98" x2="136" y2="106" stroke="#7EA7CC" strokeWidth={2} strokeLinecap="round" />
          </G>
        )}

        {state === 'frio' && (
          <G>
            <Circle cx="104" cy="102" r="3.2" fill="#28323E" />
            <Circle cx="132" cy="102" r="3.2" fill="#28323E" />
            <Path d="M 99,95 L 108,92" stroke="#28323E" strokeWidth={2} strokeLinecap="round" />
            <Path d="M 137,95 L 128,92" stroke="#28323E" strokeWidth={2} strokeLinecap="round" />
            <Path
              d="M 108,114 Q 112,111 115,114 Q 118,117 121,114 Q 124,111 128,114"
              fill="none"
              stroke="#28323E"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </G>
        )}

        {isGrumpy && (
          <G>
            <Circle cx="104" cy="104" r="3.2" fill="#28323E" />
            <Circle cx="132" cy="104" r="3.2" fill="#28323E" />
            <Path d="M 98,94 L 109,99" stroke="#28323E" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M 138,94 L 127,99" stroke="#28323E" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M 111,117 Q 118,111 125,117" fill="none" stroke="#28323E" strokeWidth={2.3} strokeLinecap="round" />
          </G>
        )}

        {isHot && (
          <G>
            <Path d="M 99,102 Q 104,106 109,102" fill="none" stroke="#28323E" strokeWidth={2.3} strokeLinecap="round" />
            <Path d="M 127,102 Q 132,106 137,102" fill="none" stroke="#28323E" strokeWidth={2.3} strokeLinecap="round" />
            <Ellipse cx="118" cy="114" rx="5" ry="4" fill="#E8B89A" stroke="#28323E" strokeWidth={2} />
          </G>
        )}

        {/* Paraguas Ciruela (#58333E) */}
        {hasUmbrella && (
          <G>
            <Path d="M 157,48 L 136,168 C 134,176 125,175 126,167" fill="none" stroke="#28323E" strokeWidth={3.2} strokeLinecap="round" />
            <Path
              d="M 88,52 C 110,18 188,22 224,68 C 204,61 187,64 176,71 C 162,60 144,58 130,65 C 115,54 100,50 88,52 Z"
              fill="#58333E"
              stroke="#28323E"
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <Path d="M 164,28 C 152,39 144,51 138,63" fill="none" stroke="#28323E" strokeWidth={1.8} />
            <Path d="M 164,28 C 174,41 180,55 182,68" fill="none" stroke="#28323E" strokeWidth={1.8} />
            <Line x1="164" y1="28" x2="166" y2="20" stroke="#28323E" strokeWidth={2.6} strokeLinecap="round" />
          </G>
        )}

        {/* Nube delantera en modo Nublado */}
        {isCloudy && (
          <Path
            d="M 134,148 C 122,148 115,139 118,129 C 117,117 128,109 140,112 C 147,101 164,100 173,109 C 183,107 193,115 191,126 C 200,130 200,142 190,147 Z"
            fill="#FFFFFF"
            stroke="#28323E"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        )}
      </G>

      {/* PARTÍCULAS ATMOSFÉRICAS */}
      {isRain && (
        <G stroke="#5A9BD5" strokeWidth={2.2} strokeLinecap="round">
          <Line x1="56" y1="74" x2="50" y2="88" />
          <Line x1="42" y1="125" x2="36" y2="139" />
          <Line x1="65" y1="165" x2="59" y2="179" />
          <Line x1="212" y1="96" x2="206" y2="110" />
          <Line x1="226" y1="145" x2="220" y2="159" />
          <Line x1="196" y1="184" x2="190" y2="198" />
        </G>
      )}

      {isSnow && (
        <G stroke="#6BA4D4" strokeWidth={2} strokeLinecap="round">
          <G transform="translate(54,84)">
            <Line x1="-7" y1="0" x2="7" y2="0" />
            <Line x1="0" y1="-7" x2="0" y2="7" />
            <Line x1="-5" y1="-5" x2="5" y2="5" />
            <Line x1="5" y1="-5" x2="-5" y2="5" />
          </G>
          <G transform="translate(192,98)">
            <Line x1="-8" y1="0" x2="8" y2="0" />
            <Line x1="0" y1="-8" x2="0" y2="8" />
            <Line x1="-5" y1="-5" x2="5" y2="5" />
            <Line x1="5" y1="-5" x2="-5" y2="5" />
          </G>
          <Circle cx="48" cy="148" r="3" fill="#B6D7F2" stroke="none" />
          <Circle cx="204" cy="158" r="3.5" fill="#B6D7F2" stroke="none" />
          <Circle cx="72" cy="196" r="2.5" fill="#B6D7F2" stroke="none" />
        </G>
      )}

      {isWind && (
        <G>
          <Path d="M 22,72 Q 52,72 62,56 C 67,48 56,42 51,49" fill="none" stroke="#6BA4D4" strokeWidth={2.3} strokeLinecap="round" />
          <Path d="M 185,176 Q 218,176 230,160 C 235,152 224,146 219,153" fill="none" stroke="#6BA4D4" strokeWidth={2.3} strokeLinecap="round" />
          <Path d="M 46,154 Q 58,146 66,154 Q 58,162 46,154 Z" fill="#7C9A5E" stroke="#28323E" strokeWidth={1.6} />
          <Path d="M 192,132 Q 204,124 212,132 Q 204,140 192,132 Z" fill="#7C9A5E" stroke="#28323E" strokeWidth={1.6} />
        </G>
      )}
    </Svg>
  );
};
