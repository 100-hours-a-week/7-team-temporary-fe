import type { MyRetroCardVM, PublicRetroCardVM } from "./list";

export const MY_PAGE_RETRO_MOCKS: MyRetroCardVM[] = [
  {
    id: 1,
    dateLabel: "2025.12.30",
    timeLabel: "23:00",
    imageUrls: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1574144113084-b6f450cc5e0c?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=320&q=80",
    ],
    content:
      "오늘은 공부를 많이 못했다 ㅠㅠ. 공부하려고 책상 앞에 앉았는데 자꾸 고양이들이 놀아달라고 해서 조금 놀아주다 보니 오늘이 끝나있었다. 다 노니까 지쳐서 저렇게 잔다.\n고양이들한테 미안하지만 다음부터는 공부방 문을 닫아놔야겠다.",
    likeCount: 32,
    isMine: true,
    visibilityText: "전체 공개",
  },
  {
    id: 2,
    dateLabel: "2025.12.30",
    timeLabel: "23:00",
    imageUrls: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1574144113084-b6f450cc5e0c?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=320&q=80",
    ],
    content:
      "오늘은 공부를 많이 못했다 ㅠㅠ. 공부하려고 책상 앞에 앉았는데 자꾸 고양이들이 놀아달라고 해서 조금 놀아주다 보니 오늘이 끝나있었다. 다 노니까 지쳐서 저렇게 잔다.\n고양이들한테 미안하지만 다음부터는 공부방 문을 닫아놔야겠다.",
    likeCount: 32,
    isMine: true,
    visibilityText: "전체 공개",
  },
];

export const EXPLORE_RETRO_MOCKS: PublicRetroCardVM[] = [
  {
    id: 101,
    dateLabel: "2026.01.05",
    timeLabel: "22:10",
    imageUrls: [
      "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=320&q=80",
    ],
    content:
      "오늘은 짧게라도 집중시간을 만들어서 밀린 할 일을 정리했다.\n작게 시작하니까 흐름이 잡혔다.",
    likeCount: 14,
    isMine: false,
    authorNickname: "happy",
  },
  {
    id: 102,
    dateLabel: "2026.01.04",
    timeLabel: "21:35",
    imageUrls: [
      "https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1472053217156-31b42df2319a?auto=format&fit=crop&w=320&q=80",
    ],
    content:
      "일정 사이사이에 쉬는 시간을 의식적으로 넣었더니 오히려 더 오래 집중했다.\n내일도 같은 방식으로 해볼 예정.",
    likeCount: 27,
    isMine: false,
    authorNickname: "molly",
  },
  {
    id: 103,
    dateLabel: "2026.01.03",
    timeLabel: "20:40",
    imageUrls: [
      "https://images.unsplash.com/photo-1470167290877-7d5d3446de4c?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=320&q=80",
      "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?auto=format&fit=crop&w=320&q=80",
    ],
    content:
      "오늘은 계획했던 공부 분량을 끝내고 산책까지 했다.\n하루 루틴을 지키니까 마음이 훨씬 가벼워졌다.",
    likeCount: 41,
    isMine: false,
    authorNickname: "choco",
  },
];
