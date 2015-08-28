* Obstacles at top / bottom randomly generated
  * Cache a series of paths (5?)
  * "Obstacle" generator like player/bullet/etc
  * Randomly select a path for an obstacle
  * Placement
    * Always X pixels apart
    * Then Randomly generated variations
      * top / bottom have to have limits so they never overlap (ie; player can
      * still get through)
  * Cache obstacles same as bullets
  * Refactor out to have generic caches
* Enemies
  * Fire bullets at player(s)
    * Ever X ms
  * Movement Patterns:
    * Simple: Straight forward
    * Circle: Straight for X ms, then rotate in circle
  * Randomly generated enemy types
  * Enemy group sequences
    * One enemey every X ms
    * Then a hard coded sequence (1 x straight, 3 x circle, 5 x straight, etc)
    * Then randomly generated (within bounds)
* Apply Jerk + Initial acceleration to the movement to give it a smooth-to-stop
  movement
* Restrict movement of player to within canvas
* Touch interactions
* Test on mobile (landscape only)
