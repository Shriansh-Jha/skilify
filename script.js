tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            hindi: ['Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'sans-serif'],
          },
          colors: {
            khan: {
              50: '#eefbf4',
              100: '#d7f6e4',
              500: '#11a368',
              600: '#0b8251',
              700: '#096741',
              800: '#0a5235',
              900: '#073e28',
            }
          }
        }
      }
    }

// Default Courses Repository
    const DEFAULT_COURSES = [
      {
        id: "course-quantum-101",
        courseTitle: "Quantum Computing & Information",
        topic: "Quantum Computing",
        description: "Explore superposition, quantum entanglement, qubits, and quantum logic gates.",
        units: [
          {
            unitNumber: 1,
            unitTitle: "Unit 1: Fundamentals of Quantum Bits",
            lessons: [
              {
                lessonNumber: 1,
                title: "Classical Bits vs. Qubits",
                summary: "In classical computing, the fundamental unit of information is a bit, representing either 0 or 1. A quantum bit (qubit), however, leverages quantum mechanics to exist in a linear combination of states.",
                youtubeSearchQuery: "Quantum Computing Qubits explained 3Blue1Brown",
                recommendedVideoTitle: "3Blue1Brown - Quantum Computing",
                quiz: [
                  {
                    questionId: 1,
                    question: "What state property allows a qubit to hold combinations of 0 and 1 simultaneously?",
                    options: ["Superposition", "Thermal Decoherence", "Electromagnetic Radiation", "Classical Binary Shift"],
                    correctIndex: 0,
                    explanation: "Superposition allows a qubit to exist in a linear combination of basis states |0⟩ and |1⟩ until measured."
                  },
                  {
                    questionId: 2,
                    question: "What happens when a qubit in superposition is measured?",
                    options: ["It duplicates itself", "It collapses to a definitive classical 0 or 1", "It stays in superposition forever", "It gains energy"],
                    correctIndex: 1,
                    explanation: "Measurement forces the quantum wavefunction to collapse into one of its definite basis states."
                  }
                ]
              },
              {
                lessonNumber: 2,
                title: "Quantum Entanglement",
                summary: "Entanglement is a phenomenon where quantum particles become inextricably linked, such that measuring one instantly dictates the state of another regardless of distance.",
                youtubeSearchQuery: "Quantum Entanglement Explained Veritasium",
                recommendedVideoTitle: "Veritasium - Spooky Action at a Distance",
                quiz: [
                  {
                    questionId: 1,
                    question: "Einstein famously referred to Quantum Entanglement as:",
                    options: ["Instantaneous Relay", "Spooky Action at a Distance", "Wave-Particle Duality", "The Uncertainty Illusion"],
                    correctIndex: 1,
                    explanation: "Einstein doubted non-local hidden variables and colorfully dubbed entanglement 'spooky action at a distance'."
                  }
                ]
              }
            ]
          },
          {
            unitNumber: 2,
            unitTitle: "Unit 2: Quantum Gates & Circuits",
            lessons: [
              {
                lessonNumber: 1,
                title: "The Hadamard Gate (H-Gate)",
                summary: "The Hadamard gate is the most fundamental quantum single-qubit gate. It transforms a qubit from a definite basis state into an equal superposition state.",
                youtubeSearchQuery: "Hadamard Gate Quantum Computing IBM Quantum",
                recommendedVideoTitle: "IBM Quantum - Logic Gates",
                quiz: [
                  {
                    questionId: 1,
                    question: "Applying a Hadamard Gate to a ground state qubit |0⟩ results in:",
                    options: ["A state of definite |1⟩", "An equal superposition (|0⟩ + |1⟩) / √2", "Complete qubit loss", "A classical bit inversion"],
                    correctIndex: 1,
                    explanation: "The Hadamard transformation maps standard basis states into equal superposition states."
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "course-web-dev",
        courseTitle: "Modern Full-Stack Web Development",
        topic: "Web Development",
        description: "Master modern HTML5, Tailwind CSS, JavaScript async programming, and API architecture.",
        units: [
          {
            unitNumber: 1,
            unitTitle: "Unit 1: Modern Frontend Foundations",
            lessons: [
              {
                lessonNumber: 1,
                title: "DOM Manipulation & Async JavaScript",
                summary: "Learn how the browser Document Object Model (DOM) connects JavaScript to HTML, and how promises and async/await handle network data fetching smoothly.",
                youtubeSearchQuery: "JavaScript Async Await Promises Fireship",
                recommendedVideoTitle: "Fireship - Async JavaScript in 100 Seconds",
                quiz: [
                  {
                    questionId: 1,
                    question: "Which keyword is used to pause execution until a Promise resolves inside an async function?",
                    options: ["yield", "await", "defer", "pause"],
                    correctIndex: 1,
                    explanation: "The 'await' expression pauses the execution of an async function until the Promise is settled."
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // Global Application State
    let state = {
      courses: [],
      activeCourseId: "",
      completedLessons: {}, // { courseId_unitIdx_lessonIdx: true }
      lessonQuestionProgress: {}, // { courseId_unitIdx_lessonIdx_qIdx: { selectedIndex, submitted } }
      currentActiveLesson: null // Reference for open modal
    };

    let lessonQuizState = {
      questions: [],
      currentIndex: 0,
      selectedIndex: null,
      submitted: false,
      mistakes: []
    };

    const soundEffects = {};

    function playSound(name) {
      const sound = soundEffects[name] || (soundEffects[name] = new Audio(`sounds/${name}.mp3`));
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Browsers can block playback until the first user interaction.
      });
    }

    // Initialize App Data
    window.onload = function() {
      loadStateFromStorage();
      applySavedTheme();
      renderCourseSelector();
      renderCurrentCourseTree();
      updateMasterPromptPreview();
      setupScrollHeader();
      setupGoogleAuth();
    };

    function setupScrollHeader() {
      const scrollViewport = document.querySelector('body > main');
      const header = document.querySelector('body > header');
      if (!scrollViewport || !header) return;

      if (window.matchMedia('(max-width: 767px)').matches) return;

      const updateHeaderState = () => {
        header.classList.toggle('is-condensed', scrollViewport.scrollTop > 32);
      };

      scrollViewport.addEventListener('scroll', updateHeaderState, { passive: true });
      updateHeaderState();
    }

    function setupGoogleAuth() {
      const loginButton = document.getElementById('google-login-btn');
      const profile = document.getElementById('user-profile');
      const profileButton = document.getElementById('user-profile-btn');
      const profileDropdown = document.getElementById('profile-dropdown');
      const signoutButton = document.getElementById('signout-btn');
      const profileImage = document.getElementById('user-pfp');

      if (!loginButton || !profile || !profileButton || !profileDropdown || !signoutButton || !profileImage) return;

      loginButton.classList.remove('hidden');

      loginButton.addEventListener('click', async () => {
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          await auth.signInWithPopup(provider);
        } catch (error) {
          if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Unable to sign in with Google.', 'error');
          }
        }
      });

      profileButton.addEventListener('click', event => {
        event.stopPropagation();
        const isHidden = profileDropdown.classList.toggle('hidden');
        profileButton.setAttribute('aria-expanded', String(!isHidden));
      });

      document.addEventListener('click', () => {
        profileDropdown.classList.add('hidden');
        profileButton.setAttribute('aria-expanded', 'false');
      });

      signoutButton.addEventListener('click', async () => {
        try {
          await auth.signOut();
          showToast('Signed out successfully.', 'info');
        } catch (error) {
          showToast('Unable to sign out.', 'error');
        }
      });

      auth.onAuthStateChanged(user => {
        const isSignedIn = Boolean(user);
        cloudSyncReady = false;
        if (!isSignedIn) cloudSyncInProgress = false;
        loginButton.classList.toggle('hidden', isSignedIn);
        profile.classList.toggle('hidden', !isSignedIn);
        if (isSignedIn) {
          profileImage.src = user.photoURL || 'icon.png';
          profileImage.alt = user.displayName ? `${user.displayName} profile` : 'Profile';
        } else {
          profileImage.removeAttribute('src');
        }
        if (user) syncUserData(user);
      });
    }

    function loadStateFromStorage() {
      try {
        const savedCourses = localStorage.getItem('skilify_courses');
        const savedProgress = localStorage.getItem('skilify_progress');

        if (savedCourses) {
          state.courses = JSON.parse(savedCourses);
        } else {
          state.courses = DEFAULT_COURSES;
          saveCoursesToStorage();
        }

        if (savedProgress) {
          const progressData = JSON.parse(savedProgress);
          state.completedLessons = progressData.completedLessons || progressData;
          state.lessonQuestionProgress = progressData.lessonQuestionProgress || {};
        }

        state.activeCourseId = state.courses[0]?.id || "";
      } catch (err) {
        console.error("Error loading saved state", err);
        state.courses = DEFAULT_COURSES;
        state.activeCourseId = DEFAULT_COURSES[0].id;
      }
    }

    function saveCoursesToStorage() {
      localStorage.setItem('skilify_courses', JSON.stringify(state.courses));
      saveUserDataToCloud();
    }
function saveProgressToStorage() {
  localStorage.setItem('skilify_progress', JSON.stringify({
    completedLessons: state.completedLessons,
    lessonQuestionProgress: state.lessonQuestionProgress
  }));
  saveUserDataToCloud();
}

let cloudSyncInProgress = false;
let cloudSyncReady = false;

function getCloudData() {
  return {
    courses: state.courses,
    activeCourse: state.activeCourseId || null,
    completedLessons: state.completedLessons,
    questionProgress: state.lessonQuestionProgress,
    updatedAt: Date.now()
  };
}

async function syncUserData(user) {
  if (!user || cloudSyncInProgress) return;
  cloudSyncInProgress = true;

  try {
    const userSnapshot = await db.collection('users').doc(user.uid).get();

    const cloudData = userSnapshot.exists
      ? userSnapshot.data().appData
      : null;

    if (cloudData) {
      if (Array.isArray(cloudData.courses) && cloudData.courses.length) {
        state.courses = cloudData.courses;
      }

      state.activeCourseId =
        cloudData.activeCourse ||
        cloudData.activeCourseId ||
        state.courses[0]?.id ||
        '';

      state.completedLessons = cloudData.completedLessons || {};

      state.lessonQuestionProgress =
        cloudData.questionProgress ||
        cloudData.lessonQuestionProgress ||
        {};

      localStorage.setItem(
        'skilify_courses',
        JSON.stringify(state.courses)
      );

      localStorage.setItem(
        'skilify_progress',
        JSON.stringify({
          completedLessons: state.completedLessons,
          lessonQuestionProgress: state.lessonQuestionProgress
        })
      );

            renderCourseSelector();
      renderCurrentCourseTree();
    }

    cloudSyncReady = true;

    if (!cloudData) {
      cloudSyncInProgress = false;
      await saveCloudData();
      cloudSyncInProgress = true;
    }

  } catch (error) {
    console.error('Cloud sync failed', error);
  } finally {
    cloudSyncInProgress = false;
  }
}
    async function saveCloudData() {
      const user = auth.currentUser;
      if (!user || !cloudSyncReady || cloudSyncInProgress) return;

      try {
        const appData = getCloudData();
        await db.collection('users').doc(user.uid).set({ appData }, { merge: true });
      } catch (error) {
        console.error('Cloud save failed', error);
      }
    }

    async function saveUserDataToCloud() {
      await saveCloudData();
    }

    function switchTab(tabId) {
      playSound('ui_tap');
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-khan-500', 'bg-slate-200/60');
        btn.classList.add('text-slate-400');
      });
      document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.remove('text-khan-500', 'text-slate-600');
        btn.classList.toggle('text-khan-500', isActive);
        btn.classList.toggle('text-slate-600', !isActive);
        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
        btn.style.setProperty('color', isActive ? '#11a368' : '#475569', 'important');
      });

      const activeTab = document.getElementById(`tab-${tabId}`);
      if (activeTab) activeTab.classList.remove('hidden');

      const navBtn = document.getElementById(`nav-${tabId}`);
      if (navBtn) {
        navBtn.classList.remove('text-slate-400');
        navBtn.classList.add('text-khan-500', 'bg-slate-200/60');
      }

      if (tabId === 'settings') {
        renderCourseLibraryList();
      }
      if (tabId === 'practice') {
        renderPracticeUI();
      }
    }

    function renderCourseSelector() {
      const selectEl = document.getElementById('course-select');
      if (selectEl) selectEl.innerHTML = '';

      // Populate both header (if present) and sidebar course selects
      const sidebarSelect = document.getElementById('sidebar-course-select');
      if (sidebarSelect) sidebarSelect.innerHTML = '';

      state.courses.forEach(course => {
        const opt = document.createElement('option');
        opt.value = course.id;
        opt.textContent = course.courseTitle;
        if (course.id === state.activeCourseId) opt.selected = true;
        if (selectEl) selectEl.appendChild(opt);

        if (sidebarSelect) {
          const sOpt = opt.cloneNode(true);
          sidebarSelect.appendChild(sOpt);
          if (course.id === state.activeCourseId) sidebarSelect.value = course.id;
        }
      });

      updateCourseHeaderMeta();
    }

    function changeCourse(courseId) {
      playSound('ui_tap');
      state.activeCourseId = courseId;
      updateCourseHeaderMeta();
      renderCurrentCourseTree();
      renderCourseSelector();
      saveUserDataToCloud();
    }

    function getActiveCourse() {
      return state.courses.find(c => c.id === state.activeCourseId) || state.courses[0];
    }

    function updateCourseHeaderMeta() {
      const course = getActiveCourse();
      if (!course) return;

      // Header title (if header selector removed) - keep in sync
      const headerTitle = document.getElementById('header-course-title');
      if (headerTitle) headerTitle.textContent = course.courseTitle || course.topic || 'Untitled Course';

      document.getElementById('course-desc').textContent = course.description || `Explore ${course.topic} through structured lessons and practice.`;
      
      // Calculate progress
      let totalLessons = 0;
      let completedCount = 0;

      course.units.forEach((unit, uIdx) => {
        unit.lessons.forEach((_, lIdx) => {
          totalLessons++;
          const key = `${course.id}_${uIdx}_${lIdx}`;
          if (state.completedLessons[key]) completedCount++;
        });
      });

      const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      document.getElementById('course-progress-percent').textContent = `${percent}%`;
      document.getElementById('course-progress-bar').style.width = `${percent}%`;
      document.getElementById('course-completed-count').textContent = `${completedCount} / ${totalLessons} Lessons`;
      
      const badge = document.getElementById('course-mastery-badge');
      if (percent === 100) {
        badge.textContent = "👑 Mastered";
        badge.className = "bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider";
      } else {
        badge.textContent = "In Progress";
        badge.className = "bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider";
      }
    }

    function renderCurrentCourseTree() {
      const container = document.getElementById('learning-tree-container');
      const course = getActiveCourse();

      if (!course || !course.units || course.units.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-500">No units found for this course.</div>`;
        return;
      }

      let html = '';

      course.units.forEach((unit, uIdx) => {
        html += `
          <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow relative overflow-hidden">
            <!-- Unit Header -->
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-khan-500 bg-khan-500/10 px-3 py-1 rounded-full border border-khan-500/20">
                  Unit ${unit.unitNumber || (uIdx + 1)}
                </span>
                <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">${escapeHtml(unit.unitTitle)}</h3>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg">
                <i class="fa-solid fa-layer-group"></i>
              </div>
            </div>

            <!-- Path Nodes (Khan / Duolingo Curved Map Effect) -->
            <div class="relative flex flex-col items-center space-y-8 py-2">
              <!-- Vertical Connecting Path Line -->
              <div class="absolute top-4 bottom-4 w-1.5 bg-slate-200 rounded-full z-0"></div>
        `;

        unit.lessons.forEach((lesson, lIdx) => {
          const lessonKey = `${course.id}_${uIdx}_${lIdx}`;
          const isCompleted = !!state.completedLessons[lessonKey];
          
          // S-curve offset logic for node map feel
          const offsetClass = (lIdx % 2 === 0) ? '-translate-x-6 sm:-translate-x-12' : 'translate-x-6 sm:translate-x-12';

          html += `
            <div class="relative z-10 flex flex-col items-center transform ${offsetClass}">
              <button onclick="openLessonModal(${uIdx}, ${lIdx})" 
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow ${
                  isCompleted 
                    ? 'bg-gradient-to-tr from-khan-600 to-emerald-400 text-white shadow-khan-600/40 border-4 border-slate-100' 
                    : 'bg-white text-slate-800 border-2 border-slate-200 hover:border-khan-500'
                }">
                <i class="fa-solid ${isCompleted ? 'fa-crown text-amber-400' : 'fa-play text-khan-500'}"></i>
              </button>

              <div class="mt-3 text-center max-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <div class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Lesson ${lesson.lessonNumber || (lIdx + 1)}</div>
                <div class="text-xs font-semibold text-slate-800 line-clamp-1">${escapeHtml(lesson.title)}</div>
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    function openLessonModal(unitIdx, lessonIdx) {
      playSound('start_lesson');
      const course = getActiveCourse();
      const unit = course.units[unitIdx];
      const lesson = unit.lessons[lessonIdx];

      state.currentActiveLesson = { courseId: course.id, unitIdx, lessonIdx, lesson };

      document.getElementById('modal-unit-title').textContent = `${unit.unitTitle} • Lesson ${lesson.lessonNumber || (lessonIdx + 1)}`;
      document.getElementById('modal-lesson-title').textContent = lesson.title;
      document.getElementById('modal-lesson-summary').textContent = lesson.summary;

      // YouTube Video Embed URL Construction
      const rawQuery = lesson.youtubeSearchQuery || `${course.topic} ${lesson.title}`;
      const query = encodeURIComponent(rawQuery);
      document.getElementById('modal-video-query').textContent = rawQuery;
      document.getElementById('modal-video-channel').textContent = lesson.recommendedVideoTitle || "Educational Video";
      document.getElementById('modal-youtube-link').href = `https://www.youtube.com/results?search_query=${query}`;
      
      // Prefer the privacy-friendly embed endpoint and accept either an ID or a YouTube URL.
      const iframe = document.getElementById('modal-youtube-iframe');
      const fallback = document.getElementById('modal-video-fallback');
      const fallbackTitle = document.getElementById('modal-video-fallback-title');
      const fallbackLink = document.getElementById('modal-video-fallback-link');
      const videoId = getYouTubeVideoId(lesson.youtubeVideoId);
      fallback.classList.add('hidden');
      iframe.classList.remove('hidden');
      fallbackLink.href = videoId
        ? `https://video.link/w/${encodeURIComponent(videoId)}`
        : document.getElementById('modal-youtube-link').href;
      fallbackLink.innerHTML = videoId
        ? 'Watch on VideoLink <i class="fa-solid fa-arrow-up-right-from-square"></i>'
        : 'Watch on YouTube <i class="fa-solid fa-arrow-up-right-from-square"></i>';
      iframe.onload = () => {
        if (iframe.src) fallback.classList.add('hidden');
      };
      iframe.onerror = () => showVideoFallback('This video cannot be embedded here.');
      if (videoId) {
        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&playsinline=1`;
      } else {
        // A search results URL is not a valid player source, so use the external result link.
        iframe.src = "";
        iframe.classList.add('hidden');
        showVideoFallback('Choose a video from the YouTube search results.');
      }

      // Render Practice Quiz
      renderQuizQuestions(lesson.quiz || []);

      // Check existing status
      const lessonKey = `${course.id}_${unitIdx}_${lessonIdx}`;
      const isDone = !!state.completedLessons[lessonKey];
      updateModalCompletionState(isDone);

      document.getElementById('lesson-modal').classList.remove('hidden');
      setLessonSection('overview');
    }

    function getYouTubeVideoId(value) {
      if (!value) return '';
      const text = String(value).trim();
      if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
      try {
        const url = new URL(text);
        if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
        if (url.hostname.endsWith('youtube.com')) {
          return url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop() || '';
        }
      } catch (error) {
        return '';
      }
      return '';
    }

    function showVideoFallback(message) {
      const fallback = document.getElementById('modal-video-fallback');
      const title = document.getElementById('modal-video-fallback-title');
      if (title) title.textContent = message;
      if (fallback) fallback.classList.remove('hidden');
    }

    function setLessonSection(sectionId) {
      document.querySelectorAll('.lesson-section').forEach(section => {
        section.classList.toggle('active', section.id === `lesson-section-${sectionId}`);
      });
      document.querySelectorAll('.lesson-step').forEach(step => {
        step.classList.toggle('active', step.dataset.lessonSection === sectionId);
      });
    }

    function closeLessonModal() {
      playSound('ui_tap');
      document.getElementById('lesson-modal').classList.add('hidden');
      const iframe = document.getElementById('modal-youtube-iframe');
      iframe.src = ""; // Stop video playback
      iframe.classList.remove('hidden');
      state.currentActiveLesson = null;
    }

    function renderQuizQuestions(quizList) {
      const container = document.getElementById('quiz-container');
      
      if (!quizList || quizList.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-500 italic">No exercise questions provided for this lesson. Read the summary above to complete!</div>`;
        return;
      }

      lessonQuizState = { questions: quizList, currentIndex: 0, selectedIndex: null, submitted: false, mistakes: [] };
      const savedQuestionIndex = quizList.findIndex((_, index) => {
        const progress = getQuestionProgress(index);
        return progress && !progress.submitted;
      });
      if (savedQuestionIndex >= 0) lessonQuizState.currentIndex = savedQuestionIndex;
      const savedProgress = getQuestionProgress(lessonQuizState.currentIndex);
      if (savedProgress) {
        lessonQuizState.selectedIndex = savedProgress.selectedIndex ?? null;
        lessonQuizState.submitted = Boolean(savedProgress.submitted);
      }
      renderCurrentLessonQuestion();
    }

    function getQuestionProgress(questionIndex) {
      if (!state.currentActiveLesson) return null;
      const { courseId, unitIdx, lessonIdx } = state.currentActiveLesson;
      return state.lessonQuestionProgress[`${courseId}_${unitIdx}_${lessonIdx}_${questionIndex}`] || null;
    }

    function saveCurrentQuestionProgress() {
      if (!state.currentActiveLesson) return;
      const { courseId, unitIdx, lessonIdx } = state.currentActiveLesson;
      const key = `${courseId}_${unitIdx}_${lessonIdx}_${lessonQuizState.currentIndex}`;
      state.lessonQuestionProgress[key] = {
        selectedIndex: lessonQuizState.selectedIndex,
        submitted: lessonQuizState.submitted,
        updatedAt: Date.now()
      };
      saveProgressToStorage();
    }

    function renderCurrentLessonQuestion() {
      const container = document.getElementById('quiz-container');
      const q = lessonQuizState.questions[lessonQuizState.currentIndex];
      if (!q) return;

      const isSubmitted = lessonQuizState.submitted;
      const selectedIdx = lessonQuizState.selectedIndex;
      const isCorrect = selectedIdx === q.correctIndex;
      const gradeClass = isCorrect ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-rose-100 border-rose-300 text-rose-800';
      const gradeText = isCorrect ? 'Correct!' : 'Not quite';
      const options = q.options.map((opt, optIdx) => {
        let resultClass = '';
        let iconClass = 'fa-regular fa-circle text-slate-400';
        if (isSubmitted && optIdx === q.correctIndex) {
          resultClass = 'bg-emerald-100 border-emerald-400';
          iconClass = 'fa-solid fa-circle-check text-emerald-500';
        } else if (isSubmitted && optIdx === selectedIdx) {
          resultClass = 'bg-rose-100 border-rose-400';
          iconClass = 'fa-solid fa-circle-xmark text-rose-500';
        } else if (!isSubmitted && optIdx === selectedIdx) {
          resultClass = 'bg-sky-100 border-sky-400';
          iconClass = 'fa-solid fa-circle-dot text-sky-500';
        }
        return `<button ${isSubmitted ? 'disabled' : ''} onclick="selectQuizAnswer(${optIdx})" id="quiz-opt-${lessonQuizState.currentIndex}-${optIdx}" class="quiz-option-btn w-full text-left p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 font-medium transition flex items-center justify-between ${resultClass}"><span>${escapeHtml(opt)}</span><i class="${iconClass} text-sm status-icon"></i></button>`;
      }).join('');

      container.innerHTML = `<div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-8 space-y-6">
        <div class="flex items-center justify-between gap-3"><span class="text-xs font-black uppercase tracking-wider text-slate-400">Question ${lessonQuizState.currentIndex + 1} of ${lessonQuizState.questions.length}</span><span class="text-xs font-bold text-slate-400">Choose one answer</span></div>
        <p class="text-lg sm:text-2xl font-extrabold text-slate-800">${escapeHtml(q.question)}</p>
        <div class="space-y-3">${options}</div>
        ${isSubmitted ? `<div class="p-4 rounded-xl border ${gradeClass}"><p class="font-black">${gradeText}</p><p class="mt-1 text-sm">${escapeHtml(q.explanation || 'Correct choice!')}</p></div>` : ''}
        <div class="flex justify-end gap-3">
          ${isSubmitted && lessonQuizState.currentIndex < lessonQuizState.questions.length - 1 ? `<button onclick="nextLessonQuestion()" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow">Next <i class="fa-solid fa-arrow-right ml-1"></i></button>` : (!isSubmitted ? `<button ${selectedIdx === null ? 'disabled' : ''} onclick="submitQuizAnswer()" class="px-5 py-2.5 bg-khan-500 hover:bg-khan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow">Submit <i class="fa-solid fa-check ml-1"></i></button>` : '')}
        </div>
      </div>`;
    }

    function selectQuizAnswer(selectedIdx) {
      if (lessonQuizState.submitted) return;
      lessonQuizState.selectedIndex = selectedIdx;
      playSound('ui_tap');
      saveCurrentQuestionProgress();
      renderCurrentLessonQuestion();
    }

    function submitQuizAnswer() {
      if (lessonQuizState.selectedIndex === null || lessonQuizState.submitted) return;
      lessonQuizState.submitted = true;
      saveCurrentQuestionProgress();
      const q = lessonQuizState.questions[lessonQuizState.currentIndex];
      const isCorrect = lessonQuizState.selectedIndex === q.correctIndex;
      if (!isCorrect) {
        lessonQuizState.mistakes.push({
          question: q.question,
          selected: q.options[lessonQuizState.selectedIndex],
          correct: q.options[q.correctIndex]
        });
      }
      playSound(isCorrect ? 'correct' : 'incorrect');
      showToast(isCorrect ? 'Correct answer!' : 'Not quite right. Try again or check explanation!', isCorrect ? 'success' : 'error');
      renderCurrentLessonQuestion();
      if (lessonQuizState.currentIndex === lessonQuizState.questions.length - 1) {
        setTimeout(completeLessonQuiz, 700);
      }
    }

    function nextLessonQuestion() {
      if (lessonQuizState.currentIndex >= lessonQuizState.questions.length - 1) {
        setLessonSection('complete');
        return;
      }
      lessonQuizState.currentIndex += 1;
      lessonQuizState.selectedIndex = null;
      lessonQuizState.submitted = false;
      saveCurrentQuestionProgress();
      renderCurrentLessonQuestion();
    }

    function completeLessonQuiz() {
      if (!state.currentActiveLesson) return;
      const { courseId, unitIdx, lessonIdx } = state.currentActiveLesson;
      const key = `${courseId}_${unitIdx}_${lessonIdx}`;
      state.completedLessons[key] = true;
      saveProgressToStorage();
      updateCourseHeaderMeta();
      renderCurrentCourseTree();
      updateModalCompletionState(true);
      renderQuizCompletion();
      playSound('lesson_complete');
      setLessonSection('complete');
    }

    function renderQuizCompletion() {
      const mistakesEl = document.getElementById('quiz-mistakes');
      if (!mistakesEl) return;
      const mistakes = lessonQuizState.mistakes;
      mistakesEl.innerHTML = mistakes.length === 0
        ? '<p class="quiz-mistakes-empty"><i class="fa-solid fa-star"></i> Perfect score. No mistakes!</p>'
        : `<p class="quiz-mistakes-title">Mistakes to review (${mistakes.length})</p>${mistakes.map(mistake => `<div class="quiz-mistake"><strong>${escapeHtml(mistake.question)}</strong><span>Your answer: ${escapeHtml(mistake.selected)}</span><br><span>Correct answer: ${escapeHtml(mistake.correct)}</span></div>`).join('')}`;
    }

    function updateModalCompletionState(isDone) {
      const statusText = document.getElementById('modal-completion-status');
      const btn = document.getElementById('modal-finish-btn');

      if (isDone) {
        statusText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i><span class="text-emerald-400 font-bold">Lesson Completed</span>`;
        btn.innerHTML = `<i class="fa-solid fa-rotate-right"></i><span>Mark as Uncompleted</span>`;
        btn.className = "px-6 py-2.5 bg-slate-200 hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition";
      } else {
        statusText.innerHTML = `<i class="fa-regular fa-circle text-slate-500"></i><span>Complete the exercise to mark complete.</span>`;
        btn.innerHTML = `<i class="fa-solid fa-check"></i><span>Mark Complete</span>`;
        btn.className = "px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow transition";
      }
    }

    function markLessonComplete() {
      if (!state.currentActiveLesson) return;

      const { courseId, unitIdx, lessonIdx } = state.currentActiveLesson;
      const key = `${courseId}_${unitIdx}_${lessonIdx}`;

      if (state.completedLessons[key]) {
        playSound('ui_tap');
        delete state.completedLessons[key];
        showToast("Lesson progress reset.", "info");
      } else {
        playSound('lesson_complete');
        state.completedLessons[key] = true;
        showToast("Lesson marked complete.", "success");
      }

      saveProgressToStorage();
      updateCourseHeaderMeta();
      renderCurrentCourseTree();
      updateModalCompletionState(!!state.completedLessons[key]);
    }

    // AI generation removed from v0.2 (user requested no external API keys).

    function loadSamplePromptSchema() {
      const sample = {
        id: "course-sample-import",
        courseTitle: "Intro to Financial Intelligence & Investing",
        topic: "Finance",
        description: "Understand assets vs liabilities, index funds, and compound interest.",
        units: [
          {
            unitNumber: 1,
            unitTitle: "Unit 1: The Wealth Formula",
            lessons: [
              {
                lessonNumber: 1,
                title: "Assets vs. Liabilities",
                summary: "An asset puts money in your pocket whether you work or not. A liability takes money out of your pocket. Real wealth is built by acquiring cash-flowing assets.",
                youtubeSearchQuery: "Assets vs Liabilities explained Simply",
                youtubeVideoId: "dQw4w9WgXcQ",
                recommendedVideoTitle: "Personal Finance 101",
                quiz: [
                  {
                    questionId: 1,
                    question: "Which of the following is defined as a income-generating asset?",
                    options: ["An index fund paying dividends", "A brand new luxury car purchase", "Credit card debt balance", "A phone subscription"],
                    correctIndex: 0,
                    explanation: "Dividend-paying index funds generate positive cash flow and build long-term value."
                  }
                ]
              }
            ]
          }
        ]
      };
      document.getElementById('import-json-textarea').value = JSON.stringify(sample, null, 2);
    }

    function importCourseFromTextarea() {
      const text = document.getElementById('import-json-textarea').value.trim();
      if (!text) return;

      try {
        const courseData = JSON.parse(text);
        if (!courseData.courseTitle || !courseData.units) {
          throw new Error("Missing courseTitle or units properties.");
        }

        courseData.id = courseData.id || "course-imported-" + Date.now();
        state.courses.unshift(courseData);
        state.activeCourseId = courseData.id;

        saveCoursesToStorage();
        renderCourseSelector();
        renderCurrentCourseTree();

        showToast("Course imported successfully!", "success");
        switchTab('dashboard');
      } catch (err) {
        showToast("Import failed: Invalid JSON schema format.", "error");
      }
    }

    function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('import-json-textarea').value = e.target.result;
        importCourseFromTextarea();
      };
      reader.readAsText(file);
    }

    function renderCourseLibraryList() {
      const container = document.getElementById('course-library-list');
      container.innerHTML = '';

      state.courses.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = "p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs";
        div.innerHTML = `
          <div>
            <span class="font-bold text-slate-900">${escapeHtml(c.courseTitle)}</span>
            <span class="text-slate-500 ml-2">(${c.units.length} Units)</span>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="changeCourse('${c.id}'); switchTab('dashboard');" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition">
              Select
            </button>
            <button onclick="editCourse('${c.id}')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-semibold transition">
              Edit
            </button>
            ${state.courses.length > 1 ? `
              <button onclick="deleteCourse('${c.id}')" class="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : ''}
          </div>
        `;
        container.appendChild(div);
      });
    }

    // Save key generation & restoration using LZ-String
    function generateSaveKey() {
      try {
        const scopeEl = document.querySelector('input[name="savekey-scope"]:checked');
        const scope = scopeEl ? scopeEl.value : 'active';

        let payload;
        if (scope === 'active') {
          const course = getActiveCourse();
          // filter progress keys to only this course
          const filteredProgress = {};
          Object.keys(state.completedLessons || {}).forEach(k => {
            if (k.startsWith((course.id || '') + '_')) filteredProgress[k] = state.completedLessons[k];
          });

          payload = {
            version: 1,
            exportedCourse: course,
            progress: filteredProgress,
            activeCourseId: course.id
          };
        } else {
          payload = {
            version: 1,
            courses: state.courses,
            progress: state.completedLessons,
            activeCourseId: state.activeCourseId
          };
        }

        const json = JSON.stringify(payload);
        // Use compressToEncodedURIComponent for compact, URL-safe string
        const compressed = LZString.compressToEncodedURIComponent(json);
        document.getElementById('save-key-output').value = compressed;
        showToast('Save key generated. Copy or transfer to another device.', 'info');
      } catch (e) {
        console.error(e);
        showToast('Failed to generate save key.', 'error');
      }
    }

    function copySaveKey() {
      const text = document.getElementById('save-key-output').value || '';
      if (!text) return showToast('No save key to copy.', 'error');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById('copy-savekey-btn');
          const old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = old, 2000);
          showToast('Save key copied to clipboard.', 'success');
        }).catch(() => showToast('Unable to copy save key.', 'error'));
      } else {
        const ta = document.getElementById('save-key-output');
        ta.select();
        try { document.execCommand('copy'); showToast('Save key copied.', 'success'); } catch (e) { showToast('Copy failed.', 'error'); }
      }
    }

    function applySaveKeyFromInput() {
      const v = (document.getElementById('save-key-input').value || '').trim();
      if (!v) return showToast('Paste a save key first.', 'error');
      try {
        const json = LZString.decompressFromEncodedURIComponent(v);
        if (!json) throw new Error('Decompression failed');
        const obj = JSON.parse(json);

        // Support exported single-course payloads (exportedCourse) and full-library payloads (courses)
        if (obj.exportedCourse) {
          const exported = obj.exportedCourse;
          // Replace existing course with same id or prepend
          const idx = state.courses.findIndex(c => c.id === exported.id);
          if (idx !== -1) {
            state.courses[idx] = exported;
          } else {
            state.courses.unshift(exported);
          }

          // Merge progress keys (only those provided)
          state.completedLessons = Object.assign({}, state.completedLessons || {}, obj.progress || {});
          state.activeCourseId = obj.activeCourseId || exported.id;

          saveCoursesToStorage();
          saveProgressToStorage();
          renderCourseSelector();
          renderCurrentCourseTree();
          showToast('Save key applied. Course added/updated.', 'success');
          return;
        }

        if (obj.courses) {
          state.courses = obj.courses;
          state.completedLessons = obj.progress || {};
          state.activeCourseId = obj.activeCourseId || (state.courses[0] && state.courses[0].id) || '';

          saveCoursesToStorage();
          saveProgressToStorage();
          renderCourseSelector();
          renderCurrentCourseTree();
          showToast('Save key applied. Library restored.', 'success');
          return;
        }

        throw new Error('Unsupported save key format');
      } catch (e) {
        console.error(e);
        showToast('Invalid or corrupted save key.', 'error');
      }
    }

    function editCourse(courseId) {
      const course = state.courses.find(c => c.id === courseId);
      if (!course) return;
      document.getElementById('import-json-textarea').value = JSON.stringify(course, null, 2);
      // Scroll to Import area and focus
      document.getElementById('import-json-textarea').scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Course loaded into Import area for editing.', 'info');
    }

    function deleteCourse(courseId) {
      state.courses = state.courses.filter(c => c.id !== courseId);
      if (state.activeCourseId === courseId) {
        state.activeCourseId = state.courses[0]?.id || "";
      }
      saveCoursesToStorage();
      renderCourseSelector();
      renderCurrentCourseTree();
      renderCourseLibraryList();
      showToast("Course removed from library.", "info");
    }

    function exportCurrentCourse() {
      const course = getActiveCourse();
      const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${course.topic.toLowerCase().replace(/\s+/g, '-')}-course.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function resetAllDataConfirm() {
      if (confirm("Are you sure you want to reset all progress and restore default sample courses?")) {
        localStorage.clear();
        state.courses = DEFAULT_COURSES;
        state.activeCourseId = DEFAULT_COURSES[0].id;
        state.completedLessons = {};
        saveCoursesToStorage();
        saveProgressToStorage();
        renderCourseSelector();
        renderCurrentCourseTree();
        showToast("Defaults & progress reset.", "info");
      }
    }
    
    // Practice mode state & helpers
    const practiceState = {
      running: false,
      questions: [],
      timeoutId: null
    };

    function formatPracticeUnitTitle(unit, index) {
      const title = String(unit.unitTitle || '').trim();
      if (/^Unit\s+\d+\s*:/i.test(title)) return title;
      return `Unit ${unit.unitNumber || (index + 1)}: ${title}`;
    }

    function updatePracticeScope() {
      const scopeSelect = document.getElementById('practice-scope-select');
      const unitSelect = document.getElementById('practice-unit-select');
      if (!scopeSelect || !unitSelect) return;
      unitSelect.classList.toggle('hidden', scopeSelect.value === 'course');
    }

    function renderPracticeUI() {
      const course = getActiveCourse();
      const unitSelect = document.getElementById('practice-unit-select');
      unitSelect.innerHTML = '';
      if (!course || !course.units) {
        updatePracticeScope();
        return;
      }
      course.units.forEach((u, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = formatPracticeUnitTitle(u, i);
        unitSelect.appendChild(opt);
      });
      // Pre-select unit based on last opened lesson if available
      const cu = (state.currentActiveLesson && typeof state.currentActiveLesson.unitIdx === 'number') ? state.currentActiveLesson.unitIdx : 0;
      unitSelect.value = cu;
      updatePracticeScope();
    }

    function startPractice() {
      playSound('ui_tap');
      const scope = document.getElementById('practice-scope-select').value;
      const unitIdx = parseInt(document.getElementById('practice-unit-select').value || 0, 10);
      const qs = collectPracticeQuestions(scope, unitIdx);
      if (!qs || qs.length === 0) {
        document.getElementById('practice-container').innerHTML = `<div class="text-slate-500">No practice questions available for the selected scope.</div>`;
        return;
      }
      practiceState.questions = qs;
      practiceState.running = true;
      document.getElementById('practice-start-btn').classList.add('hidden');
      document.getElementById('practice-stop-btn').classList.remove('hidden');
      renderPracticeQuestion();
    }

    function stopPractice() {
      playSound('ui_tap');
      practiceState.running = false;
      if (practiceState.timeoutId) clearTimeout(practiceState.timeoutId);
      document.getElementById('practice-start-btn').classList.remove('hidden');
      document.getElementById('practice-stop-btn').classList.add('hidden');
      document.getElementById('practice-container').innerHTML = `<div class="text-slate-600">Practice stopped. Press Start to resume.</div>`;
    }

    function collectPracticeQuestions(scope, unitIdx) {
      const course = getActiveCourse();
      const list = [];
      if (!course) return list;

      course.units.forEach((unit, uIdx) => {
        unit.lessons.forEach((lesson, lIdx) => {
          (lesson.quiz || []).forEach((q, qIdx) => {
            list.push({ courseId: course.id, unitIdx: uIdx, lessonIdx: lIdx, qIdx, q });
          });
        });
      });

      if (scope === 'current') {
        return list.filter(it => it.unitIdx === unitIdx);
      }
      return list;
    }

    function renderPracticeQuestion() {
      if (!practiceState.running) return;
      const pool = practiceState.questions;
      if (!pool || pool.length === 0) {
        document.getElementById('practice-container').innerHTML = `<div class="text-slate-500">No questions to practice.</div>`;
        return;
      }

      const pick = pool[Math.floor(Math.random() * pool.length)];
      const q = pick.q;

      let html = `
        <div class="bg-gradient-to-tr from-white to-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-md">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs text-slate-500">Unit ${pick.unitIdx + 1} • Lesson ${pick.lessonIdx + 1}</div>
              <div class="text-lg font-bold text-slate-900 mt-2 mb-3">${escapeHtml(q.question)}</div>
            </div>
            <div class="text-sm text-slate-400">Practice</div>
          </div>
          <div class="mt-4 space-y-3">
      `;

      q.options.forEach((opt, idx) => {
        html += `
          <button onclick="handlePracticeAnswer(${idx}, ${q.correctIndex}, ${pick.unitIdx}, ${pick.lessonIdx}, ${pick.qIdx})" class="w-full text-left p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 font-medium transition hover:bg-indigo-50">${escapeHtml(opt)}</button>
        `;
      });

      html += `
          </div>
        </div>
      `;

      document.getElementById('practice-container').innerHTML = html;
    }

    function handlePracticeAnswer(selectedIdx, correctIdx, unitIdx, lessonIdx, qIdx) {
      const container = document.getElementById('practice-container');
      const buttons = container.querySelectorAll('button');
      buttons.forEach((b, i) => {
        if (i === selectedIdx) {
          if (selectedIdx === correctIdx) b.classList.add('bg-emerald-500/20', 'border-emerald-500');
          else b.classList.add('bg-rose-500/20', 'border-rose-500');
        }
        b.disabled = true;
      });

      if (selectedIdx === correctIdx) {
        playSound('correct');
        showToast('Correct — next question incoming', 'success');
      } else {
        playSound('incorrect');
        showToast('Incorrect — try the next one!', 'error');
      }

      // Next question after a short delay
      if (practiceState.timeoutId) clearTimeout(practiceState.timeoutId);
      practiceState.timeoutId = setTimeout(() => {
        renderPracticeQuestion();
      }, 900);
    }
    function copyMasterPrompt() {
      // Build current prompt preview and copy to clipboard
      const promptText = document.getElementById('master-prompt-code').textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(promptText).then(() => {
          const btnText = document.getElementById('copy-prompt-btn-text');
          btnText.textContent = "Copied!";
          setTimeout(() => { btnText.textContent = "Copy Prompt"; }, 2000);
          showToast("Master prompt copied to clipboard!", "success");
        }).catch(() => {
          showToast("Unable to copy prompt to clipboard.", "error");
        });
      } else {
        // Fallback: select and exec copy
        const el = document.getElementById('master-prompt-code');
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try {
          document.execCommand('copy');
          sel.removeAllRanges();
          const btnText = document.getElementById('copy-prompt-btn-text');
          btnText.textContent = "Copied!";
          setTimeout(() => { btnText.textContent = "Copy Prompt"; }, 2000);
          showToast("Master prompt copied to clipboard!", "success");
        } catch (e) {
          showToast("Unable to copy prompt to clipboard.", "error");
        }
      }
    }

    // Gamification removed for v0.2: keep no-op helpers to avoid runtime errors
    function addPoints(pts) { /* no-op */ }
    function updateGamificationDisplay() { /* no-op */ }
    function triggerConfetti() { /* no-op */ }

    // Prompt helper preview & controls
    function updateMasterPromptPreview() {
      const topic = document.getElementById('prompt-skill-input')?.value?.trim() || '[INSERT TOPIC HERE]';
      const depth = document.getElementById('prompt-depth-select')?.value || 'Comprehensive Mastery (4 Units)';

      const prompt = `You are an expert curriculum designer tasked with creating a comprehensive Khan Academy-style course.\n\nTarget Topic: ${topic}\nTarget Depth: ${depth}.\n\nReturn a single, strictly valid JSON object (no surrounding text) with this structure and include a \"youtubeVideoId\" for each lesson when available:\n{\n  \"courseTitle\": "Course Title",\n  \"topic\": "Topic Name",\n  \"description\": "Short 2-sentence summary of course goals.",\n  \"units\": [ { \"unitNumber\": 1, \"unitTitle\": "Unit 1: ...", \"lessons\": [ { \"lessonNumber\": 1, \"title\": "Lesson Title", \"summary\": "...", \"youtubeSearchQuery\": "...", \"youtubeVideoId\": "<youtube id if known>", \"recommendedVideoTitle\": "Channel/Video suggestion", \"quiz\": [ { \"questionId\": 1, \"question\": "...", \"options\": ["A","B","C","D"], \"correctIndex\": 0, \"explanation\": "..." } ] } ] } ] }\n`;

      document.getElementById('master-prompt-code').textContent = prompt;
    }

    function updateAppName(name) {
      if (!name) return;
      // Update UI text in header
      const logoText = document.querySelector('header div > div > span.text-xl');
      if (logoText) logoText.textContent = name;
    }

    // Theme handling
    function applySavedTheme() {
      const t = localStorage.getItem('skilify_theme') || 'light';
      if (t === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }

    function toggleTheme() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('skilify_theme', isDark ? 'dark' : 'light');
      showToast(`Theme set to ${isDark ? 'dark' : 'light'}.`, 'info');
    }

    function showToast(msg, type = "info") {
      const toast = document.getElementById('toast-notification');
      const msgEl = document.getElementById('toast-message');
      const iconEl = document.getElementById('toast-icon');

      msgEl.textContent = msg;

      if (type === "success") {
        iconEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i>`;
      } else if (type === "error") {
        iconEl.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-400"></i>`;
      } else {
        iconEl.innerHTML = `<i class="fa-solid fa-circle-info text-sky-400"></i>`;
      }

      toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      }, 3000);
    }

    /* Override helper functions to include Notes in prompt preview and improve theme toggling */
    function updateMasterPromptPreview() {
      const topic = document.getElementById('prompt-skill-input')?.value?.trim() || '[INSERT TOPIC HERE]';
      const depth = document.getElementById('prompt-depth-select')?.value || 'Comprehensive Mastery (4 Units)';
      const notes = document.getElementById('prompt-notes-input')?.value?.trim() || '';

      let prompt = `You are an expert curriculum designer tasked with creating a comprehensive Khan Academy-style course.\n\nTarget Topic: ${topic}\nTarget Depth: ${depth}.\n\n`;
      if (notes) prompt += `Additional Notes: ${notes}\n\n`;

      prompt += `Return a single, strictly valid JSON object (no surrounding text) with this structure and include a "youtubeVideoId" for each lesson when available:\n{\n  "courseTitle": "Course Title",\n  "topic": "Topic Name",\n  "description": "Short 2-sentence summary of course goals.",\n  "units": [ { "unitNumber": 1, "unitTitle": "Unit 1: ...", "lessons": [ { "lessonNumber": 1, "title": "Lesson Title", "summary": "...", "youtubeSearchQuery": "...", "youtubeVideoId": "<youtube id if known>", "recommendedVideoTitle": "Channel/Video suggestion", "quiz": [ { "questionId": 1, "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "..." } ] } ] } ] }\n`;

      const el = document.getElementById('master-prompt-code');
      if (el) el.textContent = prompt;
    }

    function applySavedTheme() {
      const t = localStorage.getItem('skilify_theme') || 'light';
      const isDark = (t === 'dark');
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = isDark ? 'Switch to Light' : 'Switch to Dark';
    }

    function toggleTheme() {
      const el = document.documentElement;
      const body = document.body;
      const nowDark = el.classList.toggle('dark');
      body.classList.toggle('dark', nowDark);
      localStorage.setItem('skilify_theme', nowDark ? 'dark' : 'light');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = nowDark ? 'Switch to Light' : 'Switch to Dark';
      showToast(`Theme set to ${nowDark ? 'dark' : 'light'}.`, 'info');
    }

    function escapeHtml(str) {
      return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

