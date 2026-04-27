# 너의두컷

너의두컷은 짧은 글과 이미지를 소셜 피드에 기록하고, 사용자의 기록을 모아 HOOK 책 주문 흐름까지 관리하는 콘텐츠 서비스입니다.

## 1. 서비스 소개

### 타겟 사용자

- 일상 글, 이미지, 댓글, 멘션을 한곳에 기록하고 싶은 사용자
- 좋아요/저장/작성글을 기반으로 자신의 기록을 책 형태로 구성해 보고 싶은 사용자

### 주요 기능

- 회원가입, 로그인, 아이디/비밀번호 찾기
- 글 작성, 이미지 업로드, 상세 조회, 작성자 삭제, 관리자 삭제
- 좋아요, 저장, 공유 URL, 댓글, 대댓글
- 멘션, 좋아요, 댓글, 팔로잉 새 글 알림
- 사용자 검색, 게시글 검색, 공개 게시글 URL
- 프로필 사진 업로드, 이름/소개/관심사 수정
- 팔로우, 차단, 제한, 업데이트 안보기
- 개인정보 보호, 콘텐츠 기본설정
- 내 활동 그래프
- HOOK 책 만들기, 책 편집, 주문, 주문취소
- 관리자 글 관리, 주문 상태 관리, 글/댓글 신고 확인, 버그 신고 확인
- 주문 데이터를 가상 파트너에게 넘기는 JSON 내보내기
- `//` 커맨드 모드와 키보드 선택 모드

## 2. 실행 방법 Docker

아래 명령은 복사해서 그대로 실행할 수 있습니다.

```bash
# 저장소 클론
git clone https://github.com/lgw2000/sweet_boot.git
cd sweet_boot

# 환경변수 준비
cp .env.example .env

# 실행
docker-compose up --build

# 접속
# http://localhost:8000
```

Docker Compose v2 환경에서는 아래 명령도 사용할 수 있습니다.

```bash
docker compose up --build
```

종료:

```bash
docker-compose down
```

### 포트 변경

심사자 환경에서 `8000` 포트가 충돌하면 [docker-compose.yml](./docker-compose.yml)의 `ports` 왼쪽 값을 바꿉니다.

기본값:

```yaml
ports:
  - "8000:8000"
```

예를 들어 로컬 `3000` 포트로 열고 싶다면:

```yaml
ports:
  - "3000:8000"
```

다시 실행:

```bash
docker-compose up --build
```

접속:

```text
http://localhost:3000
```

오른쪽 `8000`은 컨테이너 내부 포트이므로 보통 그대로 둡니다.

### 환경변수

[.env.example](./.env.example)을 복사하면 기본 관리자 계정과 샘플 데이터 생성 옵션이 설정됩니다.

```env
SWEET_BOOK_ADMIN_ID=admin
SWEET_BOOK_ADMIN_PASSWORD=admin1234
SWEET_BOOK_SEED_SAMPLE=true
SWEET_BOOK_SAMPLE_PRIMARY_ID=sample_writer
SWEET_BOOK_SAMPLE_PRIMARY_PASSWORD=sample_writer123
SWEET_BOOK_SAMPLE_SECONDARY_ID=sample_reader
SWEET_BOOK_SAMPLE_SECONDARY_PASSWORD=sample_reader123
```

관리자 계정은 일반 회원가입으로 만들 수 없고, 서버 시작 시 환경변수 기준으로 자동 생성됩니다.

### 샘플 계정

샘플 계정도 코드에 고정하지 않고 `.env` 값으로 생성됩니다. 기본값은 아래와 같습니다.

```text
아이디: sample_writer
비밀번호: sample_writer123
아이디: sample_reader
비밀번호: sample_reader123
```

관리자:

```text
아이디: admin
비밀번호: admin1234
```

빈 DB로 처음 실행하면 위 사용자와 함께 샘플 게시글, 댓글, 좋아요/저장, HOOK 책, 주문 데이터가 자동 생성됩니다. 샘플 데이터 생성을 끄고 싶다면 `.env`에서 아래처럼 설정합니다.

```env
SWEET_BOOK_SEED_SAMPLE=false
```

### 데이터 저장 위치

Docker 실행 데이터는 로컬 폴더에 보존됩니다.

```text
simple-web/data/users.db
simple-web/static/uploads/
```

완전 초기화:

```bash
docker-compose down
rm -rf simple-web/data
find simple-web/static/uploads -mindepth 1 ! -name .gitkeep -delete
docker-compose up --build
```

## 3. 완성한 레벨

### Lv1 서비스 구현 완료

콘텐츠 서비스의 핵심 플로우가 동작합니다.

- 사용자는 글과 이미지를 작성할 수 있습니다.
- 피드에서 최신/인기 게시글을 조회할 수 있습니다.
- 글 상세 화면에서 댓글과 재귀 대댓글을 작성할 수 있습니다.
- 좋아요, 저장, 공유, 신고, 삭제 플로우가 동작합니다.
- 멘션, 댓글, 좋아요, 팔로잉 새 글 알림을 확인할 수 있습니다.
- 프로필 편집, 프로필 사진 업로드, 팔로우, 차단, 제한 기능을 사용할 수 있습니다.
- 검색, 설정, 내 활동 그래프, 커맨드 모드가 구현되어 있습니다.

### Lv2 자체 주문 기능 완료

사용자가 자신의 기록을 책으로 구성하고 주문할 수 있습니다.

- HOOK에서 좋아요한 글, 저장한 글, 내 인기글, 직접 선택한 글을 책에 담을 수 있습니다.
- 책 제목과 포함 글 목록을 저장하고 다시 조회할 수 있습니다.
- 저장된 책을 편집할 수 있습니다.
- 사용자는 책을 주문하거나 주문취소할 수 있습니다.
- 주문 상태는 `pending`, `processing`, `completed`, `cancelled` 흐름으로 관리됩니다.
- 사용자는 주문과 주문취소까지만 수행하고, 이후 상태 변경은 관리자 화면에서 처리합니다.

### Lv3 주문 데이터 익스포트 완료

주문 1건에 필요한 콘텐츠와 메타데이터를 JSON으로 내보낼 수 있습니다.

- 관리자 페이지의 `주문 관리` 탭에서 `파트너 JSON` 버튼을 누르면 JSON 파일이 다운로드됩니다.
- API로도 주문 데이터를 조회할 수 있습니다.

```text
GET /api/admin/orders/{order_id}/partner-export?token=<admin-token>
```

`<admin-token>`은 관리자 로그인 API가 응답으로 돌려주는 세션 토큰입니다. 관리자 화면에서 `파트너 JSON` 버튼을 누를 때는 프론트엔드가 이 토큰을 자동으로 사용하므로 직접 입력할 필요가 없습니다.

직접 API로 확인하려면 먼저 관리자 로그인을 호출합니다.

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"admin_id":"admin","password":"admin1234"}'
```

응답 예시:

```json
{
  "message": "관리자 로그인 성공",
  "token": "발급된-admin-token",
  "admin_id": "admin"
}
```

그 다음 응답의 `token` 값을 `<admin-token>` 자리에 넣어 호출합니다.

JSON에는 아래 데이터가 포함됩니다.

- 스키마 버전
- 가상 파트너 정보
- 주문 ID, 상태, 생성/수정 시각
- 주문자 정보
- 책 ID, 책 제목, 책 상태, 원본 게시글 ID 목록
- 책에 들어가는 게시글의 순서, 공개 ID, URL, API URL
- 게시글 본문, 이미지 경로, 작성자, 좋아요 수, 조회수, 댓글 수
- 작성자 삭제/관리자 삭제 여부 같은 운영 메타데이터

## 4. 기술 스택 및 아키텍처

### 기술 스택

- 프론트엔드: HTML, CSS, JavaScript
- 백엔드: FastAPI
- DB: SQLite, SQLAlchemy ORM
- 인증/보안: Passlib bcrypt, 관리자 세션 토큰
- 실행 환경: Docker, Docker Compose
- 정적 파일/업로드: FastAPI StaticFiles, 로컬 볼륨

### 이 스택을 선택한 이유

- 과제 규모에서 빠르게 구현하고 검증하기 위해 단순한 단일 FastAPI 앱 구조를 선택했습니다.
- SQLite는 별도 DB 서버 없이 Docker 한 번으로 실행할 수 있어 심사 환경 재현성이 좋습니다.
- JavaScript는 빌드 단계 없이 바로 UI를 확인할 수 있어 제출 안정성이 높습니다.
- Docker Compose로 백엔드, 정적 UI, DB 파일 저장을 한 번에 실행할 수 있습니다.

### 주요 디렉터리 구조

```text
.
├── docker-compose.yml
├── .env.example
├── README.md
└── simple-web
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py          # FastAPI API, DB 모델, 관리자/주문/익스포트 로직
    ├── index.html       # 단일 페이지 UI
    ├── script.js        # 프론트 상태관리와 화면 동작
    ├── style.css        # 라이트/다크 모드와 UI 스타일
    ├── feed_algorithm.py
    ├── data/            # Docker 실행 시 SQLite DB 저장 위치
    └── static/uploads/  # 업로드 이미지 저장 위치
```

### 간단한 구조

```text
Browser
  -> index.html / script.js / style.css
  -> FastAPI REST API
  -> SQLAlchemy ORM
  -> SQLite users.db
  -> static/uploads
```

## 5. AI 도구 사용 내역

| AI 도구 | 활용 내용 |
| --- | --- |
| OpenAI Codex | 기능 구현, FastAPI 라우트 설계, 프론트 상태관리, UI 수정, Docker/README 정리 |
| Antigravity | 화면 흐름 점검, UI/UX 아이디어 검토, 기능 동작 확인 보조 |

AI 도구는 반복 구현 속도를 높이는 데 사용했고, 최종 동작은 로컬 코드와 브라우저에서 확인하는 방식으로 검증했습니다.

## 6. 설계 의도

### 왜 이 서비스 아이디어를 선택했는가

요즘 콘텐츠는 숏폼 영상, 3줄 요약, 짧은 밈처럼 점점 더 빠르고 짧게 소비되는 방향으로 변하고 있습니다. 너의두컷은 이 흐름을 더 극단적으로 줄여 “2컷만으로도 하나의 콘텐츠가 될 수 있을까?”라는 질문에서 출발했습니다. 동시에 이렇게 짧게 남긴 글, 이미지, 좋아요, 저장 같은 활동이 단순히 흘러가는 피드에 머물지 않고, 나중에는 개인의 기록을 모은 책으로 확장될 수 있다는 가능성을 서비스 구조에 담았습니다.

### 사업적 가능성

- 사용자의 기존 콘텐츠를 기반으로 개인화 책, 굿즈, 회고록 같은 주문형 상품으로 확장할 수 있습니다.
- 좋아요/저장/조회수 기반 자동 큐레이션은 사용자가 직접 책 구성을 고민하는 부담을 줄입니다.
- 주문 데이터 JSON 내보내기는 실제 제작 파트너, 인쇄 업체, 편집 시스템과 연결하기 좋은 형태입니다.
- 현재는 가상 주문 관리 단계지만, 이후 결제/배송/제작 API와 연결하면 실제 커머스 플로우로 확장할 수 있습니다.

### 더 시간이 있었다면 추가할 기능

- 완전한 비로그인 게스트 모드
- 책 미리보기 PDF 또는 인쇄용 레이아웃 생성
- 이미지 편집, 표지 선택, 페이지 순서 드래그 편집
- 관리자 신고 처리 상태 변경과 사용자 제재 이력
- 공개된 트위터의 알고리즘을 모방하여 관련 피드 추가
- 모바일 버전

## 7. 일반 사용자 사용법

1. 첫 화면에서 샘플 계정으로 로그인하거나 `회원가입`으로 새 계정을 만듭니다.
2. 홈에서 글을 작성하거나 이미지를 첨부합니다.
3. 글을 클릭해 상세 화면으로 들어갑니다.
4. 상세 화면에서 댓글과 대댓글을 작성합니다.
5. 글과 댓글의 `...` 메뉴에서 저장, 공유, 신고, 삭제를 사용할 수 있습니다.
6. 사이드바의 `검색`에서 게시글과 사용자를 검색합니다.
7. `더 보기`에서 설정, 내 활동, 문제신고, 모드 전환을 사용할 수 있습니다.
8. `HOOK`에서 책을 만들고 주문할 수 있습니다.

## 8. 관리자 사용법

1. 로그인 화면에서 `관리자 로그인`을 누릅니다.
2. `.env`에 설정된 관리자 아이디와 비밀번호를 입력합니다.
3. 관리자 페이지에서 글, 주문, 신고, 버그 신고를 확인합니다.

관리자 기능:

- `글 관리`: 게시글 검색, 상세 확인, 관리자 삭제
- `주문 관리`: 주문 검색, 상태 변경, 파트너 JSON 다운로드
- `글/댓글 신고`: 신고된 글과 댓글 확인
- `버그 신고`: 사용자가 보낸 버그 신고 확인
- `다크/라이트 모드`: 관리자 페이지에서도 모드 전환

주문 상태:

```text
pending -> processing -> completed
cancelled
```

## 9. HOOK 사용법

HOOK은 사용자의 기록을 기반으로 책을 구성하는 기능입니다.

책에 담을 수 있는 글:

- 직접 선택한 글
- 좋아요한 글
- 저장한 글
- 좋아요를 많이 받은 내 글
- 조회수가 많은 내 글
- 전체 검색으로 찾은 글

사용 흐름:

1. 사이드바에서 `HOOK`을 누릅니다.
2. `책` 탭에서 저장된 책 목록을 확인합니다.
3. `책 만들기` 버튼을 눌러 책 구성 창을 엽니다.
4. 탭과 검색을 이용해 글을 담습니다.
5. 책 제목을 입력하고 저장합니다.
6. 저장된 책 카드에서 `편집` 또는 `주문하기`를 누릅니다.
7. `주문 관리` 탭에서 주문 상태를 확인하거나 주문취소를 할 수 있습니다.

## 10. 게시글 공개 ID와 URL

게시글은 내부 DB 숫자 ID와 별도로 공개 ID와 고정 URL을 가집니다.

예시:

```text
post-000026
```

브라우저에서 글 열기:

```text
http://localhost:8000/posts/post-000026
```

JSON 조회:

```text
http://localhost:8000/api/posts/public/post-000026
```

로그인 사용자 기준 권한을 반영하려면 `user_id`를 붙입니다.

```text
http://localhost:8000/api/posts/public/post-000026?user_id=demo
```

상세 조회처럼 조회수 증가까지 반영하려면 `increment_view=true`를 붙입니다.

```text
http://localhost:8000/api/posts/public/post-000026?user_id=demo&increment_view=true
```

## 11. 커맨드 모드

텍스트 입력창, 검색창, 댓글창이 활성화된 상태에서는 커맨드 모드가 켜지지 않습니다.

시작/종료:

```text
// 를 빠르게 입력
```

도움말:

```text
help
commands
cmd
?
h
```

검색:

```text
sc 검색어
search 검색어
```

화면 이동:

```text
top
bot
home
hook
noti
act
me
```

피드 전환:

```text
latest
pop
popular
feed popular
feed latest
```

프로필과 설정:

```text
profile 사용자아이디
pf 사용자아이디
settings
privacy
content
```

작성, 신고, 화면 모드:

```text
new
bug
theme
dark
light
```

글 열기와 공유:

```text
post 26
post post-000026
share
share 25
share post-000026
copy
link
```

관리:

```text
refresh
reload
clear
exit
close
q
```

## 12. 선택 모드

커맨드 모드에서 선택 모드 진입:

```text
sel
select
```

이동:

```text
W A S D
방향키
Tab
Shift + Tab
```

선택 항목 실행:

```text
Enter: 열기
O: 열기
L: 좋아요
Space: 좋아요
Y: 공유
B: 저장
Shift + S: 저장
C: 댓글
I: 댓글
R: 신고
X: 삭제
Delete: 삭제
Backspace: 삭제
Esc: 선택 모드 나가기
```

선택 모드를 나가도 커맨드 모드는 유지됩니다. 커맨드 모드까지 종료하려면 다시 `//`를 빠르게 입력하거나 `exit`을 입력합니다.

## 13. 로컬 개발 실행

Docker 없이 직접 실행하려면:

```bash
cd simple-web
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

접속:

```text
http://localhost:8000
```

포트 변경:

```bash
uvicorn main:app --host 0.0.0.0 --port 3000
```

## 14. 문제 해결

포트가 이미 사용 중일 때:

```yaml
ports:
  - "3000:8000"
```

Docker 캐시 없이 다시 빌드:

```bash
docker-compose build --no-cache
docker-compose up
```

Compose 설정 확인:

```bash
docker-compose config
```

업로드 이미지 초기화:

```bash
find simple-web/static/uploads -mindepth 1 ! -name .gitkeep -delete
```
