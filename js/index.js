"use strict";

var intervalID = 0,
  steps = [],
  strictMode = false,
  currentCPUStep = 0,
  currentLevel = 0,
  dutyCycle = 0.5, // ratio of on time to total cycleLength
  cycleLengths = [1000, 1000, 1000, 1000, 700, 700, 700, 700, 400, 400, 400, 400, 200, 200, 200, 200, 200, 200, 200, 200],
  // ms length of on+off
  winLevel = 4,
  sounds = [];

function getRandomGame() {
  // return random array of 20 ints between 0 and 3
  for (var a = [], i = 0; i < 20; i++) {
    a[i] = Math.floor(Math.random() * 4);
  }
  return a;
}

// *** Main game state machine
var controller = function () {
  var state = "",
    currentHumanStep = 0;
  // States: CPU, HUMAN, MISS, WIN

  function _setState(s) {
    state = s;
    $("#hud-state").text(s);
  }

  function _setLevel(l) {
    currentLevel = l;
    $("#hud-level").text(l + 1);
  }

  function _StartGame() {
    // create random string of 20 steps
    steps = getRandomGame();
    $("#hud-pattern").text(steps);
    _setLevel(0);
    _setState("CPU");
    _ShowPattern();
  }

  function _ShowPattern() {
    // this is the CPU turn, where the pattern is shown
    if (state == "CPU" || state == "MISS") {
      currentCPUStep = 0, currentHumanStep = 0;
      if (currentLevel >= winLevel) {
        _Win();
      } else {
        intervalID = window.setInterval(_playStep, cycleLengths[currentLevel]);
      }
    } else console.log("_ShowPattern in wrong state.");
  }

  function _Miss() {
    // This runs when there's a miss, whether or not we need to restart the game
    _setState("MISS");
    // play miss sound, show defeat announce
    _Announce();
    _ShowPattern();
  }

  function _Win() {
    _setState("WIN");
    // play win sound, show win announce
    _Announce();
  }

  function _Announce() {
    var type = (state === "WIN") ? "W" : "L";
    $(".sound" + type).trigger('play');
    $(".announce-" + type).addClass("show-announce");
    window.setTimeout(function () {
      $(".announce-" + type).removeClass("show-announce");
    }, 1500);
  }

  function _playStep() {
    if (currentCPUStep > currentLevel) {
      // Anything that needs to happen at the end of the pattern play
      // should go here.
      window.clearTimeout(intervalID);
      currentCPUStep = 0;
      if (strictMode && state == "MISS") _StartGame();
      else _setState("HUMAN");
    } else {
      $("#btn" + steps[currentCPUStep]).addClass("highlight");
      $(".sound" + steps[currentCPUStep]).trigger('play');
      currentCPUStep++;
      window.setTimeout(function () {
        $(".sbutton").removeClass("highlight");
      }, cycleLengths[currentLevel] * dutyCycle);
    }
  }

  function _ColorPress(idnum) {
    // idnum should be 0-3
    console.log("colorpress: " + idnum + " state: " + state);
    if (state == "HUMAN") {
      // steps[0] through steps[currentLevel] is the current pattern to beat
      if (idnum == steps[currentHumanStep]) {
        // pressed correct button
        currentHumanStep++;
        if (currentHumanStep > currentLevel) {
          // completed pattern
          _setState("CPU");
          _setLevel(currentLevel + 1);
          _ShowPattern();
        }
      } else {
        _Miss();
      }
    } else console.log("Pressed button in wrong state.");
  }

  return {
    startGame: _StartGame,
    colorPress: _ColorPress,
    showPatternTest: _ShowPattern
  };
};

// click handler callbacks
function buttonDown(thisObj) {
  thisObj.addClass("highlight");
  var $idnum = thisObj.attr("id").charAt(3);
  console.log("idnum: " + $idnum);
  $(".sound" + $idnum).trigger('play');
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
    $(".soundL").trigger('load');
    $(".soundW").trigger('load');
  })();

  // Event Handlers
  $("#btn-restart").click(function () {
    gameController.startGame();
  });

  $(".sbutton").mousedown(function () {
    buttonDown($(this));
  }).mouseup(function () {
    buttonUp($(this), gameController);
  })

  $("#btn-strict").click(function () {
    if (strictMode) {
      $(this).button('reset');
      strictMode = false;
    } else {
      $(this).button('toggle').button('on');
      strictMode = true;
    }
    console.log(strictMode);
  });

  gameController.startGame();
})