# Shoot Back

Side-scrolling shooter with a unique time reversal mechanic: Death causes time
to reset so you can play through the level again with your past self.

## Instructions

* Arrows to move
* Space to shoot
* Hit an enemy and time resets

----

# Goals for future development

Unique endless sidescrolling shooter for 2 players.

## Idea

### Premise

* Player 1 must escort a "valuable" ship through space.
* The ship grants an ability to be teleported back in time instead of dying.
* The enemy (Player 2) is carrying nukes. If they touch the "valuable" ship,
  it's game over for P1.
* P2's bullets aren't strong enough to hur the "valuable" ship, but can kill P1.
* The teleport ability is restricted - there are only so many "lives" it can
  grant.

### Game Play

#### Player 1

* P1 starts the game as a regular side-scrolling shooter
* When shot, the player is teleported back to the start of the game (in time &
  space)
* And everything is vertically reversed (flipped)
* The original play through (P1a) is now played back on auto
* While the player plays as a clone of the first (P1b)
* So now there are two versions of the player (P1a & P1b) killing enemies
* If P1a is not killed by the original enemy which killed it, it becomes AI
  controlled
* Once P1a dies, it is NOT teleported back. Instead, its play through is
  recorded for the next time P1b is teleported back (as P1c now).
* If P1 uses up all their "lives", the game will continue to play as the AI
  until all the clones are killed, or they reach the end of the level
* Once the level is over, it's P2's go.

##### Player 2

* Now player 2 plays the game, but from their perspective from the point where
  P1 died / finished the level.
* P1 appears to be moving in reverse (as if P2 is pushing them back)
* P2 has the same teleport ability as P1, 
* When P2 is teleported back, the same thing happens as with P1.
* The number lives P2 has is the number of kills P1 made +1Describe the game?
* At each point where P1 died, a new P1 is spawned by flying out of the
  "valuable" ship
* The P1's are AI controlled

## Implementation

### Phase 1

The side-scrolling shooter

### Phase 2

Reset after dying

### Phase 3

2 player / reverse
