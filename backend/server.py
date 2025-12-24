from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'taqdir-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

app = FastAPI(title="تقدير - نظام الاختبارات")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============== Models ==============

class UserBase(BaseModel):
    username: str
    full_name: str
    role: str = Field(..., pattern="^(admin|teacher|student)$")

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_active: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class QuestionOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    is_correct: bool = False

class QuestionBase(BaseModel):
    text: str
    options: List[QuestionOption]
    section_number: int = Field(..., ge=1, le=5)
    points: int = 1

class QuestionCreate(QuestionBase):
    exam_id: str

class Question(QuestionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_by: str = ""

class SectionConfig(BaseModel):
    section_number: int
    title: str
    duration_minutes: int = 20

class ExamBase(BaseModel):
    title: str
    description: str = ""
    instructions: str = ""
    sections: List[SectionConfig] = Field(default_factory=lambda: [
        SectionConfig(section_number=1, title="القسم الأول - كمي", duration_minutes=20),
        SectionConfig(section_number=2, title="القسم الثاني - لفظي", duration_minutes=20),
        SectionConfig(section_number=3, title="القسم الثالث - كمي", duration_minutes=20),
        SectionConfig(section_number=4, title="القسم الرابع - لفظي", duration_minutes=20),
        SectionConfig(section_number=5, title="القسم الخامس - مختلط", duration_minutes=20),
    ])

class ExamCreate(ExamBase):
    pass

class Exam(ExamBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "draft"  # draft, published, closed
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_by: str = ""
    published_at: Optional[str] = None

class StudentExamStart(BaseModel):
    exam_id: str
    student_name: str
    student_phone: Optional[str] = ""

class StudentAnswer(BaseModel):
    question_id: str
    selected_option_id: str
    answered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StudentExam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    student_id: str
    student_name: str
    student_phone: str = ""
    current_section: int = 1
    section_start_times: dict = Field(default_factory=dict)
    answers: List[StudentAnswer] = Field(default_factory=list)
    status: str = "in_progress"  # in_progress, completed
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None
    score: Optional[float] = None
    grade_released: bool = False
    graded_by: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    student_exam_id: str
    question_id: str
    selected_option_id: str

class GradeAssignment(BaseModel):
    student_exam_id: str
    score: float
    release_grade: bool = False

class SectionTimeUpdate(BaseModel):
    exam_id: str
    section_number: int
    duration_minutes: int

# ============== Auth Helpers ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin_or_teacher(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return current_user

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============== Auth Routes ==============

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"username": data.username}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    user_response = {k: v for k, v in user.items() if k != "password"}
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/register", response_model=User)
async def register_user(data: UserCreate, current_user: dict = Depends(require_admin)):
    existing = await db.users.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(
        username=data.username,
        full_name=data.full_name,
        role=data.role
    )
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(data.password)
    
    await db.users.insert_one(user_dict)
    return user

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ============== User Management ==============

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, data: UserBase, current_user: dict = Depends(require_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ============== Exam Management ==============

@api_router.post("/exams", response_model=Exam)
async def create_exam(data: ExamCreate, current_user: dict = Depends(require_admin_or_teacher)):
    exam = Exam(**data.model_dump())
    exam_dict = exam.model_dump()
    exam_dict["created_by"] = current_user["id"]
    await db.exams.insert_one(exam_dict)
    return exam

@api_router.get("/exams", response_model=List[Exam])
async def get_exams(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user["role"] == "student":
        query["status"] = "published"
    exams = await db.exams.find(query, {"_id": 0}).to_list(100)
    return exams

@api_router.get("/exams/{exam_id}")
async def get_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@api_router.put("/exams/{exam_id}")
async def update_exam(exam_id: str, data: ExamBase, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.exams.update_one(
        {"id": exam_id},
        {"$set": data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam updated"}

@api_router.post("/exams/{exam_id}/publish")
async def publish_exam(exam_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.exams.update_one(
        {"id": exam_id},
        {"$set": {"status": "published", "published_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam published"}

@api_router.post("/exams/{exam_id}/close")
async def close_exam(exam_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.exams.update_one(
        {"id": exam_id},
        {"$set": {"status": "closed"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam closed"}

@api_router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.exams.delete_one({"id": exam_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    await db.questions.delete_many({"exam_id": exam_id})
    return {"message": "Exam deleted"}

@api_router.put("/exams/section-time")
async def update_section_time(data: SectionTimeUpdate, current_user: dict = Depends(require_admin_or_teacher)):
    exam = await db.exams.find_one({"id": data.exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    sections = exam.get("sections", [])
    for section in sections:
        if section["section_number"] == data.section_number:
            section["duration_minutes"] = data.duration_minutes
            break
    
    await db.exams.update_one(
        {"id": data.exam_id},
        {"$set": {"sections": sections}}
    )
    return {"message": "Section time updated"}

# ============== Question Management ==============

@api_router.post("/questions", response_model=Question)
async def create_question(data: QuestionCreate, current_user: dict = Depends(require_admin_or_teacher)):
    question = Question(**data.model_dump())
    question_dict = question.model_dump()
    question_dict["created_by"] = current_user["id"]
    await db.questions.insert_one(question_dict)
    return question

@api_router.get("/questions", response_model=List[Question])
async def get_questions(exam_id: Optional[str] = None, section: Optional[int] = None):
    query = {}
    if exam_id:
        query["exam_id"] = exam_id
    if section:
        query["section_number"] = section
    questions = await db.questions.find(query, {"_id": 0}).to_list(500)
    return questions

@api_router.get("/questions/{question_id}")
async def get_question(question_id: str):
    question = await db.questions.find_one({"id": question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@api_router.put("/questions/{question_id}")
async def update_question(question_id: str, data: QuestionBase, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.questions.update_one(
        {"id": question_id},
        {"$set": data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question updated"}

@api_router.delete("/questions/{question_id}")
async def delete_question(question_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.questions.delete_one({"id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted"}

# ============== Student Exam ==============

@api_router.post("/student-exams/start")
async def start_student_exam(data: StudentExamStart, current_user: dict = Depends(get_current_user)):
    exam = await db.exams.find_one({"id": data.exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if exam["status"] != "published":
        raise HTTPException(status_code=400, detail="Exam is not available")
    
    # Check if student already started this exam
    existing = await db.student_exams.find_one({
        "exam_id": data.exam_id,
        "student_id": current_user["id"],
        "status": "in_progress"
    })
    if existing:
        return existing
    
    student_exam = StudentExam(
        exam_id=data.exam_id,
        student_id=current_user["id"],
        student_name=data.student_name,
        student_phone=data.student_phone or "",
        section_start_times={"1": datetime.now(timezone.utc).isoformat()}
    )
    
    await db.student_exams.insert_one(student_exam.model_dump())
    return student_exam.model_dump()

@api_router.post("/student-exams/answer")
async def submit_answer(data: SubmitAnswerRequest, current_user: dict = Depends(get_current_user)):
    student_exam = await db.student_exams.find_one({"id": data.student_exam_id}, {"_id": 0})
    if not student_exam:
        raise HTTPException(status_code=404, detail="Student exam not found")
    if student_exam["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Exam already completed")
    
    answer = StudentAnswer(
        question_id=data.question_id,
        selected_option_id=data.selected_option_id
    )
    
    # Update or add answer
    answers = student_exam.get("answers", [])
    answer_exists = False
    for i, a in enumerate(answers):
        if a["question_id"] == data.question_id:
            answers[i] = answer.model_dump()
            answer_exists = True
            break
    if not answer_exists:
        answers.append(answer.model_dump())
    
    await db.student_exams.update_one(
        {"id": data.student_exam_id},
        {"$set": {"answers": answers}}
    )
    return {"message": "Answer saved"}

@api_router.post("/student-exams/{student_exam_id}/next-section")
async def move_to_next_section(student_exam_id: str, current_user: dict = Depends(get_current_user)):
    student_exam = await db.student_exams.find_one({"id": student_exam_id}, {"_id": 0})
    if not student_exam:
        raise HTTPException(status_code=404, detail="Student exam not found")
    
    current_section = student_exam.get("current_section", 1)
    if current_section >= 5:
        # Complete the exam
        await db.student_exams.update_one(
            {"id": student_exam_id},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {"message": "Exam completed", "completed": True}
    
    next_section = current_section + 1
    section_times = student_exam.get("section_start_times", {})
    section_times[str(next_section)] = datetime.now(timezone.utc).isoformat()
    
    await db.student_exams.update_one(
        {"id": student_exam_id},
        {"$set": {
            "current_section": next_section,
            "section_start_times": section_times
        }}
    )
    return {"message": f"Moved to section {next_section}", "current_section": next_section}

@api_router.post("/student-exams/{student_exam_id}/complete")
async def complete_exam(student_exam_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.student_exams.update_one(
        {"id": student_exam_id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student exam not found")
    return {"message": "تم إنهاء الاختبار. سيتم إشعارك بالنتيجة لاحقًا."}

@api_router.get("/student-exams/{student_exam_id}")
async def get_student_exam(student_exam_id: str, current_user: dict = Depends(get_current_user)):
    student_exam = await db.student_exams.find_one({"id": student_exam_id}, {"_id": 0})
    if not student_exam:
        raise HTTPException(status_code=404, detail="Student exam not found")
    return student_exam

@api_router.get("/student-exams")
async def get_student_exams(
    exam_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if current_user["role"] == "student":
        query["student_id"] = current_user["id"]
    if exam_id:
        query["exam_id"] = exam_id
    
    student_exams = await db.student_exams.find(query, {"_id": 0}).to_list(1000)
    return student_exams

@api_router.get("/student-exams/my/results")
async def get_my_results(current_user: dict = Depends(get_current_user)):
    results = await db.student_exams.find(
        {"student_id": current_user["id"], "grade_released": True},
        {"_id": 0}
    ).to_list(100)
    return results

# ============== Grading ==============

@api_router.post("/grades/assign")
async def assign_grade(data: GradeAssignment, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.student_exams.update_one(
        {"id": data.student_exam_id},
        {"$set": {
            "score": data.score,
            "grade_released": data.release_grade,
            "graded_by": current_user["id"]
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student exam not found")
    return {"message": "Grade assigned"}

@api_router.post("/grades/release/{student_exam_id}")
async def release_grade(student_exam_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    result = await db.student_exams.update_one(
        {"id": student_exam_id},
        {"$set": {"grade_released": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student exam not found")
    return {"message": "Grade released"}

@api_router.post("/grades/calculate/{student_exam_id}")
async def calculate_grade(student_exam_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    student_exam = await db.student_exams.find_one({"id": student_exam_id}, {"_id": 0})
    if not student_exam:
        raise HTTPException(status_code=404, detail="Student exam not found")
    
    answers = student_exam.get("answers", [])
    total_score = 0
    total_points = 0
    
    for answer in answers:
        question = await db.questions.find_one({"id": answer["question_id"]}, {"_id": 0})
        if question:
            total_points += question.get("points", 1)
            for option in question.get("options", []):
                if option["id"] == answer["selected_option_id"] and option.get("is_correct"):
                    total_score += question.get("points", 1)
                    break
    
    percentage = (total_score / total_points * 100) if total_points > 0 else 0
    
    await db.student_exams.update_one(
        {"id": student_exam_id},
        {"$set": {"score": percentage, "graded_by": current_user["id"]}}
    )
    
    return {"score": percentage, "correct": total_score, "total": total_points}

# ============== Dashboard Stats ==============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(require_admin_or_teacher)):
    total_exams = await db.exams.count_documents({})
    published_exams = await db.exams.count_documents({"status": "published"})
    total_questions = await db.questions.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_submissions = await db.student_exams.count_documents({})
    completed_submissions = await db.student_exams.count_documents({"status": "completed"})
    
    return {
        "total_exams": total_exams,
        "published_exams": published_exams,
        "total_questions": total_questions,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "completed_submissions": completed_submissions,
        "in_progress": total_submissions - completed_submissions
    }

@api_router.get("/dashboard/exam-progress/{exam_id}")
async def get_exam_progress(exam_id: str, current_user: dict = Depends(require_admin_or_teacher)):
    submissions = await db.student_exams.find({"exam_id": exam_id}, {"_id": 0}).to_list(500)
    
    in_progress = sum(1 for s in submissions if s["status"] == "in_progress")
    completed = sum(1 for s in submissions if s["status"] == "completed")
    graded = sum(1 for s in submissions if s.get("score") is not None)
    
    return {
        "total": len(submissions),
        "in_progress": in_progress,
        "completed": completed,
        "graded": graded,
        "submissions": submissions
    }

# ============== Init Admin ==============

@api_router.post("/init-admin")
async def init_admin():
    existing = await db.users.find_one({"role": "admin"})
    if existing:
        return {"message": "Admin already exists"}
    
    admin = User(
        username="admin",
        full_name="مدير النظام",
        role="admin"
    )
    admin_dict = admin.model_dump()
    admin_dict["password"] = hash_password("admin123")
    
    await db.users.insert_one(admin_dict)
    return {"message": "Admin created", "username": "admin", "password": "admin123"}

@api_router.post("/init-student-account")
async def init_student_account():
    existing = await db.users.find_one({"username": "student"})
    if existing:
        return {"message": "Student account already exists"}
    
    student = User(
        username="student",
        full_name="حساب الطالب",
        role="student"
    )
    student_dict = student.model_dump()
    student_dict["password"] = hash_password("student123")
    
    await db.users.insert_one(student_dict)
    return {"message": "Student account created", "username": "student", "password": "student123"}

# ============== Root ==============

@api_router.get("/")
async def root():
    return {"message": "مرحباً بكم في نظام تقدير للاختبارات"}

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
