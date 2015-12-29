var intervalID = 0,
  steps = [],
  currentStep = 0,
  currentLevel = 0,
  dutyCycle = 0.5, // ratio of on time to total cycleLength
  cycleLength = 1000, // ms length of on+off
  sounds = [];

function getRandomStep() {
  // return random int between 0 and 3
  return Math.floor(Math.random() * 4);
}

function getRandomGame() {
  // return random array of 20 ints between 0 and 3
  for (var a = [], i = 0; i < 20; i++) a[i] = getRandomStep();
  return a;
}

// *** Main game state machine
var controller = function () {
  var state = "";
  var currentHumanPattern = [];
  var currentHumanStep = 0;
  // States:
  //   CPU
  //   HUMAN
  //   MISS

  function _StartGame() {
    // create random string of 20 steps
    steps = getRandomGame();
    currentLevel = 0;
    state = "CPU";
    _ShowPattern();
  }

  function _ShowPattern() {
    currentStep = 0;
    intervalID = window.setInterval(_playStep, cycleLength);
  }

  function _playStep() {
    if (currentStep > currentLevel) {
      // Anything that needs to happen at the end of the pattern play
      // should go here.
      window.clearTimeout(intervalID);
      currentStep = 0;
      state = "HUMAN";
      return;
    } else {
      $("#btn" + steps[currentStep]).addClass("highlight");
      $(".sound"+steps[currentStep]).trigger('play');
      currentStep++;
      window.setTimeout(function () {
        $(".sbutton").removeClass("highlight");
      }, cycleLength * dutyCycle);
    }
  }

  function _ColorPress(idnum) {
    // idnum should be 0-3
    console.log("colorpress: "+idnum+ " state: "+state);
    if (state == "HUMAN") {
      // TODO
    }
  }

  return {
    startGame: _StartGame,
    colorPress: _ColorPress,
    showPatternTest: _ShowPattern
  };
};

function buttonDown(thisObj) {
  thisObj.addClass("highlight");
  var $idnum = thisObj.attr("id").charAt(3);
  console.log("idnum: "+$idnum);
  $(".sound"+$idnum).trigger('play');
}

function buttonUp(thisObj, control) {
  thisObj.removeClass("highlight");
  control.colorPress(thisObj.attr("id").charAt(3));
}

// Main
$(function () {
  var gameController = controller(),
  steps = getRandomGame();
  
  (function setupSounds() {
    for (var i = 0; i < 4; i++) {
      $(".sound" + i).trigger('load');
    }
  })();

  gameController.startGame();

  // Event Handlers
  $("#test-btn").click(function () {
    gameController.showPatternTest();
  });

  $(".sbutton").mousedown(function () {
    buttonDown($(this));
  }).mouseup(function() {
    buttonUp($(this),gameController);
  })
})