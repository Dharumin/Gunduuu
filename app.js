/* Main Application Logic for "A Secret Just For You, Pragaaa 💌" */
class App {
  constructor() {
    this.currentQuestionIndex = 0;
    this.isAudioOn = true;
    this.storyEventsBound = false;
    this.storyTimers = [];
    this.typewriterInterval = null;
    this.secretRevealTimeout = null;
    this.unlockInterval = null;

    this.initDOMReferences();
    this.bindEvents();
    this.renderQuestion();
    this.renderScreen('screen-welcome');
  }

  initDOMReferences() {
    // Screens
    this.screens = {
      welcome: document.getElementById('screen-welcome'),
      quiz: document.getElementById('screen-quiz'),
      unlocking: document.getElementById('screen-unlocking'),
      secret: document.getElementById('screen-secret')
    };

    // Buttons
    this.btnStartQuiz = document.getElementById('btn-start-quiz');
    this.btnNextQuestion = document.getElementById('btn-next-question');
    this.btnOpenSecret = document.getElementById('btn-open-secret');
    this.btnAudio = document.getElementById('btn-audio');
    this.audioIcon = document.getElementById('audio-icon');
    this.audioText = document.getElementById('audio-text');
    this.btnCustomizer = document.getElementById('btn-customizer');
    this.heartBtn = document.getElementById('heart-btn');
    this.heartTapContainer = document.getElementById('heart-tap-container');

    // Quiz DOM
    this.quizDots = document.getElementById('quiz-dots');
    this.quizTracker = document.getElementById('quiz-tracker');
    this.quizQuestionText = document.getElementById('quiz-question-text');
    this.quizOptionsContainer = document.getElementById('quiz-options-container');
    this.quizFeedback = document.getElementById('quiz-feedback');

    // Unlocking DOM
    this.unlockProgressBar = document.getElementById('unlock-progress-bar');
    this.unlockPercent = document.getElementById('unlock-percent');

    // Secret Message Container
    this.letterLinesContainer = document.getElementById('letter-lines-container');

    // Final Surprise Modal
    this.modalFinal = document.getElementById('modal-final');
    this.finalTitleText = document.getElementById('final-title-text');
    this.finalMessageText = document.getElementById('final-message-text');
    this.finalSigText = document.getElementById('final-sig-text');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnCloseModal = document.getElementById('btn-close-modal');

    // Story Overlay DOM
    this.storyOverlay = document.getElementById('story-overlay');
    this.storyPhases = {
      'wait': document.getElementById('story-phase-wait'),
      'intro': document.getElementById('story-phase-intro'),
      'teaser': document.getElementById('story-phase-teaser'),
      'sentences': document.getElementById('story-phase-sentences'),
      'memories': document.getElementById('story-phase-memories'),
      'quote': document.getElementById('story-phase-quote'),
      'final-card': document.getElementById('story-phase-final-card'),
      'easter-egg': document.getElementById('story-phase-easter-egg')
    };

    this.btnStoryBegin = document.getElementById('btn-story-begin');
    this.btnStoryNextSentence = document.getElementById('btn-story-next-sentence');
    this.btnStoryToQuote = document.getElementById('btn-story-to-quote');
    this.btnStoryQuoteNext = document.getElementById('btn-story-quote-next');
    this.btnStoryEasterEgg = document.getElementById('btn-story-easter-egg');
    this.btnStoryRestart = document.getElementById('btn-story-restart');
    this.btnStoryClose = document.getElementById('btn-story-close');

    // Customizer Modal
    this.modalCustomizer = document.getElementById('modal-customizer');
    this.customizerQuestionsList = document.getElementById('customizer-questions-list');
    this.customSecretLines = document.getElementById('custom-secret-lines');
    this.customFinalTitle = document.getElementById('custom-final-title');
    this.customFinalMsg = document.getElementById('custom-final-msg');
    this.customFinalSig = document.getElementById('custom-final-sig');
    this.btnSaveCustom = document.getElementById('btn-save-custom');
    this.btnResetCustom = document.getElementById('btn-reset-custom');
    this.btnCloseCustom = document.getElementById('btn-close-custom');
  }

  bindEvents() {
    // Window audio unlocker for browser autoplay policies
    const unlockAudio = () => {
      audio.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    // Welcome CTA
    this.btnStartQuiz.addEventListener('click', () => {
      audio.playClick();
      audio.startBgm();
      this.startQuiz();
    });

    // Audio Toggle
    this.btnAudio.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      if (isMuted) {
        this.audioIcon.textContent = '🔇';
        this.audioText.textContent = 'Muted';
        this.btnAudio.classList.remove('active');
      } else {
        this.audioIcon.textContent = '🔊';
        this.audioText.textContent = 'Sound ON';
        this.btnAudio.classList.add('active');
        audio.startBgm();
      }
    });

    // Quiz Next Question
    this.btnNextQuestion.addEventListener('click', () => {
      audio.playClick();
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex < dataStore.questions.length) {
        this.renderQuestion();
      } else {
        this.startUnlockingSequence();
      }
    });

    // Open Secret Button (Screen 3 -> Screen 4)
    this.btnOpenSecret.addEventListener('click', () => {
      audio.playRevealFanfare();
      if (particleSystem) {
        particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 80);
      }
      this.startSecretMessageReveal();
    });

    // Heart Tap (Triggers Full Interactive Story Overlay)
    this.heartBtn.addEventListener('click', (e) => {
      audio.playHeartExplosion();
      if (particleSystem) {
        particleSystem.triggerExplosion(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 120);
      }
      this.startInteractiveStory();
    });

    // Final Surprise Modal Actions
    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => {
        this.closeFinalModal();
        audio.playRevealFanfare();
        this.startSecretMessageReveal();
      });
    }

    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener('click', () => {
        audio.playClick();
        this.closeFinalModal();
      });
    }

    // Customizer Modal Triggers
    this.btnCustomizer.addEventListener('click', () => {
      audio.playClick();
      this.openCustomizerModal();
    });

    this.btnCloseCustom.addEventListener('click', () => {
      audio.playClick();
      this.modalCustomizer.classList.remove('active');
    });

    this.btnResetCustom.addEventListener('click', () => {
      audio.playClick();
      dataStore.resetToDefault();
      this.openCustomizerModal();
    });

    this.btnSaveCustom.addEventListener('click', () => {
      audio.playSuccess();
      this.saveCustomizerData();
      this.modalCustomizer.classList.remove('active');
    });

    // Bind Interactive Story Events ONCE
    if (!this.storyEventsBound) {
      this.storyEventsBound = true;
      
      this.btnStoryBegin.addEventListener('click', () => {
        audio.playClick();
        this.runStorySentencesPhase();
      });

      this.btnStoryNextSentence.addEventListener('click', () => {
        audio.playClick();
        this.advanceSentence();
      });

      this.btnStoryToQuote.addEventListener('click', () => {
        audio.playClick();
        this.runStoryQuotePhase();
      });

      if (this.btnStoryQuoteNext) {
        this.btnStoryQuoteNext.addEventListener('click', () => {
          audio.playClick();
          this.runStoryFinalCardPhase();
        });
      }

      this.btnStoryEasterEgg.addEventListener('click', () => {
        audio.playHeartExplosion();
        if (particleSystem) {
          particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 120);
        }
        this.runStoryEasterEggPhase();
      });

      if (this.btnStoryRestart) {
        this.btnStoryRestart.addEventListener('click', () => {
          audio.playClick();
          this.startInteractiveStory();
        });
      }

      if (this.btnStoryClose) {
        this.btnStoryClose.addEventListener('click', () => {
          audio.playClick();
          this.closeStoryOverlay();
        });
      }
    }
  }

  // --- TIMER & ANIMATION CLEANUP ---
  clearStoryTimers() {
    if (this.storyTimers && this.storyTimers.length > 0) {
      this.storyTimers.forEach(id => clearTimeout(id));
      this.storyTimers = [];
    }
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
  }

  addStoryTimer(fn, delay) {
    const id = setTimeout(fn, delay);
    this.storyTimers.push(id);
    return id;
  }

  clearSecretRevealTimer() {
    if (this.secretRevealTimeout) {
      clearTimeout(this.secretRevealTimeout);
      this.secretRevealTimeout = null;
    }
  }

  clearUnlockInterval() {
    if (this.unlockInterval) {
      clearInterval(this.unlockInterval);
      this.unlockInterval = null;
    }
  }

  renderScreen(screenId) {
    Object.keys(this.screens).forEach(key => {
      const el = this.screens[key];
      if (el.id === screenId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // --- SCREEN 2: Quiz Logic ---
  startQuiz() {
    this.currentQuestionIndex = 0;
    this.renderScreen('screen-quiz');
    this.renderQuestion();
  }

  renderQuestion() {
    let q = dataStore.questions[this.currentQuestionIndex];
    if (!q || !q.options || !Array.isArray(q.options) || q.options.length === 0) {
      q = DEFAULT_QUESTIONS[this.currentQuestionIndex] || DEFAULT_QUESTIONS[0];
    }
    const totalQ = dataStore.questions ? dataStore.questions.length : 5;

    // Tracker & Dots
    this.quizTracker.textContent = `Question ${this.currentQuestionIndex + 1} of ${totalQ}`;
    this.quizDots.innerHTML = '';
    for (let i = 0; i < totalQ; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i < this.currentQuestionIndex) dot.classList.add('completed');
      if (i === this.currentQuestionIndex) dot.classList.add('active');
      this.quizDots.appendChild(dot);
    }

    // Question Text
    this.quizQuestionText.textContent = q.question;

    // Reset Feedback & Next Button
    this.quizFeedback.className = 'feedback-banner';
    this.quizFeedback.textContent = '';
    this.btnNextQuestion.style.display = 'none';
    this.btnNextQuestion.classList.remove('show');

    // Render Options
    this.quizOptionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="option-badge">${letters[index]}</span>
        <span>${optText.replace(/^[A-D]\)\s*/, '')}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleOptionSelect(index, q.correctIndex, btn);
      });

      this.quizOptionsContainer.appendChild(btn);
    });
  }

  handleOptionSelect(selectedIndex, correctIndex, buttonEl) {
    const optionsContainer = this.quizOptionsContainer;
    const feedbackEl = this.quizFeedback;
    const nextBtnEl = this.btnNextQuestion;
    
    const allBtns = Array.from(optionsContainer.querySelectorAll('.option-btn'));
    const targetBtn = buttonEl || allBtns[selectedIndex];

    if (selectedIndex === correctIndex) {
      try { audio.playSuccess(); } catch(e){}
      if (targetBtn) targetBtn.classList.add('correct');
      allBtns.forEach(b => b.style.pointerEvents = 'none');

      if (typeof particleSystem !== 'undefined' && particleSystem && targetBtn) {
        try {
          const rect = targetBtn.getBoundingClientRect();
          particleSystem.triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
        } catch(e){}
      }

      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <strong>Correct! 😌💗</strong><br>
          Okay... you know me better than I expected.
        `;
        feedbackEl.className = 'feedback-banner success show';
      }

      if (nextBtnEl) {
        nextBtnEl.classList.add('show');
        nextBtnEl.style.display = 'flex';
      }

      const cardContainer = document.querySelector('.glass-card');
      if (cardContainer) {
        setTimeout(() => {
          cardContainer.scrollTo({ top: cardContainer.scrollHeight, behavior: 'smooth' });
        }, 100);
      }

    } else {
      try { audio.playError(); } catch(e){}
      if (targetBtn) {
        targetBtn.classList.add('wrong');
        setTimeout(() => {
          targetBtn.classList.remove('wrong');
        }, 500);
      }

      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <strong>Hmm... suspicious 👀</strong><br>
          Try again, Pragaaa 😂
        `;
        feedbackEl.className = 'feedback-banner error show';
      }

      const cardContainer = document.querySelector('.glass-card');
      if (cardContainer) {
        setTimeout(() => {
          cardContainer.scrollTo({ top: cardContainer.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    }
  }

  // --- SCREEN 3: Unlocking Sequence ---
  startUnlockingSequence() {
    this.clearUnlockInterval();
    this.renderScreen('screen-unlocking');
    this.unlockProgressBar.style.width = '0%';
    this.unlockPercent.textContent = '░░░░░░░░░░ 0%';
    this.btnOpenSecret.style.display = 'none';

    let progress = 0;
    this.unlockInterval = setInterval(() => {
      progress += 2;
      if (progress > 100) progress = 100;

      this.unlockProgressBar.style.width = `${progress}%`;
      const filledBlocks = Math.floor(progress / 10);
      const emptyBlocks = 10 - filledBlocks;
      const blockStr = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
      this.unlockPercent.textContent = `${blockStr} ${progress}%`;

      if (progress % 20 === 0) {
        audio.playTick(1 + progress / 200);
      }

      if (progress >= 100) {
        this.clearUnlockInterval();
        audio.playSuccess();
        setTimeout(() => {
          this.btnOpenSecret.style.display = 'flex';
        }, 300);
      }
    }, 40);
  }

  // --- SCREEN 4: Secret Message Reveal ---
  startSecretMessageReveal() {
    this.clearSecretRevealTimer();
    this.renderScreen('screen-secret');
    this.letterLinesContainer.innerHTML = '';
    this.heartTapContainer.style.display = 'none';

    const lines = dataStore.secretLines || DEFAULT_SECRET_LINES;
    let lineIdx = 0;

    const revealNextLine = () => {
      if (lineIdx >= lines.length) {
        this.secretRevealTimeout = setTimeout(() => {
          this.heartTapContainer.style.display = 'flex';
          this.heartTapContainer.style.animation = 'zoomIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }, 500);
        return;
      }

      const lineText = lines[lineIdx];
      const p = document.createElement('span');
      p.className = 'line-item';

      if (lineIdx === 0) {
        p.classList.add('salutation');
      } else if (lineText.includes('special') || lineText.includes('realize')) {
        p.classList.add('highlight');
      }

      p.textContent = lineText;
      this.letterLinesContainer.appendChild(p);

      setTimeout(() => {
        p.classList.add('visible');
        audio.playTick(1.2);
      }, 50);

      lineIdx++;
      this.secretRevealTimeout = setTimeout(revealNextLine, 1200);
    };

    revealNextLine();
  }

  // --- INTERACTIVE STORY ENGINE ---
  startInteractiveStory() {
    this.clearStoryTimers();
    this.storyOverlay.classList.add('active');
    this.runStoryWaitPhase();
  }

  closeStoryOverlay() {
    this.clearStoryTimers();
    this.storyOverlay.classList.remove('active');
    this.openFinalModal();
  }

  openFinalModal() {
    if (!this.modalFinal) return;
    this.modalFinal.classList.add('active');
    audio.playRevealFanfare();
    if (particleSystem) {
      particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 100);
    }
  }

  closeFinalModal() {
    if (this.modalFinal) {
      this.modalFinal.classList.remove('active');
    }
  }

  showStoryPhase(phaseKey) {
    if (this.storyOverlay) {
      this.storyOverlay.scrollTop = 0;
    }
    const keyMap = {
      'finalCard': 'final-card',
      'easterEgg': 'easter-egg',
      'final-card': 'finalCard',
      'easter-egg': 'easterEgg'
    };
    Object.keys(this.storyPhases).forEach(k => {
      const el = this.storyPhases[k];
      if (!el) return;
      if (k === phaseKey || keyMap[k] === phaseKey) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Phase 1: Wait... Something is coming for you...
  runStoryWaitPhase() {
    this.showStoryPhase('wait');
    this.addStoryTimer(() => {
      this.runStoryIntroPhase();
    }, 1800);
  }

  // Phase 2: Dot -> Heart grow -> Name typewriter
  runStoryIntroPhase() {
    this.showStoryPhase('intro');
    const heartEl = document.getElementById('story-growing-heart');
    const nameEl = document.getElementById('story-typewriter-name');
    
    heartEl.textContent = '♡';
    heartEl.className = 'story-growing-heart';
    nameEl.textContent = '';

    this.addStoryTimer(() => {
      heartEl.textContent = '♥';
      heartEl.classList.add('grow-1');
      audio.playTick(1.2);
    }, 600);

    this.addStoryTimer(() => {
      heartEl.textContent = '💗';
      heartEl.classList.add('grow-2');
      audio.playSuccess();
    }, 1200);

    // Typewriter name "Pragaaa 💗"
    this.addStoryTimer(() => {
      const fullText = "Pragaaa 💗";
      let charIdx = 0;
      this.typewriterInterval = setInterval(() => {
        nameEl.textContent = fullText.slice(0, charIdx + 1);
        audio.playTick(1.4);
        charIdx++;
        if (charIdx >= fullText.length) {
          if (this.typewriterInterval) clearInterval(this.typewriterInterval);
          this.typewriterInterval = null;
          this.addStoryTimer(() => {
            this.runStoryTeaserPhase();
          }, 1200);
        }
      }, 140);
    }, 1800);
  }

  // Phase 3: "I have something to tell you..." Teaser
  runStoryTeaserPhase() {
    this.showStoryPhase('teaser');
  }

  // Phase 4: Story Sentences
  runStorySentencesPhase() {
    this.showStoryPhase('sentences');
    this.currentSentenceIdx = 0;
    this.renderCurrentSentence();
  }

  renderCurrentSentence() {
    const sentences = (dataStore.storyData && dataStore.storyData.storySentences) || DEFAULT_STORY_DATA.storySentences;
    const textEl = document.getElementById('story-sentence-text');
    const iconEl = document.getElementById('story-sentence-icon');
    const icons = ['🌱', '🌷', '☀️', '🤍'];

    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      iconEl.textContent = icons[this.currentSentenceIdx % icons.length];
      textEl.textContent = sentences[this.currentSentenceIdx];
      textEl.style.transition = 'all 0.5s ease';
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
      audio.playTick(1.2);

      if (particleSystem) {
        particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight * 0.4, 20);
      }
    }, 200);
  }

  advanceSentence() {
    const sentences = (dataStore.storyData && dataStore.storyData.storySentences) || DEFAULT_STORY_DATA.storySentences;
    this.currentSentenceIdx++;

    if (this.currentSentenceIdx < sentences.length) {
      this.renderCurrentSentence();
    } else {
      this.runStoryMemoriesPhase();
    }
  }

  // Phase 5: Memories Polaroid Gallery
  runStoryMemoriesPhase() {
    this.showStoryPhase('memories');
    const grid = document.getElementById('memory-cards-grid');
    grid.innerHTML = '';

    const memories = (dataStore.storyData && dataStore.storyData.memories) || DEFAULT_STORY_DATA.memories;
    memories.forEach((mem, i) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.style.animation = `zoomIn 0.5s ease ${i * 0.2}s forwards`;
      card.innerHTML = `
        <div class="polaroid-img-wrapper">
          <img src="${mem.img}" alt="${mem.title}" class="polaroid-img">
        </div>
        <div class="polaroid-caption">${mem.caption}</div>
      `;
      grid.appendChild(card);
    });

    if (particleSystem) {
      particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 40);
    }
  }

  // Phase 6: Final Dark Quote
  runStoryQuotePhase() {
    this.showStoryPhase('quote');
    const q1 = document.getElementById('story-quote-1');
    const q2 = document.getElementById('story-quote-2');
    const nextBtn = document.getElementById('btn-story-quote-next');

    const sData = (dataStore && dataStore.storyData) || DEFAULT_STORY_DATA;
    q1.textContent = sData.finalQuotePart1 || DEFAULT_STORY_DATA.finalQuotePart1;
    q2.textContent = sData.finalQuotePart2 || DEFAULT_STORY_DATA.finalQuotePart2;

    q1.classList.remove('visible');
    q2.classList.remove('visible');
    if (nextBtn) {
      nextBtn.style.opacity = '0.4';
      nextBtn.style.pointerEvents = 'auto';
    }

    this.addStoryTimer(() => {
      q1.classList.add('visible');
      audio.playTick(1.1);
    }, 400);

    this.addStoryTimer(() => {
      q2.classList.add('visible');
      audio.playSuccess();
      if (nextBtn) {
        nextBtn.style.opacity = '1';
      }
      if (particleSystem) {
        particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 50);
      }
    }, 1800);

    this.addStoryTimer(() => {
      this.runStoryFinalCardPhase();
    }, 6000);
  }

  // Phase 7: Final Handwritten Card (Step 7)
  runStoryFinalCardPhase() {
    this.clearStoryTimers();
    this.showStoryPhase('final-card');
    const sData = (dataStore && dataStore.storyData) || DEFAULT_STORY_DATA;
    const finalBody = document.getElementById('story-final-body');
    const finalSig = document.getElementById('story-final-sig');
    const easterEggBtn = document.getElementById('btn-story-easter-egg');

    if (finalBody) finalBody.textContent = sData.finalMessageBody || DEFAULT_STORY_DATA.finalMessageBody;
    if (finalSig) finalSig.textContent = sData.finalSignature || DEFAULT_STORY_DATA.finalSignature;
    if (easterEggBtn && easterEggBtn.querySelector('span')) {
      easterEggBtn.querySelector('span').textContent = sData.easterEggBtnText || DEFAULT_STORY_DATA.easterEggBtnText;
    }
  }

  // Phase 8: Easter Egg Surprise (Step 8)
  runStoryEasterEggPhase() {
    this.clearStoryTimers();
    this.showStoryPhase('easter-egg');
    const sData = (dataStore && dataStore.storyData) || DEFAULT_STORY_DATA;
    const easterEggText = document.getElementById('story-easter-egg-text');
    if (easterEggText) {
      easterEggText.textContent = sData.easterEggMsg || DEFAULT_STORY_DATA.easterEggMsg;
    }
    audio.playRevealFanfare();
    if (particleSystem) {
      particleSystem.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 100);
    }
  }

  // --- CUSTOMIZER MODAL LOGIC ---
  openCustomizerModal() {
    this.customizerQuestionsList.innerHTML = '';
    
    dataStore.questions.forEach((q, idx) => {
      const qBox = document.createElement('div');
      qBox.className = 'form-group';
      qBox.innerHTML = `
        <label>Question ${idx + 1}:</label>
        <input type="text" id="cust-q-${idx}" value="${q.question.replace(/"/g, '&quot;')}">
      `;
      this.customizerQuestionsList.appendChild(qBox);
    });

    this.customSecretLines.value = dataStore.secretLines.join('\n');
    this.customFinalTitle.value = dataStore.finalSurprise.title;
    this.customFinalMsg.value = dataStore.finalSurprise.message;
    this.customFinalSig.value = dataStore.finalSurprise.signature;

    this.modalCustomizer.classList.add('active');
  }

  saveCustomizerData() {
    const newQuestions = dataStore.questions.map((q, idx) => {
      const input = document.getElementById(`cust-q-${idx}`);
      return {
        ...q,
        question: input ? input.value : q.question
      };
    });

    const lines = this.customSecretLines.value.split('\n').filter(l => l.trim().length > 0);
    const finalSurprise = {
      title: this.customFinalTitle.value || DEFAULT_FINAL_SURPRISE.title,
      message: this.customFinalMsg.value || DEFAULT_FINAL_SURPRISE.message,
      signature: this.customFinalSig.value || DEFAULT_FINAL_SURPRISE.signature
    };

    dataStore.saveData(newQuestions, lines.length ? lines : DEFAULT_SECRET_LINES, finalSurprise, dataStore.storyData);
    this.renderQuestion();
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
