'use client'

import { cn } from "@/lib/utils";

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Variant = 'default' | 'placeholder'

export const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

const SIZE_STYLING: Record<CardSize, string> = {
  xs: 'w-16 h-24',
  sm: 'w-20 h-32',
  md: 'w-26 h-40',
  lg: 'w-32 h-48',
  xl: 'w-40 h-56',
}


export default function Card({ suit='', rank='', variant='default', size="md" }: { suit?: string, rank?: string, variant?: Variant, size?: CardSize }) {
  const isRed = suit === 'hearts' || suit === 'diamonds';

  if (variant === 'placeholder') {
    return (
      <div className={cn('rounded-lg border-2 border-gray-300 bg-white flex flex-col justify-between p-1', SIZE_STYLING[size])}>
      </div>
    )
  }
  return (
    <div className={cn('rounded-lg border-2 border-gray-300 bg-white flex flex-col justify-between p-1', SIZE_STYLING[size], isRed ? 'text-red-600' : 'text-gray-900')}>
      <div className="text-sm font-bold leading-none self-start">{rank}{SUIT_SYMBOLS[suit]}</div>
      <div className="text-3xl self-center">{SUIT_SYMBOLS[suit]}</div>
      <div className="text-sm font-bold leading-none self-end rotate-180">{rank}{SUIT_SYMBOLS[suit]}</div>
    </div>
  )
}
