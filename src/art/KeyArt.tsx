import { Bird } from './Bird';
import { Poacher } from './Poacher';
import { Clouds } from './Clouds';
import { SceneBank, SceneFauna, SceneForeground, SceneJungle, SceneLight, SceneSky } from './Scene';

/** The full scene as one still: lobby cards, banners, social posts. */
export function KeyArt({ width = 1000, cover = false }: { width?: number; cover?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 560"
      width={cover ? '100%' : width}
      height={cover ? '100%' : (width * 560) / 1000}
      preserveAspectRatio={cover ? 'xMidYMid slice' : undefined}
      role="img"
      aria-label="Blue Bird key art: Azul the blue macaw escapes over a moonlit jungle waterfall while Rato the poacher takes aim"
    >
      <SceneSky />
      <Clouds x={0} />
      <SceneFauna />
      <SceneJungle />
      <SceneLight />
      <g transform="translate(704 166) rotate(-14) scale(1.15)">
        <Bird state="fly" aura />
      </g>
      <SceneBank />
      <g transform="translate(214 548) scale(.82) translate(-196 -548)">
        <Poacher mood="aim" aim={-24} />
      </g>
      <SceneForeground />
    </svg>
  );
}
