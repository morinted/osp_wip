function stenoAnimation() {
  /* Phrases to type
   * [toType: string, rawSteno: string, replacesLastWord: boolean]
   **/
  var phrases =
    [ [ ['This is', 'TH-S']
      , [' what', 'WHA']
      , [' steno', 'STOEUPB']
      , [' looks', 'HRAOBGS']
      , [' like', 'HRAOEUBG']
      , ['...', 'SKWR-RBGS']
      ]
    , [ ['Write', 'WREU']
      , [' over', 'OEFR']
      , [' two', 'WUPB']
      , [' hundred', 'HUPBD']
      , [' words', 'WORDZ']
      , [' a', 'AEU']
      , [' minute', 'PHEUPB']
      , ['!', 'SKHRAPL']
      ]
    , [ ['Bring', 'PWREUPBG']
      , ['ing', '-G']
      , [' snog', 'STPHOG']
      , [' stenography', 'TPEU', true]
      , [' to', 'TO']
      , [' everyone', 'EFRPB']
      , ['.', 'TP-PL']
      ]
    ]

  // Grab typer and wait for a little.
  var typer = window.typer('.hero h2', 1)
  typer.empty().line('').pause(2000)

  /* Draw an outline (raw steno) on the HTML steno board */
  function highlightOutline(outline) {
    // Parsing from  'STROEBG' to 'S- T- R- O E -B -G'
    var matches = /([^\*AOEU\-]*)([AOEU\-\*]*)([^\*AOEU\-]*)/g.exec(outline)
    var left = matches[1] || ''
    var center = matches[2] || ''
    var right = matches[3] || ''
    var chord = []
    var i = 0

    for (i; i < left.length; i++) {
      chord.push(left[i] + '-')
    }
    for (i = 0; i < center.length; i++) {
      if (center[i] === '*') {
        chord.push('asterisk')
      } if (center[i] !== '-') {
        chord.push(center[i])
      }
    }
    for (i = 0; i < right.length; i++) {
      chord.push('-' + right[i])
    }

    // Find all the keys in the DOM
    var stenoKeys = document.getElementsByClassName('steno-key')
    
    i = 0
    var keyElement
    for (i; i < stenoKeys.length; i++) {
      keyElement = stenoKeys[i]
      if (chord.indexOf(keyElement.id) > -1) {
        // If the key is in the chord, activate it.
        keyElement.className += ' active'
      } else if (keyElement.className.indexOf('active') > -1) {
        // Otherwise deactivate it.
        var offset = keyElement.className.indexOf('active')
        keyElement.className =
          keyElement.className.substring(0, offset)
      }
    }
  }

  /* Write a phrase chord-by-chord with typer */
  function writePhrase(phrase) {
    var i = 0
    var word, stroke, replace, last_word, prefix, limit, to_backspace, to_write

    for (i; i < phrase.length; i++) {
      word = phrase[i][0]
      stroke = phrase[i][1]
      replace = !!phrase[i][2]

      if (replace) {
        prefix = 0
        limit = Math.min(last_word.length, word.length)
        for (prefix; prefix < limit; prefix++) {
          if (last_word[prefix] !== word[prefix]) {
            break
          }
        }
        to_backspace = last_word.length - prefix
        to_write = word.slice(prefix)
      } else {
        to_backspace = 0
        to_write = word
      }
      function sendStroke(stroke) {
        return function() {
          highlightOutline(stroke)
        }
      }

      typer
        .pause(50)
        .run(sendStroke(stroke))
        .pause(150)
        .run(function() { highlightOutline('') })
      if (to_backspace) {
        typer.back(to_backspace)
      }
      typer.continue([to_write], 1)
      last_word = word
    }
  }

  /* Undo a phrase chord-by-chord with typer */
  function asteriskPhrase(phrase) {
    var i = 0
    var word, stroke, replace, last_word, prefix, limit, to_backspace, to_write

    for (i = phrase.length - 1; i >= 0; i--) {
      word = phrase[i][0]
      stroke = phrase[i][1]
      replace = !!phrase[i][2]

      if (replace) {
        prefix = 0
        last_word = phrase[i - 1][0]
        limit = Math.min(last_word.length, word.length)
        for (prefix; prefix < limit; prefix++) {
          if (last_word[prefix] !== word[prefix]) {
            break
          }
        }
        to_backspace = word.length - prefix
        to_write = last_word.slice(prefix)
      } else {
        to_backspace = word.length
        to_write = ''
      }

      typer
        .pause(25)
        .run(function() { highlightOutline('*') })
        .pause(75)
        .run(function() { highlightOutline('') })
      if (to_backspace) {
        typer.back(to_backspace)
      }
      typer.continue([to_write], 1)
    }
  }

  function writeAndAsterisk(phrase) {
    writePhrase(phrase)
    typer.pause(2000)
    asteriskPhrase(phrase)
    typer.pause(1000)
  }
  writeAndAsterisk(phrases[0])
  writeAndAsterisk(phrases[1])
  writePhrase(phrases[2])
  typer.end(function(parent) {
    parent.className += ' done'
  })
}
stenoAnimation()