from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime
from passlib.context import CryptContext
import secrets
import string
import os
import shutil
import feed_algorithm

# 1. Database Setup (SQLite + SQLAlchemy)
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class PostDB(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(String, index=True)
    content = Column(Text)
    image_paths = Column(String, default="") # Comma-separated paths
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReplyDB(Base):
    __tablename__ = "replies"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    author_id = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# 2. Password Hashing Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# 3. Pydantic Models for API requests/responses
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

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. FastAPI Application Setup
app = FastAPI()

# Mount the static files for the frontend, but we'll handle index.html separately to serve at root
# Note: we assume main.py is in the same directory as index.html, style.css, script.js
current_dir = os.path.dirname(os.path.realpath(__file__))

# API Endpoints
@app.post("/api/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    # Check if user_id or email already exists
    if db.query(UserDB).filter(UserDB.user_id == req.user_id).first():
        raise HTTPException(status_code=400, detail="이미 사용중인 아이디입니다.")
    if db.query(UserDB).filter(UserDB.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 사용중인 이메일입니다.")
    
    hashed_pw = get_password_hash(req.password)
    new_user = UserDB(user_id=req.user_id, email=req.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "회원가입이 완료되었습니다."}

@app.post("/api/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.user_id == req.user_id).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 잘못되었습니다.")
    return {"message": "로그인 성공!"}

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
    
    # Generate temporary password
    temp_pw = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
    user.hashed_password = get_password_hash(temp_pw)
    db.commit()
    return {"temp_password": temp_pw}

# --- Post and Feed APIs ---

@app.post("/api/posts")
async def create_post(
    author_id: str = Form(...),
    content: str = Form(...),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
):
    # Process images (max 2)
    saved_paths = []
    if len(images) > 2:
        images = images[:2]
        
    for img in images:
        if img.filename:
            # Simple unique filename
            ext = os.path.splitext(img.filename)[1]
            new_filename = f"{secrets.token_hex(8)}{ext}"
            filepath = os.path.join(current_dir, "static", "uploads", new_filename)
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(img.file, buffer)
            saved_paths.append(f"/static/uploads/{new_filename}")
            
    post = PostDB(
        author_id=author_id,
        content=content,
        image_paths=",".join(saved_paths)
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    imgs = post.image_paths.split(",") if post.image_paths else []
    full_post = {
        "id": post.id,
        "author_id": post.author_id,
        "content": post.content,
        "images": [i for i in imgs if i],
        "likes": post.likes,
        "views": post.views,
        "created_at": post.created_at.isoformat(),
        "replies": []
    }
    return {"message": "Post created successfully", "post": full_post}

@app.get("/api/feed")
def get_feed(type: str = "latest", timeframe: str = "alltime", user_id: str = "", db: Session = Depends(get_db)):
    posts = db.query(PostDB).all()
    
    # Attach reply_count for sorting
    for p in posts:
        p.reply_count = db.query(ReplyDB).filter(ReplyDB.post_id == p.id).count()
        
    sorted_posts = feed_algorithm.sort_feed(posts, feed_type=type, timeframe=timeframe, current_user_id=user_id)
    
    # Increment views
    for p in sorted_posts:
        p.views += 1
    db.commit()
    
    # Format output
    result = []
    for p in sorted_posts:
        imgs = p.image_paths.split(",") if p.image_paths else []
        replies = db.query(ReplyDB).filter(ReplyDB.post_id == p.id).order_by(ReplyDB.created_at.asc()).all()
        result.append({
            "id": p.id,
            "author_id": p.author_id,
            "content": p.content,
            "images": [i for i in imgs if i],
            "likes": p.likes,
            "views": p.views,
            "created_at": p.created_at.isoformat(),
            "replies": [{"id": r.id, "author_id": r.author_id, "content": r.content, "created_at": r.created_at.isoformat()} for r in replies]
        })
    return result

@app.get("/api/search")
def search_posts(q: str, db: Session = Depends(get_db)):
    if not q:
        return []
    # Search by author or content
    posts = db.query(PostDB).filter(
        (PostDB.content.like(f"%{q}%")) | (PostDB.author_id.like(f"%{q}%"))
    ).all()
    
    for p in posts:
        p.reply_count = db.query(ReplyDB).filter(ReplyDB.post_id == p.id).count()
        p.views += 1
    db.commit()
    
    # Sort by oldest by default for search to match feed
    posts.sort(key=lambda x: x.created_at, reverse=False)
    
    result = []
    for p in posts:
        imgs = p.image_paths.split(",") if p.image_paths else []
        replies = db.query(ReplyDB).filter(ReplyDB.post_id == p.id).order_by(ReplyDB.created_at.asc()).all()
        result.append({
            "id": p.id,
            "author_id": p.author_id,
            "content": p.content,
            "images": [i for i in imgs if i],
            "likes": p.likes,
            "views": p.views,
            "created_at": p.created_at.isoformat(),
            "replies": [{"id": r.id, "author_id": r.author_id, "content": r.content, "created_at": r.created_at.isoformat()} for r in replies]
        })
    return result

@app.post("/api/replies")
def create_reply(req: ReplyRequest, db: Session = Depends(get_db)):
    reply = ReplyDB(post_id=req.post_id, author_id=req.author_id, content=req.content)
    db.add(reply)
    db.commit()
    db.refresh(reply)
    full_reply = {
        "id": reply.id,
        "post_id": reply.post_id,
        "author_id": reply.author_id,
        "content": reply.content,
        "created_at": reply.created_at.isoformat()
    }
    return {"message": "Reply created successfully", "reply": full_reply}

# Serve Frontend files
app.mount("/static", StaticFiles(directory=os.path.join(current_dir, "static")), name="static")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(current_dir, "index.html"))

@app.get("/style.css")
def serve_css():
    return FileResponse(os.path.join(current_dir, "style.css"))

@app.get("/script.js")
def serve_js():
    return FileResponse(os.path.join(current_dir, "script.js"))
