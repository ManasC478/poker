import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function roundToTwo(num: number) {
  // Shifts the decimal to look at the thousandths place safely
  return Number(Math.round(num + 'e2') + 'e-2');
}

export function settleUp(balances: { playerId: number, playerName: string, net: number }[]) {
  const creditors = balances
    .filter(b => b.net > 0)
    .map(b => ({ ...b, remaining: b.net }))
    .sort((a, b) => a.remaining - b.remaining);

  const debtors = balances
    .filter(b => b.net < 0)
    .map(b => ({ ...b, remaining: -b.net }))
    .sort((a, b) => a.remaining - b.remaining);

  const transactions = [];
  let i = 0, j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.remaining, debtor.remaining);

    transactions.push({
      from: debtor.playerName,
      to: creditor.playerName,
      amount: roundToTwo(amount),
    });

    creditor.remaining -= amount;
    debtor.remaining -= amount;

    if (creditor.remaining === 0) i++;
    if (debtor.remaining === 0) j++;
  }

  return transactions;
}

