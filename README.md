# Ninja Whist

Derived from Norweigan Whist.

Extended to use score tokens and bonus tokens.

## setup

Place the score tokens in a common supply; shuffle the bonus tokens into a face-down stock.

Each player gets a bid marker (two-sided, indicating 0-7)

## the cards and their rank

Four suits, cards ranked: A, 2 ... 9, K (Sword, Staff, Lnives, Stars)

One suit, one card ranked: J (arrows)

41 cards

Follow suit if able, else may sluff or trump (unless hand is played a no trump)

Ace is lowest rank, unless King of its suit is in play, in that case it outranks the King.
The Ace of trump also outranks the Jack of Arrows.

The Jack of Arrows: ('super trump')
- with trump: outranks the King of trump, but is outranked by Ace of trump.
- at no trump: is it's own suit; if led it wins, if following it loses.

## Bonus tokens

Bonus tokens are awarded to the winner of each trick.

When a trick is taken, a bonus token is drawn from a common *stock*, and placed in the player's *play area*.

At the end of the round, bonus tokens are moved from the play area to the player's *score area*.

There are 31 bonus tokens.
- 1: no bonus
- 4: one bonus (a, b, c, d)
- 10: two bonus (aa, ab, ac, ad, bb, bc, bd, cc, cd, dd)
- 16: three bonus (aab, aac, aad, bba, bbc, bbd, cca, ccb, ccd, dda, ddb, ddc, abc, abd, acd, bcd)

## Deal, Bid, Play as Norweigan Whist
Choose initial dealer (cut or deal a card for each player, first highest card is initial dealer)

### hand size changes each round: 1 -> max --> 1
In first round deal 1 card to each player.  
In subsequent rounds deal 1 more card to each player.

At the maximal hand size, the round is played with no trump.  
Otherwise, reveal the next card, indicating the trump suit for that round.  
If the Jack of Arrows is so revealed, the round is played with no trump.

After the maximal sized hand, reduce the number of cards by 1 each round.  
Therefore, play (2 * max - 1) rounds, where max = floor(41 / number_of_players)

Option: With 7 or 8 players, play the max size round twice.

### players contract for number of tricks each will take
Beginning with the eldest hand, each player declares the number of tricks they expect to take.  
Record each bid (place the 0-7 bid marker with bid facing player).  
The dealer is required to bid such that the total of all bids does not equal the number of tricks for that round!

### play
Dealer makes initial lead.  
Other players in order follow suit if able; else may sluff or trump.  
Players may also play one or more Bonus tokens from their Score area, increasing the rank of their card by the number of matching suit icons. (sacrificing the bonus points in attempt to make their bid contract)

Trick is won by the highest ranked card of trump, if no trump is played then the highest ranked card of the suit led.  
Note that the rank of an Ace changes when the Jack or its King is played.  

The player who wins the trick takes a *bonus* token from the stock, and places in their 'play' area.  
If the stock is empty take a bonus token from a player with the most bonus tokens in their 'score' area.  
If the winning player uniquely has the most bonus tokens in their score area, they move one of their own into their play area.

### score
After the final trick of the round is taken, each player gets a score token.
If the number of bonus tokens in their play area exactly matches their bid
the player get a +10 score token.

Bonus tokens are moved from play area to score area.  

At end of game player's score each Score token for 10 points, plus 1 pt for each icon (1, 2 or3) on the Bonus tokens.

# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
