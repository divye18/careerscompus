import type { ComponentType } from 'react';
import type { DomainId } from '@/theme/tokens';
import { TechnologyArt, TechnologyBackdrop } from './envs/TechnologyEnv';
import { MedicineArt, MedicineBackdrop } from './envs/MedicineEnv';
import { BusinessArt, BusinessBackdrop } from './envs/BusinessEnv';
import { DesignArt, DesignBackdrop, DESIGN_RATIO } from './envs/DesignEnv';
import { LawArt, LawBackdrop } from './envs/LawEnv';
import { ArchitectureArt, ArchitectureBackdrop } from './envs/ArchitectureEnv';
import { ScienceArt, ScienceBackdrop } from './envs/ScienceEnv';

/**
 * Per-domain environment: its own artwork, backdrop, desktop composition and typographic treatment.
 * Compositions deliberately differ (text left/right/top, art centred/wide/offset, detail as a column or a
 * strip) — this is not one layout with a colour swap.
 *
 * Layout rules (viewport-relative, inside the pinned stage):
 *  - right-hand blocks end at 10vw from the right edge so they never run under the Direction Rail;
 *  - nothing sits in the bottom 14vh centre column (the docked compass lives there);
 *  - artwork is vertically centred around 45vh via `top: calc(45vh - <half its height>)`.
 */
export interface EnvSpec {
  Backdrop: ComponentType;
  Art: ComponentType;
  /** CSS aspect-ratio of the artwork box */
  ratio: string;
  /** desktop placement classes */
  art: string;
  head: string;
  detail: string;
  /** render the two detail lists side by side (for wide strips) instead of stacked */
  detailCols?: boolean;
  /** typographic treatment of the domain name */
  nameClass: string;
  /** artwork parallax depth (px at one room of scroll) */
  depth: number;
}

export const ENVS: Record<DomainId, EnvSpec> = {
  technology: {
    Backdrop: TechnologyBackdrop,
    Art: TechnologyArt,
    ratio: '1000 / 700',
    // width 40vw → height 28vw
    art: 'left-[30vw] top-[calc(45vh-13.3vw)] w-[38vw]',
    head: 'left-[5vw] top-[16vh] w-[min(23vw,350px)]',
    detail: 'right-[10vw] top-[16vh] w-[min(19vw,280px)]',
    nameClass: 'border-l-2 border-[color:var(--hue)] pl-4 text-[clamp(40px,min(4.6vw,7vh),68px)] leading-[1.04] tracking-[-0.01em]',
    depth: 40,
  },
  medicine: {
    Backdrop: MedicineBackdrop,
    Art: MedicineArt,
    ratio: '1000 / 700',
    // width 40vw → height 28vw
    art: 'left-[26vw] top-[calc(45vh-14vw)] w-[40vw]',
    head: 'right-[10vw] top-[16vh] w-[min(24vw,360px)]',
    detail: 'left-[5vw] top-[16vh] w-[min(19vw,280px)]',
    nameClass: 'italic font-light text-[clamp(40px,min(4.6vw,7vh),68px)] leading-[1.04]',
    depth: 28,
  },
  business: {
    Backdrop: BusinessBackdrop,
    Art: BusinessArt,
    ratio: '1400 / 440',
    // chart strip right of centre and above the compass; width 55vw → height 17.3vw
    art: 'left-[36vw] bottom-[17vh] w-[55vw]',
    head: 'left-[5vw] top-[14vh] w-[min(30vw,440px)]',
    detail: 'right-[10vw] top-[14vh] w-[min(21vw,300px)]',
    nameClass: 'text-[clamp(44px,min(5.2vw,8vh),80px)] tracking-[-0.02em] leading-[0.94]',
    depth: 30,
  },
  design: {
    Backdrop: DesignBackdrop,
    Art: DesignArt,
    ratio: DESIGN_RATIO,
    // width 50vw → height 35vw
    // width 44vw → height 30.8vw (ends before the right-hand detail column)
    art: 'left-[26vw] top-[calc(46vh-15.4vw)] w-[44vw]',
    head: 'left-[5vw] top-[16vh] w-[min(21vw,320px)]',
    detail: 'right-[10vw] top-[16vh] w-[min(19vw,280px)]',
    nameClass: 'italic text-[clamp(40px,min(4.4vw,6.6vh),66px)] -rotate-[3deg] origin-left leading-[0.95] border-b border-[color:var(--hue)] pb-2',
    depth: 60,
  },
  law: {
    Backdrop: LawBackdrop,
    Art: LawArt,
    ratio: '1000 / 700',
    // width 38vw → height 26.6vw
    art: 'left-[31vw] top-[calc(45vh-13.3vw)] w-[38vw]',
    head: 'left-[5vw] top-[16vh] w-[min(23vw,350px)]',
    detail: 'right-[10vw] top-[16vh] w-[min(19vw,280px)]',
    nameClass: 'uppercase tracking-[0.14em] text-[clamp(28px,min(3.2vw,5vh),46px)] leading-[1.15] border-t border-[color:var(--hue)] pt-3',
    depth: 14,
  },
  architecture: {
    Backdrop: ArchitectureBackdrop,
    Art: ArchitectureArt,
    ratio: '1000 / 700',
    // art top-left, detail as a strip beneath it; width 42vw → height 29.4vw
    art: 'left-[3vw] top-[9vh] w-[42vw] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]',
    head: 'right-[10vw] top-[15vh] w-[min(27vw,400px)]',
    detail: 'left-[5vw] bottom-[13vh] w-[min(40vw,600px)]',
    detailCols: true,
    nameClass: 'border border-[color:var(--hue)] px-4 py-3 text-[clamp(34px,min(3.8vw,6vh),56px)] leading-[1.05]',
    depth: 22,
  },
  science: {
    Backdrop: ScienceBackdrop,
    Art: ScienceArt,
    ratio: '1000 / 700',
    art: 'left-[3vw] top-[9vh] w-[48vw]',
    head: 'right-[10vw] top-[15vh] w-[min(27vw,400px)]',
    detail: 'left-[5vw] bottom-[13vh] w-[min(44vw,640px)]',
    detailCols: true,
    nameClass: 'text-[clamp(38px,min(4.2vw,6.6vh),62px)] leading-[1.04] tracking-[-0.01em]',
    depth: 34,
  },
};
