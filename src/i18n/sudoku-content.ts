export const sudokuContent = {
  ko: {
    introTitle: "스도쿠란?",
    intro:
      "스도쿠는 9×9 판을 숫자 1부터 9까지 채우는 논리 퍼즐입니다. 각 행, 열, 3×3 박스에는 같은 숫자가 한 번씩만 들어가며, 이 게임의 모든 퍼즐은 추측 없이 논리 기법으로 완성할 수 있도록 검증되었습니다.",
    howTitle: "게임 방법",
    steps: [
      "쉬움, 보통, 어려움, 전문가 중 원하는 난이도를 선택합니다.",
      "빈 칸을 선택하고 각 행, 열, 3×3 박스에 숫자가 겹치지 않도록 입력합니다.",
      "확실하지 않은 숫자는 메모 모드로 후보를 남기고, 필요하면 되돌리기나 힌트를 사용합니다.",
      "모든 칸이 유일한 해답과 일치하면 시간이 기록되고 난이도별 최고 기록이 갱신됩니다.",
    ],
    controlsTitle: "조작과 도움",
    controls: [
      {
        title: "숫자와 이동",
        body: "칸을 탭하거나 클릭하세요. 키보드에서는 방향키로 이동하고 1–9로 입력합니다.",
      },
      {
        title: "메모와 지우기",
        body: "N으로 메모 모드를 전환합니다. 0, Backspace, Delete로 선택한 칸을 지웁니다.",
      },
      {
        title: "되돌리기",
        body: "화면 버튼이나 Ctrl/Cmd+Z를 사용합니다. 제거된 동료 칸 메모도 함께 복원됩니다.",
      },
      {
        title: "논리 힌트",
        body: "게임마다 세 번, 값을 대신 채우지 않는 다음 논리 기법 설명과 강조 표시를 받을 수 있습니다.",
      },
      {
        title: "일시정지",
        body: "P 또는 일시정지 버튼을 사용합니다. 다른 화면으로 이동해도 자동으로 멈추고 판이 가려집니다.",
      },
      {
        title: "자동저장",
        body: "현재 판, 메모, 남은 힌트와 시간이 이 브라우저에 저장되며 다시 열 때 일시정지 상태로 복원됩니다.",
      },
    ],
    difficultyTitle: "난이도는 어떻게 정해지나요?",
    difficultyIntro:
      "빈 칸 수가 아니라 퍼즐을 완성하는 데 필요한 가장 어려운 논리 기법으로 분류합니다.",
    difficulties: [
      { name: "쉬움", body: "유일 후보와 숨은 유일 후보를 사용합니다." },
      { name: "보통", body: "잠긴 후보와 후보 쌍이 추가됩니다." },
      { name: "어려움", body: "후보 트리플과 X-Wing이 등장합니다." },
      {
        name: "전문가",
        body: "XY-Wing, Swordfish와 제한된 논리 체인을 사용합니다.",
      },
    ],
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        question: "진행 중인 게임은 어디에 저장되나요?",
        answer:
          "현재 게임과 최고 기록은 이 기기의 브라우저에만 저장됩니다. 계정이나 외부 서버로 전송되지 않습니다.",
      },
      {
        question: "틀린 숫자를 바로 알려 주나요?",
        answer:
          "같은 행, 열, 박스에서 겹치는 숫자만 즉시 표시합니다. 겹치지 않는 입력은 정답과 비교해 공개하지 않습니다.",
      },
      {
        question: "힌트가 숫자를 대신 입력하나요?",
        answer:
          "아니요. 힌트는 다음 논리 기법과 관련 셀 또는 후보만 설명하고 강조합니다. 최고 기록 자격에도 영향을 주지 않습니다.",
      },
      {
        question: "같은 퍼즐이 반복될 수 있나요?",
        answer:
          "각 난이도의 100개 퍼즐을 모두 한 번씩 선택한 뒤에만 해당 난이도의 새 순환이 시작됩니다.",
      },
      {
        question: "화면을 닫아도 시간이 계속 흐르나요?",
        answer:
          "아니요. 화면을 벗어나면 자동으로 일시정지되며, 다시 열어 복원한 게임도 직접 계속하기 전까지 멈춰 있습니다.",
      },
    ],
  },
  en: {
    introTitle: "What is Sudoku?",
    intro:
      "Sudoku is a logic puzzle played on a 9×9 grid. Each row, column, and 3×3 box contains the digits 1 through 9 exactly once. Every puzzle here is verified to finish with logic rather than guessing.",
    howTitle: "How to play",
    steps: [
      "Choose Easy, Medium, Hard, or Expert difficulty.",
      "Select an empty cell and enter digits without repeating one in its row, column, or 3×3 box.",
      "Use note mode for uncertain candidates, and reach for undo or a hint when needed.",
      "When every cell matches the unique solution, your time is recorded and the best time for that difficulty is updated.",
    ],
    controlsTitle: "Controls and assistance",
    controls: [
      {
        title: "Digits and movement",
        body: "Tap or click a cell. On a keyboard, move with the arrow keys and enter digits with 1–9.",
      },
      {
        title: "Notes and erase",
        body: "Press N to toggle notes. Use 0, Backspace, or Delete to clear the selected cell.",
      },
      {
        title: "Undo and redo",
        body: "Use the on-screen controls or Ctrl/Cmd+Z. Peer notes removed by a placement are restored together.",
      },
      {
        title: "Logical hints",
        body: "Up to three times per game, reveal an explanation and highlights for the next technique without filling a digit.",
      },
      {
        title: "Pause",
        body: "Press P or use Pause. Leaving the page also stops the timer and hides the board.",
      },
      {
        title: "Autosave",
        body: "The board, notes, remaining hints, and time stay in this browser and restore paused when you return.",
      },
    ],
    difficultyTitle: "How is difficulty decided?",
    difficultyIntro:
      "Difficulty comes from the hardest logical technique needed, not simply the number of empty cells.",
    difficulties: [
      { name: "Easy", body: "Uses naked and hidden singles." },
      { name: "Medium", body: "Adds locked candidates and candidate pairs." },
      { name: "Hard", body: "Introduces candidate triples and X-Wing." },
      {
        name: "Expert",
        body: "Uses XY-Wing, Swordfish, and bounded logical chains.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "Where is my unfinished game saved?",
        answer:
          "Your current game and best times stay only in this browser on this device. Nothing is sent to an account or external server.",
      },
      {
        question: "Does the game reveal every wrong digit?",
        answer:
          "It immediately marks only digits that conflict in a row, column, or box. A non-conflicting entry is not compared with the solution during play.",
      },
      {
        question: "Does a hint enter a digit for me?",
        answer:
          "No. A hint only explains the next logical technique and highlights related cells or candidates. It does not affect best-time eligibility.",
      },
      {
        question: "Can the same puzzle repeat?",
        answer:
          "A difficulty starts a new cycle only after all 100 of its puzzles have been selected once.",
      },
      {
        question: "Does the timer keep running when I leave?",
        answer:
          "No. Hiding the page pauses automatically, and a restored game stays paused until you explicitly resume.",
      },
    ],
  },
} as const;
