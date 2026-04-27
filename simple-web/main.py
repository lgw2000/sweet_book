from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timedelta
from passlib.context import CryptContext
import json
import os
import re
import secrets
import shutil
import string
import feed_algorithm

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

OFFENSIVE_WORDS = [
    "ㅅㅂ", "시발", "병신", "개새끼", "미친놈", "미친년", "fuck", "shit",
]

MENTION_PATTERN = re.compile(r"@([^\s@]+)")


def load_env_file(path: str):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


repo_dir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
current_dir = os.path.dirname(os.path.realpath(__file__))
load_env_file(os.path.join(repo_dir, ".env"))
load_env_file(os.path.join(current_dir, ".env"))


class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    display_name = Column(String, default="")
    bio = Column(Text, default="")
    interests = Column(Text, default="[]")
    profile_image = Column(String, default="")
    is_private = Column(Boolean, default=False)
    mention_permission = Column(String, default="everyone")
    tag_permission = Column(String, default="everyone")
    activity_visibility = Column(String, default="everyone")
    hide_offensive_replies = Column(Boolean, default=False)
    hide_like_counts = Column(Boolean, default=False)


class PostDB(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, unique=True, index=True, default="")
    author_id = Column(String, index=True)
    content = Column(Text)
    image_paths = Column(String, default="")
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    author_deleted = Column(Boolean, default=False)
    admin_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PostViewDB(Base):
    __tablename__ = "post_views"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    user_id = Column(String, index=True)
    last_viewed_at = Column(DateTime, default=datetime.utcnow)


class ReplyDB(Base):
    __tablename__ = "replies"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    parent_id = Column(Integer, default=0, index=True)
    author_id = Column(String)
    content = Column(Text)
    likes = Column(Integer, default=0)
    author_deleted = Column(Boolean, default=False)
    admin_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LikeDB(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SaveDB(Base):
    __tablename__ = "saves"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReplyLikeDB(Base):
    __tablename__ = "reply_likes"
    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, index=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReplySaveDB(Base):
    __tablename__ = "reply_saves"
    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, index=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReportDB(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(String, index=True)
    target_type = Column(String, index=True)
    target_id = Column(Integer, index=True)
    reason = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class BugReportDB(Base):
    __tablename__ = "bug_reports"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(String, index=True)
    title = Column(String, default="")
    content = Column(Text, default="")
    image_paths = Column(String, default="")
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)


class FollowDB(Base):
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(String, index=True)
    following_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class BlockDB(Base):
    __tablename__ = "blocks"
    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(String, index=True)
    blocked_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RestrictDB(Base):
    __tablename__ = "restrictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    target_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MuteDB(Base):
    __tablename__ = "muted_updates"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    target_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CustomFilterDB(Base):
    __tablename__ = "custom_filters"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    keyword = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class NotificationReadDB(Base):
    __tablename__ = "notification_reads"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    notification_key = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class HookBookDB(Base):
    __tablename__ = "hook_books"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    title = Column(String, default="")
    source_type = Column(String, default="selected")
    post_ids = Column(Text, default="[]")
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class HookOrderDB(Base):
    __tablename__ = "hook_orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    book_id = Column(Integer, index=True)
    status = Column(String, default="pending")
    memo = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class AdminDB(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminSessionDB(Base):
    __tablename__ = "admin_sessions"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(String, index=True)
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def ensure_column(table_name: str, column_name: str, definition: str, backfill_sql: str = ""):
    with engine.begin() as conn:
        columns = [row[1] for row in conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()]
        if column_name not in columns:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}"))
            if backfill_sql:
                conn.execute(text(backfill_sql))


def make_post_public_id(post_id: int) -> str:
    return f"post-{post_id:06d}"


def get_post_public_id(post: PostDB) -> str:
    return post.public_id or make_post_public_id(post.id)


def get_post_public_url(post: PostDB) -> str:
    return f"/posts/{get_post_public_id(post)}"


def get_post_api_url(post: PostDB) -> str:
    return f"/api/posts/public/{get_post_public_id(post)}"


def find_post_by_public_id(db: Session, public_id: str):
    requested_id = (public_id or "").strip().lower()
    if not requested_id:
        return None
    post = db.query(PostDB).filter(PostDB.public_id == requested_id).first()
    if post:
        return post

    # Some share targets paste surrounding text next to the URL. Public IDs are fixed
    # as post-000000, so recover links like /posts/post-000148100 -> post-000148.
    match = re.match(r"^(post-\d{6})", requested_id)
    if match:
        return db.query(PostDB).filter(PostDB.public_id == match.group(1)).first()
    return None


def ensure_schema_updates():
    ensure_column("likes", "created_at", "DATETIME", "UPDATE likes SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
    ensure_column("saves", "created_at", "DATETIME", "UPDATE saves SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
    ensure_column("users", "display_name", "VARCHAR DEFAULT ''", "UPDATE users SET display_name = user_id WHERE display_name IS NULL OR display_name = ''")
    ensure_column("users", "bio", "TEXT DEFAULT ''", "UPDATE users SET bio = '' WHERE bio IS NULL")
    ensure_column("users", "interests", "TEXT DEFAULT '[]'", "UPDATE users SET interests = '[]' WHERE interests IS NULL OR interests = ''")
    ensure_column("users", "profile_image", "VARCHAR DEFAULT ''", "UPDATE users SET profile_image = '' WHERE profile_image IS NULL")
    ensure_column("users", "is_private", "BOOLEAN DEFAULT 0", "UPDATE users SET is_private = 0 WHERE is_private IS NULL")
    ensure_column("users", "mention_permission", "VARCHAR DEFAULT 'everyone'", "UPDATE users SET mention_permission = 'everyone' WHERE mention_permission IS NULL OR mention_permission = ''")
    ensure_column("users", "tag_permission", "VARCHAR DEFAULT 'everyone'", "UPDATE users SET tag_permission = 'everyone' WHERE tag_permission IS NULL OR tag_permission = ''")
    ensure_column("users", "activity_visibility", "VARCHAR DEFAULT 'everyone'", "UPDATE users SET activity_visibility = 'everyone' WHERE activity_visibility IS NULL OR activity_visibility = ''")
    ensure_column("users", "hide_offensive_replies", "BOOLEAN DEFAULT 0", "UPDATE users SET hide_offensive_replies = 0 WHERE hide_offensive_replies IS NULL")
    ensure_column("users", "hide_like_counts", "BOOLEAN DEFAULT 0", "UPDATE users SET hide_like_counts = 0 WHERE hide_like_counts IS NULL")
    ensure_column("posts", "author_deleted", "BOOLEAN DEFAULT 0", "UPDATE posts SET author_deleted = 0 WHERE author_deleted IS NULL")
    ensure_column("posts", "admin_deleted", "BOOLEAN DEFAULT 0", "UPDATE posts SET admin_deleted = 0 WHERE admin_deleted IS NULL")
    ensure_column("posts", "public_id", "VARCHAR DEFAULT ''")
    ensure_column("replies", "parent_id", "INTEGER DEFAULT 0", "UPDATE replies SET parent_id = 0 WHERE parent_id IS NULL")
    ensure_column("replies", "likes", "INTEGER DEFAULT 0", "UPDATE replies SET likes = 0 WHERE likes IS NULL")
    ensure_column("replies", "author_deleted", "BOOLEAN DEFAULT 0", "UPDATE replies SET author_deleted = 0 WHERE author_deleted IS NULL")
    ensure_column("replies", "admin_deleted", "BOOLEAN DEFAULT 0", "UPDATE replies SET admin_deleted = 0 WHERE admin_deleted IS NULL")


ensure_schema_updates()


def ensure_post_public_ids():
    db = SessionLocal()
    try:
        posts = db.query(PostDB).filter((PostDB.public_id == None) | (PostDB.public_id == "")).all()
        for post in posts:
            post.public_id = make_post_public_id(post.id)
        db.commit()
    finally:
        db.close()

    with engine.begin() as conn:
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_posts_public_id ON posts(public_id)"))


ensure_post_public_ids()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()
upload_dir = os.path.join(current_dir, "static", "uploads")
os.makedirs(upload_dir, exist_ok=True)


def ensure_default_admin():
    admin_id = os.getenv("SWEET_BOOK_ADMIN_ID", "admin")
    admin_password = os.getenv("SWEET_BOOK_ADMIN_PASSWORD", "admin1234")
    db = SessionLocal()
    try:
        existing = db.query(AdminDB).filter(AdminDB.admin_id == admin_id).first()
        if not existing:
            db.add(AdminDB(admin_id=admin_id, hashed_password=pwd_context.hash(admin_password)))
            db.commit()
    finally:
        db.close()


ensure_default_admin()


def ensure_sample_data():
    seed_value = os.getenv("SWEET_BOOK_SEED_SAMPLE", "true")
    seed_enabled = seed_value.lower() not in {"0", "false", "no", "off"}
    if not seed_enabled:
        return

    db = SessionLocal()
    try:
        if db.query(UserDB).first():
            return

        now = datetime.utcnow()
        sample_users = [
            UserDB(
                user_id="lgw2000",
                email="lgw2000@example.com",
                hashed_password=pwd_context.hash("lgw2000"),
                display_name="lgw2000",
                bio="일상의 짧은 장면을 책으로 묶어보는 사용자입니다.",
                interests=json.dumps(["사진", "메모", "HOOK"], ensure_ascii=False),
            ),
            UserDB(
                user_id="glw2000",
                email="glw2000@example.com",
                hashed_password=pwd_context.hash("glw2000"),
                display_name="glw2000",
                bio="댓글과 멘션으로 다른 사용자와 자주 교류합니다.",
                interests=json.dumps(["댓글", "피드", "커뮤니티"], ensure_ascii=False),
            ),
        ]
        db.add_all(sample_users)
        db.flush()

        sample_posts = [
            PostDB(author_id="lgw2000", content="첫 번째 HOOK 샘플 글입니다. 오늘의 기록을 책으로 묶어볼 수 있어요.", likes=3, views=42, created_at=now - timedelta(hours=7)),
            PostDB(author_id="lgw2000", content="@glw2000 님에게 공유하고 싶은 두 번째 장면입니다.", likes=2, views=31, created_at=now - timedelta(hours=5)),
            PostDB(author_id="glw2000", content="댓글과 멘션 알림을 확인하기 위한 샘플 게시글입니다.", likes=1, views=18, created_at=now - timedelta(hours=4)),
            PostDB(author_id="glw2000", content="저장한 글과 좋아요한 글을 모아서 HOOK 책을 구성해보세요.", likes=4, views=55, created_at=now - timedelta(hours=3)),
            PostDB(author_id="lgw2000", content="주문 데이터 JSON 내보내기에 포함될 샘플 콘텐츠입니다.", likes=5, views=77, created_at=now - timedelta(hours=2)),
        ]
        db.add_all(sample_posts)
        db.flush()
        for post in sample_posts:
            post.public_id = make_post_public_id(post.id)

        db.add_all([
            LikeDB(post_id=sample_posts[0].id, user_id="glw2000", created_at=now - timedelta(hours=6)),
            LikeDB(post_id=sample_posts[1].id, user_id="glw2000", created_at=now - timedelta(hours=4, minutes=30)),
            LikeDB(post_id=sample_posts[3].id, user_id="lgw2000", created_at=now - timedelta(hours=2, minutes=40)),
            SaveDB(post_id=sample_posts[0].id, user_id="glw2000", created_at=now - timedelta(hours=5, minutes=50)),
            SaveDB(post_id=sample_posts[4].id, user_id="glw2000", created_at=now - timedelta(hours=1, minutes=30)),
            FollowDB(follower_id="glw2000", following_id="lgw2000", created_at=now - timedelta(hours=5)),
        ])

        reply = ReplyDB(
            post_id=sample_posts[0].id,
            author_id="glw2000",
            content="@lgw2000 이 글은 댓글/멘션 알림 확인용 샘플 댓글입니다.",
            likes=1,
            created_at=now - timedelta(hours=4, minutes=55),
        )
        db.add(reply)
        db.flush()
        db.add(ReplyLikeDB(reply_id=reply.id, user_id="lgw2000", created_at=now - timedelta(hours=3, minutes=20)))

        first_book = HookBookDB(
            user_id="lgw2000",
            title="샘플 HOOK 책",
            source_type="selected",
            post_ids=json.dumps([sample_posts[0].id, sample_posts[1].id, sample_posts[4].id]),
            status="ordered",
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(hours=1, minutes=10),
        )
        second_book = HookBookDB(
            user_id="lgw2000",
            title="저장한 글 모음",
            source_type="saved",
            post_ids=json.dumps([sample_posts[0].id, sample_posts[4].id]),
            status="draft",
            created_at=now - timedelta(hours=1),
            updated_at=now - timedelta(hours=1),
        )
        db.add_all([first_book, second_book])
        db.flush()

        db.add_all([
            HookOrderDB(user_id="lgw2000", book_id=first_book.id, status="pending", memo="심사용 샘플 주문입니다.", created_at=now - timedelta(hours=1), updated_at=now - timedelta(hours=1)),
            HookOrderDB(user_id="lgw2000", book_id=first_book.id, status="processing", memo="상태 변경 확인용 주문입니다.", created_at=now - timedelta(minutes=50), updated_at=now - timedelta(minutes=30)),
        ])
        db.commit()
    finally:
        db.close()


ensure_sample_data()


class SignupRequest(BaseModel):
    user_id: str
    email: str
    password: str


class LoginRequest(BaseModel):
    user_id: str
    password: str


class FindIdRequest(BaseModel):
    email: str


class FindPwRequest(BaseModel):
    user_id: str
    email: str


class ReplyRequest(BaseModel):
    post_id: int
    author_id: str
    content: str
    parent_id: int = 0


class LikeRequest(BaseModel):
    post_id: int
    user_id: str


class SaveRequest(BaseModel):
    post_id: int
    user_id: str


class RelationshipRequest(BaseModel):
    user_id: str
    target_id: str


class SettingsUpdateRequest(BaseModel):
    user_id: str
    is_private: bool
    mention_permission: str
    tag_permission: str
    activity_visibility: str
    hide_offensive_replies: bool
    hide_like_counts: bool


class CustomFilterRequest(BaseModel):
    user_id: str
    keyword: str


class NotificationReadRequest(BaseModel):
    user_id: str
    notification_key: str


class NotificationReadAllRequest(BaseModel):
    user_id: str


class HookBookRequest(BaseModel):
    user_id: str
    title: str
    source_type: str = "selected"
    post_ids: List[int] = []
    status: str = "draft"


class HookBookUpdateRequest(BaseModel):
    user_id: str
    title: Optional[str] = None
    source_type: Optional[str] = None
    post_ids: Optional[List[int]] = None
    status: Optional[str] = None


class HookOrderRequest(BaseModel):
    user_id: str
    book_id: int
    memo: str = ""


class HookStatusRequest(BaseModel):
    user_id: str
    status: str


class HookOrderCancelRequest(BaseModel):
    user_id: str


class PostDeleteRequest(BaseModel):
    user_id: str


class ReplyActionRequest(BaseModel):
    user_id: str
    reply_id: int


class ReportRequest(BaseModel):
    reporter_id: str
    target_id: int
    reason: str


class AdminLoginRequest(BaseModel):
    admin_id: str
    password: str


class AdminTokenRequest(BaseModel):
    token: str


class AdminOrderStatusRequest(BaseModel):
    token: str
    status: str


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user(db: Session, user_id: str):
    return db.query(UserDB).filter(UserDB.user_id == user_id).first()


def require_admin(db: Session, token_value: str):
    session = db.query(AdminSessionDB).filter(AdminSessionDB.token == token_value).first()
    if not session:
        raise HTTPException(status_code=401, detail="관리자 로그인이 필요합니다.")
    admin = db.query(AdminDB).filter(AdminDB.admin_id == session.admin_id).first()
    if not admin:
        raise HTTPException(status_code=401, detail="관리자 권한을 확인할 수 없습니다.")
    return admin


def parse_json_list(value: str):
    try:
        parsed = json.loads(value or "[]")
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def serialize_interests(raw_value: str):
    items = [item.strip() for item in (raw_value or "").split(",") if item.strip()]
    return json.dumps(items, ensure_ascii=False)


def get_initials(user: UserDB):
    source = (user.display_name or user.user_id or "US").strip()
    return source[:2].upper()


def save_upload(file: UploadFile):
    if not file or not file.filename:
        return ""
    ext = os.path.splitext(file.filename)[1] or ".png"
    filename = f"{secrets.token_hex(8)}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/static/uploads/{filename}"


def is_following(db: Session, follower_id: str, following_id: str) -> bool:
    if not follower_id or not following_id:
        return False
    return db.query(FollowDB).filter(
        FollowDB.follower_id == follower_id,
        FollowDB.following_id == following_id,
    ).first() is not None


def is_blocked(db: Session, viewer_id: str, target_id: str) -> bool:
    if not viewer_id or not target_id:
        return False
    return db.query(BlockDB).filter(
        BlockDB.blocker_id == viewer_id,
        BlockDB.blocked_id == target_id,
    ).first() is not None


def has_block_relationship(db: Session, user_a: str, user_b: str) -> bool:
    return is_blocked(db, user_a, user_b) or is_blocked(db, user_b, user_a)


def is_muted(db: Session, user_id: str, target_id: str) -> bool:
    return db.query(MuteDB).filter(MuteDB.user_id == user_id, MuteDB.target_id == target_id).first() is not None


def is_restricted(db: Session, user_id: str, target_id: str) -> bool:
    return db.query(RestrictDB).filter(RestrictDB.user_id == user_id, RestrictDB.target_id == target_id).first() is not None


def can_view_private_profile(db: Session, viewer_id: str, target_user: UserDB) -> bool:
    if not target_user:
        return False
    if not target_user.is_private:
        return True
    if viewer_id == target_user.user_id:
        return True
    return is_following(db, viewer_id, target_user.user_id)


def can_mention_user(db: Session, actor_id: str, target_user: UserDB) -> bool:
    if not actor_id or not target_user or actor_id == target_user.user_id:
        return True
    if has_block_relationship(db, actor_id, target_user.user_id):
        return False
    permission = target_user.mention_permission or "everyone"
    if permission == "everyone":
        return True
    if permission == "following":
        return is_following(db, target_user.user_id, actor_id)
    return False


def validate_mentions(db: Session, text_value: str, actor_id: str):
    mention_ids = {match.strip() for match in MENTION_PATTERN.findall(text_value or "") if match.strip()}
    for mention_id in mention_ids:
        mentioned_user = get_user(db, mention_id)
        if mentioned_user and not can_mention_user(db, actor_id, mentioned_user):
            raise HTTPException(
                status_code=400,
                detail=f"@{mention_id} 님은 현재 회원님의 멘션을 허용하지 않습니다.",
            )


def contains_forbidden_term(text_value: str, viewer: UserDB, custom_keywords: List[str]) -> bool:
    normalized = (text_value or "").lower()
    if viewer and viewer.hide_offensive_replies and any(word in normalized for word in OFFENSIVE_WORDS):
        return True
    return any(keyword.lower() in normalized for keyword in custom_keywords)


def get_custom_filter_keywords(db: Session, user_id: str) -> List[str]:
    rows = db.query(CustomFilterDB).filter(CustomFilterDB.user_id == user_id).order_by(CustomFilterDB.created_at.desc()).all()
    return [row.keyword for row in rows]


def viewer_profile_summary(db: Session, target_id: str):
    user = get_user(db, target_id)
    if not user:
        return None
    return {
        "user_id": user.user_id,
        "display_name": user.display_name or user.user_id,
        "profile_image": user.profile_image or "",
        "initials": get_initials(user),
    }


def serialize_settings(db: Session, user: UserDB):
    return {
        "is_private": bool(user.is_private),
        "mention_permission": user.mention_permission or "everyone",
        "tag_permission": user.tag_permission or "everyone",
        "activity_visibility": user.activity_visibility or "everyone",
        "hide_offensive_replies": bool(user.hide_offensive_replies),
        "hide_like_counts": bool(user.hide_like_counts),
        "custom_filters": get_custom_filter_keywords(db, user.user_id),
        "restricted_profiles": [
            viewer_profile_summary(db, row.target_id)
            for row in db.query(RestrictDB).filter(RestrictDB.user_id == user.user_id).order_by(RestrictDB.created_at.desc()).all()
        ],
        "blocked_profiles": [
            viewer_profile_summary(db, row.blocked_id)
            for row in db.query(BlockDB).filter(BlockDB.blocker_id == user.user_id).order_by(BlockDB.created_at.desc()).all()
        ],
        "muted_profiles": [
            viewer_profile_summary(db, row.target_id)
            for row in db.query(MuteDB).filter(MuteDB.user_id == user.user_id).order_by(MuteDB.created_at.desc()).all()
        ],
    }


def serialize_reply(reply: ReplyDB, db: Session, current_user_id: str = "", children_map=None):
    children_map = children_map or {}
    is_liked = False
    is_saved = False
    if current_user_id:
        is_liked = db.query(ReplyLikeDB).filter(ReplyLikeDB.reply_id == reply.id, ReplyLikeDB.user_id == current_user_id).first() is not None
        is_saved = db.query(ReplySaveDB).filter(ReplySaveDB.reply_id == reply.id, ReplySaveDB.user_id == current_user_id).first() is not None
    return {
        "id": reply.id,
        "post_id": reply.post_id,
        "parent_id": reply.parent_id or 0,
        "author_id": reply.author_id,
        "content": reply.content,
        "likes": reply.likes or 0,
        "is_liked": is_liked,
        "is_saved": is_saved,
        "can_delete": bool(current_user_id and reply.author_id == current_user_id and not reply.author_deleted and not reply.admin_deleted),
        "created_at": reply.created_at.isoformat(),
        "children": [
            serialize_reply(child, db, current_user_id, children_map)
            for child in children_map.get(reply.id, [])
        ],
    }


def serialize_admin_reply(reply: ReplyDB, children_map=None):
    children_map = children_map or {}
    return {
        "id": reply.id,
        "post_id": reply.post_id,
        "parent_id": reply.parent_id or 0,
        "author_id": reply.author_id,
        "content": reply.content,
        "likes": reply.likes or 0,
        "author_deleted": bool(reply.author_deleted),
        "admin_deleted": bool(reply.admin_deleted),
        "created_at": reply.created_at.isoformat(),
        "children": [
            serialize_admin_reply(child, children_map)
            for child in children_map.get(reply.id, [])
        ],
    }


def format_post(post: PostDB, db: Session, current_user_id: str = ""):
    viewer = get_user(db, current_user_id) if current_user_id else None
    viewer_keywords = get_custom_filter_keywords(db, current_user_id) if current_user_id else []
    replies = db.query(ReplyDB).filter(ReplyDB.post_id == post.id, ReplyDB.admin_deleted == False, ReplyDB.author_deleted == False).order_by(ReplyDB.created_at.asc()).all()

    visible_replies = []
    hidden_reply_count = 0
    for reply in replies:
        if current_user_id and contains_forbidden_term(reply.content, viewer, viewer_keywords) and reply.author_id != current_user_id:
            hidden_reply_count += 1
        else:
            visible_replies.append(reply)

    images = [item for item in (post.image_paths or "").split(",") if item]
    is_liked = False
    is_saved = False
    if current_user_id:
        is_liked = db.query(LikeDB).filter(LikeDB.post_id == post.id, LikeDB.user_id == current_user_id).first() is not None
        is_saved = db.query(SaveDB).filter(SaveDB.post_id == post.id, SaveDB.user_id == current_user_id).first() is not None

    hide_metrics = bool(viewer and viewer.hide_like_counts and post.author_id != current_user_id)
    author = get_user(db, post.author_id)
    children_map = {}
    for reply in visible_replies:
        children_map.setdefault(reply.parent_id or 0, []).append(reply)
    public_id = get_post_public_id(post)
    return {
        "id": post.id,
        "public_id": public_id,
        "url": get_post_public_url(post),
        "api_url": get_post_api_url(post),
        "author_id": post.author_id,
        "author_name": author.display_name if author and author.display_name else post.author_id,
        "author_profile_image": author.profile_image if author else "",
        "author_initials": get_initials(author) if author else post.author_id[:2].upper(),
        "content": post.content,
        "images": images,
        "likes": post.likes,
        "views": post.views,
        "created_at": post.created_at.isoformat(),
        "is_liked": is_liked,
        "is_saved": is_saved,
        "can_delete": bool(current_user_id and post.author_id == current_user_id and not post.author_deleted and not post.admin_deleted),
        "hide_metrics": hide_metrics,
        "hidden_reply_count": hidden_reply_count,
        "replies": [
            serialize_reply(reply, db, current_user_id, children_map)
            for reply in children_map.get(0, [])
        ],
    }


def serialize_admin_post(post: PostDB, db: Session):
    replies = db.query(ReplyDB).filter(ReplyDB.post_id == post.id).order_by(ReplyDB.created_at.asc()).all()
    children_map = {}
    for reply in replies:
        children_map.setdefault(reply.parent_id or 0, []).append(reply)
    public_id = get_post_public_id(post)
    return {
        "id": post.id,
        "public_id": public_id,
        "url": get_post_public_url(post),
        "api_url": get_post_api_url(post),
        "author_id": post.author_id,
        "content": post.content,
        "images": [item for item in (post.image_paths or "").split(",") if item],
        "likes": post.likes,
        "views": post.views,
        "reply_count": db.query(ReplyDB).filter(ReplyDB.post_id == post.id).count(),
        "author_deleted": bool(post.author_deleted),
        "admin_deleted": bool(post.admin_deleted),
        "created_at": post.created_at.isoformat(),
        "replies": [
            serialize_admin_reply(reply, children_map)
            for reply in children_map.get(0, [])
        ],
    }


def serialize_admin_order(order: HookOrderDB, db: Session):
    book = db.query(HookBookDB).filter(HookBookDB.id == order.book_id).first()
    return {
        "id": order.id,
        "user_id": order.user_id,
        "book_id": order.book_id,
        "book_title": book.title if book else f"HOOK 책 #{order.book_id}",
        "status": order.status,
        "memo": order.memo or "",
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat(),
    }


def build_partner_order_export(order: HookOrderDB, db: Session):
    book = db.query(HookBookDB).filter(HookBookDB.id == order.book_id).first()
    customer = get_user(db, order.user_id)
    post_ids = parse_post_ids(book.post_ids) if book else []
    posts = db.query(PostDB).filter(PostDB.id.in_(post_ids)).all() if post_ids else []
    posts_by_id = {post.id: post for post in posts}
    ordered_posts = [posts_by_id[post_id] for post_id in post_ids if post_id in posts_by_id]

    return {
        "schema_version": "partner-order-export.v1",
        "exported_at": datetime.utcnow().isoformat(),
        "partner": {
            "name": "Virtual HOOK Book Partner",
            "handoff_type": "book_order_payload",
            "format": "json",
        },
        "order": {
            "id": order.id,
            "status": order.status,
            "memo": order.memo or "",
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
        },
        "customer": {
            "user_id": order.user_id,
            "display_name": customer.display_name if customer and customer.display_name else order.user_id,
            "profile_image": customer.profile_image if customer else "",
        },
        "book": {
            "id": book.id if book else order.book_id,
            "title": book.title if book else f"HOOK 책 #{order.book_id}",
            "source_type": book.source_type if book else "",
            "status": book.status if book else "",
            "post_ids": post_ids,
            "created_at": book.created_at.isoformat() if book else "",
            "updated_at": book.updated_at.isoformat() if book else "",
        },
        "contents": [
            {
                "sequence": index + 1,
                "post_id": post.id,
                "post_public_id": get_post_public_id(post),
                "post_url": get_post_public_url(post),
                "post_api_url": get_post_api_url(post),
                "author_id": post.author_id,
                "content": post.content or "",
                "images": [item for item in (post.image_paths or "").split(",") if item],
                "metrics": {
                    "likes": post.likes,
                    "views": post.views,
                    "reply_count": db.query(ReplyDB).filter(ReplyDB.post_id == post.id).count(),
                },
                "flags": {
                    "author_deleted": bool(post.author_deleted),
                    "admin_deleted": bool(post.admin_deleted),
                },
                "created_at": post.created_at.isoformat(),
            }
            for index, post in enumerate(ordered_posts)
        ],
        "fulfillment_note": "This is a virtual partner payload. No real production or payment is triggered.",
    }


def serialize_report(report: ReportDB, db: Session):
    target = None
    post = None
    if report.target_type == "post":
        post = db.query(PostDB).filter(PostDB.id == report.target_id).first()
        target = serialize_admin_post(post, db) if post else None
    if report.target_type == "reply":
        reply = db.query(ReplyDB).filter(ReplyDB.id == report.target_id).first()
        if reply:
            post = db.query(PostDB).filter(PostDB.id == reply.post_id).first()
            target = {
                "id": reply.id,
                "post_id": reply.post_id,
                "parent_id": reply.parent_id or 0,
                "author_id": reply.author_id,
                "content": reply.content,
                "likes": reply.likes or 0,
                "created_at": reply.created_at.isoformat(),
                "post": serialize_admin_post(post, db) if post else None,
            }
    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "target_type": report.target_type,
        "target_id": report.target_id,
        "reason": report.reason,
        "created_at": report.created_at.isoformat(),
        "target": target,
    }


def serialize_bug_report(report: BugReportDB):
    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "title": report.title,
        "content": report.content,
        "images": [item for item in (report.image_paths or "").split(",") if item],
        "status": report.status,
        "created_at": report.created_at.isoformat(),
    }


def make_preview(text_value: str, limit: int = 90):
    compact = " ".join((text_value or "").split())
    return compact if len(compact) <= limit else compact[: limit - 1] + "…"


def add_months(value: datetime, months: int):
    month = value.month - 1 + months
    year = value.year + month // 12
    month = month % 12 + 1
    return value.replace(year=year, month=month, day=1, hour=0, minute=0, second=0, microsecond=0)


def parse_activity_start(start: str, fallback: datetime):
    if not start:
        return fallback
    try:
        return datetime.fromisoformat(start.replace("Z", ""))
    except ValueError:
        return fallback


def activity_bucket_ranges(period: str, start: str = ""):
    now = datetime.utcnow()
    period = period if period in {"day", "week", "month", "year"} else "week"
    if period == "year":
        base = parse_activity_start(start, now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0))
        base = base.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        return [
            {"label": f"{month}월", "start": add_months(base, month - 1), "end": add_months(base, month), "next_period": "month"}
            for month in range(1, 13)
        ]
    if period == "month":
        base = parse_activity_start(start, now.replace(day=1, hour=0, minute=0, second=0, microsecond=0))
        base = base.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return [
            {"label": f"{index + 1}주", "start": base + timedelta(days=index * 7), "end": base + timedelta(days=(index + 1) * 7), "next_period": "week"}
            for index in range(4)
        ]
    if period == "week":
        base = parse_activity_start(start, now - timedelta(days=now.weekday()))
        base = base.replace(hour=0, minute=0, second=0, microsecond=0)
        return [
            {"label": ["월", "화", "수", "목", "금", "토", "일"][index], "start": base + timedelta(days=index), "end": base + timedelta(days=index + 1), "next_period": "day"}
            for index in range(7)
        ]
    base = parse_activity_start(start, now.replace(hour=0, minute=0, second=0, microsecond=0))
    base = base.replace(hour=0, minute=0, second=0, microsecond=0)
    return [
        {"label": f"{hour:02d}시", "start": base + timedelta(hours=hour), "end": base + timedelta(hours=hour + 1), "next_period": ""}
        for hour in range(24)
    ]


def count_mentions_in_text(text_value: str, user_id: str, exclude_self: bool = False):
    mentions = MENTION_PATTERN.findall(text_value or "")
    if exclude_self:
        mentions = [mention for mention in mentions if mention != user_id]
    return len(mentions)


def record_post_view(post: PostDB, user_id: str, db: Session):
    if not user_id or post.author_id == user_id:
        return False
    now = datetime.utcnow()
    existing = db.query(PostViewDB).filter(PostViewDB.post_id == post.id, PostViewDB.user_id == user_id).first()
    if existing and existing.last_viewed_at and now - existing.last_viewed_at < timedelta(hours=6):
        return False
    if existing:
        existing.last_viewed_at = now
    else:
        db.add(PostViewDB(post_id=post.id, user_id=user_id, last_viewed_at=now))
    post.views = (post.views or 0) + 1
    db.commit()
    db.refresh(post)
    return True


def serialize_notification(key: str, category: str, actor_id: str, created_at: datetime, post: PostDB, source_text: str, note: str, db: Session, current_user_id: str):
    return {
        "key": key,
        "category": category,
        "actor_id": actor_id,
        "actor": viewer_profile_summary(db, actor_id),
        "created_at": created_at.isoformat(),
        "post_id": post.id,
        "post_preview": make_preview(post.content),
        "source_preview": make_preview(source_text),
        "note": note,
        "post": format_post(post, db, current_user_id),
    }


def parse_post_ids(raw_value: str) -> List[int]:
    ids = []
    for item in parse_json_list(raw_value):
        try:
            ids.append(int(item))
        except (TypeError, ValueError):
            continue
    return ids


def serialize_hook_book(book: HookBookDB, db: Session, current_user_id: str):
    post_ids = parse_post_ids(book.post_ids)
    posts = db.query(PostDB).filter(PostDB.id.in_(post_ids)).all() if post_ids else []
    posts_by_id = {post.id: post for post in filter_posts_for_viewer(posts, db, current_user_id)}
    ordered_posts = [format_post(posts_by_id[post_id], db, current_user_id) for post_id in post_ids if post_id in posts_by_id]
    return {
        "id": book.id,
        "user_id": book.user_id,
        "title": book.title,
        "source_type": book.source_type,
        "post_ids": post_ids,
        "status": book.status,
        "created_at": book.created_at.isoformat(),
        "updated_at": book.updated_at.isoformat(),
        "posts": ordered_posts,
    }


def serialize_hook_order(order: HookOrderDB, db: Session, current_user_id: str):
    book = db.query(HookBookDB).filter(HookBookDB.id == order.book_id, HookBookDB.user_id == order.user_id).first()
    return {
        "id": order.id,
        "user_id": order.user_id,
        "book_id": order.book_id,
        "status": order.status,
        "memo": order.memo or "",
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat(),
        "book": serialize_hook_book(book, db, current_user_id) if book else None,
    }


def normalize_post_ids(db: Session, user_id: str, post_ids: List[int]) -> List[int]:
    unique_ids = []
    for post_id in post_ids:
        if post_id not in unique_ids:
            unique_ids.append(post_id)
    posts = db.query(PostDB).filter(PostDB.id.in_(unique_ids)).all() if unique_ids else []
    visible = {post.id for post in filter_posts_for_viewer(posts, db, user_id)}
    return [post_id for post_id in unique_ids if post_id in visible]


def get_read_notification_keys(db: Session, user_id: str):
    rows = db.query(NotificationReadDB).filter(NotificationReadDB.user_id == user_id).all()
    return {row.notification_key for row in rows}


def mark_notification_read(db: Session, user_id: str, notification_key: str):
    if not user_id or not notification_key:
        return
    exists = db.query(NotificationReadDB).filter(
        NotificationReadDB.user_id == user_id,
        NotificationReadDB.notification_key == notification_key,
    ).first()
    if not exists:
        db.add(NotificationReadDB(user_id=user_id, notification_key=notification_key))


def filter_posts_for_viewer(posts: List[PostDB], db: Session, viewer_id: str):
    viewer = get_user(db, viewer_id) if viewer_id else None
    viewer_keywords = get_custom_filter_keywords(db, viewer_id) if viewer_id else []
    visible_posts = []
    for post in posts:
        author = get_user(db, post.author_id)
        if not author:
            continue
        if post.author_deleted or post.admin_deleted:
            continue
        if viewer_id and has_block_relationship(db, viewer_id, author.user_id):
            continue
        if viewer_id and is_muted(db, viewer_id, author.user_id) and author.user_id != viewer_id:
            continue
        if not can_view_private_profile(db, viewer_id, author):
            continue
        if viewer_id and contains_forbidden_term(post.content, viewer, viewer_keywords) and author.user_id != viewer_id:
            continue
        visible_posts.append(post)
    return visible_posts


@app.post("/api/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.user_id == req.user_id).first():
        raise HTTPException(status_code=400, detail="이미 사용중인 아이디입니다.")
    if db.query(UserDB).filter(UserDB.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 사용중인 이메일입니다.")

    new_user = UserDB(
        user_id=req.user_id,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        display_name=req.user_id,
    )
    db.add(new_user)
    db.commit()
    return {"message": "회원가입이 완료되었습니다."}


@app.post("/api/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = get_user(db, req.user_id)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 잘못되었습니다.")
    return {"message": "로그인 성공!"}


@app.post("/api/admin/login")
def admin_login(req: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminDB).filter(AdminDB.admin_id == req.admin_id).first()
    if not admin or not verify_password(req.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="관리자 아이디 또는 비밀번호가 잘못되었습니다.")
    token_value = secrets.token_urlsafe(32)
    db.add(AdminSessionDB(admin_id=admin.admin_id, token=token_value))
    db.commit()
    return {"message": "관리자 로그인 성공", "token": token_value, "admin_id": admin.admin_id}


@app.post("/api/find-id")
def find_id(req: FindIdRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 이메일로 가입된 아이디가 없습니다.")
    return {"user_id": user.user_id}


@app.post("/api/find-pw")
def find_pw(req: FindPwRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.user_id == req.user_id, UserDB.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="입력하신 정보와 일치하는 계정이 없습니다.")
    temp_pw = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
    user.hashed_password = get_password_hash(temp_pw)
    db.commit()
    return {"temp_password": temp_pw}


@app.get("/api/me")
def get_me(user_id: str, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return {
        "user_id": user.user_id,
        "display_name": user.display_name or user.user_id,
        "bio": user.bio or "",
        "interests": parse_json_list(user.interests),
        "profile_image": user.profile_image or "",
        "initials": get_initials(user),
        "settings": serialize_settings(db, user),
    }


@app.post("/api/profile/update")
async def update_profile(
    user_id: str = Form(...),
    display_name: str = Form(...),
    bio: str = Form(default=""),
    interests: str = Form(default=""),
    profile_image: UploadFile = File(default=None),
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    validate_mentions(db, bio, user_id)
    user.display_name = display_name.strip() or user.user_id
    user.bio = bio.strip()
    user.interests = serialize_interests(interests)
    if profile_image and profile_image.filename:
        user.profile_image = save_upload(profile_image)
    db.commit()

    return {
        "message": "프로필이 저장되었습니다.",
        "profile": {
            "user_id": user.user_id,
            "display_name": user.display_name,
            "bio": user.bio,
            "interests": parse_json_list(user.interests),
            "profile_image": user.profile_image or "",
            "initials": get_initials(user),
        },
    }


@app.get("/api/settings/{user_id}")
def get_settings(user_id: str, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return serialize_settings(db, user)


@app.post("/api/settings/update")
def update_settings(req: SettingsUpdateRequest, db: Session = Depends(get_db)):
    user = get_user(db, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    user.is_private = req.is_private
    user.mention_permission = req.mention_permission
    user.tag_permission = req.tag_permission
    user.activity_visibility = req.activity_visibility
    user.hide_offensive_replies = req.hide_offensive_replies
    user.hide_like_counts = req.hide_like_counts
    db.commit()
    return {"message": "설정이 저장되었습니다.", "settings": serialize_settings(db, user)}


@app.post("/api/settings/custom-filter")
def add_custom_filter(req: CustomFilterRequest, db: Session = Depends(get_db)):
    if not get_user(db, req.user_id):
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    keyword = req.keyword.strip()
    if not keyword:
        raise HTTPException(status_code=400, detail="필터 단어를 입력해주세요.")
    exists = db.query(CustomFilterDB).filter(CustomFilterDB.user_id == req.user_id, CustomFilterDB.keyword == keyword).first()
    if not exists:
        db.add(CustomFilterDB(user_id=req.user_id, keyword=keyword))
        db.commit()
    return {"custom_filters": get_custom_filter_keywords(db, req.user_id)}


@app.post("/api/settings/custom-filter/remove")
def remove_custom_filter(req: CustomFilterRequest, db: Session = Depends(get_db)):
    row = db.query(CustomFilterDB).filter(CustomFilterDB.user_id == req.user_id, CustomFilterDB.keyword == req.keyword.strip()).first()
    if row:
        db.delete(row)
        db.commit()
    return {"custom_filters": get_custom_filter_keywords(db, req.user_id)}


@app.post("/api/posts")
async def create_post(
    author_id: str = Form(...),
    content: str = Form(default=""),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    author = get_user(db, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="작성자를 찾을 수 없습니다.")
    validate_mentions(db, content, author_id)

    saved_paths = []
    for image in (images or [])[:2]:
        if image.filename:
            saved_paths.append(save_upload(image))

    post = PostDB(author_id=author_id, content=content, image_paths=",".join(saved_paths))
    db.add(post)
    db.flush()
    post.public_id = make_post_public_id(post.id)
    db.commit()
    db.refresh(post)
    return {"message": "Post created successfully", "post": format_post(post, db, author_id)}


@app.get("/api/feed")
def get_feed(
    type: str = "latest",
    timeframe: str = "alltime",
    user_id: str = "",
    limit: int = 100,
    offset: int = 0,
    paged: bool = False,
    db: Session = Depends(get_db),
):
    posts = filter_posts_for_viewer(db.query(PostDB).all(), db, user_id)
    for post in posts:
        post.reply_count = db.query(ReplyDB).filter(ReplyDB.post_id == post.id).count()

    sorted_posts = feed_algorithm.sort_feed(posts, feed_type=type, timeframe=timeframe, current_user_id=user_id)
    if paged:
        total = len(sorted_posts)
        safe_limit = min(max(limit, 1), 100)
        safe_offset = max(offset, 0)
        if type == "latest":
            end = max(total - safe_offset, 0)
            start = max(end - safe_limit, 0)
            page_posts = sorted_posts[start:end]
            has_more = start > 0
        else:
            start = safe_offset
            end = min(start + safe_limit, total)
            page_posts = sorted_posts[start:end]
            has_more = end < total

        return {
            "posts": [format_post(post, db, user_id) for post in page_posts],
            "next_offset": safe_offset + len(page_posts),
            "has_more": has_more,
            "total": total,
        }

    return [format_post(post, db, user_id) for post in sorted_posts]


@app.get("/api/search")
def search_posts(q: str, user_id: str = "", db: Session = Depends(get_db)):
    if not q:
        return []
    posts = db.query(PostDB).filter(
        (PostDB.content.like(f"%{q}%")) |
        (PostDB.author_id.like(f"%{q}%")) |
        (PostDB.public_id.like(f"%{q}%"))
    ).all()
    visible_posts = filter_posts_for_viewer(posts, db, user_id)
    visible_posts.sort(key=lambda item: item.created_at, reverse=False)
    return [format_post(post, db, user_id) for post in visible_posts]


@app.get("/api/post/{post_id}")
def get_single_post(post_id: int, user_id: str = "", increment_view: bool = False, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post or not filter_posts_for_viewer([post], db, user_id):
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if increment_view:
        record_post_view(post, user_id, db)
    return format_post(post, db, user_id)


@app.get("/api/posts/public/{public_id}")
def get_single_post_by_public_id(public_id: str, user_id: str = "", increment_view: bool = False, db: Session = Depends(get_db)):
    post = find_post_by_public_id(db, public_id)
    if not post or not filter_posts_for_viewer([post], db, user_id):
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if increment_view:
        record_post_view(post, user_id, db)
    return format_post(post, db, user_id)


@app.get("/api/users/search")
def search_users(q: str, user_id: str = "", include_self: bool = False, db: Session = Depends(get_db)):
    term = (q or "").strip()
    if not term:
        return []
    users = db.query(UserDB).filter(
        (UserDB.user_id.like(f"%{term}%")) |
        (UserDB.display_name.like(f"%{term}%"))
    ).order_by(UserDB.user_id.asc()).limit(20).all()
    results = []
    for user in users:
        if user.user_id == user_id and not include_self:
            continue
        if has_block_relationship(db, user_id, user.user_id):
            continue
        results.append({
            "user_id": user.user_id,
            "display_name": user.display_name or user.user_id,
            "profile_image": user.profile_image or "",
            "initials": get_initials(user),
        })
    return results


@app.get("/api/activity")
def get_activity(user_id: str, period: str = "week", start: str = "", db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    authored_posts = db.query(PostDB).filter(PostDB.author_id == user_id).all()
    authored_post_ids = [post.id for post in authored_posts]
    authored_replies = db.query(ReplyDB).filter(ReplyDB.author_id == user_id).all()
    post_likes_given = db.query(LikeDB).filter(LikeDB.user_id == user_id).all()
    reply_likes_given = db.query(ReplyLikeDB).filter(ReplyLikeDB.user_id == user_id).all()
    post_saves = db.query(SaveDB).filter(SaveDB.user_id == user_id).all()
    reply_saves = db.query(ReplySaveDB).filter(ReplySaveDB.user_id == user_id).all()
    mentioned_posts = db.query(PostDB).filter(PostDB.author_id != user_id, PostDB.content.like(f"%@{user_id}%")).all()
    mentioned_replies = db.query(ReplyDB).filter(ReplyDB.author_id != user_id, ReplyDB.content.like(f"%@{user_id}%")).all()
    received_post_likes = db.query(LikeDB).filter(LikeDB.post_id.in_(authored_post_ids)).all() if authored_post_ids else []
    received_comments = db.query(ReplyDB).filter(ReplyDB.post_id.in_(authored_post_ids)).all() if authored_post_ids else []

    buckets = activity_bucket_ranges(period, start)
    my_activity_series = []
    my_posts_series = []
    for bucket in buckets:
        started_at = bucket["start"]
        ended_at = bucket["end"]
        likes_given = len([row for row in post_likes_given if started_at <= row.created_at < ended_at]) + len([row for row in reply_likes_given if started_at <= row.created_at < ended_at])
        saves_count = len([row for row in post_saves if started_at <= row.created_at < ended_at]) + len([row for row in reply_saves if started_at <= row.created_at < ended_at])
        reply_count = len([reply for reply in authored_replies if started_at <= reply.created_at < ended_at])
        mentions_made = sum(count_mentions_in_text(post.content, user_id, True) for post in authored_posts if started_at <= post.created_at < ended_at)
        mentions_made += sum(count_mentions_in_text(reply.content, user_id, True) for reply in authored_replies if started_at <= reply.created_at < ended_at)
        mentions_received = sum(count_mentions_in_text(post.content, user_id) for post in mentioned_posts if started_at <= post.created_at < ended_at)
        mentions_received += sum(count_mentions_in_text(reply.content, user_id) for reply in mentioned_replies if started_at <= reply.created_at < ended_at)
        post_likes_received = len([row for row in received_post_likes if started_at <= row.created_at < ended_at])
        post_comments_received = len([reply for reply in received_comments if started_at <= reply.created_at < ended_at])

        my_activity_values = [
            {"label": "좋아요", "value": likes_given},
            {"label": "저장", "value": saves_count},
            {"label": "댓글", "value": reply_count},
            {"label": "멘션함", "value": mentions_made},
            {"label": "멘션받음", "value": mentions_received},
        ]
        my_post_values = [
            {"label": "받은 좋아요", "value": post_likes_received},
            {"label": "받은 댓글", "value": post_comments_received},
        ]
        bucket_meta = {
            "label": bucket["label"],
            "start": started_at.isoformat(),
            "end": ended_at.isoformat(),
            "next_period": bucket["next_period"],
        }
        my_activity_series.append({**bucket_meta, "total": sum(item["value"] for item in my_activity_values), "values": my_activity_values})
        my_posts_series.append({**bucket_meta, "total": sum(item["value"] for item in my_post_values), "values": my_post_values})

    return {
        "period": period if period in {"day", "week", "month", "year"} else "week",
        "start": buckets[0]["start"].isoformat() if buckets else "",
        "my_activity": my_activity_series,
        "my_posts": my_posts_series,
    }


@app.get("/api/saves")
def get_saves(user_id: str, requesting_user_id: str = "", db: Session = Depends(get_db)):
    if user_id != requesting_user_id:
        return {"posts": [], "replies": []}
    post_ids = [row.post_id for row in db.query(SaveDB).filter(SaveDB.user_id == user_id).all()]
    posts = db.query(PostDB).filter(PostDB.id.in_(post_ids)).all() if post_ids else []
    reply_ids = [row.reply_id for row in db.query(ReplySaveDB).filter(ReplySaveDB.user_id == user_id).order_by(ReplySaveDB.created_at.desc()).all()]
    replies = db.query(ReplyDB).filter(ReplyDB.id.in_(reply_ids), ReplyDB.admin_deleted == False, ReplyDB.author_deleted == False).all() if reply_ids else []
    replies_by_id = {reply.id: reply for reply in replies}
    return {
        "posts": [format_post(post, db, user_id) for post in filter_posts_for_viewer(posts, db, user_id)],
        "replies": [
            {
                "reply": serialize_reply(replies_by_id[reply_id], db, user_id),
                "post": format_post(db.query(PostDB).filter(PostDB.id == replies_by_id[reply_id].post_id).first(), db, user_id),
            }
            for reply_id in reply_ids
            if reply_id in replies_by_id and db.query(PostDB).filter(PostDB.id == replies_by_id[reply_id].post_id).first()
        ],
    }


@app.get("/api/hook/sources")
def get_hook_sources(user_id: str, db: Session = Depends(get_db)):
    if not get_user(db, user_id):
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    liked_ids = [row.post_id for row in db.query(LikeDB).filter(LikeDB.user_id == user_id).order_by(LikeDB.created_at.desc()).all()]
    saved_ids = [row.post_id for row in db.query(SaveDB).filter(SaveDB.user_id == user_id).order_by(SaveDB.id.desc()).all()]
    own_posts = filter_posts_for_viewer(db.query(PostDB).filter(PostDB.author_id == user_id).all(), db, user_id)
    own_top_liked = sorted(
        [post for post in own_posts if (post.likes or 0) >= 1],
        key=lambda post: (post.likes or 0, post.created_at),
        reverse=True,
    )[:12]
    own_top_viewed = sorted(
        [post for post in own_posts if (post.views or 0) >= 1],
        key=lambda post: (post.views or 0, post.created_at),
        reverse=True,
    )[:12]

    liked_posts = db.query(PostDB).filter(PostDB.id.in_(liked_ids)).all() if liked_ids else []
    saved_posts = db.query(PostDB).filter(PostDB.id.in_(saved_ids)).all() if saved_ids else []
    liked_by_id = {post.id: post for post in filter_posts_for_viewer(liked_posts, db, user_id)}
    saved_by_id = {post.id: post for post in filter_posts_for_viewer(saved_posts, db, user_id)}

    return {
        "liked": [format_post(liked_by_id[post_id], db, user_id) for post_id in liked_ids if post_id in liked_by_id][:12],
        "saved": [format_post(saved_by_id[post_id], db, user_id) for post_id in saved_ids if post_id in saved_by_id][:12],
        "top_liked": [format_post(post, db, user_id) for post in own_top_liked],
        "top_viewed": [format_post(post, db, user_id) for post in own_top_viewed],
    }


@app.get("/api/hook/books")
def get_hook_books(user_id: str, db: Session = Depends(get_db)):
    books = db.query(HookBookDB).filter(HookBookDB.user_id == user_id).order_by(HookBookDB.updated_at.desc()).all()
    return [serialize_hook_book(book, db, user_id) for book in books]


@app.post("/api/hook/books")
def create_hook_book(req: HookBookRequest, db: Session = Depends(get_db)):
    if not get_user(db, req.user_id):
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    post_ids = normalize_post_ids(db, req.user_id, req.post_ids)
    if not post_ids:
        raise HTTPException(status_code=400, detail="책에 담을 글을 선택해주세요.")
    book = HookBookDB(
        user_id=req.user_id,
        title=req.title.strip() or "나의 HOOK 책",
        source_type=req.source_type or "selected",
        post_ids=json.dumps(post_ids),
        status=req.status or "draft",
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return {"message": "HOOK 책이 저장되었습니다.", "book": serialize_hook_book(book, db, req.user_id)}


@app.patch("/api/hook/books/{book_id}")
def update_hook_book(book_id: int, req: HookBookUpdateRequest, db: Session = Depends(get_db)):
    book = db.query(HookBookDB).filter(HookBookDB.id == book_id, HookBookDB.user_id == req.user_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="HOOK 책을 찾을 수 없습니다.")
    if req.title is not None:
        book.title = req.title.strip() or book.title
    if req.source_type is not None:
        book.source_type = req.source_type
    if req.post_ids is not None:
        post_ids = normalize_post_ids(db, req.user_id, req.post_ids)
        if not post_ids:
            raise HTTPException(status_code=400, detail="책에 담을 글을 선택해주세요.")
        book.post_ids = json.dumps(post_ids)
    if req.status is not None:
        book.status = req.status
    book.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(book)
    return {"message": "HOOK 책이 수정되었습니다.", "book": serialize_hook_book(book, db, req.user_id)}


@app.get("/api/hook/orders")
def get_hook_orders(user_id: str, db: Session = Depends(get_db)):
    orders = db.query(HookOrderDB).filter(HookOrderDB.user_id == user_id).order_by(HookOrderDB.updated_at.desc()).all()
    return [serialize_hook_order(order, db, user_id) for order in orders]


@app.post("/api/hook/orders")
def create_hook_order(req: HookOrderRequest, db: Session = Depends(get_db)):
    book = db.query(HookBookDB).filter(HookBookDB.id == req.book_id, HookBookDB.user_id == req.user_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="주문할 HOOK 책을 찾을 수 없습니다.")
    order = HookOrderDB(user_id=req.user_id, book_id=req.book_id, status="pending", memo=req.memo.strip())
    book.status = "ordered"
    book.updated_at = datetime.utcnow()
    db.add(order)
    db.commit()
    db.refresh(order)
    return {"message": "주문 흐름이 기록되었습니다.", "order": serialize_hook_order(order, db, req.user_id)}


@app.patch("/api/hook/orders/{order_id}/status")
def update_hook_order_status(order_id: int, req: HookStatusRequest, db: Session = Depends(get_db)):
    raise HTTPException(status_code=403, detail="주문 상태 변경은 관리자만 할 수 있습니다.")


@app.post("/api/hook/orders/{order_id}/cancel")
def cancel_hook_order(order_id: int, req: HookOrderCancelRequest, db: Session = Depends(get_db)):
    order = db.query(HookOrderDB).filter(HookOrderDB.id == order_id, HookOrderDB.user_id == req.user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
    if order.status not in {"pending", "processing"}:
        raise HTTPException(status_code=400, detail="이 주문은 취소할 수 없습니다.")
    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return {"message": "주문이 취소되었습니다.", "order": serialize_hook_order(order, db, req.user_id)}


@app.get("/api/admin/posts")
def admin_get_posts(token: str, q: str = "", db: Session = Depends(get_db)):
    require_admin(db, token)
    query = db.query(PostDB)
    term = (q or "").strip()
    if term:
        query = query.filter(
            (PostDB.content.like(f"%{term}%")) |
            (PostDB.author_id.like(f"%{term}%")) |
            (PostDB.public_id.like(f"%{term}%"))
        )
    posts = query.order_by(PostDB.created_at.desc()).limit(100).all()
    return [serialize_admin_post(post, db) for post in posts]


@app.post("/api/admin/posts/{post_id}/delete")
def admin_delete_post(post_id: int, req: AdminTokenRequest, db: Session = Depends(get_db)):
    require_admin(db, req.token)
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    post.admin_deleted = True
    db.commit()
    return {"deleted": True}


@app.get("/api/admin/orders")
def admin_get_orders(token: str, q: str = "", db: Session = Depends(get_db)):
    require_admin(db, token)
    query = db.query(HookOrderDB)
    term = (q or "").strip()
    if term:
        matching_books = db.query(HookBookDB.id).filter(HookBookDB.title.like(f"%{term}%")).all()
        matching_book_ids = [row[0] for row in matching_books]
        query = query.filter(
            (HookOrderDB.user_id.like(f"%{term}%")) |
            (HookOrderDB.status.like(f"%{term}%")) |
            (HookOrderDB.book_id.in_(matching_book_ids))
        )
    orders = query.order_by(HookOrderDB.updated_at.desc()).limit(100).all()
    return [serialize_admin_order(order, db) for order in orders]


@app.get("/api/admin/orders/{order_id}/partner-export")
def admin_export_order_for_partner(order_id: int, token: str, db: Session = Depends(get_db)):
    require_admin(db, token)
    order = db.query(HookOrderDB).filter(HookOrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
    return build_partner_order_export(order, db)


@app.get("/api/admin/reports")
def admin_get_reports(token: str, db: Session = Depends(get_db)):
    require_admin(db, token)
    reports = db.query(ReportDB).order_by(ReportDB.created_at.desc()).limit(100).all()
    return [serialize_report(report, db) for report in reports]


@app.get("/api/admin/bug-reports")
def admin_get_bug_reports(token: str, db: Session = Depends(get_db)):
    require_admin(db, token)
    reports = db.query(BugReportDB).order_by(BugReportDB.created_at.desc()).limit(100).all()
    return [serialize_bug_report(report) for report in reports]


@app.post("/api/admin/orders/{order_id}/status")
def admin_update_order_status(order_id: int, req: AdminOrderStatusRequest, db: Session = Depends(get_db)):
    require_admin(db, req.token)
    allowed = {"pending", "processing", "completed", "cancelled"}
    if req.status not in allowed:
        raise HTTPException(status_code=400, detail="지원하지 않는 주문 상태입니다.")
    order = db.query(HookOrderDB).filter(HookOrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
    order.status = req.status
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return {"message": "주문 상태가 수정되었습니다.", "order": serialize_admin_order(order, db)}


@app.post("/api/replies")
def create_reply(req: ReplyRequest, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == req.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if has_block_relationship(db, req.author_id, post.author_id):
        raise HTTPException(status_code=403, detail="차단된 사용자에게는 답글을 남길 수 없습니다.")
    validate_mentions(db, req.content, req.author_id)

    if req.parent_id:
        parent = db.query(ReplyDB).filter(ReplyDB.id == req.parent_id, ReplyDB.post_id == req.post_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="상위 댓글을 찾을 수 없습니다.")
    reply = ReplyDB(post_id=req.post_id, parent_id=req.parent_id or 0, author_id=req.author_id, content=req.content)
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return {"message": "Reply created successfully", "reply": serialize_reply(reply, db, req.author_id)}


@app.post("/api/replies/like")
def toggle_reply_like(req: ReplyActionRequest, db: Session = Depends(get_db)):
    reply = db.query(ReplyDB).filter(ReplyDB.id == req.reply_id, ReplyDB.admin_deleted == False, ReplyDB.author_deleted == False).first()
    if not reply:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    existing = db.query(ReplyLikeDB).filter(ReplyLikeDB.reply_id == req.reply_id, ReplyLikeDB.user_id == req.user_id).first()
    if existing:
        db.delete(existing)
        reply.likes = max(0, (reply.likes or 0) - 1)
        db.commit()
        return {"liked": False, "likes": reply.likes}
    db.add(ReplyLikeDB(reply_id=req.reply_id, user_id=req.user_id))
    reply.likes = (reply.likes or 0) + 1
    db.commit()
    return {"liked": True, "likes": reply.likes}


@app.post("/api/replies/save")
def toggle_reply_save(req: ReplyActionRequest, db: Session = Depends(get_db)):
    reply = db.query(ReplyDB).filter(ReplyDB.id == req.reply_id, ReplyDB.admin_deleted == False, ReplyDB.author_deleted == False).first()
    if not reply:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    existing = db.query(ReplySaveDB).filter(ReplySaveDB.reply_id == req.reply_id, ReplySaveDB.user_id == req.user_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}
    db.add(ReplySaveDB(reply_id=req.reply_id, user_id=req.user_id))
    db.commit()
    return {"saved": True}


@app.post("/api/like")
def toggle_like(req: LikeRequest, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == req.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if has_block_relationship(db, req.user_id, post.author_id):
        raise HTTPException(status_code=403, detail="차단된 사용자 게시물에는 좋아요를 누를 수 없습니다.")

    existing = db.query(LikeDB).filter(LikeDB.post_id == req.post_id, LikeDB.user_id == req.user_id).first()
    if existing:
        db.delete(existing)
        post.likes = max(0, post.likes - 1)
        db.commit()
        return {"liked": False, "likes": post.likes}

    db.add(LikeDB(post_id=req.post_id, user_id=req.user_id, created_at=datetime.utcnow()))
    post.likes += 1
    db.commit()
    return {"liked": True, "likes": post.likes}


@app.post("/api/save")
def toggle_save(req: SaveRequest, db: Session = Depends(get_db)):
    existing = db.query(SaveDB).filter(SaveDB.post_id == req.post_id, SaveDB.user_id == req.user_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}
    db.add(SaveDB(post_id=req.post_id, user_id=req.user_id))
    db.commit()
    return {"saved": True}


@app.post("/api/posts/{post_id}/delete")
def author_delete_post(post_id: int, req: PostDeleteRequest, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post or post.admin_deleted:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if post.author_id != req.user_id:
        raise HTTPException(status_code=403, detail="글쓴이만 게시글을 삭제할 수 있습니다.")
    post.author_deleted = True
    db.commit()
    return {"deleted": True}


@app.post("/api/replies/delete")
def author_delete_reply(req: ReplyActionRequest, db: Session = Depends(get_db)):
    reply = db.query(ReplyDB).filter(ReplyDB.id == req.reply_id, ReplyDB.admin_deleted == False).first()
    if not reply:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    if reply.author_id != req.user_id:
        raise HTTPException(status_code=403, detail="댓글 작성자만 삭제할 수 있습니다.")
    reply.author_deleted = True
    db.commit()
    return {"deleted": True}


@app.post("/api/reports/post")
def report_post(req: ReportRequest, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == req.target_id, PostDB.admin_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    db.add(ReportDB(reporter_id=req.reporter_id, target_type="post", target_id=req.target_id, reason=req.reason.strip()))
    db.commit()
    return {"reported": True}


@app.post("/api/reports/reply")
def report_reply(req: ReportRequest, db: Session = Depends(get_db)):
    reply = db.query(ReplyDB).filter(ReplyDB.id == req.target_id, ReplyDB.admin_deleted == False).first()
    if not reply:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    db.add(ReportDB(reporter_id=req.reporter_id, target_type="reply", target_id=req.target_id, reason=req.reason.strip()))
    db.commit()
    return {"reported": True}


@app.post("/api/bug-reports")
async def create_bug_report(
    reporter_id: str = Form(...),
    title: str = Form(...),
    content: str = Form(default=""),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    saved_paths = []
    for image in (images or [])[:3]:
        if image.filename:
            saved_paths.append(save_upload(image))
    report = BugReportDB(reporter_id=reporter_id, title=title.strip(), content=content.strip(), image_paths=",".join(saved_paths))
    db.add(report)
    db.commit()
    return {"reported": True}


@app.post("/api/follow")
def toggle_follow(req: RelationshipRequest, db: Session = Depends(get_db)):
    if req.user_id == req.target_id:
        raise HTTPException(status_code=400, detail="자기 자신은 팔로우할 수 없습니다.")
    if has_block_relationship(db, req.user_id, req.target_id):
        raise HTTPException(status_code=403, detail="차단된 사용자와는 팔로우할 수 없습니다.")
    if not get_user(db, req.target_id):
        raise HTTPException(status_code=404, detail="대상 사용자를 찾을 수 없습니다.")

    existing = db.query(FollowDB).filter(FollowDB.follower_id == req.user_id, FollowDB.following_id == req.target_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"following": False}

    db.add(FollowDB(follower_id=req.user_id, following_id=req.target_id))
    db.commit()
    return {"following": True}


@app.post("/api/block")
def toggle_block(req: RelationshipRequest, db: Session = Depends(get_db)):
    existing = db.query(BlockDB).filter(BlockDB.blocker_id == req.user_id, BlockDB.blocked_id == req.target_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"blocked": False}

    db.query(FollowDB).filter(
        ((FollowDB.follower_id == req.user_id) & (FollowDB.following_id == req.target_id)) |
        ((FollowDB.follower_id == req.target_id) & (FollowDB.following_id == req.user_id))
    ).delete(synchronize_session=False)
    db.add(BlockDB(blocker_id=req.user_id, blocked_id=req.target_id))
    db.commit()
    return {"blocked": True}


@app.post("/api/restrict")
def toggle_restrict(req: RelationshipRequest, db: Session = Depends(get_db)):
    existing = db.query(RestrictDB).filter(RestrictDB.user_id == req.user_id, RestrictDB.target_id == req.target_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"restricted": False}
    db.add(RestrictDB(user_id=req.user_id, target_id=req.target_id))
    db.commit()
    return {"restricted": True}


@app.post("/api/mute")
def toggle_mute(req: RelationshipRequest, db: Session = Depends(get_db)):
    existing = db.query(MuteDB).filter(MuteDB.user_id == req.user_id, MuteDB.target_id == req.target_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"muted": False}
    db.add(MuteDB(user_id=req.user_id, target_id=req.target_id))
    db.commit()
    return {"muted": True}


@app.get("/api/notifications")
def get_notifications(user_id: str, db: Session = Depends(get_db)):
    if not user_id:
        return {"all": [], "mentions": [], "likes": [], "comments": [], "counts": {"all": 0, "mentions": 0, "likes": 0, "comments": 0}}

    notifications = {"mentions": [], "likes": [], "comments": [], "all": []}
    read_keys = get_read_notification_keys(db, user_id)
    user_posts = db.query(PostDB).filter(PostDB.author_id == user_id).all()
    user_post_map = {post.id: post for post in user_posts}

    for post in filter_posts_for_viewer(db.query(PostDB).filter(PostDB.author_id != user_id).order_by(PostDB.created_at.desc()).all(), db, user_id):
        if any(match == user_id for match in MENTION_PATTERN.findall(post.content or "")):
            notifications["mentions"].append(
                serialize_notification(f"mention:post:{post.id}", "mention", post.author_id, post.created_at, post, post.content, f"{post.author_id}님이 회원님을 게시글에서 멘션했어요.", db, user_id)
            )

    replies = db.query(ReplyDB).order_by(ReplyDB.created_at.desc()).all()
    for reply in replies:
        if has_block_relationship(db, user_id, reply.author_id):
            continue
        related_post = db.query(PostDB).filter(PostDB.id == reply.post_id).first()
        if not related_post:
            continue
        if related_post.author_id == user_id and reply.author_id != user_id:
            notifications["comments"].append(
                serialize_notification(f"comment:reply:{reply.id}", "comment", reply.author_id, reply.created_at, related_post, reply.content, f"{reply.author_id}님이 회원님의 글에 댓글을 남겼어요.", db, user_id)
            )
        if reply.author_id != user_id and any(match == user_id for match in MENTION_PATTERN.findall(reply.content or "")):
            notifications["mentions"].append(
                serialize_notification(f"mention:reply:{reply.id}", "mention", reply.author_id, reply.created_at, related_post, reply.content, f"{reply.author_id}님이 댓글에서 회원님을 멘션했어요.", db, user_id)
            )

    if user_post_map:
        likes = db.query(LikeDB).filter(LikeDB.post_id.in_(list(user_post_map.keys()))).order_by(LikeDB.created_at.desc()).all()
        for like in likes:
            if like.user_id == user_id or has_block_relationship(db, user_id, like.user_id):
                continue
            notifications["likes"].append(
                serialize_notification(f"like:{like.id}", "like", like.user_id, like.created_at, user_post_map[like.post_id], user_post_map[like.post_id].content, f"{like.user_id}님이 회원님의 글을 좋아해요.", db, user_id)
            )

    following_ids = [row.following_id for row in db.query(FollowDB).filter(FollowDB.follower_id == user_id).all()]
    if following_ids:
        followed_posts = db.query(PostDB).filter(PostDB.author_id.in_(following_ids)).order_by(PostDB.created_at.desc()).limit(20).all()
        for post in followed_posts:
            if not has_block_relationship(db, user_id, post.author_id):
                notifications["all"].append(
                    serialize_notification(f"following_post:{post.id}", "following_post", post.author_id, post.created_at, post, post.content, f"{post.author_id}님이 새 글을 올렸어요.", db, user_id)
                )

    for bucket in notifications:
        notifications[bucket] = [item for item in notifications[bucket] if item["key"] not in read_keys]

    notifications["mentions"].sort(key=lambda item: item["created_at"], reverse=True)
    notifications["likes"].sort(key=lambda item: item["created_at"], reverse=True)
    notifications["comments"].sort(key=lambda item: item["created_at"], reverse=True)
    notifications["all"] = sorted(
        notifications["all"] + notifications["mentions"] + notifications["likes"] + notifications["comments"],
        key=lambda item: item["created_at"],
        reverse=True,
    )
    return {
        "all": notifications["all"],
        "mentions": notifications["mentions"],
        "likes": notifications["likes"],
        "comments": notifications["comments"],
        "counts": {
            "all": len(notifications["all"]),
            "mentions": len(notifications["mentions"]),
            "likes": len(notifications["likes"]),
            "comments": len(notifications["comments"]),
        },
    }


@app.post("/api/notifications/read")
def read_notification(req: NotificationReadRequest, db: Session = Depends(get_db)):
    mark_notification_read(db, req.user_id, req.notification_key)
    db.commit()
    return {"read": True}


@app.post("/api/notifications/read-all")
def read_all_notifications(req: NotificationReadAllRequest, db: Session = Depends(get_db)):
    current = get_notifications(req.user_id, db)
    keys = {item["key"] for item in current["all"]}
    for notification_key in keys:
        mark_notification_read(db, req.user_id, notification_key)
    db.commit()
    return {"read": True, "count": len(keys)}


@app.get("/api/profile/{user_id}")
def get_profile(user_id: str, viewer_id: str = "", db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    blocked_by_viewer = is_blocked(db, viewer_id, user_id) if viewer_id else False
    blocked_viewer = is_blocked(db, user_id, viewer_id) if viewer_id else False
    can_view_content = not (blocked_by_viewer or blocked_viewer) and can_view_private_profile(db, viewer_id, user)

    user_posts = db.query(PostDB).filter(PostDB.author_id == user_id).order_by(PostDB.created_at.desc()).all()
    liked_ids = [row.post_id for row in db.query(LikeDB).filter(LikeDB.user_id == user_id).order_by(LikeDB.created_at.desc()).all()]
    liked_posts = db.query(PostDB).filter(PostDB.id.in_(liked_ids)).order_by(PostDB.created_at.desc()).all() if liked_ids else []
    liked_reply_ids = [row.reply_id for row in db.query(ReplyLikeDB).filter(ReplyLikeDB.user_id == user_id).order_by(ReplyLikeDB.created_at.desc()).all()]
    liked_replies = db.query(ReplyDB).filter(ReplyDB.id.in_(liked_reply_ids), ReplyDB.admin_deleted == False, ReplyDB.author_deleted == False).all() if liked_reply_ids else []
    liked_replies_by_id = {reply.id: reply for reply in liked_replies}
    visible_posts = [format_post(post, db, viewer_id or user_id) for post in filter_posts_for_viewer(user_posts, db, viewer_id or user_id)] if can_view_content else []
    visible_liked_posts = filter_posts_for_viewer(liked_posts, db, viewer_id or user_id) if can_view_content else []
    visible_liked_by_id = {post.id: post for post in visible_liked_posts}
    visible_liked = [format_post(visible_liked_by_id[post_id], db, viewer_id or user_id) for post_id in liked_ids if post_id in visible_liked_by_id]
    visible_liked_replies = []
    if can_view_content:
        for reply_id in liked_reply_ids:
            reply = liked_replies_by_id.get(reply_id)
            if not reply:
                continue
            post = db.query(PostDB).filter(PostDB.id == reply.post_id).first()
            if not post or not filter_posts_for_viewer([post], db, viewer_id or user_id):
                continue
            visible_liked_replies.append({
                "reply": serialize_reply(reply, db, viewer_id or user_id),
                "post": format_post(post, db, viewer_id or user_id),
            })

    all_images = []
    if can_view_content:
        for post in visible_posts:
            all_images.extend(post["images"])

    return {
        "user_id": user.user_id,
        "display_name": user.display_name or user.user_id,
        "bio": user.bio or "",
        "interests": parse_json_list(user.interests),
        "profile_image": user.profile_image or "",
        "initials": get_initials(user),
        "post_count": len(user_posts),
        "total_likes": sum(post.likes for post in user_posts),
        "follower_count": db.query(FollowDB).filter(FollowDB.following_id == user_id).count(),
        "following_count": db.query(FollowDB).filter(FollowDB.follower_id == user_id).count(),
        "posts": visible_posts,
        "liked_posts": visible_liked,
        "liked_replies": visible_liked_replies,
        "images": all_images,
        "can_view_content": can_view_content,
        "is_private": bool(user.is_private),
        "is_own_profile": viewer_id == user_id,
        "relationship": {
            "is_following": is_following(db, viewer_id, user_id) if viewer_id else False,
            "is_followed_by": is_following(db, user_id, viewer_id) if viewer_id else False,
            "is_blocked": blocked_by_viewer,
            "blocked_you": blocked_viewer,
            "is_muted": is_muted(db, viewer_id, user_id) if viewer_id else False,
            "is_restricted": is_restricted(db, viewer_id, user_id) if viewer_id else False,
        },
    }


app.mount("/static", StaticFiles(directory=os.path.join(current_dir, "static")), name="static")

NO_STORE_HEADERS = {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
}


@app.get("/")
def serve_index():
    return FileResponse(os.path.join(current_dir, "index.html"), headers=NO_STORE_HEADERS)


@app.get("/posts/{public_id}")
def serve_post_permalink(public_id: str):
    return FileResponse(os.path.join(current_dir, "index.html"), headers=NO_STORE_HEADERS)


@app.get("/style.css")
def serve_css():
    return FileResponse(os.path.join(current_dir, "style.css"), headers=NO_STORE_HEADERS)


@app.get("/script.js")
def serve_js():
    return FileResponse(os.path.join(current_dir, "script.js"), headers=NO_STORE_HEADERS)
