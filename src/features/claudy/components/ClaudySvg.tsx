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
import {
  ClaudyConfig,
  ClaudyWeatherMode,
  DEFAULT_CLAUDY_CONFIG,
  getDetailTonePalette,
} from '../types';

export interface ClaudySvgProps {
  weatherMode?: ClaudyWeatherMode;
  config?: Partial<ClaudyConfig>;
  size?: number;
  /** Fuerza mostrar el paraguas durante la vista previa al editarlo en el personalizador */
  forceShowUmbrella?: boolean;
}

const INK = '#335C67';
const BURGUNDY = '#9E2A2B';
const BURGUNDY_DEEP = '#540B0E';
const HONEY = '#E09F3E';
const VANILLA = '#FFF3B0';
const OFF_WHITE = '#FAF6E8';

export const ClaudySvg: React.FC<ClaudySvgProps> = ({
  weatherMode = 'sunny',
  config,
  size = 148,
  forceShowUmbrella = false,
}) => {
  const merged: ClaudyConfig = { ...DEFAULT_CLAUDY_CONFIG, ...config };
  const tonePalette = getDetailTonePalette(merged.detailTone);

  const isRain = weatherMode === 'rainy' || weatherMode === 'storm';
  const isStorm = weatherMode === 'storm';
  const isSunny = weatherMode === 'sunny' || weatherMode === 'hot';
  const isHot = weatherMode === 'hot';
  const isCold = weatherMode === 'cold' || weatherMode === 'snowy';
  const isWind = weatherMode === 'windy';
  const isSnow = weatherMode === 'snowy';
  const isCloudy = weatherMode === 'cloudy';

  // Resolución combinada: clima real automático + preferencias elegidas por el usuario
  const showUmbrella = isRain || forceShowUmbrella;
  const resolvedUmbrella =
    merged.umbrellaStyle === 'auto' ? 'classic_burgundy' : merged.umbrellaStyle;

  const resolvedGlasses =
    merged.glassesStyle === 'auto'
      ? isSunny
        ? 'round_honey'
        : 'none'
      : merged.glassesStyle;

  const resolvedHeadwear =
    merged.headwearStyle === 'auto'
      ? isCold
        ? 'beanie'
        : isHot
          ? 'sunhat'
          : 'none'
      : merged.headwearStyle;

  const resolvedScarf =
    merged.scarfStyle === 'auto'
      ? isCold || isWind
        ? 'knit_honey'
        : 'none'
      : merged.scarfStyle;

  const showRaincoat = isRain;
  const showWinterCoat = !isRain && (isCold || isWind);

  const height = Math.round((size * 260) / 260);
  const gradId = `claudyBody-${weatherMode}-${merged.detailTone}`;

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 260 260"
      accessibilityLabel={`${merged.name}, tu nube del clima`}
    >
      <Defs>
        <LinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={isStorm ? '#E6ECEE' : '#FFFFFF'} />
          <Stop offset="68%" stopColor={isStorm ? '#D5E0E4' : OFF_WHITE} />
          <Stop offset="100%" stopColor={isStorm ? '#BDD0D6' : '#F2EBD5'} />
        </LinearGradient>
      </Defs>

      {/* CAPA 1: AURA SUTIL Y FONDO CLIMÁTICO */}
      <Circle cx="130" cy="134" r="92" fill={tonePalette.softHex} />
      <Ellipse cx="128" cy="236" rx="54" ry="8" fill={INK} opacity="0.15" />

      {/* Sol / Calor con acentos en miel #E09F3E */}
      {isSunny && (
        <G>
          {isHot && <Circle cx="206" cy="52" r="34" fill={VANILLA} opacity="0.55" />}
          <G stroke={HONEY} strokeWidth={3} strokeLinecap="round">
            <Line x1="206" y1="16" x2="206" y2="25" />
            <Line x1="206" y1="79" x2="206" y2="88" />
            <Line x1="170" y1="52" x2="179" y2="52" />
            <Line x1="233" y1="52" x2="242" y2="52" />
            <Line x1="181" y1="27" x2="187" y2="33" />
            <Line x1="225" y1="71" x2="231" y2="77" />
            <Line x1="231" y1="27" x2="225" y2="33" />
            <Line x1="187" y1="71" x2="181" y2="77" />
          </G>
          <Circle cx="206" cy="52" r="20" fill={VANILLA} stroke={HONEY} strokeWidth={3} />
          <Circle cx="206" cy="52" r="12" fill={HONEY} />
        </G>
      )}

      {/* Nubes suaves de acompañamiento en nublado */}
      {isCloudy && (
        <G>
          <Path
            d="M 28,88 C 19,88 14,81 16,73 C 16,64 25,58 34,60 C 40,51 54,50 61,58 C 70,56 78,63 76,71 C 83,74 83,84 75,88 Z"
            fill={OFF_WHITE}
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path
            d="M 184,74 C 176,74 172,68 174,61 C 174,53 182,48 190,50 C 195,43 207,42 213,49 C 221,47 228,53 226,60 C 232,63 232,71 225,74 Z"
            fill={VANILLA}
            stroke={INK}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </G>
      )}

      {/* Tormenta: rayo miel y nube de tormenta */}
      {isStorm && (
        <G>
          <Path
            d="M 26,76 C 17,76 12,69 15,61 C 15,51 24,45 34,48 C 40,39 54,38 62,46 C 71,44 79,51 77,60 C 84,63 84,72 76,76 Z"
            fill={INK}
            stroke={BURGUNDY_DEEP}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Polygon
            points="58,76 47,100 58,100 50,124 74,94 62,94 69,76"
            fill={HONEY}
            stroke={BURGUNDY_DEEP}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </G>
      )}

      {/* Viento: ráfagas editoriales */}
      {isWind && (
        <G>
          <Path
            d="M 18,74 Q 48,74 58,58 C 63,50 52,44 47,51"
            fill="none"
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Path
            d="M 192,164 Q 222,164 234,148 C 239,140 228,134 223,141"
            fill="none"
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Path
            d="M 28,146 Q 40,138 48,146 Q 40,154 28,146 Z"
            fill={HONEY}
            stroke={INK}
            strokeWidth={1.6}
          />
          <Path
            d="M 206,86 Q 218,78 226,86 Q 218,94 206,86 Z"
            fill={BURGUNDY}
            stroke={INK}
            strokeWidth={1.6}
          />
        </G>
      )}

      {/* Nieve: copos geométricos */}
      {isSnow && (
        <G stroke={INK} strokeWidth={2} strokeLinecap="round">
          <G transform="translate(46,72)">
            <Line x1="-7" y1="0" x2="7" y2="0" />
            <Line x1="0" y1="-7" x2="0" y2="7" />
            <Line x1="-5" y1="-5" x2="5" y2="5" />
            <Line x1="5" y1="-5" x2="-5" y2="5" />
          </G>
          <G transform="translate(212,86)">
            <Line x1="-8" y1="0" x2="8" y2="0" />
            <Line x1="0" y1="-8" x2="0" y2="8" />
            <Line x1="-5" y1="-5" x2="5" y2="5" />
            <Line x1="5" y1="-5" x2="-5" y2="5" />
          </G>
          <Circle cx="40" cy="148" r="3.5" fill={OFF_WHITE} stroke={INK} strokeWidth={1.4} />
          <Circle cx="218" cy="154" r="3" fill={VANILLA} stroke={INK} strokeWidth={1.4} />
        </G>
      )}

      {/* Lluvia: gotas nítidas */}
      {isRain && (
        <G stroke={INK} strokeWidth={2.3} strokeLinecap="round">
          <Line x1="42" y1="84" x2="36" y2="98" />
          <Line x1="28" y1="132" x2="22" y2="146" />
          <Line x1="50" y1="176" x2="44" y2="190" />
          <Line x1="222" y1="98" x2="216" y2="112" />
          <Line x1="234" y1="146" x2="228" y2="160" />
          <Line x1="210" y1="186" x2="204" y2="200" />
        </G>
      )}

      {/* CAPA 2: PIES / BOTAS */}
      <G>
        <Rect
          x="104"
          y="200"
          width="11"
          height="24"
          rx="5.5"
          fill={OFF_WHITE}
          stroke={INK}
          strokeWidth={2.4}
        />
        <Rect
          x="141"
          y="200"
          width="11"
          height="24"
          rx="5.5"
          fill={OFF_WHITE}
          stroke={INK}
          strokeWidth={2.4}
        />

        {showRaincoat ? (
          /* Botas de agua burdeos #9E2A2B con suela #540B0E */
          <G>
            <Path
              d="M 98,210 L 117,210 L 117,230 L 94,230 C 94,223 98,221 98,217 Z"
              fill={BURGUNDY}
              stroke={BURGUNDY_DEEP}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Line x1="94" y1="228" x2="117" y2="228" stroke={BURGUNDY_DEEP} strokeWidth={3} />
            <Path
              d="M 139,210 L 158,210 L 158,217 C 158,221 162,223 162,230 L 139,230 Z"
              fill={BURGUNDY}
              stroke={BURGUNDY_DEEP}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Line x1="139" y1="228" x2="162" y2="228" stroke={BURGUNDY_DEEP} strokeWidth={3} />
          </G>
        ) : showWinterCoat ? (
          /* Botas cálidas miel/pizarra */
          <G>
            <Path
              d="M 98,212 L 117,212 L 117,230 L 95,230 C 95,224 98,222 98,218 Z"
              fill={HONEY}
              stroke={INK}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Path
              d="M 139,212 L 158,212 L 158,218 C 158,222 161,224 161,230 L 139,230 Z"
              fill={HONEY}
              stroke={INK}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          </G>
        ) : (
          /* Zapatillas suaves minimalistas */
          <G>
            <Ellipse cx="107" cy="227" rx="14" ry="6" fill={tonePalette.hex} stroke={INK} strokeWidth={2.2} />
            <Ellipse cx="149" cy="227" rx="14" ry="6" fill={tonePalette.hex} stroke={INK} strokeWidth={2.2} />
          </G>
        )}
      </G>

      {/* CAPA 3: ROPA AUTOMÁTICA POR CLIMA */}
      {showRaincoat ? (
        /* Chubasquero en rojo #9E2A2B y burdeos #540B0E con botones miel */
        <G>
          <Path
            d="M 94,154 L 162,154 L 172,208 L 84,208 Z"
            fill={BURGUNDY}
            stroke={BURGUNDY_DEEP}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {/* Solapa y cierre central */}
          <Line x1="128" y1="156" x2="128" y2="207" stroke={BURGUNDY_DEEP} strokeWidth={2.2} />
          <Circle cx="122" cy="172" r="3" fill={HONEY} stroke={BURGUNDY_DEEP} strokeWidth={1.3} />
          <Circle cx="122" cy="186" r="3" fill={HONEY} stroke={BURGUNDY_DEEP} strokeWidth={1.3} />
          <Circle cx="122" cy="199" r="3" fill={HONEY} stroke={BURGUNDY_DEEP} strokeWidth={1.3} />
          {/* Bolsillos */}
          <Rect x="95" y="184" width="16" height="12" rx="3" fill={BURGUNDY_DEEP} opacity="0.35" />
          <Rect x="145" y="184" width="16" height="12" rx="3" fill={BURGUNDY_DEEP} opacity="0.35" />
          {/* Ribete inferior burdeos oscuro */}
          <Line x1="85" y1="204" x2="171" y2="204" stroke={BURGUNDY_DEEP} strokeWidth={3} />
        </G>
      ) : showWinterCoat ? (
        /* Abrigo editorial de invierno en pizarra + botones miel */
        <G>
          <Path
            d="M 94,154 L 162,154 L 168,207 L 88,207 Z"
            fill={INK}
            stroke={BURGUNDY_DEEP}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Line x1="128" y1="156" x2="128" y2="206" stroke={VANILLA} strokeWidth={1.8} opacity="0.65" />
          <Circle cx="121" cy="174" r="3" fill={HONEY} />
          <Circle cx="135" cy="174" r="3" fill={HONEY} />
          <Circle cx="121" cy="190" r="3" fill={HONEY} />
          <Circle cx="135" cy="190" r="3" fill={HONEY} />
        </G>
      ) : (
        /* Prenda ligera editorial con acento del tono elegido */
        <G>
          <Path
            d="M 99,154 L 157,154 L 161,202 L 95,202 Z"
            fill={VANILLA}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Path
            d="M 97,186 L 159,186 L 161,202 L 95,202 Z"
            fill={tonePalette.hex}
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </G>
      )}

      {/* Bracitos simpáticos */}
      {showUmbrella ? (
        <G>
          <Path
            d="M 95,164 C 78,172 78,188 92,192"
            fill="none"
            stroke={INK}
            strokeWidth={7.5}
            strokeLinecap="round"
          />
          <Path
            d="M 95,164 C 78,172 78,188 92,192"
            fill="none"
            stroke={showRaincoat ? BURGUNDY : OFF_WHITE}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path
            d="M 161,164 C 178,166 184,158 182,148"
            fill="none"
            stroke={INK}
            strokeWidth={7.5}
            strokeLinecap="round"
          />
          <Path
            d="M 161,164 C 178,166 184,158 182,148"
            fill="none"
            stroke={showRaincoat ? BURGUNDY : OFF_WHITE}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </G>
      ) : (
        <G>
          <Path
            d="M 95,164 C 78,170 78,186 92,190"
            fill="none"
            stroke={INK}
            strokeWidth={7.5}
            strokeLinecap="round"
          />
          <Path
            d="M 95,164 C 78,170 78,186 92,190"
            fill="none"
            stroke={showWinterCoat ? INK : OFF_WHITE}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path
            d="M 161,164 C 178,170 178,186 164,190"
            fill="none"
            stroke={INK}
            strokeWidth={7.5}
            strokeLinecap="round"
          />
          <Path
            d="M 161,164 C 178,170 178,186 164,190"
            fill="none"
            stroke={showWinterCoat ? INK : OFF_WHITE}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </G>
      )}

      {/* CAPA 4: CUERPO / CABEZA DE NUBE CLAUDY */}
      <Path
        d="M 74,156 C 53,156 42,140 47,122 C 47,103 63,91 80,95 C 88,73 116,66 134,82 C 150,74 170,84 173,101 C 190,104 198,121 192,138 C 187,150 175,156 162,156 Z"
        fill={`url(#${gradId})`}
        stroke={INK}
        strokeWidth={2.7}
        strokeLinejoin="round"
      />
      {/* Brillo interior suave */}
      <Path
        d="M 96,87 C 106,80 120,80 128,87"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3.5}
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* CAPA 5: BUFANDA (AUTO FRÍO/VIENTO O PERSONALIZADA) */}
      {resolvedScarf !== 'none' && (() => {
        const scarfFill =
          resolvedScarf === 'burgundy_wrap'
            ? BURGUNDY
            : resolvedScarf === 'slate_cozy'
              ? INK
              : HONEY;
        const scarfStripe =
          resolvedScarf === 'burgundy_wrap'
            ? VANILLA
            : resolvedScarf === 'slate_cozy'
              ? HONEY
              : BURGUNDY_DEEP;
        return (
          <G>
            <Rect
              x="92"
              y="148"
              width="72"
              height="16"
              rx="8"
              fill={scarfFill}
              stroke={INK}
              strokeWidth={2.2}
            />
            <Path
              d="M 136,162 L 151,162 L 156,192 L 140,192 Z"
              fill={scarfFill}
              stroke={INK}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Line x1="138" y1="172" x2="152" y2="172" stroke={scarfStripe} strokeWidth={2.5} />
            <Line x1="140" y1="182" x2="154" y2="182" stroke={scarfStripe} strokeWidth={2.5} />
          </G>
        );
      })()}

      {/* CAPA 6: EXPRESIÓN FACIAL CONFIGURABLE */}
      <G>
        {/* Mejillas cálidas con tono elegido */}
        <Ellipse cx="96" cy="130" rx="7" ry="4" fill={tonePalette.cheekHex} opacity="0.65" />
        <Ellipse cx="152" cy="130" rx="7" ry="4" fill={tonePalette.cheekHex} opacity="0.65" />

        {merged.expression === 'happy' && (
          <G>
            <Circle cx="107" cy="118" r="4.2" fill={INK} />
            <Circle cx="108.5" cy="116.5" r="1.4" fill="#FFFFFF" />
            <Circle cx="141" cy="118" r="4.2" fill={INK} />
            <Circle cx="142.5" cy="116.5" r="1.4" fill="#FFFFFF" />
            <Path d="M 101,108 Q 107,104 113,108" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
            <Path d="M 135,108 Q 141,104 147,108" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
            <Path d="M 116,129 Q 124,137 132,129" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
          </G>
        )}

        {merged.expression === 'wink' && (
          <G>
            <Circle cx="107" cy="118" r="4.2" fill={INK} />
            <Circle cx="108.5" cy="116.5" r="1.4" fill="#FFFFFF" />
            <Path d="M 134,119 Q 141,113 148,119" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M 101,108 Q 107,104 113,108" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
            <Path d="M 116,129 Q 125,137 134,127" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
          </G>
        )}

        {merged.expression === 'sleepy' && (
          <G>
            <Path d="M 100,118 Q 107,124 114,118" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M 134,118 Q 141,124 148,118" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M 119,131 Q 124,134 129,131" fill="none" stroke={INK} strokeWidth={2.3} strokeLinecap="round" />
            {/* Zzz sutiles en miel */}
            <Path d="M 176,88 L 184,88 L 176,96 L 184,96" fill="none" stroke={HONEY} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M 188,76 L 194,76 L 188,82 L 194,82" fill="none" stroke={HONEY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </G>
        )}

        {merged.expression === 'chill' && (
          <G>
            <Line x1="100" y1="115" x2="114" y2="115" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
            <Circle cx="107" cy="119" r="3" fill={INK} />
            <Line x1="134" y1="115" x2="148" y2="115" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
            <Circle cx="141" cy="119" r="3" fill={INK} />
            <Path d="M 117,131 Q 125,133 133,128" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          </G>
        )}

        {merged.expression === 'surprised' && (
          <G>
            <Circle cx="107" cy="118" r="5" fill={INK} />
            <Circle cx="108.5" cy="116" r="1.7" fill="#FFFFFF" />
            <Circle cx="141" cy="118" r="5" fill={INK} />
            <Circle cx="142.5" cy="116" r="1.7" fill="#FFFFFF" />
            <Path d="M 101,105 Q 107,100 113,105" fill="none" stroke={INK} strokeWidth={2.1} strokeLinecap="round" />
            <Path d="M 135,105 Q 141,100 147,105" fill="none" stroke={INK} strokeWidth={2.1} strokeLinecap="round" />
            <Circle cx="124" cy="132" r="4.5" fill={BURGUNDY} stroke={INK} strokeWidth={2} />
          </G>
        )}
      </G>

      {/* CAPA 7: GAFAS (AUTO SOL/CALOR CON ACENTO MIEL O PERSONALIZADAS) */}
      {resolvedGlasses === 'round_honey' && (
        <G>
          <Circle cx="107" cy="118" r="12" fill={INK} fillOpacity="0.86" stroke={HONEY} strokeWidth={3} />
          <Circle cx="141" cy="118" r="12" fill={INK} fillOpacity="0.86" stroke={HONEY} strokeWidth={3} />
          <Line x1="119" y1="118" x2="129" y2="118" stroke={HONEY} strokeWidth={3} />
          <Line x1="102" y1="113" x2="108" y2="119" stroke={VANILLA} strokeWidth={2} strokeLinecap="round" />
          <Line x1="136" y1="113" x2="142" y2="119" stroke={VANILLA} strokeWidth={2} strokeLinecap="round" />
        </G>
      )}

      {resolvedGlasses === 'classic_slate' && (
        <G>
          <Rect x="94" y="109" width="25" height="17" rx="6" fill={BURGUNDY_DEEP} fillOpacity="0.82" stroke={INK} strokeWidth={2.6} />
          <Rect x="129" y="109" width="25" height="17" rx="6" fill={BURGUNDY_DEEP} fillOpacity="0.82" stroke={INK} strokeWidth={2.6} />
          <Line x1="119" y1="116" x2="129" y2="116" stroke={INK} strokeWidth={2.6} />
          <Line x1="99" y1="113" x2="106" y2="120" stroke={OFF_WHITE} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="134" y1="113" x2="141" y2="120" stroke={OFF_WHITE} strokeWidth={1.8} strokeLinecap="round" />
        </G>
      )}

      {resolvedGlasses === 'star_gold' && (
        <G>
          <Path
            d="M 93,110 L 121,110 L 118,124 C 115,129 99,129 96,124 Z"
            fill={HONEY}
            fillOpacity="0.88"
            stroke={BURGUNDY_DEEP}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Path
            d="M 127,110 L 155,110 L 152,124 C 149,129 133,129 130,124 Z"
            fill={HONEY}
            fillOpacity="0.88"
            stroke={BURGUNDY_DEEP}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Line x1="120" y1="115" x2="128" y2="115" stroke={BURGUNDY_DEEP} strokeWidth={2.5} />
          <Line x1="100" y1="114" x2="106" y2="121" stroke={VANILLA} strokeWidth={2} strokeLinecap="round" />
          <Line x1="134" y1="114" x2="140" y2="121" stroke={VANILLA} strokeWidth={2} strokeLinecap="round" />
        </G>
      )}

      {/* CAPA 8: GORRO / BOINA / SOMBRERO */}
      {resolvedHeadwear === 'beanie' && (
        <G>
          <Circle cx="123" cy="48" r="9" fill={HONEY} stroke={INK} strokeWidth={2.2} />
          <Path
            d="M 92,81 C 94,54 152,54 154,81 Z"
            fill={BURGUNDY}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Rect x="88" y="76" width="70" height="13" rx="6.5" fill={VANILLA} stroke={INK} strokeWidth={2.3} />
          <Line x1="104" y1="77" x2="104" y2="88" stroke={INK} strokeWidth={1.4} opacity="0.4" />
          <Line x1="123" y1="77" x2="123" y2="88" stroke={INK} strokeWidth={1.4} opacity="0.4" />
          <Line x1="142" y1="77" x2="142" y2="88" stroke={INK} strokeWidth={1.4} opacity="0.4" />
        </G>
      )}

      {resolvedHeadwear === 'beret' && (
        <G>
          <Path
            d="M 90,82 C 88,60 144,52 162,72 C 166,78 158,85 148,84 L 96,86 Z"
            fill={BURGUNDY_DEEP}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Path
            d="M 124,57 L 128,49"
            stroke={BURGUNDY_DEEP}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <Path
            d="M 98,78 C 114,72 138,72 152,78"
            fill="none"
            stroke={HONEY}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </G>
      )}

      {resolvedHeadwear === 'sunhat' && (
        <G>
          <Ellipse cx="123" cy="82" rx="46" ry="10" fill={VANILLA} stroke={HONEY} strokeWidth={2.4} />
          <Path
            d="M 98,81 C 98,60 148,60 148,81 Z"
            fill={VANILLA}
            stroke={HONEY}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Path
            d="M 98,76 Q 123,82 148,76"
            fill="none"
            stroke={BURGUNDY}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </G>
      )}

      {/* CAPA 9: PARAGUAS (LLUVIA/TORMENTA CON DETALLES EN #9E2A2B Y #540B0E) */}
      {showUmbrella && (() => {
        const canopyPrimary =
          resolvedUmbrella === 'striped_editorial'
            ? OFF_WHITE
            : resolvedUmbrella === 'clear_honey'
              ? VANILLA
              : BURGUNDY;
        const canopyTrim =
          resolvedUmbrella === 'clear_honey' ? HONEY : BURGUNDY_DEEP;

        return (
          <G>
            {/* Mango del paraguas */}
            <Path
              d="M 188,64 L 180,158 C 179,166 170,165 171,158"
              fill="none"
              stroke={BURGUNDY_DEEP}
              strokeWidth={3.4}
              strokeLinecap="round"
            />
            {/* Punta superior */}
            <Line x1="189" y1="54" x2="190" y2="44" stroke={BURGUNDY_DEEP} strokeWidth={3} strokeLinecap="round" />
            {/* Cúpula */}
            <Path
              d="M 122,72 C 142,38 222,42 246,84 C 228,76 212,78 202,84 C 190,74 172,72 158,79 C 145,69 132,68 122,72 Z"
              fill={canopyPrimary}
              stroke={BURGUNDY_DEEP}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {/* Paneles / detalles rojo #9E2A2B y burdeos #540B0E */}
            {resolvedUmbrella === 'striped_editorial' ? (
              <Path
                d="M 189,52 C 174,60 165,70 158,79 C 172,72 190,74 202,84 C 202,71 198,60 189,52 Z"
                fill={BURGUNDY}
                stroke={BURGUNDY_DEEP}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            ) : (
              <>
                <Path d="M 189,52 C 176,61 166,70 158,79" fill="none" stroke={canopyTrim} strokeWidth={2.2} />
                <Path d="M 189,52 C 198,62 203,73 202,84" fill="none" stroke={canopyTrim} strokeWidth={2.2} />
              </>
            )}
            {/* Detalle ribete en burdeos/miel */}
            <Circle cx="189" cy="52" r="3" fill={HONEY} stroke={BURGUNDY_DEEP} strokeWidth={1.4} />
          </G>
        );
      })()}
    </Svg>
  );
};
