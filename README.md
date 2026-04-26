# 너의두컷

## 1. 서비스 소개

너의두컷은 사용자의 글과 기록을 모아 소셜 피드와 개인 맞춤형 HOOK 책 제작 흐름을 제공하는 웹 서비스입니다.

타겟 사용자:

- 짧은 글과 이미지를 기록하고 싶은 사용자
- 댓글, 멘션, 좋아요, 저장을 통해 다른 사용자와 교류하고 싶은 사용자
- 자신이 쓴 글과 좋아요/저장한 글을 모아 책 형태로 구성해 보고 싶은 사용자
- 게시글, 신고, 주문 상태를 관리해야 하는 운영자 또는 심사자

주요 기능:

- 회원가입, 로그인, 아이디/비밀번호 찾기
- 글 작성, 이미지 업로드, 좋아요, 저장, 댓글, 대댓글
- 멘션, 좋아요, 댓글, 팔로잉 새 글 알림
- 사용자 검색, 게시글 검색
- 프로필 사진 업로드, 이름/소개/관심사 수정
- 팔로우, 차단, 제한, 업데이트 안보기
- 개인정보 보호와 콘텐츠 기본설정
- 내 활동 그래프
- HOOK 책 만들기, 책 편집, 주문, 주문취소
- 관리자 글 관리, 주문 상태 관리, 신고 확인
- 주문 콘텐츠와 메타데이터를 가상 파트너에게 넘기기 위한 JSON 내보내기
- `//` 기반 커맨드 모드와 키보드 선택 모드
- Docker Compose 한 번으로 실행

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
```

Docker Compose v2 환경에서는 아래 명령도 가능합니다.

```bash
docker compose up --build
```

접속:

```text
http://localhost:8000
```

종료:

```bash
docker-compose down
```

## 3. 포트 변경

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

다시 실행:

```bash
docker-compose up --build
```

접속 주소:

```text
http://localhost:3000
```

오른쪽 `8000`은 컨테이너 내부 포트이므로 보통 그대로 둡니다.

## 4. 환경변수

`.env.example`을 복사해 `.env`를 만들면 기본 관리자 계정이 설정됩니다.

```bash
cp .env.example .env
```

기본값:

```env
SWEET_BOOK_ADMIN_ID=admin
SWEET_BOOK_ADMIN_PASSWORD=admin1234
```

관리자 계정은 일반 회원가입으로 만들 수 없습니다. 서버 시작 시 위 환경변수를 기준으로 자동 생성됩니다.

주의: 이미 `simple-web/data/users.db`가 만들어진 뒤에는 기존 관리자 계정이 DB에 남아 있습니다. 관리자 계정을 완전히 초기화하려면 DB를 삭제한 뒤 다시 실행합니다.

```bash
docker-compose down
rm -f simple-web/data/users.db
docker-compose up --build
```

## 5. 데이터 저장 위치

Docker 실행 데이터는 아래 로컬 폴더에 보존됩니다.

```text
simple-web/data/users.db
simple-web/static/uploads/
```

컨테이너를 삭제해도 위 파일과 폴더가 남아 있으면 사용자, 게시글, 주문, 이미지 데이터가 유지됩니다.

완전 초기화:

```bash
docker-compose down
rm -rf simple-web/data
find simple-web/static/uploads -mindepth 1 ! -name .gitkeep -delete
docker-compose up --build
```

## 6. 일반 사용자 사용법

1. 첫 화면에서 `회원가입`을 누릅니다.
2. 아이디, 이메일, 비밀번호를 입력해 계정을 만듭니다.
3. 만든 아이디와 비밀번호로 로그인합니다.
4. 홈에서 글을 작성하거나 이미지를 첨부합니다.
5. 글을 클릭해 상세 화면으로 들어가 댓글과 대댓글을 작성합니다.
6. 글과 댓글의 `...` 메뉴에서 저장, 신고, 삭제를 사용할 수 있습니다.
7. 프로필에서 작성글, 좋아요, 저장됨, 이미지를 확인합니다.
8. 더보기 메뉴에서 설정, 내 활동, 문제신고, 모드 전환을 사용할 수 있습니다.

## 7. 관리자 사용법

관리자 로그인:

1. 로그인 화면에서 `관리자 로그인`을 누릅니다.
2. `.env`에 설정한 관리자 아이디와 비밀번호를 입력합니다.
3. 관리자 페이지로 이동합니다.

관리자 페이지 기능:

- `글 관리`: 게시글 검색, 상세 확인, 관리자 삭제 처리
- `주문 관리`: HOOK 주문 검색, 상태 변경, 파트너 JSON 내보내기
- `글/댓글 신고`: 신고된 글과 댓글 확인
- `버그 신고`: 사용자가 보낸 버그 신고 확인
- `모드 전환`: 관리자 페이지에서도 라이트/다크 모드 전환

주문 상태:

```text
pending
processing
completed
cancelled
```

## 8. 파트너 JSON 내보내기

주문이 발생하면 관리자 페이지의 `주문 관리` 탭에서 각 주문을 가상 파트너에게 전달 가능한 JSON 파일로 내보낼 수 있습니다.

사용 방법:

1. 관리자 페이지에 로그인합니다.
2. `주문 관리` 탭으로 이동합니다.
3. 원하는 주문의 `파트너 JSON` 버튼을 누릅니다.
4. `hook-order-<주문번호>-partner-export.json` 파일이 다운로드됩니다.

JSON에는 아래 정보가 포함됩니다.

- 내보내기 스키마 버전
- 가상 파트너 정보
- 주문 번호, 주문 상태, 생성/수정 시각
- 주문자 아이디와 표시 이름
- 책 번호, 책 제목, 책 상태, 원본 글 ID 목록
- 책에 포함된 글의 순서, 본문, 이미지 경로, 작성자, 좋아요 수, 조회수, 댓글 수
- 삭제 여부 같은 운영 메타데이터

이 기능은 실제 결제나 실제 제작 요청을 보내지 않고, 파트너 전달 형식의 JSON을 생성하는 단계까지만 구현되어 있습니다.

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

## 10. 검색과 알림

검색:

- 사이드바의 `검색`에서 게시글과 사용자를 검색합니다.
- 검색 결과의 글을 클릭하면 상세 화면으로 이동합니다.
- 사용자 결과를 클릭하면 해당 프로필로 이동합니다.

알림:

- 멘션 알림
- 좋아요 알림
- 댓글 알림
- 팔로우한 사용자의 새 글 알림
- 알림 클릭 시 읽음 처리
- 전체 확인 버튼으로 전체 읽음 처리

## 11. 프로필과 설정

프로필:

- 프로필 사진 업로드
- 이름, 소개, 관심사 수정
- 작성글, 좋아요, 저장됨, 이미지 확인
- 상대 프로필 팔로우
- 상대 프로필에서 업데이트 안보기, 제한, 차단

설정:

- 비공개 프로필
- 멘션 및 언급 허용 대상
- 태그 허용 대상
- 활동 상태 공개범위
- 제한된 프로필 관리
- 차단된 프로필 관리
- 숨겨진 단어
- 맞춤 필터
- 좋아요수 및 공유수 숨기기

## 12. 문제신고

글 또는 댓글 신고:

1. 글 또는 댓글의 `...` 버튼을 누릅니다.
2. 신고 버튼을 누릅니다.
3. 신고 사유를 입력합니다.
4. 관리자는 `글/댓글 신고` 탭에서 확인합니다.

버그 신고:

1. 더보기 메뉴에서 `문제신고`를 누릅니다.
2. 제목과 내용을 작성합니다.
3. 필요한 경우 이미지를 첨부합니다.
4. 관리자는 `버그 신고` 탭에서 확인합니다.

## 13. 커맨드 모드

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
related
feed popular
feed related
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

기타:

```text
refresh
reload
post 25
clear
exit
close
q
```

## 14. 선택 모드

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

## 15. 로컬 개발 실행

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

로컬 실행 포트 변경:

```bash
uvicorn main:app --host 0.0.0.0 --port 3000
```

## 16. 문제 해결

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
