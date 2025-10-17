# Ninja Whist

Whist with a twist. Derived from Norweigan Whist.

Extended with bonus tokens to buff numeric ranks.

## The cards:

45 (or 46) cards

Suits: Sword, Staff, Knives, Stars; cards ranked: A, 2 ... 10, K

Suit: Archers; rank: J (the Archer); optionally include the Lessor Archer

## Setup

Shuffle the bonus tokens into a face-down stock.

Each player gets a bid marker (two-sided, indicating 0-7) and a pair of score trackers.

Shuffle the pack of 45 or 46 cards.

Choose initial dealer (cut or deal a card for each player, first highest card is initial dealer)

## Deal and determine trump suit

Deal cards to each player, up to hand size for the current round.

In the first round hand size is 1.  
Hand size increases by 1 each round, up to max hand size; then decreases by 1 each round.  
For 3 - 5 players, you may increase by 2 per round, odd on the way up, even on the way down.

| Players:  | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|:--        |:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Max size: |15 |11 | 9 | 7 | 6 | 5 | 5 |
| Tricks:  | 256 | 144 | 81 | 49 | 36 | 25 | 25|
| played:  | 768 | 576 | 405| 294 | 252 | 200 | 225 |

Reveal the next card, indicating the trump suit for that round.  
If an Ace or Archer is revealed, the round is played with no trump.  
At the maximum hand size, the round is played with no trump.  

Option: With 7 or more players, play the max size round twice.

## Players contract for number of tricks each will take
Beginning with the eldest hand, each player declares the exact number of tricks they expect to take.  
Record each bid (place the 0-7 bid marker with bid facing player).  

Dealer (last to bid, with most information) is constrained:
Dealer *must* bid so that the total of all players’ bids does **not** equal the hand size.
That is: it is not possible for *all* players to make their bids.

## Play each trick
Eldest hand makes initial lead.  
Other players, play in order, and must follow suit if able; else may play card of any suit, including trump or Archer.  
Players may also play one or more bonus tokens from their *score* area, increasing the rank of a numeric card.
(sacrificing bonus tokens in an attempt to make their bid contract)

Trick is won by the highest ranked card played. 

Bonus tokens played are returned to the stock.

The player who wins the trick takes a *bonus* token from the stock, and places in their 'play' area.  
If the stock is empty take a bonus token from a player with the most bonus tokens in their 'score' area.  
If the winning player uniquely has the most bonus tokens in their score area, they move one of their own into their play area.

Winner of each trick leads for the next trick.

### Rank of cards
Rank is generally: A, 2, … 10, K 

Cards of the suit led outrank any non-trump, non-Archer card played.  

One or more bonus tokens can be played to increase the rank of numeric cards.  
A numeric card’s rank is increased by 1 for each suit icon on the bonus tokens that matches the card’s suit.  
That is: the 6 of Knives accompanied by bonus tokens containing 3 Knives would outrank the 8 of Knives.  
Numeric cards, even with bonus tokens, never outrank the King.  

When there is a trump suit:
* Any card of trump suit outranks all cards of any suit (other than Archers).  
* Archers outrank all cards of the trump suit.
* Archers are their own suit, when Archer is led it is *not* required to follow with a trump.

The Ace is an assassin, Ace beats a face:  
* The Ace outranks the King of its suit; the Ace of trump also outranks the Archers.  
(if the King or Archers are *not* in the trick, Ace is outranked by all cards of its suit)  


### Bonus tokens

Bonus tokens are awarded to the winner of each trick.

When a trick is taken, a bonus token is drawn from a common *stock*, and placed in the player's *play area*.

A bonus token cannot be played (from play area) during the round it was acquired. This ensures that the number of bonus tokens in the play area exactly indicates the number of tricks the player has taken this round.

At the end of the round, bonus tokens are moved from the play area to the player's *score area*.

There are 32 bonus tokens.
- 2: no suit bonus (archers)
- 4: one suit bonus (a, b, c, d)
- 10: two suit bonus (aa, ab, ac, ad, bb, bc, bd, cc, cd, dd)
- 16: three suit bonus (aab, aac, aad, bba, bbc, bbd, cca, ccb, ccd, dda, ddb, ddc, abc, abd, acd, bcd)

## Score each round:
After the final trick of the round is taken, each player scores their bid:

If the number of bonus tokens in their play area exactly matches their bid
the player increase their score tracker by 10.

Bonus tokens are moved from play area to score area.  

### End game score:
At end of game player's score is 10 for each bid made, plus 1 point per bonus token remaining in their score area.

Player with highest score is the winner.
