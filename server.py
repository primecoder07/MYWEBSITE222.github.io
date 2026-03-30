from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.environ['JWT_SECRET']
EMERGENT_KEY = os.environ['EMERGENT_LLM_KEY']

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    college_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    college_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Notice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_id: str
    author_name: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"
    type: str = "general"
    is_urgent: bool = False

class NoticeCreate(BaseModel):
    title: str
    content: str
    type: str = "general"
    is_urgent: bool = False

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: str
    time: str
    location: str
    organizer_id: str
    organizer_name: str
    registrations: List[str] = Field(default_factory=list)
    max_attendees: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    max_attendees: Optional[int] = None

class Club(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    members: List[str] = Field(default_factory=list)
    admin_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: str

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        college_id=user_data.college_id
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hashed_password
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = jwt.encode({"user_id": user.id, "email": user.email, "role": user.role}, JWT_SECRET, algorithm="HS256")
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    del user['password']
    token = jwt.encode({"user_id": user['id'], "email": user['email'], "role": user['role']}, JWT_SECRET, algorithm="HS256")
    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_current_user(user_data = Depends(verify_token)):
    user = await db.users.find_one({"id": user_data['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/notices")
async def get_notices():
    notices = await db.notices.find({"status": "approved"}, {"_id": 0}).sort("date", -1).to_list(100)
    return notices

@api_router.post("/notices")
async def create_notice(notice_data: NoticeCreate, user_data = Depends(verify_token)):
    if user_data['role'] not in ['club', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = await db.users.find_one({"id": user_data['user_id']}, {"_id": 0})
    notice = Notice(
        title=notice_data.title,
        content=notice_data.content,
        author_id=user['id'],
        author_name=user['name'],
        type=notice_data.type,
        is_urgent=notice_data.is_urgent,
        status="approved" if user_data['role'] == 'admin' else "pending"
    )
    
    notice_dict = notice.model_dump()
    notice_dict['date'] = notice_dict['date'].isoformat()
    await db.notices.insert_one(notice_dict)
    return notice

@api_router.get("/events")
async def get_events():
    events = await db.events.find({"status": "approved"}, {"_id": 0}).sort("date", 1).to_list(100)
    return events

@api_router.post("/events")
async def create_event(event_data: EventCreate, user_data = Depends(verify_token)):
    if user_data['role'] not in ['club', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = await db.users.find_one({"id": user_data['user_id']}, {"_id": 0})
    event = Event(
        title=event_data.title,
        description=event_data.description,
        date=event_data.date,
        time=event_data.time,
        location=event_data.location,
        organizer_id=user['id'],
        organizer_name=user['name'],
        max_attendees=event_data.max_attendees,
        status="approved" if user_data['role'] == 'admin' else "pending"
    )
    
    event_dict = event.model_dump()
    event_dict['created_at'] = event_dict['created_at'].isoformat()
    await db.events.insert_one(event_dict)
    return event

@api_router.post("/events/{event_id}/register")
async def register_for_event(event_id: str, user_data = Depends(verify_token)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if user_data['user_id'] in event.get('registrations', []):
        raise HTTPException(status_code=400, detail="Already registered")
    
    if event.get('max_attendees') and len(event.get('registrations', [])) >= event['max_attendees']:
        raise HTTPException(status_code=400, detail="Event is full")
    
    await db.events.update_one(
        {"id": event_id},
        {"$push": {"registrations": user_data['user_id']}}
    )
    return {"message": "Registered successfully"}

@api_router.get("/clubs")
async def get_clubs():
    clubs = await db.clubs.find({}, {"_id": 0}).to_list(100)
    return clubs

@api_router.post("/clubs/{club_id}/join")
async def join_club(club_id: str, user_data = Depends(verify_token)):
    club = await db.clubs.find_one({"id": club_id}, {"_id": 0})
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    if user_data['user_id'] in club.get('members', []):
        raise HTTPException(status_code=400, detail="Already a member")
    
    await db.clubs.update_one(
        {"id": club_id},
        {"$push": {"members": user_data['user_id']}}
    )
    return {"message": "Joined successfully"}

@api_router.get("/admin/pending-notices")
async def get_pending_notices(user_data = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notices = await db.notices.find({"status": "pending"}, {"_id": 0}).to_list(100)
    return notices

@api_router.post("/admin/notices/{notice_id}/approve")
async def approve_notice(notice_id: str, user_data = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.notices.update_one({"id": notice_id}, {"$set": {"status": "approved"}})
    return {"message": "Notice approved"}

@api_router.get("/admin/pending-events")
async def get_pending_events(user_data = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    events = await db.events.find({"status": "pending"}, {"_id": 0}).to_list(100)
    return events

@api_router.post("/admin/events/{event_id}/approve")
async def approve_event(event_id: str, user_data = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.events.update_one({"id": event_id}, {"$set": {"status": "approved"}})
    return {"message": "Event approved"}

@api_router.get("/admin/users")
async def get_all_users(user_data = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.post("/chat")
async def chat(request: ChatRequest, user_data = Depends(verify_token)):
    try:
        chat_instance = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=request.session_id,
            system_message="You are a helpful college assistant for Demo College. Help students with questions about events, deadlines, club registrations, and navigating the Smart College Connect platform. Be friendly, concise, and professional."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.message)
        response = await chat_instance.send_message(user_message)
        
        chat_msg = ChatMessage(
            user_id=user_data['user_id'],
            session_id=request.session_id,
            message=request.message,
            response=response
        )
        
        chat_dict = chat_msg.model_dump()
        chat_dict['timestamp'] = chat_dict['timestamp'].isoformat()
        await db.chat_messages.insert_one(chat_dict)
        
        return {"response": response}
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat service unavailable")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
