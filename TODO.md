* A collision bounce for objects with velocity
* Give objects velocity and mass: http://elancev.name/oliver/2D%20polygon.htm
* Independantly scalable items (x & y)
* Menu / Intro screen
  * Tutorial level:
    * Screen 1: "<space> to shoot"
      * Then an increasingly impossible wave of enemies
      * Eventually the player will die
    * Screen 2: "Time Warp Activated!"
      * Replay
      * Player will die again
    * Screen 3: "Final Time Warp!"
      * Stop the wave generating after the 2nd player death
      * If player dies again, go to Sreen 4
      * If player makes it to the end, go to Screen 5
    * Screen 4: "Let's try again!"
      * Go to Screen 1
    * Screen 5: "Mission complete! Ready to try the real thing?"
  * Drop info in localStorage about intro seen or not
* Scoring, based on;
  * number of kills
  * distance travelled
* High score
* Enemies
  * Randomly generated enemy types
  * Enemy group sequences
    * One enemey every X ms
    * Then a hard coded sequence (1 x straight, 3 x circle, 5 x straight, etc)
    * Then randomly generated (within bounds)
  * Enemy death causes an "explosion" (a growing circle that fades out).
    * If player collides with explosion, they die.
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
  * Sounds for bullets fired
    * Something similar to th eblue eyeball bullets in Devious Dungeon
* Game over state
* Pause Menu
* AI for the killed players after their death
