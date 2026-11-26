/*
 * 파이스텝 레슨 데이터
 * 레슨 흐름(가네 9단계 기반): intro(흥미 유발 + 학습 목표) → 지난 내용 떠올리기(recall)
 *   → concept(개념 설명) → example(예제) → 개념 확인 문제(check) → 응용 문제(apply) → summary(요약)
 * 문제 kind: ox | mc | short | order
 *   - ox: answer는 true(O) 또는 false(X)
 *   - mc: options 배열, answer는 정답 번호(0부터)
 *   - short: answers 배열(허용 답안). 앞뒤 공백과 연속 공백은 무시하고 채점
 *   - order: items 배열(정답 순서대로 작성, 화면에서는 섞여서 나옴)
 * 글 안의 `백틱`은 코드 글꼴로 표시됩니다.
 */
const CHAPTERS = [
  {
    id: 1,
    title: "파이썬이란?",
    desc: "프로그래밍과 첫 코드",
    color: "green",
    lessons: [
      {
        id: "1-1",
        title: "프로그래밍과 파이썬",
        steps: [
          {
            type: "intro",
            hook: "유튜브 추천 영상, 인스타그램 필터, 급식 메뉴 앱. 이것들의 공통점은 무엇일까요? 모두 누군가 쓴 프로그램이 있어서 작동해요.",
            goal: "프로그래밍이 무엇이고, 왜 파이썬으로 시작하는지 배워요."
          },
          {
            type: "concept",
            points: [
              "프로그램은 컴퓨터가 따라 할 명령을 순서대로 적은 것이고, 이걸 쓰는 일이 프로그래밍(코딩)이에요.",
              "컴퓨터는 사람 말을 바로 알아듣지 못해서, 프로그래밍 언어로 명령해요.",
              "파이썬은 문법이 영어 문장처럼 간단해서 입문용으로 많이 쓰이고, 데이터 분석·인공지능·웹·자동화에도 쓰여요.",
              "컴퓨터는 명령을 **위에서 아래로, 한 줄씩** 실행해요."
            ]
          },
          {
            type: "example",
            text: "라면 끓이기를 순서대로 적으면 이미 프로그램이에요. 순서가 바뀌면 결과도 달라져요.",
            code: "print(\"물 500ml 넣기\")\nprint(\"물 끓이기\")\nprint(\"면과 스프 넣기\")\nprint(\"4분 더 끓이기\")",
            output: "물 500ml 넣기\n물 끓이기\n면과 스프 넣기\n4분 더 끓이기"
          },
          {
            type: "quiz", stage: "check", kind: "ox",
            question: "컴퓨터는 한국어 문장을 그대로 알아듣고 실행할 수 있다.",
            answer: false,
            explanation: "컴퓨터는 프로그래밍 언어로 쓴 명령만 실행할 수 있어요. 그래서 파이썬 같은 언어를 배워요."
          },
          {
            type: "quiz", stage: "check", kind: "mc",
            question: "프로그램에 대한 설명으로 알맞은 것은?",
            options: ["컴퓨터 부품의 이름", "컴퓨터가 따라 할 명령을 순서대로 적은 것", "인터넷 주소", "컴퓨터의 전원 장치"],
            answer: 1,
            explanation: "프로그램은 명령의 모음이에요. 라면 레시피처럼 순서가 중요해요."
          },
          {
            type: "quiz", stage: "check", kind: "mc",
            question: "파이썬이 입문용으로 많이 쓰이는 이유는?",
            options: ["문법이 간단하고 읽기 쉽다", "게임에서만 쓸 수 있다", "유료 프로그램이다", "숫자만 다룰 수 있다"],
            answer: 0,
            explanation: "파이썬은 무료이고 문법이 영어 문장처럼 쉽지만, 인공지능과 데이터 분석에도 쓸 만큼 강력해요."
          },
          {
            type: "quiz", stage: "apply", kind: "short",
            question: "아래 코드를 실행하면 첫째 줄에 무엇이 나올까요?",
            code: "print(\"1교시 수학\")\nprint(\"2교시 영어\")",
            answers: ["1교시 수학"],
            explanation: "코드는 위에서 아래로 실행돼요. 그래서 첫 줄의 명령이 먼저 출력돼요."
          },
          {
            type: "quiz", stage: "apply", kind: "order",
            question: "\"등교 준비\" 프로그램이에요. 올바른 순서로 놓아 보세요.",
            items: ["print(\"일어나기\")", "print(\"교복 입기\")", "print(\"집을 나서기\")"],
            explanation: "컴퓨터는 적힌 순서대로만 실행해요. 순서를 정하는 것도 프로그래밍의 일이에요."
          },
          {
            type: "summary",
            text: "프로그램은 컴퓨터에게 주는 순서 있는 명령이고, 파이썬은 그 명령을 쉽게 쓸 수 있는 언어예요."
          }
        ]
      },
      {
        id: "1-2",
        title: "첫 코드 print()",
        steps: [
          {
            type: "intro",
            hook: "프로그래머들이 새 언어를 배울 때 가장 먼저 쓰는 코드가 있어요. 화면에 \"Hello, World!\"를 띄우는 코드예요. 오늘 여러분도 써 볼 거예요.",
            goal: "`print()`로 화면에 글자와 숫자를 출력하는 법을 배워요."
          },
          {
            type: "quiz", stage: "recall", kind: "ox",
            question: "컴퓨터는 코드를 위에서 아래로, 한 줄씩 실행한다.",
            answer: true,
            explanation: "1-1에서 배운 대로 코드는 적힌 순서대로 실행돼요."
          },
          {
            type: "concept",
            points: [
              "`print()`는 괄호 안의 내용을 화면에 보여 주는 명령이에요.",
              "글자(문자열)는 따옴표로 감싸요. 큰따옴표 `\"\"`와 작은따옴표 `''` 모두 돼요.",
              "숫자는 따옴표 없이 쓰고, 계산 결과를 바로 출력할 수 있어요.",
              "`print()`를 한 번 쓸 때마다 한 줄씩 출력돼요."
            ]
          },
          {
            type: "example",
            text: "세 줄의 코드가 세 줄의 결과를 만들어요.",
            code: "print(\"Hello, World!\")\nprint(\"오늘 급식은 카레\")\nprint(85 + 90)",
            output: "Hello, World!\n오늘 급식은 카레\n175"
          },
          {
            type: "quiz", stage: "check", kind: "ox",
            question: "`print()`로 글자를 출력할 때는 따옴표로 감싸야 한다.",
            answer: true,
            explanation: "따옴표가 없으면 파이썬은 그 글자를 명령어나 이름으로 생각해서 오류가 나요."
          },
          {
            type: "quiz", stage: "check", kind: "mc",
            question: "화면에 안녕을 올바르게 출력하는 코드는?",
            options: ["`print(안녕)`", "`Print(\"안녕\")`", "`print(\"안녕\")`", "`print \"안녕\"`"],
            answer: 2,
            explanation: "①은 따옴표가 없고, ②는 대문자 P라서 틀려요. 파이썬은 대소문자를 구분해요. ④는 괄호가 없어요."
          },
          {
            type: "quiz", stage: "check", kind: "mc",
            question: "`print(3 + 4)`의 실행 결과는?",
            options: ["3 + 4", "7", "34", "오류"],
            answer: 1,
            explanation: "따옴표가 없는 숫자는 계산되어서 7이 출력돼요."
          },
          {
            type: "quiz", stage: "apply", kind: "short",
            question: "아래 코드의 실행 결과를 써 보세요.",
            code: "print(\"3 + 4\")",
            answers: ["3 + 4"],
            explanation: "따옴표 안에 있으면 계산하지 않고 글자 그대로 출력해요. 바로 앞 문제와 비교해 보세요."
          },
          {
            type: "quiz", stage: "apply", kind: "short",
            question: "국어 92점과 수학 88점의 합계를 출력하려고 해요. 빈칸에 들어갈 기호는?",
            code: "print(92 ___ 88)",
            answers: ["+"],
            explanation: "`print()` 안에서 바로 더하기를 할 수 있어요. 실행하면 180이 출력돼요."
          },
          {
            type: "summary",
            text: "`print()`는 화면에 출력하는 명령이고, 글자는 따옴표 안에, 숫자와 계산은 따옴표 없이 써요."
          }
        ]
      },
      {
        id: "1-3",
        title: "주석과 오류 읽기",
        steps: [
          {
            type: "intro",
            hook: "빨간 오류 메시지가 뜨면 당황스럽죠? 사실 오류 메시지는 파이썬이 \"여기가 이래서 틀렸어\"라고 알려 주는 힌트예요.",
            goal: "코드에 메모를 남기는 주석과, 오류 메시지를 읽는 법을 배워요."
          },
          {
            type: "quiz", stage: "recall", kind: "mc",
            question: "`print(\"10 + 5\")`의 실행 결과는?",
            options: ["15", "10 + 5", "오류"],
            answer: 1,
            explanation: "따옴표 안의 내용은 계산하지 않고 글자 그대로 출력해요."
          },
          {
            type: "concept",
            points: [
              "주석은 `#` 뒤에 쓰는 메모예요. 파이썬은 `#` 뒤의 내용을 실행하지 않고 건너뛰어요.",
              "주석은 코드가 무슨 일을 하는지 나중의 나와 친구에게 설명할 때 써요.",
              "오류 메시지는 **줄 번호(line)**와 **마지막 줄의 오류 이름**만 보면 돼요.",
              "`SyntaxError`는 문법이 틀렸다는 뜻이에요. 따옴표나 괄호를 빠뜨렸을 때 자주 나요.",
              "`NameError`는 모르는 이름이라는 뜻이에요. 철자를 틀렸거나 글자에 따옴표를 안 썼을 때 나요."
            ]
          },
          {
            type: "example",
            text: "실행하면 180이 출력된 뒤, 3번 줄에서 오류가 나요. P를 소문자로 고치면 돼요.",
            code: "# 시험 점수 합계를 출력하는 프로그램\nprint(92 + 88)  # 국어 + 수학\nPrint(\"끝\")",
            output: "180\nNameError: name 'Print' is not defined",
            error: true
          },
          {
            type: "quiz", stage: "check", kind: "ox",
            question: "`#` 뒤에 쓴 내용도 화면에 출력된다.",
            answer: false,
            explanation: "`#` 뒤는 주석이라 파이썬이 실행하지 않고 건너뛰어요."
          },
          {
            type: "quiz", stage: "check", kind: "mc",
            question: "`print(\"안녕)`을 실행하면 어떤 오류가 날까요?",
            options: ["SyntaxError", "NameError", "오류 없음"],
            answer: 0,
            explanation: "닫는 따옴표가 빠져서 문법이 틀렸어요. 따옴표는 항상 쌍으로 써요."
          },
          {
            type: "quiz", stage: "check", kind: "mc",
            question: "오류 메시지에서 가장 먼저 봐야 할 것은?",
            options: ["글자 색깔", "줄 번호와 마지막 줄의 오류 이름", "메시지 길이"],
            answer: 1,
            explanation: "줄 번호는 어디가, 오류 이름은 무엇이 틀렸는지 알려 줘요."
          },
          {
            type: "quiz", stage: "apply", kind: "short",
            question: "아래 코드의 실행 결과를 써 보세요.",
            code: "# print(\"안녕\")\nprint(\"반가워\")",
            answers: ["반가워"],
            explanation: "첫 줄은 맨 앞에 `#`이 있어서 전체가 주석이에요. 그래서 둘째 줄만 출력돼요."
          },
          {
            type: "quiz", stage: "apply", kind: "short",
            question: "`print(안녕)`을 실행했더니 NameError가 났어요. 안녕 양쪽에 넣어야 할 기호는?",
            code: "print(___안녕___)",
            answers: ["\"", "'", "\"\"", "''"],
            explanation: "따옴표가 없으면 파이썬은 안녕을 모르는 이름으로 생각해요. 글자는 따옴표로 감싸야 해요."
          },
          {
            type: "summary",
            text: "`#`은 실행되지 않는 메모이고, 오류가 나면 줄 번호와 오류 이름부터 확인해요."
          }
        ]
      }
    ]
  },
  { id: 2, title: "입력과 출력", desc: "print() 꾸미기와 input()", color: "blue", lessons: [] },
  { id: 3, title: "자료형", desc: "숫자, 문자열, 참과 거짓", color: "purple", lessons: [] },
  { id: 4, title: "조건문", desc: "if, else, elif", color: "orange", lessons: [] },
  { id: 5, title: "반복문", desc: "for, while", color: "pink", lessons: [] },
  { id: 6, title: "리스트", desc: "여러 값을 한 번에", color: "teal", lessons: [] },
  { id: 7, title: "튜플", desc: "바꿀 수 없는 묶음", color: "blue", lessons: [] },
  { id: 8, title: "함수", desc: "나만의 명령 만들기", color: "purple", lessons: [] },
  { id: 9, title: "turtle", desc: "코드로 그림 그리기", color: "orange", lessons: [] }
];
