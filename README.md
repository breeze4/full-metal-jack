# Full Metal Jack
Clone of Full Metal Mac

## TODO:
* make it easy to add units to the right cell
* add a limit to the amount of movement for the unit
* add in automated NPC movement
* separate the game engine logic, from the instance of the game that holds the state. The game engine should be stateless and pass in the state/context each function it calls. It holds the logic of process the game's individual pieces and calling the right methods on the classes.
* the map should take in a list of entities, and call render methods on each of the entities. The entities get updated by the main class. 
* the main class handles the actions (clicks/taking actions/etc) and holds the master instance of the game state.  THe main class is responsible for taking the game state, running it through the game engine on each actions taken, and then updating the map with the "view"