/**
 * Fallback player bios, keyed by first name (lowercase).
 *
 * The profile page reads `description` from the `players` table first
 * (`getPlayer` / `getPlayers` in `lib/data.ts`). These strings are only used
 * when a player's `description` is empty in the database, so the About
 * section still renders if the column hasn't been filled in yet.
 *
 * Source: the bios Mihir dictated on 2026-11-19, cleaned up for
 * structure/grammar only, personality and style kept.
 */
export const PLAYER_BIO_FALLBACKS: Record<string, string> = {
  manas: `Consistent. Dominant. Successful.

"The Chogster" strikes fear into his opponents with his tactical, powerful, patent-pending "Chougule Theory." Chapter 1: Taking Down the King — how to re-raise and suppress threats from Ishan "The King" Singh.

He never shows his cards. He frightens opponents by re-raising, and the key is simple: never show his hand. By the time the river comes, his opponents have already been cremated, either by folding or mucking, knowing the strength of the Chogster.

His hands never fail to impress — he regularly visits the Mandir to converse with his closest friends, the Poker Gods. Poker is a game of luck and skill, and the Chogster holds both in his two hands, ready to blast his opponents like Goku.

His play style can be boring, but he always walks away with no more than $29.99 and no less than $9.99.

In the words of Shai-Gilgeous Alexander, "My whole life is consistent."`,

  justin: `Tricky Justin — one of the hardest opponents to read in the game, and also the most efficient. In just 12 seshies, he has amassed close to $250.

Before the Nut Ledger's creation, Yee was cheeks. A typical night would be getting cooked in the first few hands, going all in, and calling it a night. However, one night in Vegas changed it all. After a nice rub down by the masseuses, Yee entered a new realm of poker.

Whether it is raising by ridonkulous amounts preflop and frightening his opponents, or folding 90% of his hands, you never know what TrickyJustin123 is up to. However, one thing is certain — if you are one-on-one with him, you have already lost. His all-ins are brutal, wiping the table of all the chips, and to this day he still holds the single-game profit record.

When he wins, he wins big and blows the whole load, and when he loses, he remains as tight as a bunyan on an Indian unc.

Mirror, mirror on the wall, who's the trickiest of them all?`,

  sawyer: `Soysaucewaso — or where did you go?

Big Blankenship has been missing from action for a while, stuck in Davis with the cows. But don't forget his classic playing style, following the greats like Helmuth, Negreanu, and all his white brothas.

When Sawyer has something joothy, he locks in to another dimension, smoldering at his opponents, exposing his chiseled jawline and hunter eyes in a very sharp and sexy way. His opponents start nervously shaking like a Jamaican, and before you know it, they get fried like bacon.

But you never know — sometimes Blank will bluff you right out of your boots, making you look like a damn fool. His opponents are happiest when he is stuck on the cowfields in Davis, for that is where he can do no damage.

But watch out — on any random Tuesday, Thursday, shoot, even a Saturday, Soysaucewaso will pull up, wipe the floor with all you scrubs, and then head back with his briefcase full of dough, driving back to Davis in the same night. In one fell swoop, he takes your dough and says, "I gotta go."`,

  mihir: `Bork — a fascinating player who never ceases to amaze with his drama. Ready for Bollywood, he loves to trash talk his opponents until their ears are bleeding, toying with their teeny brains until they cannot handle the psychological warfare!

In over 80 hours of playing, the fool has only made a measly 22 bucks. Straight buns. Go big or go home is his motto — and boy, does he go home a lot.

But his wins are triumphant, often the last hand in a long night, ending with a triumphant BOOM or DOOM. He refuses to take a mediocre win of $20, only accepting $50+ or going in the red.

Easily the most tilted player of all time, you might as well send him to Tilted Towers. No matter what he does, whether it is gambling hundreds on sports betting, going all in on poker, or getting wiped in his stocks — he always ends up a zero, not the hero.`,

  rajiv: `Ohhhh Rajiv. What a man, what a mighty good man.

Big Mo sure is an interesting player. Currently on hiatus for poor performance, a truckload of school work, and a lil Digicert work, Mohan is building his skills ground up, all with the help of Coach Bork, who will be mentoring him on how to play like an absolute retard.

Mohan's infamous high-cortisol, thousand-yard stare, Look-to-the-Lord moments will go down in history. Known for his tight playing style and extremely high stress, Rajiv refuses to lose a damn penny. His hands are drier than the Sahara, and by the time one of his hands finally hits, everyone is already sleeping — too little, too late, Big Mo.

In the words of his GOAT Steph Curry — "Night Night!"

But what we are really waiting to see is: does Rajiv have any more fight? We miss you, Big Mo!`,

  ishaan: `Singh is King! All hail the King!

Ishaan shows he is the King by playing like one, refusing to fold any hand no matter how booty it is. Whether it is a pair of crispies (two twos) or a 10 high, Singh is ready to shove that thang.

Astounding his opponents, Singh always manages to fold his river cards or muck instantly, which begs the question — how did he get to the river in the first place? But no one at the table complains, for it makes all prosperous.

Even in losing, he keeps his mind on the mission — to lose all of his chips. But even that won't stop the King! Refusing to let up, he buys back in until his bank says, "We got no mo money, Singh!" The Singh Foundation has already donated hundreds, and looks to do more for his brothers in Bork's garage.

But who gives a piss? He's FILTHY RICH! Vegas, watch out, Singh is coming!`,

  atharva: `"I'm All EEEEEN. SEEE YAAAAA!" — these are Atharva's famous last words before going all in with his absolute rubbish.

The numbers don't lie — on 69% of hands, Big Berde goes ALL EEEEEN. And he wins approximately 2% of them — absolute Aura Loss.

But nothing can stop me, I'm all the way up! Atharva's aggressive and nuclear playing style should scare opponents away, but his immensely large range makes his opponents smell out his bluffs. And boy, do his hands stink!

Atharva keeps everyone on their toes, exciting his opponents when he raises the stakes! More like mistakes! Atharva's willing to bet at any cost — reminded that his brothas Singh and Bork are ready to join the Berde party.

SEEE YAAAAA`,
}

/** Bio for a player: the database `description` wins, fallback second. */
export function bioForPlayer(name: string, description: string | null | undefined): string | null {
  if (description?.trim()) return description
  return PLAYER_BIO_FALLBACKS[name.trim().toLowerCase()] ?? null
}
