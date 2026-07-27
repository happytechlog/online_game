export const game2048Content = {
  ko: {
    introTitle: "2048은 어떤 게임인가요?",
    intro:
      "같은 숫자 타일을 밀어 합치고 더 큰 숫자를 만드는 퍼즐입니다. 한 번의 움직임이 다음 공간을 결정하므로, 빈 칸을 유지하며 가장 큰 타일을 한쪽 모서리에 모아 보세요.",
    howTitle: "게임 방법",
    steps: [
      "새 게임은 4×4 보드의 서로 다른 두 칸에 숫자 타일이 놓인 상태로 시작합니다.",
      "한 방향으로 움직이면 모든 타일이 끝까지 밀리고, 맞닿은 같은 숫자는 하나로 합쳐집니다.",
      "타일을 움직인 뒤 빈 칸 하나에 새로운 2 또는 4 타일이 나타납니다.",
      "2048을 만들면 승리합니다. 계속 플레이할 수 있으며, 더 움직일 수 없으면 게임이 끝납니다.",
    ],
    controlsTitle: "조작 방법",
    controls: [
      {
        title: "방향키",
        body: "키보드의 위·아래·왼쪽·오른쪽 방향키로 모든 타일을 움직입니다.",
      },
      {
        title: "WASD",
        body: "W, A, S, D 키도 각각 위, 왼쪽, 아래, 오른쪽 이동으로 사용할 수 있습니다.",
      },
      {
        title: "스와이프",
        body: "휴대폰과 태블릿에서는 게임판을 원하는 방향으로 밀어 움직입니다.",
      },
    ],
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        question: "한 번 움직일 때 같은 타일이 연속으로 합쳐지나요?",
        answer:
          "아니요. 한 번 합쳐져 만들어진 타일은 같은 움직임에서 다시 합쳐지지 않습니다.",
      },
      {
        question: "2048을 만들면 바로 게임이 끝나나요?",
        answer:
          "계속하기를 선택하면 현재 보드와 점수를 유지한 채 더 큰 타일에 도전할 수 있습니다.",
      },
      {
        question: "한 수 무르기가 있나요?",
        answer: "원작 규칙에 맞춰 한 수 무르기 기능은 제공하지 않습니다.",
      },
    ],
  },
  en: {
    introTitle: "What is 2048?",
    intro:
      "2048 is a puzzle about sliding equal-numbered tiles together to build larger values. Every move shapes the space available for the next one, so preserve empty cells and try anchoring your largest tile in a corner.",
    howTitle: "How to play",
    steps: [
      "A new game starts with two numbered tiles in different cells of a 4×4 board.",
      "Choose a direction to slide every tile to the edge. Equal tiles that meet merge into one.",
      "After a successful move, a new 2 or 4 appears in one empty cell.",
      "Creating 2048 wins the game. You may keep playing, and the game ends when no move remains.",
    ],
    controlsTitle: "Controls",
    controls: [
      {
        title: "Arrow keys",
        body: "Use the up, down, left, and right arrow keys to move every tile.",
      },
      {
        title: "WASD",
        body: "W, A, S, and D also move up, left, down, and right.",
      },
      {
        title: "Swipe",
        body: "On a phone or tablet, swipe across the board in the direction you want to move.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "Can a tile merge twice in one move?",
        answer:
          "No. A tile created by a merge cannot merge again during that same move.",
      },
      {
        question: "Does the game end as soon as I reach 2048?",
        answer:
          "Choose keep going to preserve the board and score while you pursue larger tiles.",
      },
      {
        question: "Is there an undo button?",
        answer: "No. Undo is omitted to follow the original rules.",
      },
    ],
  },
} as const;
