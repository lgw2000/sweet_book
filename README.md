# 너의두컷

너의두컷은 글, 이미지, 댓글, 알림, 프로필, HOOK 책 만들기, 주문 관리, 신고/관리자 기능을 포함한 FastAPI 기반 웹 애플리케이션입니다.

심사자는 아래의 Docker 실행 방법만 따라 하면 바로 실행할 수 있습니다.

## 빠른 실행

필요한 것:

- Docker
- Docker Compose 또는 Docker Desktop

실행:

```bash
docker-compose up --build
```

또는 Docker Compose v2를 사용하는 환경에서는 아래 명령도 가능합니다.

```bash
docker compose up --build
```

브라우저에서 접속:

```text
http://127.0.0.1:8000
```

중지:

```bash
docker-compose down
```

## 포트 변경

포트는 [docker-compose.yml](./docker-compose.yml)의 `ports` 항목에서 왼쪽 숫자를 바꾸면 됩니다.

기본값:

```yaml
ports:
  - "8000:8000"
```

예를 들어 3000번 포트로 실행하려면:

```yaml
ports:
  - "3000:8000"
```

이후 다시 실행합니다.

```bash
docker-compose up --build
```

접속 주소는 아래처럼 바뀝니다.

```text
http://127.0.0.1:3000
```

오른쪽 `8000`은 컨테이너 내부 포트이므로 보통 그대로 둡니다.

## 관리자 계정

관리자 계정은 회원가입으로 만들 수 없습니다. 서버 실행 시 환경변수로 지정된 관리자 계정이 자동으로 준비됩니다.

기본 관리자 계정:

```text
아이디: admin
비밀번호: admin1234
```

관리자 계정을 바꾸려면 실행 전에 환경변수를 지정합니다.

```bash
SWEET_BOOK_ADMIN_ID=myadmin SWEET_BOOK_ADMIN_PASSWORD=mypassword docker-compose up --build
```

또는 `.env` 파일을 루트에 만들고 아래처럼 작성해도 됩니다.

```env
SWEET_BOOK_ADMIN_ID=myadmin
SWEET_BOOK_ADMIN_PASSWORD=mypassword
```

주의: 이미 `simple-web/data/users.db`가 만들어진 뒤에는 기존 관리자 계정이 DB에 남아 있습니다. 완전히 새 관리자 계정으로 초기화하려면 컨테이너를 끄고 `simple-web/data/users.db`를 삭제한 뒤 다시 실행하세요.

## 데이터 저장 위치

Docker 실행 시 데이터는 로컬 폴더에 보존됩니다.

```text
simple-web/data/users.db
simple-web/static/uploads/
```

컨테이너를 삭제해도 위 폴더가 남아 있으면 사용자, 게시글, 주문, 업로드 이미지가 유지됩니다.

완전 초기화:

```bash
docker-compose down
rm -rf simple-web/data
find simple-web/static/uploads -mindepth 1 ! -name .gitkeep -delete
docker-compose up --build
```

## 일반 사용자 사용법

1. 첫 화면에서 `회원가입`을 눌러 사용자 계정을 만듭니다.
2. 만든 아이디와 비밀번호로 로그인합니다.
3. 홈에서 글을 작성하거나 이미지와 함께 게시할 수 있습니다.
4. 게시글을 클릭하면 상세 화면에서 댓글과 대댓글을 작성할 수 있습니다.
5. 글과 댓글에는 좋아요, 저장, 신고, 삭제 기능이 있습니다.
6. 저장한 글과 댓글은 프로필의 `저장됨` 탭에서 확인할 수 있습니다.
7. 다른 사용자의 프로필에서 팔로우, 업데이트 안보기, 제한, 차단을 관리할 수 있습니다.
8. 알림 탭에서는 멘션, 좋아요, 댓글, 팔로잉한 사람의 새 글 알림을 확인할 수 있습니다.
9. 더보기 메뉴에서 설정, 내 활동, 문제신고, 모드 전환을 사용할 수 있습니다.

## 주요 기능

### 피드

- 최신 피드
- 인기 피드
- 관련 피드
- 위로 스크롤할 때 이전 게시물 100개 단위 로드
- 글 상세 진입 시 조회수 증가

### 검색

- 게시글 검색
- 사용자 검색
- 검색 결과에서 글 또는 프로필로 이동

### 프로필

- 프로필 사진 업로드
- 이름, 소개, 관심사 수정
- 작성글, 좋아요, 저장됨, 이미지 탭
- 팔로우, 차단, 제한, 업데이트 안보기

### 설정

- 개인정보 보호
- 비공개 프로필
- 멘션 및 언급 허용 대상
- 태그 허용 대상
- 활동 상태 공개범위
- 제한된 프로필
- 차단된 프로필
- 콘텐츠 기본설정
- 숨겨진 단어
- 맞춤 필터
- 좋아요수 및 공유수 숨기기

### 알림

- 멘션 알림
- 좋아요 알림
- 댓글 알림
- 팔로우한 사용자의 새 글 알림
- 알림 클릭 시 읽음 처리
- 전체 확인 버튼

### HOOK

HOOK은 사용자의 기록을 기반으로 책을 만드는 기능입니다.

책에 담을 수 있는 글:

- 사용자가 직접 선택한 글
- 좋아요한 글
- 저장한 글
- 좋아요를 많이 받은 내 글
- 조회수가 많은 내 글
- 전체 검색으로 찾은 글

HOOK에서 할 수 있는 일:

- 책 만들기
- 저장된 책 보기
- 책 편집
- 주문하기
- 주문취소
- 주문 상태 확인

주문 상태는 사용자가 직접 바꾸지 않고 시스템/관리자 흐름에서 관리됩니다.

### 내 활동

내 활동 그래프에서 아래 지표를 볼 수 있습니다.

- 내가 좋아요한 수
- 내가 저장한 수
- 내가 댓글 쓴 수
- 내가 멘션한 수
- 내가 멘션 받은 수
- 내 게시물이 받은 좋아요 수
- 내 게시물이 받은 댓글 수

기간 단위:

- 하루
- 1주일
- 한달
- 1년

1년에서 월을 클릭하면 주 단위로, 주를 클릭하면 일 단위로, 일을 클릭하면 시간 단위로 내려가 볼 수 있습니다.

## 관리자 사용법

1. 로그인 화면에서 `관리자 로그인`을 누릅니다.
2. 관리자 아이디와 비밀번호를 입력합니다.
3. 관리자 페이지에서 아래 기능을 사용할 수 있습니다.

관리자 기능:

- 글 검색 및 관리
- 글 상세 확인
- 관리자 권한으로 글 삭제 처리
- 주문 검색
- 주문 상태 변경
- 글 신고 확인
- 댓글 신고 확인
- 버그 신고 확인

주문 상태 예시:

```text
pending -> processing -> completed
```

관리자가 삭제하지 않은 글은 사용자가 삭제해도 서버 데이터에는 남아 있고, 사용자 화면에서만 숨겨집니다.

## 문제신고

글 신고:

1. 글 또는 댓글의 세로 `...` 버튼을 누릅니다.
2. `이 글 신고하기` 또는 `댓글 신고`를 선택합니다.
3. 신고 사유를 입력합니다.

버그 신고:

1. 더보기 메뉴에서 `문제신고`를 누릅니다.
2. 제목과 내용을 작성합니다.
3. 필요한 경우 이미지를 첨부합니다.
4. 관리자 페이지의 `버그 신고` 탭에서 확인할 수 있습니다.

## 커맨드 모드

입력창, 검색창, 댓글창처럼 텍스트 입력 중인 상태에서는 커맨드 모드가 켜지지 않습니다.

커맨드 모드 시작/종료:

```text
// 를 빠르게 입력
```

커맨드 모드는 종료하기 전까지 계속 유지됩니다.

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
related
feed popular
feed related
feed latest
```

프로필 열기:

```text
profile 사용자아이디
pf 사용자아이디
me
```

설정 이동:

```text
settings
privacy
content
```

글쓰기와 신고:

```text
new
bug
```

화면 모드:

```text
theme
dark
light
```

현재 화면 데이터 새로고침:

```text
refresh
reload
```

글 번호로 바로 열기:

```text
post 25
```

커맨드 기록 지우기와 종료:

```text
clear
exit
close
q
```

## 선택 모드

커맨드 모드에서 선택 모드로 진입:

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

선택한 항목 실행:

```text
Enter: 열기
O: 열기
L: 좋아요
Space: 좋아요
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

## 로컬 개발 실행

Docker를 쓰지 않고 직접 실행할 수도 있습니다.

```bash
cd simple-web
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

브라우저에서 접속:

```text
http://127.0.0.1:8000
```

로컬 실행 포트를 바꾸려면 `--port` 값을 바꿉니다.

```bash
uvicorn main:app --host 0.0.0.0 --port 3000
```

## 문제 해결

### 포트가 이미 사용 중일 때

`docker-compose.yml`에서 왼쪽 포트를 바꿉니다.

```yaml
ports:
  - "3000:8000"
```

### Docker 캐시 없이 다시 빌드하고 싶을 때

```bash
docker-compose build --no-cache
docker-compose up
```

### 관리자 비밀번호를 바꿨는데 적용되지 않을 때

기존 DB에 이미 관리자 계정이 만들어져 있으면 새 환경변수가 기존 계정을 덮어쓰지 않습니다. 초기화하려면 아래처럼 DB를 삭제한 뒤 다시 실행합니다.

```bash
docker-compose down
rm -f simple-web/data/users.db
docker-compose up --build
```

### 업로드 이미지를 초기화하고 싶을 때

```bash
find simple-web/static/uploads -mindepth 1 ! -name .gitkeep -delete
```

### 실행 확인 명령

```bash
docker-compose config
```

위 명령이 오류 없이 출력되면 Compose 설정이 정상입니다.
