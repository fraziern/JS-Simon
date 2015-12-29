"use strict";

var intervalID = 0,
  steps = [],
  strictMode = false,
  currentStep = 0,
  currentLevel = 0,
  dutyCycle = 0.5, // ratio of on time to total cycleLength
  cycleLengths = [1000, 1000, 1000, 1000, 700, 700, 700, 700, 400, 400, 400, 400, 200, 200, 200, 200, 200, 200, 200, 200],
  // ms length of on+off
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
  var state = "",
    currentHumanPattern = [],
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
    currentStep = 0, currentHumanStep = 0;
    if (currentLevel > 20) {
      _setState("WIN");
    } else {
      intervalID = window.setInterval(_playStep, cycleLengths[currentLevel]);
    }
  }

  function _Miss() {
    _setState("MISS");
    _ShowPattern();
  }

  function _playStep() {
    if (currentStep > currentLevel) {
      // Anything that needs to happen at the end of the pattern play
      // should go here.
      window.clearTimeout(intervalID);
      currentStep = 0;
      if (strictMode) _StartGame();
      else _setState("HUMAN");
    } else {
      $("#btn" + steps[currentStep]).addClass("highlight");
      $(".sound" + steps[currentStep]).trigger('play');
      currentStep++;
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