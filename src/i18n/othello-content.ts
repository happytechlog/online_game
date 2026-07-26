export const othelloContent = {
  ko: {
    introTitle: "오델로란?",
    intro:
      "오델로는 상대 돌을 내 돌 사이에 끼워 뒤집는 8×8 전략 보드 게임입니다. 규칙은 몇 분이면 익힐 수 있지만, 모서리와 이동 가능 수를 둘러싼 선택은 매 판 새로운 깊이를 만듭니다.",
    howTitle: "게임 방법",
    steps: [
      "흑이 먼저 시작하며, 점으로 표시된 합법적인 칸에 돌을 놓습니다.",
      "가로·세로·대각선으로 감싼 상대 돌은 모두 내 색으로 뒤집힙니다.",
      "둘 곳이 없으면 자동으로 차례를 넘기고, 양쪽 모두 둘 곳이 없으면 종료됩니다.",
      "게임이 끝났을 때 돌이 더 많은 쪽이 승리하며, 같으면 무승부입니다.",
    ],
    controlsTitle: "조작 방법",
    controls: [
      { title: "돌 놓기", body: "점이 표시된 칸을 클릭하거나 탭하세요." },
      { title: "한 수 무르기", body: "이전 선택으로 돌아갑니다. AI 대전에서는 사람의 이전 선택 전까지 되돌립니다." },
      { title: "새 게임", body: "현재 설정으로 판을 처음부터 다시 시작합니다." },
      { title: "게임 포기", body: "진행 중인 판을 종료하고 상대의 승리로 기록합니다." },
    ],
    aiTitle: "AI 난이도",
    aiIntro: "모든 계산은 현재 브라우저 안에서만 실행됩니다.",
    difficulties: [
      { name: "초급", body: "합법적인 수 중 하나를 무작위로 선택합니다." },
      { name: "중급", body: "모서리, 가장자리, 이동성, 위험한 모서리 인접 칸과 게임 단계를 평가합니다." },
      { name: "고급", body: "Minimax와 Alpha-Beta 가지치기로 여러 수 앞을 탐색합니다. Web Worker를 사용해 화면이 멈추지 않습니다." },
    ],
    faqTitle: "자주 묻는 질문",
    faqs: [
      { question: "게임 진행은 자동으로 저장되나요?", answer: "네. 진행 중인 판은 이 기기의 브라우저에 자동 저장됩니다. 서버로 전송되지 않으며 저장된 게임은 직접 삭제할 수 있습니다." },
      { question: "온라인 상대와 대전할 수 있나요?", answer: "아니요. 이 사이트의 온라인 게임은 브라우저에서 실행된다는 뜻입니다. 원격 대전이나 매칭은 제공하지 않습니다." },
      { question: "AI가 외부 서비스에 접속하나요?", answer: "아니요. 세 난이도 모두 브라우저에서 계산하며 외부 AI API나 서버를 사용하지 않습니다." },
      { question: "둘 곳이 없으면 어떻게 되나요?", answer: "앱이 자동으로 패스를 안내하고 상대에게 차례를 넘깁니다. 양쪽 모두 둘 수 없으면 즉시 게임이 끝납니다." },
    ],
  },
  en: {
    introTitle: "What is Othello?",
    intro:
      "Othello is an 8×8 strategy game where you trap opposing discs between your own to flip them. The rules take minutes to learn, while corners and mobility make every match a new puzzle.",
    howTitle: "How to play",
    steps: [
      "Black moves first by choosing one of the dotted legal squares.",
      "Every opposing line bracketed horizontally, vertically, or diagonally flips to your color.",
      "If no move is available, the turn passes automatically. The game ends when neither player can move.",
      "The player with more discs at the end wins. Equal scores are a draw.",
    ],
    controlsTitle: "Controls",
    controls: [
      { title: "Place a disc", body: "Click or tap a square marked with a dot." },
      { title: "Undo", body: "Return to your previous choice. Against AI, both your move and the computer reply are reversed." },
      { title: "New game", body: "Restart the board using the current settings." },
      { title: "Resign", body: "End the current match and award the win to the opponent." },
    ],
    aiTitle: "AI difficulty",
    aiIntro: "All computation runs locally inside your browser.",
    difficulties: [
      { name: "Beginner", body: "Selects one of the legal moves at random." },
      { name: "Intermediate", body: "Evaluates corners, edges, mobility, risky corner-adjacent squares, and the game phase." },
      { name: "Advanced", body: "Searches ahead with minimax and alpha-beta pruning. A Web Worker keeps the interface responsive." },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      { question: "Is my game saved automatically?", answer: "Yes. An active match is saved in this browser on this device. Nothing is sent to a server, and you can delete the save at any time." },
      { question: "Can I play against someone online?", answer: "No. Online game here means a game that runs in a web browser. Remote matches and matchmaking are not included." },
      { question: "Does the AI contact an external service?", answer: "No. Every difficulty runs in your browser without an external AI API or game server." },
      { question: "What happens when there is no legal move?", answer: "The app announces an automatic pass and gives the opponent the turn. If neither side can move, the game ends immediately." },
    ],
  },
} as const;
