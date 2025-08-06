let buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];
let level = 0;

$(".btn").addClass("disabled");

// Press the play button to start the game
$("#play-button").click(function () {
  $(".btn").removeClass("disabled");
  $("#play-button").hide();
  if (level === 0) nextSequence();
});

// Generate a new sequence
function nextSequence() {
  // reset the userClickedPattern to an empty array ready for the next level.
  userClickedPattern = [];

  // increment the level and display it
  level++;
  $("h2").text("Level " + level);

  // pick a random color
  randomNumber = Math.floor(Math.random() * 4);
  randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);

  // color choosing animation
  $("#" + randomChosenColor)
    .fadeIn(100)
    .fadeOut(100)
    .fadeIn(100);
  playSound(randomChosenColor);
}

// When the user click a button
$(".btn").click(function () {
  // get the button id
  userChosenColor = $(this).attr("id");
  userClickedPattern.push(userChosenColor);

  // sound and animation
  playSound(userChosenColor);
  animatePress(userChosenColor);

  checkAnswer(userClickedPattern.length - 1);
});

// Play button sound
function playSound(color) {
  audio = new Audio("sounds/" + color + ".mp3");
  audio.play();
}

// Button animation
function animatePress(color) {
  $("#" + color).addClass("pressed");
  setTimeout(function () {
    $("#" + color).removeClass("pressed");
  }, 50);
}

// Check the user answer
function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    // If the user has finished the sequence, start a new one
    if (userClickedPattern.length === gamePattern.length) {
      playSound("success");
      setTimeout(function () {
        nextSequence();
      }, 2000);
    }

    // game over
  } else {
    startOver();
  }
}

// Start a new game
function startOver() {
  playSound("wrong");
  $("body").addClass("game-over");
  setTimeout(function () {
    $("body").removeClass("game-over");
  }, 200);
  gamePattern = [];
  level = 0;
  $("h2").text("Game Over");
  $(".btn").addClass("disabled");
  $("#play-button").show();
}
