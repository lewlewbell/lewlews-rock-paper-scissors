$(function() {
	var visuals = {
		// Hide element by adding the 'hide' class
		addHide: function(className) {
			$('.'+className).addClass('hide');
		},

		// Show element by removing the 'hide' class
		removeHide: function(className) {
			$('.'+className).removeClass('hide');
		},

		// Uses a combination of CSS and Jquery to scale and fade out an element
		selectionFade: function(className) {
			$('.'+className).addClass('scale-up');
			$('.'+className).fadeOut(350);
		}
	};

	// Contains all gameplay related functions and variables operating behind the scenes
	var gameEngine = {
		offerSelection: function(playerSelection) {
			// For player to select an option
			$('.select').on('click', function() {
				$('.select').off('click');
				var playerSelection = $(this).attr('id');
				gameEngine.processSelection(playerSelection);
			});
		},

		// New round commences
		processSelection: function(playerSelection) {
			// Points initially set to 0
			var playerPoint = 0;
			var AIPoint = 0;

			// Tell the AI to make a selection
			var AISelection = gameEngine.AI.selection();

			$('.the-ring__human').addClass('u-shake');
			$('.the-ring__ai').addClass('u-shake-reversed');

			setTimeout(function(){
				$('.the-ring__human').removeClass('u-shake');
				$('.the-ring__ai').removeClass('u-shake-reversed');
				$('.the-ring__human').addClass('the-ring__human--'+playerSelection);
				$('.the-ring__ai').addClass('the-ring__ai--'+AISelection);

				setTimeout(function(){
					$('.the-ring__human').removeClass('the-ring__human--'+playerSelection);
					$('.the-ring__ai').removeClass('the-ring__ai--'+AISelection);
				}, 3000);
			}, 1250);

			// Determine if player or AI win this round
			if (playerSelection === AISelection) {
				// It's a draw, no scores updated this round
				console.log('This round is a draw!');
				var victor = 'draw';
			} else {
				if (playerSelection === "rock") {
				    if(AISelection === "scissors") {
				        playerPoint++;
								var victor = 'player';
				    } else {
				        AIPoint++;
								var victor = 'ai';
				    }
				}

				if (playerSelection === "paper") {
				    if(AISelection === "rock") {
				        playerPoint++;
								var victor = 'player';
				    } else {
				        AIPoint++;
								var victor = 'ai';
				    }
				}

				if (playerSelection === "scissors") {
				    if(AISelection === "paper") {
				        playerPoint++;
								var victor = 'player';
				    } else {
				        AIPoint++;
								var victor = 'ai';
				    }
				}
			}

			// Add players selection to AI memory
			gameEngine.AI.playerSelectionMemory.push(playerSelection);

			// Add the victor to AI memory
			gameEngine.AI.victorMemory.push(victor);

			// Timeout used to wait for CSS animations
			setTimeout(function(){
				// Update the AI modifier
				gameEngine.AI.enableModifier();

				// We have a winner, update the score
				gameEngine.updateScores(playerPoint, AIPoint);
			}, 4250);
		},

		// AI selects an option
		AI: {

			playerSelectionMemory: [],
			victorMemory: [],
			currentModifier: 'neutral',

			selection: function() {
				var nameOfModifier = gameEngine.AI.currentModifier;

				// Get the % for rock, paper and scissors for this AI modifier
				var selectionChance = [
					['rock', '0.'+gameEngine.AI.modifiers[nameOfModifier].rock],
					['paper', '0.'+gameEngine.AI.modifiers[nameOfModifier].paper],
					['scissors', '0.'+gameEngine.AI.modifiers[nameOfModifier].scissors]
				]

				// Sort the selectionChance array from lowest to highest chance value
				// We need it to be sorted into number order for the condition below
				var selectionChance = selectionChance.sort(sortChances);

				// This function allows us to sort the two dimensional array from lowest
				// to highest numbers
				function sortChances(a, b) {
				    if (b[0] === a[0]) {
				        return 0;
				    } else {
				        return (b[0] < a[0]) ? -1 : 1;
				    }
				}

				// Randomly selects a number from 1 to 100, this is like a dice roll
				var AISelection = Math.random();

				// Here's where the AI makes the decision

				// If the random number is less than the lowest selectionChance
				if (AISelection < selectionChance[0][1]) {
						// Check the array to see if this sectionChance was rock, paper or scissors
						var AISelection = selectionChance[0][0];
			  // If random number is lower than second higher chance
				} else if (AISelection < selectionChance[1][1]) {
					 // Check the array to see if this sectionChance was rock, paper or scissors
					 var AISelection = selectionChance[1][0];
				// else if must be the highest chance
				} else {
					 // Check the array to see if this sectionChance was rock, paper or scissors
					 var AISelection = selectionChance[2][0];
				}

				// Debugger, forces AI to select rock
				//var AISelection = 'rock';

				return AISelection;
			},

			// Modifiers help the AI in dealing with the Human psychy
			// https://www.psychologytoday.com/blog/the-blame-game/201504/the-surprising-psychology-rock-paper-scissors
			modifiers: {
				// On a players first go, they have a tendency to lean towards Rock
				rookieCrusher: {
					modifierName: 'Rookie Crusher',
					modifierDescription: 'A Rookie Crusher is a first move modifier, it helps the AI to predict the Human\'s first decision.',
					rock: 35,
					paper: 40,
					scissors: 25
				},
				// When a player is rapidly losing, they will usually favour Rock and avoid Paper
				blitzer: {
					modifierName: 'Blitzer',
					modifierDescription: 'A Blitzer modifier helps the AI to finish off and crush a desparate Human.',
					rock: 30,
					paper: 65,
					scissors: 5
				},
				// Scissors is the option of choice for a player feeling confident
				defender: {
					modifierName: 'Defender',
					modifierDescription: 'A Defender modifier gives the AI an edge in defending against confident Human\'s.',
					rock: 50,
					paper: 20,
					scissors: 30
				},
				// If a player makes the same selection twice, they are unlikely to select it again, let's outsmart them
				trickster: {
					modifierName: 'Trickster',
					modifierDescription: 'The Trickster modifier gives the AI an edge in luring preditcable Human\'s into a trap.',
					rock: 0, // Dynamic
					paper: 0, // Dynamic
					scissors: 0 // Dynamic
				},
				neutral: {
					modifierName: 'Balanced',
					modifierDescription: 'The AI currently has no tactics, it\'s decision will be entirely random.',
					rock: 33.33,
					paper: 33.33,
					scissors: 33.33
				}
			},
			enableModifier: function() {
				var selectionMemory = gameEngine.AI.playerSelectionMemory;
				var victorMemory = gameEngine.AI.victorMemory;

				if (selectionMemory.length === 0) {
					// AI has no memory of player decisions, assume they are a rookie
					var modifier = 'rookieCrusher';
				}else if (selectionMemory[selectionMemory.length-1] === selectionMemory[selectionMemory.length-2]) {
					var repeatedSelection = selectionMemory[selectionMemory.length-1];

					// If the player has made the same selection twice, enable trickster modifier
					// Because the trickster modifier is dynamic, we need to set the values accordingly:
					if (repeatedSelection === 'rock') {
						gameEngine.AI.modifiers.trickster.rock = 45
						gameEngine.AI.modifiers.trickster.paper = 10
						gameEngine.AI.modifiers.trickster.scissors = 45
					}

					if (repeatedSelection === 'paper') {
						gameEngine.AI.modifiers.trickster.rock = 45
						gameEngine.AI.modifiers.trickster.paper = 45
						gameEngine.AI.modifiers.trickster.scissors = 10
					}

					if (repeatedSelection === 'scissors') {
						gameEngine.AI.modifiers.trickster.rock = 10
						gameEngine.AI.modifiers.trickster.paper = 45
						gameEngine.AI.modifiers.trickster.scissors = 45
					}

					var modifier = 'trickster';

				}else if (victorMemory[victorMemory.length-1] && victorMemory[victorMemory.length-2] === 'ai') {
					// Player is has lost twice in a row, enable blitzer modifier
					var modifier = 'blitzer';
				}else if (victorMemory[victorMemory.length-1] && victorMemory[victorMemory.length-2] === 'player') {
					// AI has lost twice in a row, enable defender modifier
					var modifier = 'defender';
				}else{
					var modifier = 'neutral';
				}

				// Store the current modifier in the object var for later use
				gameEngine.AI.currentModifier = modifier;

				// Display the current modifier to the user
				$('.modifier').text('Modifier: '+gameEngine.AI.modifiers[modifier].modifierName);

				// Add the modifier description as a title attribute
				$('.modifier').attr('title', 'Modifier: '+gameEngine.AI.modifiers[modifier].modifierDescription);
			}
		},

		// Total scores are processed
		updateScores: function(playerPoint, AIPoint) {
			gameEngine.playerTotalScore += playerPoint;
			gameEngine.AITotalScore += AIPoint;
			gameEngine.roundNo++;

			$('.round').text('Round '+gameEngine.roundNo);

			$('.scoreboard__player-score').text(gameEngine.playerTotalScore);
			$('.scoreboard__ai-score').text(gameEngine.AITotalScore);

			if (gameEngine.roundNo > 5) {
				// If player or AI hit a score of 10, declare a victory
				if (gameEngine.playerTotalScore > gameEngine.AITotalScore) {
					gameEngine.endGame('win');
				}else if(gameEngine.playerTotalScore < gameEngine.AITotalScore) {
					gameEngine.endGame('lose');
				}else{
					gameEngine.endGame('draw');
				}
			}else{
				gameEngine.offerSelection();
			}
		},

		endGame: function(result) {
			if (result === 'win') {
				$('.scoreboard__conclusion').text('Congratulations, you defeated the AI!');
				$('.scoreboard__score1').text('Human: ' + gameEngine.playerTotalScore);
				$('.scoreboard__score2').text('AI: ' + gameEngine.AITotalScore);
			}

			if (result === 'lose') {
				$('.scoreboard__conclusion').text('It looks like the AI tore you to shreds, better luck next time Human!');
				$('.scoreboard__score1').text('AI: ' + gameEngine.AITotalScore);
				$('.scoreboard__score2').text('Human: ' + gameEngine.playerTotalScore);
			}

			if (result === 'draw') {
				$('.scoreboard__conclusion').text("The battle between man and machine is inconclusive. It's a draw!");
				$('.scoreboard__score1').text('Human: ' + gameEngine.playerTotalScore);
				$('.scoreboard__score2').text('AI: ' + gameEngine.AITotalScore);
			}

			visuals.selectionFade('game__during');
			visuals.removeHide('scoreboard'); // Show options

			setTimeout(function(){
				visuals.addHide('scoreboard'); // Show options
				visuals.removeHide('game__launch'); // Show options
			}, 6000);
		},

		// Total scores - default is 0
		playerTotalScore: 0,
		AITotalScore: 0
	};

	// Document finished loading, show the game controls
	visuals.removeHide('game');

	// Launch the game
	$('.game__launch').click(function() {
		visuals.selectionFade('game__launch');
		visuals.removeHide('game__during'); // Show options

		// Set round to 1
		gameEngine.roundNo = 1;
		gameEngine.AI.enableModifier();

		// Launch the selection buttons function
		gameEngine.offerSelection();
	});
});
