* Rotatable elements
* Independantly scalable items (x & y)
* Obstacles at top / bottom randomly generated
  * Placement
    * Always X pixels apart
    * Then Randomly generated variations
      * top / bottom have to have limits so they never overlap (ie; player can
      * still get through)
* Player death
* Restartable game
* Menu / Intro screen (StarWars text scroller with skip button)
  * Drop info in localStorage about intro seen or not
* Scoring, based on;
  * number of kills
  * distance travelled
* High score
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
* Particles when things are shot
  * Cast a line from geometric center to collision point, then use as normal for
  * particles to burst from
* Particles when things die / explode
* Generate Beat-y music
  * Increase music tempo with the number of things drawn on screen.
