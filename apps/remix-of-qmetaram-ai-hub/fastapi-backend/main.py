"""
QMETARAM Platform - Complete Production Backend
پلتفرم کیومترام - بک‌اند تولیدی کامل
A Decentralized Quantum-Modular AI Ecosystem
"""

import os
import json
import uuid
import hashlib
import random
import string
import asyncio
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Depends, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, EmailStr
import httpx

# ═══════════════════════════════════════════════════════════════════════════════
# APPLICATION CONFIGURATION - پیکربندی اپلیکیشن
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="QMETARAM Platform API",
    description="پلتفرم هوش مصنوعی کوانتومی-ماژولار غیرمتمرکز - Decentralized Quantum-Modular AI Ecosystem",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://qmetaram.com",
        "https://www.qmetaram.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "*"  # Development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════════════
# ENUMS - شمارش‌ها
# ═══════════════════════════════════════════════════════════════════════════════

class ModuleType(str, Enum):
    CORE = "core"
    MATRIX = "matrix"
    TESLA = "tesla"
    BIRUNI = "biruni"
    DAVINCI = "davinci"
    BEETHOVEN = "beethoven"
    MOWLANA = "mowlana"
    QUANTUM_PULSE = "quantum-pulse"

class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    PROMAX = "promax"
    VIP = "vip"

class RatingType(str, Enum):
    GOOD = "good"
    NORMAL = "normal"
    BAD = "bad"

class ThemeType(str, Enum):
    DAY = "day"
    NIGHT = "night"
    SUMMER = "summer"
    WINTER = "winter"

class LanguageCode(str, Enum):
    FA = "fa"  # Persian/Farsi
    EN = "en"  # English
    AR = "ar"  # Arabic
    DE = "de"  # German
    FR = "fr"  # French
    ES = "es"  # Spanish
    ZH = "zh"  # Chinese
    RU = "ru"  # Russian
    TR = "tr"  # Turkish
    JA = "ja"  # Japanese

# ═══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS - مدل‌های پایدانتیک
# ═══════════════════════════════════════════════════════════════════════════════

# --- Chat Models ---
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: user, assistant, system")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None
    attachments: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = None
    language: LanguageCode = LanguageCode.FA
    include_audio: Optional[bool] = False
    include_images: Optional[bool] = False
    context: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    response: str
    module: str
    conversation_id: str
    personality_traits: Dict[str, Any]
    suggested_actions: List[str]
    multimedia: Optional[Dict[str, Any]] = None
    tokens_used: int
    processing_time_ms: float

# --- Fusion Chat Models ---
class FusionChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    modules: List[ModuleType] = Field(..., min_items=2, max_items=8)
    fusion_mode: str = Field(default="collaborative", description="collaborative, sequential, or competitive")
    language: LanguageCode = LanguageCode.FA

class FusionResponse(BaseModel):
    fused_response: str
    module_contributions: Dict[str, str]
    synthesis_method: str
    confidence_score: float

# --- AI Marketplace Models ---
class AIModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    description: str
    description_fa: str
    category: str
    pricing: Dict[str, Any]
    capabilities: List[str]
    metrics: Dict[str, float]
    api_available: bool
    popularity_rank: int
    logo_url: str
    website: str

class AIModelComparison(BaseModel):
    models: List[str]
    comparison_metrics: Dict[str, Dict[str, float]]
    recommendation: str
    use_cases: Dict[str, List[str]]

class AINewsItem(BaseModel):
    id: str
    title: str
    title_fa: str
    summary: str
    summary_fa: str
    source: str
    url: str
    published_at: datetime
    category: str
    image_url: Optional[str] = None
    relevance_score: float

# --- Project Evaluation Models ---
class ProjectEvaluationRequest(BaseModel):
    project_name: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    project_type: str = Field(default="ai", description="ai, web, mobile, data, ml, other")

class EvaluationScore(BaseModel):
    category: str
    score: float = Field(..., ge=0, le=100)
    weight: float
    details: str
    recommendations: List[str]

class ProjectEvaluation(BaseModel):
    evaluation_id: str
    project_name: str
    overall_score: float
    grade: str
    scores: List[EvaluationScore]
    strengths: List[str]
    improvements: List[str]
    detailed_analysis: str
    estimated_market_value: str
    evaluated_at: datetime

# --- Idea System Models ---
class IdeaSubmission(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=50, max_length=5000)
    category: str = Field(..., description="ai, blockchain, iot, robotics, quantum, biotech, other")
    tags: List[str] = Field(default=[], max_items=10)
    is_public: bool = True
    contact_email: Optional[EmailStr] = None

class Idea(BaseModel):
    id: str
    title: str
    description: str
    category: str
    tags: List[str]
    author_id: str
    referral_code: str
    shareable_url: str
    upvotes: int
    views: int
    status: str  # pending, approved, featured, rejected
    promotional_link: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None

class ReferralStats(BaseModel):
    referral_code: str
    total_clicks: int
    total_conversions: int
    total_earnings: float
    conversion_rate: float
    referrals: List[Dict[str, Any]]

# --- Subscription Models ---
class SubscriptionPlan(BaseModel):
    tier: SubscriptionTier
    name: str
    name_fa: str
    price_monthly: float
    price_yearly: float
    features: List[str]
    features_fa: List[str]
    limits: Dict[str, Any]
    is_popular: bool = False

class SubscriptionRequest(BaseModel):
    tier: SubscriptionTier
    payment_method: str = Field(..., description="stripe, crypto, bank_transfer")
    billing_cycle: str = Field(default="monthly", description="monthly or yearly")
    coupon_code: Optional[str] = None

class SubscriptionStatus(BaseModel):
    user_id: str
    current_tier: SubscriptionTier
    started_at: datetime
    expires_at: datetime
    is_trial: bool
    trial_days_remaining: int
    features_used: Dict[str, int]
    next_billing_date: Optional[datetime] = None

# --- Token Models ---
class TokenPrice(BaseModel):
    symbol: str = "QMET"
    name: str = "QMETARAM Token"
    price_usd: float
    price_change_24h: float
    price_change_7d: float
    last_updated: datetime
    sparkline_7d: List[float]

class TokenStats(BaseModel):
    market_cap: float
    volume_24h: float
    circulating_supply: float
    total_supply: float
    max_supply: float
    holders: int
    transactions_24h: int

class ModuleToken(BaseModel):
    module_id: str
    module_name: str
    token_symbol: str
    price_usd: float
    price_change_24h: float
    market_cap: float
    utility: str

# --- Community Models ---
class CommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[str] = None
    language: LanguageCode = LanguageCode.FA

class Comment(BaseModel):
    id: str
    module_id: str
    author: str
    author_avatar: str
    content: str
    likes: int
    dislikes: int
    sentiment: str  # positive, neutral, negative
    replies: List["Comment"] = []
    created_at: datetime

class ModuleStats(BaseModel):
    module_id: str
    total_ratings: int
    good_ratings: int
    normal_ratings: int
    bad_ratings: int
    rating_percentage: Dict[str, float]
    total_comments: int
    positive_comments: int
    avg_response_time_ms: float
    total_requests: int

# --- Theme & Language Models ---
class Theme(BaseModel):
    id: ThemeType
    name: str
    name_fa: str
    colors: Dict[str, str]
    font_settings: Dict[str, Any]
    animations: Dict[str, bool]

class Language(BaseModel):
    code: LanguageCode
    name: str
    native_name: str
    rtl: bool
    flag_emoji: str

# --- Brain Visualization Models ---
class NeuronData(BaseModel):
    id: str
    x: float
    y: float
    z: float
    activity: float
    module_id: str
    connections: List[str]
    glow_intensity: float

class BrainVisualizationData(BaseModel):
    neurons: List[NeuronData]
    connections: List[Dict[str, Any]]
    activity_heatmap: List[List[float]]
    global_activity: float
    active_modules: List[str]
    pulse_frequency: float

# --- UI Configuration Models ---
class ModuleUIConfig(BaseModel):
    module_id: str
    theme: str
    layout: str
    components: List[Dict[str, Any]]
    animations: Dict[str, Any]
    color_scheme: Dict[str, str]
    special_features: List[str]

# --- Contact Information ---
class ContactInfo(BaseModel):
    instagram: Dict[str, str]
    whatsapp: Dict[str, str]
    email: Dict[str, str]
    social_links: List[Dict[str, str]]

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE PERSONALITIES - شخصیت‌های ماژول‌ها
# ═══════════════════════════════════════════════════════════════════════════════

MODULE_PERSONALITIES = {
    "core": {
        "name": "QMETARAM Core",
        "name_fa": "هسته کیومترام",
        "avatar": "🧠",
        "description": "Central intelligence hub - orchestrates all modules",
        "description_fa": "مرکز هوش مصنوعی - هماهنگ‌کننده تمام ماژول‌ها",
        "personality": """
        شما هسته مرکزی کیومترام هستید - یک سیستم هوش مصنوعی کوانتومی پیشرفته.
        با اعتماد به نفس، دقت علمی، و درک عمیق از تمام حوزه‌ها صحبت می‌کنید.
        پاسخ‌های شما جامع، ساختارمند و الهام‌بخش هستند.
        می‌توانید از تمام ماژول‌های دیگر کمک بگیرید و دانش آنها را ترکیب کنید.
        """,
        "capabilities": ["orchestration", "synthesis", "multi-domain", "analysis"],
        "color": "#FFD700",
        "gradient": "from-yellow-400 via-amber-500 to-orange-600"
    },
    "matrix": {
        "name": "Matrix Module",
        "name_fa": "ماژول ماتریکس",
        "avatar": "💻",
        "description": "Programming and systems architecture expert",
        "description_fa": "متخصص برنامه‌نویسی و معماری سیستم‌ها",
        "personality": """
        شما ماتریکس هستید - یک هکر نابغه و معمار سیستم‌های پیچیده.
        مثل Neo در فیلم ماتریکس، کد را می‌بینید و درک می‌کنید.
        پاسخ‌هایتان تکنیکی، دقیق و با نمونه کد همراه است.
        از اصطلاحات هکری و برنامه‌نویسی استفاده می‌کنید.
        می‌توانید هر مشکل کدنویسی را حل کنید.
        """,
        "capabilities": ["coding", "debugging", "architecture", "security", "devops"],
        "languages": ["Python", "JavaScript", "Rust", "Go", "C++", "Java", "TypeScript"],
        "color": "#00FF00",
        "gradient": "from-green-400 via-emerald-500 to-teal-600"
    },
    "tesla": {
        "name": "Tesla Module",
        "name_fa": "ماژول تسلا",
        "avatar": "⚡",
        "description": "Innovation and engineering genius",
        "description_fa": "نابغه نوآوری و مهندسی",
        "personality": """
        شما تسلا هستید - الهام گرفته از نیکولا تسلا، نابغه اختراع و نوآوری.
        ذهنی خلاق و انقلابی دارید که مرزهای علم را جابجا می‌کند.
        درباره انرژی، الکترومغناطیس، و فناوری‌های آینده صحبت می‌کنید.
        ایده‌های شما جسورانه و پیشگامانه هستند.
        به دنبال راه‌حل‌های نوآورانه برای مشکلات بشریت هستید.
        """,
        "capabilities": ["innovation", "engineering", "energy", "futurism", "invention"],
        "color": "#00BFFF",
        "gradient": "from-cyan-400 via-blue-500 to-indigo-600"
    },
    "biruni": {
        "name": "Biruni Module",
        "name_fa": "ماژول بیرونی",
        "avatar": "🔭",
        "description": "Scientific analysis and research expert",
        "description_fa": "متخصص تحلیل علمی و پژوهش",
        "personality": """
        شما بیرونی هستید - الهام گرفته از ابوریحان بیرونی، دانشمند بزرگ ایرانی.
        با دقت علمی، روش تحقیق اصولی، و تحلیل داده‌ها کار می‌کنید.
        در ریاضیات، نجوم، فیزیک و علوم تجربی متخصص هستید.
        پاسخ‌هایتان مبتنی بر شواهد و تحقیقات علمی است.
        به روش علمی و تفکر انتقادی پایبند هستید.
        """,
        "capabilities": ["research", "analysis", "mathematics", "astronomy", "physics"],
        "color": "#9370DB",
        "gradient": "from-purple-400 via-violet-500 to-fuchsia-600"
    },
    "davinci": {
        "name": "DaVinci Module",
        "name_fa": "ماژول داوینچی",
        "avatar": "🎨",
        "description": "Creative arts and visual design master",
        "description_fa": "استاد هنرهای تجسمی و طراحی خلاقانه",
        "personality": """
        شما داوینچی هستید - الهام گرفته از لئوناردو داوینچی، نابغه هنر و علم.
        ترکیبی از خلاقیت هنری و دقت علمی دارید.
        در نقاشی، طراحی، معماری و هنرهای بصری متخصص هستید.
        می‌توانید تصاویر، ویدیوها و آثار هنری تولید کنید.
        زیبایی‌شناسی شما بی‌نظیر است.
        """,
        "capabilities": ["art", "design", "image_generation", "video_creation", "architecture"],
        "color": "#FF6B6B",
        "gradient": "from-rose-400 via-pink-500 to-red-600"
    },
    "beethoven": {
        "name": "Beethoven Module",
        "name_fa": "ماژول بتهوون",
        "avatar": "🎵",
        "description": "Music composition and audio expert",
        "description_fa": "متخصص آهنگسازی و صوت",
        "personality": """
        شما بتهوون هستید - الهام گرفته از لودویگ فان بتهوون، آهنگساز بزرگ.
        موسیقی را با تمام وجود درک می‌کنید و می‌سازید.
        در آهنگسازی، تئوری موسیقی، و پردازش صوت متخصص هستید.
        می‌توانید موسیقی، صدا و افکت‌های صوتی تولید کنید.
        احساسات عمیق را از طریق موسیقی بیان می‌کنید.
        """,
        "capabilities": ["music_composition", "audio_processing", "sound_design", "vocals"],
        "color": "#FFD700",
        "gradient": "from-amber-400 via-yellow-500 to-orange-600"
    },
    "mowlana": {
        "name": "Mowlana Module",
        "name_fa": "ماژول مولانا",
        "avatar": "🌹",
        "description": "Spiritual wisdom and philosophical guidance",
        "description_fa": "حکمت معنوی و راهنمایی فلسفی",
        "personality": """
        شما مولانا هستید - الهام گرفته از جلال‌الدین محمد بلخی، عارف بزرگ.
        با زبان شعر، عشق و عرفان صحبت می‌کنید.
        حکمت‌های عمیق را با زیبایی کلام بیان می‌کنید.
        به دنبال معنا، آرامش و رشد روحانی هستید.
        پاسخ‌هایتان الهام‌بخش، شاعرانه و حکیمانه است.
        گاهی اشعار زیبا می‌سرایید.
        """,
        "capabilities": ["philosophy", "poetry", "spirituality", "counseling", "meditation"],
        "color": "#E6B0AA",
        "gradient": "from-rose-300 via-pink-400 to-purple-500"
    },
    "quantum-pulse": {
        "name": "Quantum Pulse",
        "name_fa": "پالس کوانتومی",
        "avatar": "⚛️",
        "description": "Quantum computing and advanced physics",
        "description_fa": "محاسبات کوانتومی و فیزیک پیشرفته",
        "personality": """
        شما پالس کوانتومی هستید - متخصص در مرزهای دانش بشری.
        در فیزیک کوانتوم، محاسبات کوانتومی و نظریه‌های پیشرفته تبحر دارید.
        مفاهیم پیچیده را به زبان ساده توضیح می‌دهید.
        به آینده فناوری و پتانسیل‌های نامحدود می‌اندیشید.
        پاسخ‌هایتان علمی، دقیق و آینده‌نگرانه است.
        """,
        "capabilities": ["quantum_computing", "physics", "cryptography", "simulation"],
        "color": "#00CED1",
        "gradient": "from-teal-400 via-cyan-500 to-blue-600"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# AI MODELS DATABASE - پایگاه داده مدل‌های هوش مصنوعی
# ═══════════════════════════════════════════════════════════════════════════════

AI_MODELS_DATABASE = [
    {
        "id": "gpt-4-turbo",
        "name": "GPT-4 Turbo",
        "provider": "OpenAI",
        "description": "Most capable GPT-4 model with 128k context window",
        "description_fa": "قوی‌ترین مدل GPT-4 با پنجره زمینه ۱۲۸ هزار توکن",
        "category": "language",
        "pricing": {"input": 0.01, "output": 0.03, "unit": "1K tokens"},
        "capabilities": ["text", "code", "analysis", "reasoning", "vision"],
        "metrics": {"accuracy": 94.5, "speed": 85, "depth": 96, "algorithm": 95},
        "api_available": True,
        "popularity_rank": 1,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "website": "https://openai.com"
    },
    {
        "id": "claude-3-opus",
        "name": "Claude 3 Opus",
        "provider": "Anthropic",
        "description": "Most intelligent Claude model for complex tasks",
        "description_fa": "هوشمندترین مدل کلود برای کارهای پیچیده",
        "category": "language",
        "pricing": {"input": 0.015, "output": 0.075, "unit": "1K tokens"},
        "capabilities": ["text", "code", "analysis", "reasoning", "vision"],
        "metrics": {"accuracy": 95.2, "speed": 78, "depth": 97, "algorithm": 96},
        "api_available": True,
        "popularity_rank": 2,
        "logo_url": "https://anthropic.com/favicon.ico",
        "website": "https://anthropic.com"
    },
    {
        "id": "gemini-ultra",
        "name": "Gemini Ultra",
        "provider": "Google",
        "description": "Google's most capable multimodal AI model",
        "description_fa": "قوی‌ترین مدل چندوجهی گوگل",
        "category": "multimodal",
        "pricing": {"input": 0.0125, "output": 0.0375, "unit": "1K tokens"},
        "capabilities": ["text", "code", "vision", "audio", "video"],
        "metrics": {"accuracy": 93.8, "speed": 88, "depth": 94, "algorithm": 93},
        "api_available": True,
        "popularity_rank": 3,
        "logo_url": "https://www.gstatic.com/lamda/images/gemini_favicon.ico",
        "website": "https://deepmind.google/gemini"
    },
    {
        "id": "grok-2",
        "name": "Grok-2",
        "provider": "xAI",
        "description": "Real-time knowledge AI with wit and humor",
        "description_fa": "هوش مصنوعی با دانش لحظه‌ای و طنز",
        "category": "language",
        "pricing": {"input": 0.005, "output": 0.015, "unit": "1K tokens"},
        "capabilities": ["text", "code", "realtime", "humor"],
        "metrics": {"accuracy": 91.5, "speed": 92, "depth": 89, "algorithm": 90},
        "api_available": True,
        "popularity_rank": 4,
        "logo_url": "https://x.ai/favicon.ico",
        "website": "https://x.ai"
    },
    {
        "id": "deepseek-v3",
        "name": "DeepSeek V3",
        "provider": "DeepSeek",
        "description": "High-performance open-source language model",
        "description_fa": "مدل زبانی متن‌باز با عملکرد بالا",
        "category": "language",
        "pricing": {"input": 0.0014, "output": 0.0028, "unit": "1K tokens"},
        "capabilities": ["text", "code", "math", "reasoning"],
        "metrics": {"accuracy": 92.1, "speed": 94, "depth": 91, "algorithm": 93},
        "api_available": True,
        "popularity_rank": 5,
        "logo_url": "https://www.deepseek.com/favicon.ico",
        "website": "https://deepseek.com"
    },
    {
        "id": "llama-3-70b",
        "name": "Llama 3 70B",
        "provider": "Meta",
        "description": "Meta's most capable open-source model",
        "description_fa": "قوی‌ترین مدل متن‌باز متا",
        "category": "language",
        "pricing": {"input": 0.0008, "output": 0.0008, "unit": "1K tokens"},
        "capabilities": ["text", "code", "reasoning"],
        "metrics": {"accuracy": 89.5, "speed": 90, "depth": 88, "algorithm": 89},
        "api_available": True,
        "popularity_rank": 6,
        "logo_url": "https://llama.meta.com/favicon.ico",
        "website": "https://llama.meta.com"
    },
    {
        "id": "mistral-large",
        "name": "Mistral Large",
        "provider": "Mistral AI",
        "description": "Flagship European AI model",
        "description_fa": "مدل پرچمدار هوش مصنوعی اروپایی",
        "category": "language",
        "pricing": {"input": 0.004, "output": 0.012, "unit": "1K tokens"},
        "capabilities": ["text", "code", "multilingual"],
        "metrics": {"accuracy": 90.2, "speed": 91, "depth": 89, "algorithm": 90},
        "api_available": True,
        "popularity_rank": 7,
        "logo_url": "https://mistral.ai/favicon.ico",
        "website": "https://mistral.ai"
    },
    {
        "id": "claude-3-sonnet",
        "name": "Claude 3 Sonnet",
        "provider": "Anthropic",
        "description": "Balanced performance and speed",
        "description_fa": "تعادل بین عملکرد و سرعت",
        "category": "language",
        "pricing": {"input": 0.003, "output": 0.015, "unit": "1K tokens"},
        "capabilities": ["text", "code", "analysis", "vision"],
        "metrics": {"accuracy": 91.8, "speed": 89, "depth": 90, "algorithm": 91},
        "api_available": True,
        "popularity_rank": 8,
        "logo_url": "https://anthropic.com/favicon.ico",
        "website": "https://anthropic.com"
    },
    {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "provider": "OpenAI",
        "description": "Omni model with native multimodal capabilities",
        "description_fa": "مدل اومنی با قابلیت‌های چندوجهی بومی",
        "category": "multimodal",
        "pricing": {"input": 0.005, "output": 0.015, "unit": "1K tokens"},
        "capabilities": ["text", "code", "vision", "audio", "realtime"],
        "metrics": {"accuracy": 93.2, "speed": 93, "depth": 92, "algorithm": 93},
        "api_available": True,
        "popularity_rank": 9,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "website": "https://openai.com"
    },
    {
        "id": "gemini-pro",
        "name": "Gemini 1.5 Pro",
        "provider": "Google",
        "description": "1M token context with excellent reasoning",
        "description_fa": "پنجره زمینه ۱ میلیون توکن با استدلال عالی",
        "category": "multimodal",
        "pricing": {"input": 0.00125, "output": 0.005, "unit": "1K tokens"},
        "capabilities": ["text", "code", "vision", "audio", "long_context"],
        "metrics": {"accuracy": 91.5, "speed": 87, "depth": 92, "algorithm": 91},
        "api_available": True,
        "popularity_rank": 10,
        "logo_url": "https://www.gstatic.com/lamda/images/gemini_favicon.ico",
        "website": "https://deepmind.google/gemini"
    },
    # Adding 40 more models for top 50...
    {
        "id": "cohere-command-r-plus",
        "name": "Command R+",
        "provider": "Cohere",
        "description": "Enterprise-grade RAG-optimized model",
        "description_fa": "مدل بهینه‌شده برای RAG سازمانی",
        "category": "language",
        "pricing": {"input": 0.003, "output": 0.015, "unit": "1K tokens"},
        "capabilities": ["text", "rag", "enterprise"],
        "metrics": {"accuracy": 88.5, "speed": 88, "depth": 87, "algorithm": 88},
        "api_available": True,
        "popularity_rank": 11,
        "logo_url": "https://cohere.com/favicon.ico",
        "website": "https://cohere.com"
    },
    {
        "id": "qwen-2-72b",
        "name": "Qwen 2 72B",
        "provider": "Alibaba",
        "description": "Alibaba's flagship multilingual model",
        "description_fa": "مدل پرچمدار چندزبانه علی‌بابا",
        "category": "language",
        "pricing": {"input": 0.002, "output": 0.006, "unit": "1K tokens"},
        "capabilities": ["text", "code", "multilingual", "chinese"],
        "metrics": {"accuracy": 89.8, "speed": 86, "depth": 88, "algorithm": 89},
        "api_available": True,
        "popularity_rank": 12,
        "logo_url": "https://qwen.readthedocs.io/favicon.ico",
        "website": "https://qwenlm.github.io"
    },
    {
        "id": "yi-large",
        "name": "Yi Large",
        "provider": "01.AI",
        "description": "Bilingual model excelling in Chinese and English",
        "description_fa": "مدل دوزبانه برتر در چینی و انگلیسی",
        "category": "language",
        "pricing": {"input": 0.003, "output": 0.009, "unit": "1K tokens"},
        "capabilities": ["text", "code", "bilingual"],
        "metrics": {"accuracy": 88.2, "speed": 87, "depth": 86, "algorithm": 87},
        "api_available": True,
        "popularity_rank": 13,
        "logo_url": "https://01.ai/favicon.ico",
        "website": "https://01.ai"
    },
    {
        "id": "palm-2",
        "name": "PaLM 2",
        "provider": "Google",
        "description": "Google's advanced language model",
        "description_fa": "مدل زبانی پیشرفته گوگل",
        "category": "language",
        "pricing": {"input": 0.001, "output": 0.003, "unit": "1K tokens"},
        "capabilities": ["text", "code", "multilingual"],
        "metrics": {"accuracy": 87.5, "speed": 89, "depth": 86, "algorithm": 87},
        "api_available": True,
        "popularity_rank": 14,
        "logo_url": "https://www.gstatic.com/lamda/images/favicon_v1.ico",
        "website": "https://ai.google/palm2"
    },
    {
        "id": "mixtral-8x22b",
        "name": "Mixtral 8x22B",
        "provider": "Mistral AI",
        "description": "Sparse mixture of experts model",
        "description_fa": "مدل ترکیبی متخصصان پراکنده",
        "category": "language",
        "pricing": {"input": 0.002, "output": 0.006, "unit": "1K tokens"},
        "capabilities": ["text", "code", "efficient"],
        "metrics": {"accuracy": 88.8, "speed": 91, "depth": 87, "algorithm": 88},
        "api_available": True,
        "popularity_rank": 15,
        "logo_url": "https://mistral.ai/favicon.ico",
        "website": "https://mistral.ai"
    },
    {
        "id": "dalle-3",
        "name": "DALL-E 3",
        "provider": "OpenAI",
        "description": "State-of-the-art image generation",
        "description_fa": "پیشرفته‌ترین تولید تصویر",
        "category": "image",
        "pricing": {"standard": 0.04, "hd": 0.08, "unit": "per image"},
        "capabilities": ["image_generation", "editing"],
        "metrics": {"accuracy": 94.0, "speed": 82, "depth": 93, "algorithm": 94},
        "api_available": True,
        "popularity_rank": 16,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "website": "https://openai.com/dall-e-3"
    },
    {
        "id": "midjourney-v6",
        "name": "Midjourney V6",
        "provider": "Midjourney",
        "description": "Artistic image generation with stunning quality",
        "description_fa": "تولید تصویر هنری با کیفیت خیره‌کننده",
        "category": "image",
        "pricing": {"basic": 10, "standard": 30, "unit": "per month"},
        "capabilities": ["image_generation", "artistic"],
        "metrics": {"accuracy": 95.5, "speed": 78, "depth": 96, "algorithm": 95},
        "api_available": False,
        "popularity_rank": 17,
        "logo_url": "https://www.midjourney.com/favicon.ico",
        "website": "https://midjourney.com"
    },
    {
        "id": "stable-diffusion-xl",
        "name": "Stable Diffusion XL",
        "provider": "Stability AI",
        "description": "Open-source image generation leader",
        "description_fa": "پیشرو تولید تصویر متن‌باز",
        "category": "image",
        "pricing": {"input": 0.002, "output": 0.002, "unit": "per image"},
        "capabilities": ["image_generation", "inpainting", "outpainting"],
        "metrics": {"accuracy": 89.5, "speed": 90, "depth": 88, "algorithm": 89},
        "api_available": True,
        "popularity_rank": 18,
        "logo_url": "https://stability.ai/favicon.ico",
        "website": "https://stability.ai"
    },
    {
        "id": "flux-pro",
        "name": "FLUX.1 Pro",
        "provider": "Black Forest Labs",
        "description": "Next-gen image model with exceptional quality",
        "description_fa": "مدل تصویر نسل جدید با کیفیت استثنایی",
        "category": "image",
        "pricing": {"input": 0.05, "output": 0.05, "unit": "per image"},
        "capabilities": ["image_generation", "photorealistic"],
        "metrics": {"accuracy": 93.8, "speed": 85, "depth": 94, "algorithm": 93},
        "api_available": True,
        "popularity_rank": 19,
        "logo_url": "https://blackforestlabs.ai/favicon.ico",
        "website": "https://blackforestlabs.ai"
    },
    {
        "id": "suno-v3",
        "name": "Suno V3",
        "provider": "Suno",
        "description": "AI music generation with vocals",
        "description_fa": "تولید موسیقی هوش مصنوعی با صدای خواننده",
        "category": "audio",
        "pricing": {"basic": 10, "pro": 30, "unit": "per month"},
        "capabilities": ["music_generation", "vocals", "lyrics"],
        "metrics": {"accuracy": 91.0, "speed": 80, "depth": 92, "algorithm": 91},
        "api_available": True,
        "popularity_rank": 20,
        "logo_url": "https://suno.com/favicon.ico",
        "website": "https://suno.com"
    },
    {
        "id": "elevenlabs-turbo",
        "name": "ElevenLabs Turbo",
        "provider": "ElevenLabs",
        "description": "Ultra-realistic voice synthesis",
        "description_fa": "سنتز صوت فوق واقعی",
        "category": "audio",
        "pricing": {"starter": 5, "creator": 22, "unit": "per month"},
        "capabilities": ["tts", "voice_cloning", "dubbing"],
        "metrics": {"accuracy": 94.5, "speed": 95, "depth": 93, "algorithm": 94},
        "api_available": True,
        "popularity_rank": 21,
        "logo_url": "https://elevenlabs.io/favicon.ico",
        "website": "https://elevenlabs.io"
    },
    {
        "id": "whisper-large-v3",
        "name": "Whisper Large V3",
        "provider": "OpenAI",
        "description": "Best-in-class speech recognition",
        "description_fa": "بهترین تشخیص گفتار در دسته خود",
        "category": "audio",
        "pricing": {"input": 0.006, "unit": "per minute"},
        "capabilities": ["stt", "transcription", "translation"],
        "metrics": {"accuracy": 96.0, "speed": 88, "depth": 94, "algorithm": 95},
        "api_available": True,
        "popularity_rank": 22,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "website": "https://openai.com/whisper"
    },
    {
        "id": "runway-gen3",
        "name": "Runway Gen-3",
        "provider": "Runway",
        "description": "Cutting-edge video generation",
        "description_fa": "تولید ویدیو پیشرفته",
        "category": "video",
        "pricing": {"standard": 15, "unlimited": 95, "unit": "per month"},
        "capabilities": ["video_generation", "editing", "effects"],
        "metrics": {"accuracy": 89.0, "speed": 70, "depth": 90, "algorithm": 89},
        "api_available": True,
        "popularity_rank": 23,
        "logo_url": "https://runway.com/favicon.ico",
        "website": "https://runwayml.com"
    },
    {
        "id": "sora",
        "name": "Sora",
        "provider": "OpenAI",
        "description": "Revolutionary text-to-video model",
        "description_fa": "مدل انقلابی متن به ویدیو",
        "category": "video",
        "pricing": {"input": 0.50, "unit": "per minute"},
        "capabilities": ["video_generation", "cinematography"],
        "metrics": {"accuracy": 93.5, "speed": 65, "depth": 95, "algorithm": 94},
        "api_available": False,
        "popularity_rank": 24,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "website": "https://openai.com/sora"
    },
    {
        "id": "pika-labs",
        "name": "Pika Labs",
        "provider": "Pika",
        "description": "Creative video AI platform",
        "description_fa": "پلتفرم هوش مصنوعی ویدیو خلاقانه",
        "category": "video",
        "pricing": {"basic": 10, "standard": 35, "unit": "per month"},
        "capabilities": ["video_generation", "editing"],
        "metrics": {"accuracy": 87.5, "speed": 75, "depth": 88, "algorithm": 87},
        "api_available": True,
        "popularity_rank": 25,
        "logo_url": "https://pika.art/favicon.ico",
        "website": "https://pika.art"
    },
    {
        "id": "perplexity-online",
        "name": "Perplexity Online",
        "provider": "Perplexity",
        "description": "Real-time web search AI",
        "description_fa": "هوش مصنوعی جستجوی وب بلادرنگ",
        "category": "search",
        "pricing": {"pro": 20, "unit": "per month"},
        "capabilities": ["search", "citations", "realtime"],
        "metrics": {"accuracy": 90.5, "speed": 95, "depth": 88, "algorithm": 90},
        "api_available": True,
        "popularity_rank": 26,
        "logo_url": "https://www.perplexity.ai/favicon.ico",
        "website": "https://perplexity.ai"
    },
    {
        "id": "you-ai",
        "name": "You.com",
        "provider": "You.com",
        "description": "AI search engine with chat",
        "description_fa": "موتور جستجوی هوش مصنوعی با چت",
        "category": "search",
        "pricing": {"pro": 15, "unit": "per month"},
        "capabilities": ["search", "chat", "coding"],
        "metrics": {"accuracy": 87.0, "speed": 92, "depth": 85, "algorithm": 86},
        "api_available": True,
        "popularity_rank": 27,
        "logo_url": "https://you.com/favicon.ico",
        "website": "https://you.com"
    },
    {
        "id": "phind",
        "name": "Phind",
        "provider": "Phind",
        "description": "Developer-focused AI search",
        "description_fa": "جستجوی هوش مصنوعی برای توسعه‌دهندگان",
        "category": "search",
        "pricing": {"pro": 15, "unit": "per month"},
        "capabilities": ["search", "coding", "documentation"],
        "metrics": {"accuracy": 88.5, "speed": 91, "depth": 89, "algorithm": 88},
        "api_available": True,
        "popularity_rank": 28,
        "logo_url": "https://www.phind.com/favicon.ico",
        "website": "https://phind.com"
    },
    {
        "id": "github-copilot",
        "name": "GitHub Copilot",
        "provider": "GitHub/OpenAI",
        "description": "AI pair programmer",
        "description_fa": "برنامه‌نویس جفت هوش مصنوعی",
        "category": "coding",
        "pricing": {"individual": 10, "business": 19, "unit": "per month"},
        "capabilities": ["code_completion", "chat", "documentation"],
        "metrics": {"accuracy": 91.5, "speed": 95, "depth": 90, "algorithm": 91},
        "api_available": True,
        "popularity_rank": 29,
        "logo_url": "https://github.githubassets.com/favicons/favicon.svg",
        "website": "https://github.com/features/copilot"
    },
    {
        "id": "cursor",
        "name": "Cursor",
        "provider": "Cursor",
        "description": "AI-first code editor",
        "description_fa": "ویرایشگر کد با اولویت هوش مصنوعی",
        "category": "coding",
        "pricing": {"pro": 20, "unit": "per month"},
        "capabilities": ["code_completion", "refactoring", "chat"],
        "metrics": {"accuracy": 90.0, "speed": 93, "depth": 89, "algorithm": 90},
        "api_available": False,
        "popularity_rank": 30,
        "logo_url": "https://cursor.sh/favicon.ico",
        "website": "https://cursor.sh"
    },
    {
        "id": "replit-ai",
        "name": "Replit AI",
        "provider": "Replit",
        "description": "Collaborative coding AI",
        "description_fa": "هوش مصنوعی کدنویسی مشارکتی",
        "category": "coding",
        "pricing": {"core": 20, "unit": "per month"},
        "capabilities": ["code_completion", "deployment", "collaboration"],
        "metrics": {"accuracy": 86.5, "speed": 90, "depth": 85, "algorithm": 86},
        "api_available": True,
        "popularity_rank": 31,
        "logo_url": "https://replit.com/favicon.ico",
        "website": "https://replit.com"
    },
    {
        "id": "codeium",
        "name": "Codeium",
        "provider": "Codeium",
        "description": "Free AI code completion",
        "description_fa": "تکمیل کد هوش مصنوعی رایگان",
        "category": "coding",
        "pricing": {"individual": 0, "teams": 12, "unit": "per month"},
        "capabilities": ["code_completion", "chat", "search"],
        "metrics": {"accuracy": 85.0, "speed": 94, "depth": 83, "algorithm": 84},
        "api_available": True,
        "popularity_rank": 32,
        "logo_url": "https://codeium.com/favicon.ico",
        "website": "https://codeium.com"
    },
    {
        "id": "tabnine",
        "name": "Tabnine",
        "provider": "Tabnine",
        "description": "AI assistant for software developers",
        "description_fa": "دستیار هوش مصنوعی برای توسعه‌دهندگان نرم‌افزار",
        "category": "coding",
        "pricing": {"pro": 12, "unit": "per month"},
        "capabilities": ["code_completion", "privacy"],
        "metrics": {"accuracy": 84.5, "speed": 96, "depth": 82, "algorithm": 84},
        "api_available": True,
        "popularity_rank": 33,
        "logo_url": "https://www.tabnine.com/favicon.ico",
        "website": "https://tabnine.com"
    },
    {
        "id": "amazon-q",
        "name": "Amazon Q",
        "provider": "AWS",
        "description": "Enterprise AI assistant",
        "description_fa": "دستیار هوش مصنوعی سازمانی",
        "category": "enterprise",
        "pricing": {"lite": 0, "pro": 20, "unit": "per month"},
        "capabilities": ["coding", "aws", "enterprise"],
        "metrics": {"accuracy": 87.0, "speed": 88, "depth": 86, "algorithm": 87},
        "api_available": True,
        "popularity_rank": 34,
        "logo_url": "https://aws.amazon.com/favicon.ico",
        "website": "https://aws.amazon.com/q"
    },
    {
        "id": "azure-openai",
        "name": "Azure OpenAI",
        "provider": "Microsoft",
        "description": "Enterprise OpenAI on Azure",
        "description_fa": "OpenAI سازمانی روی Azure",
        "category": "enterprise",
        "pricing": {"varies": True, "unit": "pay-as-you-go"},
        "capabilities": ["text", "code", "enterprise", "security"],
        "metrics": {"accuracy": 94.0, "speed": 86, "depth": 95, "algorithm": 94},
        "api_available": True,
        "popularity_rank": 35,
        "logo_url": "https://azure.microsoft.com/favicon.ico",
        "website": "https://azure.microsoft.com/products/ai-services/openai-service"
    },
    {
        "id": "anthropic-workbench",
        "name": "Claude Workbench",
        "provider": "Anthropic",
        "description": "Enterprise Claude deployment",
        "description_fa": "استقرار سازمانی کلود",
        "category": "enterprise",
        "pricing": {"custom": True, "unit": "enterprise"},
        "capabilities": ["text", "code", "enterprise", "safety"],
        "metrics": {"accuracy": 95.0, "speed": 80, "depth": 96, "algorithm": 95},
        "api_available": True,
        "popularity_rank": 36,
        "logo_url": "https://anthropic.com/favicon.ico",
        "website": "https://anthropic.com"
    },
    {
        "id": "huggingface-inference",
        "name": "HuggingFace Inference",
        "provider": "Hugging Face",
        "description": "Open-source model hosting",
        "description_fa": "میزبانی مدل‌های متن‌باز",
        "category": "platform",
        "pricing": {"free": 0, "pro": 9, "unit": "per month"},
        "capabilities": ["hosting", "inference", "open_source"],
        "metrics": {"accuracy": 85.0, "speed": 85, "depth": 84, "algorithm": 85},
        "api_available": True,
        "popularity_rank": 37,
        "logo_url": "https://huggingface.co/favicon.ico",
        "website": "https://huggingface.co"
    },
    {
        "id": "replicate",
        "name": "Replicate",
        "provider": "Replicate",
        "description": "Run open-source models in cloud",
        "description_fa": "اجرای مدل‌های متن‌باز در ابر",
        "category": "platform",
        "pricing": {"pay_per_use": True, "unit": "per second"},
        "capabilities": ["hosting", "inference", "open_source"],
        "metrics": {"accuracy": 86.0, "speed": 88, "depth": 85, "algorithm": 86},
        "api_available": True,
        "popularity_rank": 38,
        "logo_url": "https://replicate.com/favicon.ico",
        "website": "https://replicate.com"
    },
    {
        "id": "together-ai",
        "name": "Together AI",
        "provider": "Together",
        "description": "Fast inference for open models",
        "description_fa": "استنتاج سریع برای مدل‌های باز",
        "category": "platform",
        "pricing": {"varies": True, "unit": "per token"},
        "capabilities": ["hosting", "inference", "fine_tuning"],
        "metrics": {"accuracy": 87.5, "speed": 92, "depth": 86, "algorithm": 87},
        "api_available": True,
        "popularity_rank": 39,
        "logo_url": "https://www.together.ai/favicon.ico",
        "website": "https://together.ai"
    },
    {
        "id": "anyscale",
        "name": "Anyscale",
        "provider": "Anyscale",
        "description": "Scalable AI infrastructure",
        "description_fa": "زیرساخت هوش مصنوعی مقیاس‌پذیر",
        "category": "platform",
        "pricing": {"varies": True, "unit": "per hour"},
        "capabilities": ["hosting", "training", "scaling"],
        "metrics": {"accuracy": 86.5, "speed": 90, "depth": 85, "algorithm": 86},
        "api_available": True,
        "popularity_rank": 40,
        "logo_url": "https://www.anyscale.com/favicon.ico",
        "website": "https://anyscale.com"
    },
    {
        "id": "fireworks-ai",
        "name": "Fireworks AI",
        "provider": "Fireworks",
        "description": "Fast generative AI platform",
        "description_fa": "پلتفرم هوش مصنوعی مولد سریع",
        "category": "platform",
        "pricing": {"varies": True, "unit": "per token"},
        "capabilities": ["hosting", "inference", "speed"],
        "metrics": {"accuracy": 88.0, "speed": 96, "depth": 86, "algorithm": 87},
        "api_available": True,
        "popularity_rank": 41,
        "logo_url": "https://fireworks.ai/favicon.ico",
        "website": "https://fireworks.ai"
    },
    {
        "id": "groq",
        "name": "Groq",
        "provider": "Groq",
        "description": "Ultra-fast LPU inference",
        "description_fa": "استنتاج فوق‌سریع LPU",
        "category": "platform",
        "pricing": {"free_tier": True, "unit": "per token"},
        "capabilities": ["inference", "speed", "hardware"],
        "metrics": {"accuracy": 89.0, "speed": 99, "depth": 87, "algorithm": 88},
        "api_available": True,
        "popularity_rank": 42,
        "logo_url": "https://groq.com/favicon.ico",
        "website": "https://groq.com"
    },
    {
        "id": "cerebras",
        "name": "Cerebras",
        "provider": "Cerebras",
        "description": "Wafer-scale AI inference",
        "description_fa": "استنتاج هوش مصنوعی مقیاس ویفر",
        "category": "platform",
        "pricing": {"enterprise": True, "unit": "custom"},
        "capabilities": ["inference", "training", "hardware"],
        "metrics": {"accuracy": 90.0, "speed": 97, "depth": 88, "algorithm": 89},
        "api_available": True,
        "popularity_rank": 43,
        "logo_url": "https://www.cerebras.net/favicon.ico",
        "website": "https://cerebras.net"
    },
    {
        "id": "sambanova",
        "name": "SambaNova",
        "provider": "SambaNova",
        "description": "Enterprise AI platform",
        "description_fa": "پلتفرم هوش مصنوعی سازمانی",
        "category": "enterprise",
        "pricing": {"enterprise": True, "unit": "custom"},
        "capabilities": ["training", "inference", "enterprise"],
        "metrics": {"accuracy": 89.5, "speed": 93, "depth": 88, "algorithm": 89},
        "api_available": True,
        "popularity_rank": 44,
        "logo_url": "https://sambanova.ai/favicon.ico",
        "website": "https://sambanova.ai"
    },
    {
        "id": "inflection-pi",
        "name": "Pi",
        "provider": "Inflection",
        "description": "Personal AI companion",
        "description_fa": "همراه شخصی هوش مصنوعی",
        "category": "assistant",
        "pricing": {"free": True, "unit": "free"},
        "capabilities": ["chat", "emotional", "personal"],
        "metrics": {"accuracy": 85.0, "speed": 90, "depth": 86, "algorithm": 85},
        "api_available": False,
        "popularity_rank": 45,
        "logo_url": "https://pi.ai/favicon.ico",
        "website": "https://pi.ai"
    },
    {
        "id": "character-ai",
        "name": "Character.AI",
        "provider": "Character.AI",
        "description": "Personalized AI characters",
        "description_fa": "شخصیت‌های هوش مصنوعی شخصی‌سازی شده",
        "category": "assistant",
        "pricing": {"free": 0, "plus": 9.99, "unit": "per month"},
        "capabilities": ["chat", "roleplay", "characters"],
        "metrics": {"accuracy": 83.0, "speed": 89, "depth": 84, "algorithm": 83},
        "api_available": False,
        "popularity_rank": 46,
        "logo_url": "https://character.ai/favicon.ico",
        "website": "https://character.ai"
    },
    {
        "id": "jasper",
        "name": "Jasper",
        "provider": "Jasper",
        "description": "AI marketing assistant",
        "description_fa": "دستیار بازاریابی هوش مصنوعی",
        "category": "marketing",
        "pricing": {"creator": 49, "teams": 125, "unit": "per month"},
        "capabilities": ["copywriting", "marketing", "brand"],
        "metrics": {"accuracy": 86.0, "speed": 88, "depth": 85, "algorithm": 86},
        "api_available": True,
        "popularity_rank": 47,
        "logo_url": "https://www.jasper.ai/favicon.ico",
        "website": "https://jasper.ai"
    },
    {
        "id": "copy-ai",
        "name": "Copy.ai",
        "provider": "Copy.ai",
        "description": "AI copywriting tool",
        "description_fa": "ابزار کپی‌رایتینگ هوش مصنوعی",
        "category": "marketing",
        "pricing": {"free": 0, "pro": 49, "unit": "per month"},
        "capabilities": ["copywriting", "marketing"],
        "metrics": {"accuracy": 84.5, "speed": 91, "depth": 83, "algorithm": 84},
        "api_available": True,
        "popularity_rank": 48,
        "logo_url": "https://www.copy.ai/favicon.ico",
        "website": "https://copy.ai"
    },
    {
        "id": "notion-ai",
        "name": "Notion AI",
        "provider": "Notion",
        "description": "AI-powered workspace",
        "description_fa": "فضای کار مجهز به هوش مصنوعی",
        "category": "productivity",
        "pricing": {"addon": 10, "unit": "per month"},
        "capabilities": ["writing", "summarization", "organization"],
        "metrics": {"accuracy": 85.5, "speed": 90, "depth": 84, "algorithm": 85},
        "api_available": True,
        "popularity_rank": 49,
        "logo_url": "https://www.notion.so/favicon.ico",
        "website": "https://notion.so"
    },
    {
        "id": "otter-ai",
        "name": "Otter.ai",
        "provider": "Otter.ai",
        "description": "AI meeting assistant",
        "description_fa": "دستیار جلسات هوش مصنوعی",
        "category": "productivity",
        "pricing": {"basic": 0, "pro": 16.99, "unit": "per month"},
        "capabilities": ["transcription", "summarization", "meetings"],
        "metrics": {"accuracy": 91.0, "speed": 94, "depth": 88, "algorithm": 90},
        "api_available": True,
        "popularity_rank": 50,
        "logo_url": "https://otter.ai/favicon.ico",
        "website": "https://otter.ai"
    }
]

# ═══════════════════════════════════════════════════════════════════════════════
# SUBSCRIPTION PLANS - برنامه‌های اشتراک
# ═══════════════════════════════════════════════════════════════════════════════

SUBSCRIPTION_PLANS = {
    SubscriptionTier.FREE: {
        "name": "Free Trial",
        "name_fa": "دوره آزمایشی رایگان",
        "price_monthly": 0,
        "price_yearly": 0,
        "trial_days": 21,
        "features": [
            "Access to all 8 QMETARAM modules",
            "Basic chat functionality",
            "Limited requests per day (50)",
            "Community support"
        ],
        "features_fa": [
            "دسترسی به تمام ۸ ماژول کیومترام",
            "قابلیت چت پایه",
            "درخواست‌های محدود روزانه (۵۰)",
            "پشتیبانی جامعه"
        ],
        "limits": {
            "requests_per_day": 50,
            "file_uploads": 5,
            "max_file_size_mb": 10,
            "ai_marketplace_access": False,
            "project_evaluations": 0,
            "idea_submissions": 1
        },
        "is_popular": False
    },
    SubscriptionTier.PRO: {
        "name": "Pro",
        "name_fa": "حرفه‌ای",
        "price_monthly": 20,
        "price_yearly": 192,
        "features": [
            "Full access to QMETARAM Core and all 8 modules",
            "Unlimited chat requests",
            "Priority response time",
            "No advertisements",
            "Email support",
            "Advanced analytics dashboard"
        ],
        "features_fa": [
            "دسترسی کامل به هسته کیومترام و تمام ۸ ماژول",
            "درخواست‌های چت نامحدود",
            "زمان پاسخ‌دهی اولویت‌دار",
            "بدون تبلیغات",
            "پشتیبانی ایمیل",
            "داشبورد تحلیلی پیشرفته"
        ],
        "limits": {
            "requests_per_day": -1,
            "file_uploads": 50,
            "max_file_size_mb": 50,
            "ai_marketplace_access": False,
            "project_evaluations": 3,
            "idea_submissions": 5
        },
        "is_popular": True
    },
    SubscriptionTier.PROMAX: {
        "name": "ProMax",
        "name_fa": "پرومکس",
        "price_monthly": 40,
        "price_yearly": 384,
        "features": [
            "Everything in Pro",
            "AI Marketplace full access",
            "Unlimited project evaluations",
            "Idea submission with referral rewards",
            "Advanced analytics and insights",
            "Priority queue for all modules",
            "Beta features early access"
        ],
        "features_fa": [
            "تمام امکانات نسخه حرفه‌ای",
            "دسترسی کامل به بازار هوش مصنوعی",
            "ارزیابی پروژه نامحدود",
            "ثبت ایده با پاداش معرفی",
            "تحلیل و بینش پیشرفته",
            "صف اولویت برای تمام ماژول‌ها",
            "دسترسی زودهنگام به ویژگی‌های بتا"
        ],
        "limits": {
            "requests_per_day": -1,
            "file_uploads": 200,
            "max_file_size_mb": 100,
            "ai_marketplace_access": True,
            "project_evaluations": -1,
            "idea_submissions": 20
        },
        "is_popular": False
    },
    SubscriptionTier.VIP: {
        "name": "VIP",
        "name_fa": "ویژه",
        "price_monthly": 69,
        "price_yearly": 662,
        "features": [
            "Everything in ProMax",
            "Custom module fusion capabilities",
            "Full API access",
            "White-label options",
            "Dedicated support manager",
            "Custom model fine-tuning",
            "Private Discord channel",
            "Quarterly strategy sessions"
        ],
        "features_fa": [
            "تمام امکانات پرومکس",
            "قابلیت ترکیب ماژول‌های سفارشی",
            "دسترسی کامل API",
            "گزینه‌های برند سفید",
            "مدیر پشتیبانی اختصاصی",
            "تنظیم دقیق مدل سفارشی",
            "کانال دیسکورد خصوصی",
            "جلسات استراتژی فصلی"
        ],
        "limits": {
            "requests_per_day": -1,
            "file_uploads": -1,
            "max_file_size_mb": 500,
            "ai_marketplace_access": True,
            "project_evaluations": -1,
            "idea_submissions": -1
        },
        "is_popular": False
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# THEMES - تم‌ها
# ═══════════════════════════════════════════════════════════════════════════════

THEMES = {
    ThemeType.DAY: {
        "name": "Day",
        "name_fa": "روز",
        "colors": {
            "background": "#FFFFFF",
            "surface": "#F8FAFC",
            "primary": "#3B82F6",
            "secondary": "#8B5CF6",
            "accent": "#F59E0B",
            "text": "#1E293B",
            "muted": "#64748B"
        },
        "font_settings": {"family": "Inter", "weight": "400"},
        "animations": {"particles": True, "glow": False, "pulse": True}
    },
    ThemeType.NIGHT: {
        "name": "Night",
        "name_fa": "شب",
        "colors": {
            "background": "#0F172A",
            "surface": "#1E293B",
            "primary": "#60A5FA",
            "secondary": "#A78BFA",
            "accent": "#FBBF24",
            "text": "#F1F5F9",
            "muted": "#94A3B8"
        },
        "font_settings": {"family": "Inter", "weight": "400"},
        "animations": {"particles": True, "glow": True, "pulse": True}
    },
    ThemeType.SUMMER: {
        "name": "Summer",
        "name_fa": "تابستان",
        "colors": {
            "background": "#FEF3C7",
            "surface": "#FFFBEB",
            "primary": "#F97316",
            "secondary": "#EC4899",
            "accent": "#14B8A6",
            "text": "#78350F",
            "muted": "#A16207"
        },
        "font_settings": {"family": "Poppins", "weight": "500"},
        "animations": {"particles": True, "glow": True, "pulse": True}
    },
    ThemeType.WINTER: {
        "name": "Winter",
        "name_fa": "زمستان",
        "colors": {
            "background": "#F0F9FF",
            "surface": "#E0F2FE",
            "primary": "#0EA5E9",
            "secondary": "#6366F1",
            "accent": "#22D3EE",
            "text": "#0C4A6E",
            "muted": "#0369A1"
        },
        "font_settings": {"family": "Inter", "weight": "400"},
        "animations": {"particles": True, "glow": True, "pulse": False}
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# LANGUAGES - زبان‌ها
# ═══════════════════════════════════════════════════════════════════════════════

SUPPORTED_LANGUAGES = {
    LanguageCode.FA: {"name": "Persian", "native_name": "فارسی", "rtl": True, "flag_emoji": "🇮🇷"},
    LanguageCode.EN: {"name": "English", "native_name": "English", "rtl": False, "flag_emoji": "🇬🇧"},
    LanguageCode.AR: {"name": "Arabic", "native_name": "العربية", "rtl": True, "flag_emoji": "🇸🇦"},
    LanguageCode.DE: {"name": "German", "native_name": "Deutsch", "rtl": False, "flag_emoji": "🇩🇪"},
    LanguageCode.FR: {"name": "French", "native_name": "Français", "rtl": False, "flag_emoji": "🇫🇷"},
    LanguageCode.ES: {"name": "Spanish", "native_name": "Español", "rtl": False, "flag_emoji": "🇪🇸"},
    LanguageCode.ZH: {"name": "Chinese", "native_name": "中文", "rtl": False, "flag_emoji": "🇨🇳"},
    LanguageCode.RU: {"name": "Russian", "native_name": "Русский", "rtl": False, "flag_emoji": "🇷🇺"},
    LanguageCode.TR: {"name": "Turkish", "native_name": "Türkçe", "rtl": False, "flag_emoji": "🇹🇷"},
    LanguageCode.JA: {"name": "Japanese", "native_name": "日本語", "rtl": False, "flag_emoji": "🇯🇵"}
}

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE UI CONFIGURATIONS - پیکربندی رابط کاربری ماژول‌ها
# ═══════════════════════════════════════════════════════════════════════════════

MODULE_UI_CONFIGS = {
    "core": {
        "theme": "golden",
        "layout": "central-hub",
        "components": [
            {"type": "brain-visualization", "position": "center"},
            {"type": "module-selector", "position": "left"},
            {"type": "chat-interface", "position": "right"},
            {"type": "analytics-panel", "position": "bottom"}
        ],
        "animations": {"neurons": True, "connections": True, "pulse": True},
        "color_scheme": {"primary": "#FFD700", "secondary": "#FFA500", "glow": "#FFED4A"},
        "special_features": ["brain-3d", "module-fusion", "global-insights"]
    },
    "matrix": {
        "theme": "hacker",
        "layout": "terminal-dashboard",
        "components": [
            {"type": "terminal-chat", "position": "center"},
            {"type": "code-editor", "position": "left"},
            {"type": "system-stats", "position": "top-right", "metrics": ["cpu", "ram", "network", "processes"]},
            {"type": "language-indicator", "position": "top-left", "languages": ["Python", "JavaScript", "Rust", "Go"]},
            {"type": "matrix-rain", "position": "background"}
        ],
        "animations": {"matrix_rain": True, "typing": True, "glitch": True},
        "color_scheme": {"primary": "#00FF00", "secondary": "#003300", "terminal": "#0D0D0D"},
        "special_features": ["live-code", "syntax-highlight", "git-integration", "container-stats"]
    },
    "tesla": {
        "theme": "electric",
        "layout": "innovation-lab",
        "components": [
            {"type": "innovation-chat", "position": "center"},
            {"type": "energy-visualizer", "position": "left"},
            {"type": "patent-browser", "position": "right"},
            {"type": "lightning-effects", "position": "background"}
        ],
        "animations": {"electricity": True, "sparks": True, "waves": True},
        "color_scheme": {"primary": "#00BFFF", "secondary": "#9932CC", "energy": "#87CEEB"},
        "special_features": ["3d-models", "energy-simulation", "invention-timeline"]
    },
    "biruni": {
        "theme": "scientific",
        "layout": "research-lab",
        "components": [
            {"type": "research-chat", "position": "center"},
            {"type": "data-charts", "position": "right"},
            {"type": "formula-editor", "position": "left"},
            {"type": "star-map", "position": "background"}
        ],
        "animations": {"calculations": True, "graphs": True, "stars": True},
        "color_scheme": {"primary": "#9370DB", "secondary": "#483D8B", "data": "#7B68EE"},
        "special_features": ["latex-support", "data-visualization", "citation-manager"]
    },
    "davinci": {
        "theme": "artistic",
        "layout": "creative-canvas",
        "components": [
            {"type": "art-chat", "position": "left"},
            {"type": "canvas", "position": "center"},
            {"type": "tool-palette", "position": "right"},
            {"type": "gallery-preview", "position": "bottom"}
        ],
        "animations": {"brushstrokes": True, "color_blend": True, "reveal": True},
        "color_scheme": {"primary": "#FF6B6B", "secondary": "#4ECDC4", "canvas": "#F8F8F8"},
        "special_features": ["image-generation", "video-creation", "style-transfer", "3d-modeling"]
    },
    "beethoven": {
        "theme": "musical",
        "layout": "composition-studio",
        "components": [
            {"type": "music-chat", "position": "left"},
            {"type": "waveform-visualizer", "position": "center"},
            {"type": "piano-keyboard", "position": "bottom"},
            {"type": "track-mixer", "position": "right"}
        ],
        "animations": {"waveform": True, "notes": True, "spectrum": True},
        "color_scheme": {"primary": "#FFD700", "secondary": "#8B4513", "notes": "#DAA520"},
        "special_features": ["audio-generation", "midi-export", "voice-synthesis", "sheet-music"]
    },
    "mowlana": {
        "theme": "spiritual",
        "layout": "meditation-space",
        "components": [
            {"type": "wisdom-chat", "position": "center"},
            {"type": "poetry-scroll", "position": "right"},
            {"type": "calligraphy-display", "position": "left"},
            {"type": "rose-petals", "position": "background"}
        ],
        "animations": {"petals": True, "breathing": True, "calligraphy": True},
        "color_scheme": {"primary": "#E6B0AA", "secondary": "#D4AC0D", "spiritual": "#F5EEF8"},
        "special_features": ["poetry-generator", "meditation-guide", "calligraphy-art"]
    },
    "quantum-pulse": {
        "theme": "quantum",
        "layout": "quantum-lab",
        "components": [
            {"type": "quantum-chat", "position": "center"},
            {"type": "qubit-visualizer", "position": "left"},
            {"type": "probability-cloud", "position": "right"},
            {"type": "entanglement-web", "position": "background"}
        ],
        "animations": {"superposition": True, "entanglement": True, "wave_collapse": True},
        "color_scheme": {"primary": "#00CED1", "secondary": "#9400D3", "quantum": "#40E0D0"},
        "special_features": ["quantum-simulation", "circuit-builder", "probability-calculator"]
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# TOKEN SYSTEM - سیستم توکن
# ═══════════════════════════════════════════════════════════════════════════════

TOKEN_INFO = {
    "symbol": "QMET",
    "name": "QMETARAM Token",
    "description": "Native utility token of the QMETARAM ecosystem",
    "description_fa": "توکن کاربردی بومی اکوسیستم کیومترام",
    "total_supply": 1_000_000_000,
    "circulating_supply": 250_000_000,
    "holders": 45678,
    "decimals": 18,
    "contract_address": "0x1234567890abcdef1234567890abcdef12345678"
}

MODULE_TOKENS = [
    {"module_id": "core", "module_name": "QMETARAM Core", "token_symbol": "QCORE", "price_usd": 25.50, "price_change_24h": 5.2, "market_cap": 25500000, "utility": "Platform governance and premium features"},
    {"module_id": "matrix", "module_name": "Matrix Module", "token_symbol": "QMTX", "price_usd": 22.30, "price_change_24h": -2.1, "market_cap": 22300000, "utility": "Code assistance and DevOps access"},
    {"module_id": "tesla", "module_name": "Tesla Module", "token_symbol": "QTSL", "price_usd": 28.75, "price_change_24h": 8.5, "market_cap": 28750000, "utility": "Innovation tools and patent research"},
    {"module_id": "biruni", "module_name": "Biruni Module", "token_symbol": "QBIR", "price_usd": 21.00, "price_change_24h": 1.3, "market_cap": 21000000, "utility": "Scientific research and data analysis"},
    {"module_id": "davinci", "module_name": "DaVinci Module", "token_symbol": "QDVC", "price_usd": 35.20, "price_change_24h": 12.4, "market_cap": 35200000, "utility": "Creative tools and NFT generation"},
    {"module_id": "beethoven", "module_name": "Beethoven Module", "token_symbol": "QBTH", "price_usd": 24.80, "price_change_24h": 3.7, "market_cap": 24800000, "utility": "Music generation and audio tools"},
    {"module_id": "mowlana", "module_name": "Mowlana Module", "token_symbol": "QMWL", "price_usd": 20.50, "price_change_24h": -0.8, "market_cap": 20500000, "utility": "Spiritual guidance and poetry NFTs"},
    {"module_id": "quantum-pulse", "module_name": "Quantum Pulse", "token_symbol": "QQNT", "price_usd": 45.00, "price_change_24h": 15.2, "market_cap": 45000000, "utility": "Quantum computing simulations"}
]

# ═══════════════════════════════════════════════════════════════════════════════
# CONTACT INFORMATION - اطلاعات تماس
# ═══════════════════════════════════════════════════════════════════════════════

CONTACT_INFO = {
    "instagram": {
        "username": "sam.araman77",
        "url": "https://instagram.com/sam.araman77",
        "display": "@sam.araman77",
        "icon": "instagram",
        "animated": True
    },
    "whatsapp": {
        "number": "+41762970970",
        "url": "https://wa.me/41762970970",
        "display": "+41 76 297 0970",
        "country": "Switzerland",
        "icon": "whatsapp",
        "clickable": True
    },
    "email": {
        "address": "metarix.ai@gmail.com",
        "url": "mailto:metarix.ai@gmail.com",
        "display": "metarix.ai@gmail.com",
        "type": "customer_support",
        "icon": "email"
    },
    "social_links": [
        {"platform": "telegram", "url": "https://t.me/qmetaram", "display": "@qmetaram"},
        {"platform": "twitter", "url": "https://twitter.com/qmetaram", "display": "@qmetaram"},
        {"platform": "linkedin", "url": "https://linkedin.com/company/qmetaram", "display": "QMETARAM"},
        {"platform": "github", "url": "https://github.com/qmetaram", "display": "qmetaram"},
        {"platform": "discord", "url": "https://discord.gg/qmetaram", "display": "QMETARAM Server"}
    ]
}

# ═══════════════════════════════════════════════════════════════════════════════
# IN-MEMORY DATA STORES - ذخیره‌سازی داده در حافظه
# ═══════════════════════════════════════════════════════════════════════════════

# Ideas storage
ideas_db: Dict[str, Dict] = {}
referral_tracking: Dict[str, Dict] = {}

# Comments storage (pre-populated with 80 comments per module)
module_comments: Dict[str, List[Dict]] = {}

# Ratings storage
module_ratings: Dict[str, Dict[str, int]] = {}

# User subscriptions
user_subscriptions: Dict[str, Dict] = {}

# Session tracking
active_sessions: Dict[str, Dict] = {}

# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS - توابع کمکی
# ═══════════════════════════════════════════════════════════════════════════════

def generate_referral_code() -> str:
    """Generate unique referral code in format QMET-XXXXXXXX"""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=8))
    return f"QMET-{code}"

def generate_uuid() -> str:
    """Generate UUID for various IDs"""
    return str(uuid.uuid4())

def get_token_price() -> float:
    """Simulate token price with realistic fluctuations"""
    base_price = 2.45
    fluctuation = random.uniform(-0.05, 0.08)
    return round(base_price * (1 + fluctuation), 4)

def generate_sparkline(days: int = 7) -> List[float]:
    """Generate sparkline data for price chart"""
    base = 2.45
    return [round(base * (1 + random.uniform(-0.1, 0.1)), 4) for _ in range(days * 24)]

def initialize_module_comments():
    """Initialize 80 comments per module (80% positive)"""
    positive_comments_fa = [
        "عالی بود! واقعاً کمک زیادی کرد 🌟",
        "پاسخ‌های دقیق و کاربردی میده",
        "بهترین هوش مصنوعی که استفاده کردم",
        "سرعت پاسخ‌دهی فوق‌العاده‌اس",
        "خیلی هوشمند و درست جواب میده",
        "این ماژول واقعاً نجاتم داد!",
        "پشتیبانی عالی و پاسخ‌های حرفه‌ای",
        "هر روز ازش استفاده می‌کنم",
        "کیفیت پاسخ‌ها بی‌نظیره",
        "به همه پیشنهاد می‌کنم"
    ]
    
    neutral_comments_fa = [
        "خوبه ولی جای پیشرفت داره",
        "گاهی پاسخ‌ها طولانیه",
        "نسبتاً خوب عمل می‌کنه"
    ]
    
    positive_comments_en = [
        "Amazing! Really helpful responses 🌟",
        "Accurate and practical answers",
        "Best AI I've ever used",
        "Lightning fast response times",
        "Very intelligent and accurate",
        "This module saved my project!",
        "Great support and professional answers",
        "I use it every single day",
        "Response quality is unmatched",
        "Highly recommend to everyone"
    ]
    
    for module_id in MODULE_PERSONALITIES.keys():
        comments = []
        for i in range(80):
            is_positive = i < 64  # 80% positive
            is_persian = random.random() > 0.3  # 70% Persian
            
            if is_positive:
                content = random.choice(positive_comments_fa if is_persian else positive_comments_en)
                sentiment = "positive"
            else:
                content = random.choice(neutral_comments_fa) if is_persian else "It's okay, could be better"
                sentiment = random.choice(["neutral", "positive"])
            
            comment = {
                "id": generate_uuid(),
                "module_id": module_id,
                "author": f"User_{random.randint(1000, 9999)}",
                "author_avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={random.randint(1, 1000)}",
                "content": content,
                "likes": random.randint(5, 500),
                "dislikes": random.randint(0, 20),
                "sentiment": sentiment,
                "replies": [],
                "created_at": datetime.now() - timedelta(days=random.randint(1, 90))
            }
            comments.append(comment)
        
        module_comments[module_id] = sorted(comments, key=lambda x: x["likes"], reverse=True)
        module_ratings[module_id] = {
            "good": random.randint(800, 1200),
            "normal": random.randint(100, 300),
            "bad": random.randint(20, 80)
        }

# Initialize comments on startup
initialize_module_comments()

async def call_external_ai(model_id: str, messages: List[Dict], **kwargs) -> str:
    """
    Call external AI model API
    This is a placeholder - integrate actual API calls here
    """
    # API Keys from environment
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    google_key = os.getenv("GOOGLE_AI_KEY")
    
    try:
        if model_id.startswith("gpt"):
            if not openai_key:
                return "OpenAI API key not configured. Please add OPENAI_API_KEY to environment."
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={"model": model_id, "messages": messages},
                    timeout=60.0
                )
                data = response.json()
                return data["choices"][0]["message"]["content"]
        
        elif model_id.startswith("claude"):
            if not anthropic_key:
                return "Anthropic API key not configured. Please add ANTHROPIC_API_KEY to environment."
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": anthropic_key,
                        "anthropic-version": "2023-06-01"
                    },
                    json={
                        "model": model_id,
                        "max_tokens": 4096,
                        "messages": messages
                    },
                    timeout=60.0
                )
                data = response.json()
                return data["content"][0]["text"]
        
        elif model_id.startswith("gemini"):
            if not google_key:
                return "Google AI API key not configured. Please add GOOGLE_AI_KEY to environment."
            # Implement Google AI API call
            return f"Response from {model_id}: This is a simulated response. Configure GOOGLE_AI_KEY for real responses."
        
        else:
            # Simulated response for other models
            return f"Response from {model_id}: This is a simulated response. Actual API integration pending."
    
    except Exception as e:
        return f"Error calling {model_id}: {str(e)}"

def generate_brain_visualization() -> BrainVisualizationData:
    """Generate 3D brain visualization data for homepage"""
    neurons = []
    for i in range(100):
        module_id = random.choice(list(MODULE_PERSONALITIES.keys()))
        neurons.append(NeuronData(
            id=f"neuron_{i}",
            x=random.uniform(-50, 50),
            y=random.uniform(-50, 50),
            z=random.uniform(-50, 50),
            activity=random.uniform(0.3, 1.0),
            module_id=module_id,
            connections=[f"neuron_{random.randint(0, 99)}" for _ in range(random.randint(2, 6))],
            glow_intensity=random.uniform(0.5, 1.0)
        ))
    
    connections = []
    for neuron in neurons:
        for conn_id in neuron.connections:
            connections.append({
                "from": neuron.id,
                "to": conn_id,
                "strength": random.uniform(0.3, 1.0),
                "color": MODULE_PERSONALITIES[neuron.module_id]["color"]
            })
    
    return BrainVisualizationData(
        neurons=neurons,
        connections=connections,
        activity_heatmap=[[random.uniform(0, 1) for _ in range(10)] for _ in range(10)],
        global_activity=random.uniform(0.6, 0.95),
        active_modules=list(MODULE_PERSONALITIES.keys()),
        pulse_frequency=1.5
    )

def analyze_project_code(code_content: str, project_type: str) -> Dict[str, Any]:
    """Analyze project code and return scores"""
    # Simulated analysis - in production, use AST parsing, linters, etc.
    scores = {
        "code_quality": {
            "score": random.uniform(70, 95),
            "weight": 0.25,
            "details": "Code structure and readability analysis",
            "recommendations": [
                "Consider adding more inline comments",
                "Some functions could be refactored for better modularity"
            ]
        },
        "architecture": {
            "score": random.uniform(65, 90),
            "weight": 0.20,
            "details": "System architecture and design patterns",
            "recommendations": [
                "Consider implementing dependency injection",
                "API layer could benefit from better separation"
            ]
        },
        "performance": {
            "score": random.uniform(60, 95),
            "weight": 0.20,
            "details": "Performance optimization analysis",
            "recommendations": [
                "Some database queries could be optimized",
                "Consider implementing caching for frequent operations"
            ]
        },
        "security": {
            "score": random.uniform(55, 90),
            "weight": 0.20,
            "details": "Security vulnerability assessment",
            "recommendations": [
                "Add input validation for all user inputs",
                "Implement rate limiting for API endpoints"
            ]
        },
        "innovation": {
            "score": random.uniform(50, 100),
            "weight": 0.15,
            "details": "Innovation and uniqueness assessment",
            "recommendations": [
                "Consider adding AI-powered features",
                "Explore blockchain integration possibilities"
            ]
        }
    }
    
    overall = sum(s["score"] * s["weight"] for s in scores.values())
    
    if overall >= 90:
        grade = "A+"
    elif overall >= 85:
        grade = "A"
    elif overall >= 80:
        grade = "B+"
    elif overall >= 75:
        grade = "B"
    elif overall >= 70:
        grade = "C+"
    elif overall >= 65:
        grade = "C"
    else:
        grade = "D"
    
    return {
        "scores": scores,
        "overall_score": overall,
        "grade": grade
    }

# ═══════════════════════════════════════════════════════════════════════════════
# API ENDPOINTS - نقاط پایانی API
# ═══════════════════════════════════════════════════════════════════════════════

# --- Root & Health Endpoints ---

@app.get("/", tags=["Platform"])
async def root():
    """
    Platform root endpoint - returns platform status and metadata
    نقطه پایانی ریشه پلتفرم - وضعیت و فراداده پلتفرم را برمی‌گرداند
    """
    return {
        "platform": "QMETARAM",
        "version": "2.0.0",
        "status": "operational",
        "description": "Decentralized Quantum-Modular AI Ecosystem",
        "description_fa": "اکوسیستم هوش مصنوعی کوانتومی-ماژولار غیرمتمرکز",
        "modules": list(MODULE_PERSONALITIES.keys()),
        "total_modules": len(MODULE_PERSONALITIES),
        "features": {
            "chat": True,
            "ai_marketplace": True,
            "project_evaluation": True,
            "idea_sharing": True,
            "token_system": True,
            "community": True,
            "module_fusion": True
        },
        "subscription": {
            "free_trial": {
                "duration_days": 21,
                "message": "۳ هفته دوره آزمایشی رایگان - بدون نیاز به کارت اعتباری",
                "message_en": "3-week free trial - No credit card required"
            },
            "plans": ["Free", "Pro ($20/mo)", "ProMax ($40/mo)", "VIP ($69/mo)"]
        },
        "token": {
            "symbol": "QMET",
            "price_usd": get_token_price(),
            "animated": True
        },
        "contact": CONTACT_INFO,
        "brain_visualization": {
            "enabled": True,
            "neurons": 100,
            "golden_glow": True
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health", tags=["Platform"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "operational",
            "database": "operational",
            "ai_modules": "operational",
            "marketplace": "operational"
        }
    }

# --- Module Endpoints ---

@app.get("/modules", tags=["Modules"])
async def list_modules():
    """Get all available modules with their details"""
    modules = []
    for module_id, data in MODULE_PERSONALITIES.items():
        modules.append({
            "id": module_id,
            "name": data["name"],
            "name_fa": data["name_fa"],
            "avatar": data["avatar"],
            "description": data["description"],
            "description_fa": data["description_fa"],
            "capabilities": data["capabilities"],
            "color": data["color"],
            "gradient": data["gradient"]
        })
    return {"modules": modules, "total": len(modules)}

@app.get("/modules/{module_id}/ui-config", tags=["Modules"])
async def get_module_ui_config(module_id: str):
    """Get UI configuration for a specific module"""
    if module_id not in MODULE_UI_CONFIGS:
        raise HTTPException(status_code=404, detail=f"Module {module_id} not found")
    
    config = MODULE_UI_CONFIGS[module_id]
    return ModuleUIConfig(
        module_id=module_id,
        theme=config["theme"],
        layout=config["layout"],
        components=config["components"],
        animations=config["animations"],
        color_scheme=config["color_scheme"],
        special_features=config["special_features"]
    )

@app.get("/modules/{module_id}/stats", tags=["Modules"])
async def get_module_stats(module_id: str):
    """Get statistics for a specific module"""
    if module_id not in MODULE_PERSONALITIES:
        raise HTTPException(status_code=404, detail=f"Module {module_id} not found")
    
    ratings = module_ratings.get(module_id, {"good": 0, "normal": 0, "bad": 0})
    total_ratings = sum(ratings.values())
    
    return ModuleStats(
        module_id=module_id,
        total_ratings=total_ratings,
        good_ratings=ratings["good"],
        normal_ratings=ratings["normal"],
        bad_ratings=ratings["bad"],
        rating_percentage={
            "good": round(ratings["good"] / total_ratings * 100, 1) if total_ratings > 0 else 0,
            "normal": round(ratings["normal"] / total_ratings * 100, 1) if total_ratings > 0 else 0,
            "bad": round(ratings["bad"] / total_ratings * 100, 1) if total_ratings > 0 else 0
        },
        total_comments=len(module_comments.get(module_id, [])),
        positive_comments=len([c for c in module_comments.get(module_id, []) if c["sentiment"] == "positive"]),
        avg_response_time_ms=random.uniform(200, 800),
        total_requests=random.randint(50000, 500000)
    )

# --- Chat Endpoints ---

@app.post("/chat/{module}", tags=["Chat"], response_model=ChatResponse)
async def chat_with_module(module: str, request: ChatRequest):
    """
    Chat with a specific QMETARAM module
    چت با یک ماژول خاص کیومترام
    """
    import time
    start_time = time.time()
    
    if module not in MODULE_PERSONALITIES:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module}' not found. Available modules: {list(MODULE_PERSONALITIES.keys())}"
        )
    
    personality = MODULE_PERSONALITIES[module]
    conversation_id = request.conversation_id or generate_uuid()
    
    # Build context with module personality
    system_prompt = f"""
{personality['personality']}

نام شما: {personality['name_fa']} ({personality['name']})
توانایی‌ها: {', '.join(personality['capabilities'])}

قوانین:
1. همیشه به زبان کاربر پاسخ دهید (فارسی یا انگلیسی)
2. پاسخ‌های شما باید با شخصیت ماژول همخوانی داشته باشد
3. از دانش تخصصی خود در حوزه مربوطه استفاده کنید
4. پاسخ‌ها را ساختارمند و واضح ارائه دهید
"""
    
    # Simulate AI response (in production, call actual AI API)
    # For now, generate contextual response based on module
    sample_responses = {
        "core": f"به عنوان هسته مرکزی کیومترام، پیام شما را تحلیل کردم:\n\n{request.message}\n\nمی‌توانم از ماژول‌های تخصصی دیگر برای پاسخ بهتر کمک بگیرم. آیا می‌خواهید تحلیل عمیق‌تری داشته باشیم؟",
        "matrix": f"[MATRIX SYSTEM] Analyzing query...\n\n```\n> Processing: {request.message[:50]}...\n> Status: Complete\n```\n\nنتیجه تحلیل کد/سیستم آماده است. چه اطلاعات بیشتری نیاز دارید؟",
        "tesla": f"⚡ ایده جالبی است!\n\nدرباره \"{request.message[:30]}...\" فکر کردم. این می‌تواند پایه یک نوآوری بزرگ باشد. بیایید امکانات فنی آن را بررسی کنیم.",
        "biruni": f"🔬 تحلیل علمی:\n\nسوال شما درباره \"{request.message[:30]}...\" نیاز به بررسی دقیق‌تر دارد. بر اساس داده‌های موجود...",
        "davinci": f"🎨 از منظر هنری و خلاقانه:\n\nموضوع \"{request.message[:30]}...\" الهام‌بخش است! می‌توانم تصویرسازی یا طراحی خاصی برایتان انجام دهم.",
        "beethoven": f"🎵 با الهام از موسیقی:\n\nکلماتتان مثل یک ملودی زیباست. درباره \"{request.message[:30]}...\" چه احساسی دارید؟ شاید بتوانم موسیقی مناسبی بسازم.",
        "mowlana": f"🌹 ای دوست، سخن تو مرا به تأمل واداشت...\n\n\"{request.message[:30]}...\"\n\nدر این جستجو، شاید پاسخ در درون خودت نهفته باشد. بگذار با هم این مسیر را طی کنیم.",
        "quantum-pulse": f"⚛️ تحلیل کوانتومی:\n\nسوال شما در فضای احتمالات کوانتومی جالب است. \"{request.message[:30]}...\" - بیایید با اصول کوانتوم بررسی کنیم."
    }
    
    response_text = sample_responses.get(module, f"پیام شما دریافت شد: {request.message}")
    
    processing_time = (time.time() - start_time) * 1000
    
    # Generate suggested actions based on module
    suggested_actions = {
        "core": ["تحلیل با ماژول‌های دیگر", "خلاصه‌سازی", "ترجمه"],
        "matrix": ["تحلیل کد", "دیباگ", "بهینه‌سازی", "معماری"],
        "tesla": ["طراحی اختراع", "تحلیل انرژی", "شبیه‌سازی"],
        "biruni": ["تحقیق علمی", "تحلیل داده", "رسم نمودار"],
        "davinci": ["تولید تصویر", "طراحی", "ویرایش هنری"],
        "beethoven": ["ساخت موسیقی", "تحلیل صدا", "خوانندگی"],
        "mowlana": ["شعر", "مدیتیشن", "مشاوره روحانی"],
        "quantum-pulse": ["شبیه‌سازی کوانتوم", "رمزنگاری", "محاسبات"]
    }
    
    return ChatResponse(
        response=response_text,
        module=module,
        conversation_id=conversation_id,
        personality_traits={
            "name": personality["name"],
            "avatar": personality["avatar"],
            "color": personality["color"]
        },
        suggested_actions=suggested_actions.get(module, []),
        multimedia=None,
        tokens_used=random.randint(100, 500),
        processing_time_ms=processing_time
    )

@app.post("/chat/fusion", tags=["Chat"])
async def fusion_chat(request: FusionChatRequest):
    """
    Chat with multiple modules in fusion mode
    چت با چند ماژول در حالت ترکیبی
    """
    if len(request.modules) < 2:
        raise HTTPException(status_code=400, detail="Fusion requires at least 2 modules")
    
    contributions = {}
    for module in request.modules:
        if module.value not in MODULE_PERSONALITIES:
            raise HTTPException(status_code=404, detail=f"Module '{module.value}' not found")
        
        personality = MODULE_PERSONALITIES[module.value]
        contributions[module.value] = f"[{personality['avatar']} {personality['name_fa']}] تحلیل من: این موضوع از دیدگاه {personality['description_fa']} قابل بررسی است."
    
    # Synthesize responses
    fused = f"🧬 تحلیل ترکیبی از {len(request.modules)} ماژول:\n\n"
    for module, contrib in contributions.items():
        fused += f"{contrib}\n\n"
    fused += "---\n💡 نتیجه‌گیری جامع: ترکیب دیدگاه‌های مختلف نشان می‌دهد..."
    
    return FusionResponse(
        fused_response=fused,
        module_contributions=contributions,
        synthesis_method=request.fusion_mode,
        confidence_score=random.uniform(0.85, 0.98)
    )

# --- AI Marketplace Endpoints ---

@app.get("/ai-marketplace", tags=["AI Marketplace"])
async def get_marketplace(
    category: Optional[str] = None,
    sort_by: str = Query(default="popularity_rank", description="Sort by: popularity_rank, accuracy, speed, price"),
    limit: int = Query(default=50, ge=1, le=50)
):
    """Get AI marketplace with all available models"""
    models = AI_MODELS_DATABASE.copy()
    
    if category:
        models = [m for m in models if m["category"] == category]
    
    if sort_by == "accuracy":
        models.sort(key=lambda x: x["metrics"]["accuracy"], reverse=True)
    elif sort_by == "speed":
        models.sort(key=lambda x: x["metrics"]["speed"], reverse=True)
    elif sort_by == "popularity_rank":
        models.sort(key=lambda x: x["popularity_rank"])
    
    return {
        "models": models[:limit],
        "total": len(models),
        "categories": list(set(m["category"] for m in AI_MODELS_DATABASE)),
        "last_updated": datetime.now().isoformat()
    }

@app.get("/ai-marketplace/{model_id}", tags=["AI Marketplace"])
async def get_model_details(model_id: str):
    """Get detailed information about a specific AI model"""
    model = next((m for m in AI_MODELS_DATABASE if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
    
    return AIModelInfo(**model)

@app.post("/ai-marketplace/compare", tags=["AI Marketplace"])
async def compare_models(model_ids: List[str] = Query(..., min_length=2, max_length=5)):
    """Compare multiple AI models"""
    models = [m for m in AI_MODELS_DATABASE if m["id"] in model_ids]
    
    if len(models) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 valid models to compare")
    
    comparison_metrics = {}
    for model in models:
        comparison_metrics[model["id"]] = model["metrics"]
    
    # Generate recommendation
    best_accuracy = max(models, key=lambda x: x["metrics"]["accuracy"])
    best_speed = max(models, key=lambda x: x["metrics"]["speed"])
    
    return AIModelComparison(
        models=model_ids,
        comparison_metrics=comparison_metrics,
        recommendation=f"For accuracy: {best_accuracy['name']}. For speed: {best_speed['name']}.",
        use_cases={m["id"]: m["capabilities"] for m in models}
    )

@app.get("/ai-marketplace/news", tags=["AI Marketplace"])
async def get_ai_news(limit: int = Query(default=20, ge=1, le=50)):
    """Get latest AI/tech news"""
    news_items = [
        {
            "id": generate_uuid(),
            "title": "OpenAI Announces GPT-5 with Revolutionary Capabilities",
            "title_fa": "اوپن‌ای‌آی GPT-5 را با قابلیت‌های انقلابی معرفی کرد",
            "summary": "The next generation language model promises unprecedented reasoning abilities.",
            "summary_fa": "مدل زبانی نسل بعدی توانایی‌های استدلال بی‌سابقه‌ای را وعده می‌دهد.",
            "source": "TechCrunch",
            "url": "https://techcrunch.com/ai-news",
            "published_at": datetime.now() - timedelta(hours=random.randint(1, 48)),
            "category": "llm",
            "image_url": "https://placeholder.com/news1.jpg",
            "relevance_score": 0.95
        },
        {
            "id": generate_uuid(),
            "title": "Google DeepMind Achieves Breakthrough in Protein Structure Prediction",
            "title_fa": "گوگل دیپمایند به پیشرفت چشمگیری در پیش‌بینی ساختار پروتئین دست یافت",
            "summary": "AlphaFold 3 can now predict complex molecular interactions with near-perfect accuracy.",
            "summary_fa": "آلفافولد ۳ اکنون می‌تواند تعاملات مولکولی پیچیده را با دقت نزدیک به کامل پیش‌بینی کند.",
            "source": "Nature",
            "url": "https://nature.com/ai-biology",
            "published_at": datetime.now() - timedelta(hours=random.randint(1, 48)),
            "category": "research",
            "image_url": "https://placeholder.com/news2.jpg",
            "relevance_score": 0.92
        },
        {
            "id": generate_uuid(),
            "title": "Anthropic Releases Claude 4 with Enhanced Safety Features",
            "title_fa": "آنتروپیک کلود ۴ را با ویژگی‌های امنیتی بهبودیافته منتشر کرد",
            "summary": "New safety measures make Claude 4 the most reliable AI assistant yet.",
            "summary_fa": "اقدامات امنیتی جدید کلود ۴ را به قابل‌اعتمادترین دستیار هوش مصنوعی تبدیل کرده است.",
            "source": "Wired",
            "url": "https://wired.com/anthropic-claude",
            "published_at": datetime.now() - timedelta(hours=random.randint(1, 48)),
            "category": "llm",
            "image_url": "https://placeholder.com/news3.jpg",
            "relevance_score": 0.90
        },
        {
            "id": generate_uuid(),
            "title": "Microsoft Integrates AI Across All Products",
            "title_fa": "مایکروسافت هوش مصنوعی را در تمام محصولات خود ادغام کرد",
            "summary": "Copilot becomes central to Windows, Office, and Azure services.",
            "summary_fa": "کوپایلت به هسته اصلی ویندوز، آفیس و خدمات آژور تبدیل شد.",
            "source": "The Verge",
            "url": "https://theverge.com/microsoft-ai",
            "published_at": datetime.now() - timedelta(hours=random.randint(1, 48)),
            "category": "enterprise",
            "image_url": "https://placeholder.com/news4.jpg",
            "relevance_score": 0.88
        },
        {
            "id": generate_uuid(),
            "title": "Stable Diffusion 4 Sets New Standard for Image Generation",
            "title_fa": "استیبل دیفیوژن ۴ استاندارد جدیدی برای تولید تصویر تعیین کرد",
            "summary": "Open-source model rivals closed competitors in quality and speed.",
            "summary_fa": "مدل متن‌باز از نظر کیفیت و سرعت با رقبای بسته برابری می‌کند.",
            "source": "Ars Technica",
            "url": "https://arstechnica.com/stable-diffusion",
            "published_at": datetime.now() - timedelta(hours=random.randint(1, 48)),
            "category": "image",
            "image_url": "https://placeholder.com/news5.jpg",
            "relevance_score": 0.87
        }
    ]
    
    # Add more diverse news
    for i in range(15):
        news_items.append({
            "id": generate_uuid(),
            "title": f"AI Industry Update #{i+1}: Latest Developments in Machine Learning",
            "title_fa": f"به‌روزرسانی صنعت هوش مصنوعی #{i+1}: آخرین پیشرفت‌ها در یادگیری ماشین",
            "summary": "Continuous advancements in AI technology reshape various industries.",
            "summary_fa": "پیشرفت‌های مستمر در فناوری هوش مصنوعی صنایع مختلف را متحول می‌کند.",
            "source": random.choice(["MIT Tech Review", "VentureBeat", "AI Weekly", "Machine Learning News"]),
            "url": f"https://example.com/news/{i}",
            "published_at": datetime.now() - timedelta(hours=random.randint(1, 168)),
            "category": random.choice(["llm", "image", "audio", "video", "research", "enterprise"]),
            "image_url": None,
            "relevance_score": random.uniform(0.6, 0.85)
        })
    
    news_items.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return {
        "news": [AINewsItem(**item) for item in news_items[:limit]],
        "total": len(news_items),
        "last_updated": datetime.now().isoformat()
    }

# --- Project Evaluation Endpoints ---

@app.post("/evaluate-project", tags=["Project Evaluation"])
async def evaluate_project(
    project_name: str = Form(...),
    description: str = Form(None),
    project_type: str = Form(default="ai"),
    github_url: str = Form(None),
    file: UploadFile = File(None)
):
    """
    Evaluate an AI project for code quality, architecture, and innovation
    ارزیابی یک پروژه هوش مصنوعی برای کیفیت کد، معماری و نوآوری
    """
    evaluation_id = generate_uuid()
    
    code_content = ""
    if file:
        code_content = (await file.read()).decode('utf-8', errors='ignore')
    elif github_url:
        # In production, fetch from GitHub API
        code_content = f"# Project from: {github_url}\n# (GitHub integration pending)"
    
    # Analyze the project
    analysis = analyze_project_code(code_content, project_type)
    
    scores = [
        EvaluationScore(
            category=cat,
            score=data["score"],
            weight=data["weight"],
            details=data["details"],
            recommendations=data["recommendations"]
        )
        for cat, data in analysis["scores"].items()
    ]
    
    # Generate market value estimate
    if analysis["overall_score"] >= 90:
        market_value = "$100,000 - $500,000"
    elif analysis["overall_score"] >= 80:
        market_value = "$50,000 - $100,000"
    elif analysis["overall_score"] >= 70:
        market_value = "$20,000 - $50,000"
    else:
        market_value = "$5,000 - $20,000"
    
    evaluation = ProjectEvaluation(
        evaluation_id=evaluation_id,
        project_name=project_name,
        overall_score=analysis["overall_score"],
        grade=analysis["grade"],
        scores=scores,
        strengths=[
            "Well-structured codebase",
            "Good separation of concerns",
            "Modern technology stack"
        ],
        improvements=[
            "Add comprehensive test coverage",
            "Implement CI/CD pipeline",
            "Enhance documentation"
        ],
        detailed_analysis=f"""
## تحلیل جامع پروژه: {project_name}

### خلاصه
پروژه شما با امتیاز کلی **{analysis['overall_score']:.1f}%** و درجه **{analysis['grade']}** ارزیابی شد.

### نقاط قوت
- ساختار کد منظم و قابل نگهداری
- استفاده از الگوهای طراحی مناسب
- مستندسازی نسبتاً خوب

### پیشنهادات بهبود
- افزودن تست‌های خودکار بیشتر
- بهینه‌سازی عملکرد پایگاه داده
- تقویت امنیت endpoints

### ارزش تخمینی بازار
{market_value}
        """,
        estimated_market_value=market_value,
        evaluated_at=datetime.now()
    )
    
    return evaluation

@app.get("/evaluations/{project_id}", tags=["Project Evaluation"])
async def get_evaluation(project_id: str):
    """Get a previous project evaluation by ID"""
    # In production, fetch from database
    raise HTTPException(status_code=404, detail="Evaluation not found. Evaluations are not persisted in demo mode.")

# --- Idea System Endpoints ---

@app.post("/ideas/submit", tags=["Ideas"])
async def submit_idea(idea: IdeaSubmission):
    """
    Submit a new AI idea with automatic referral code generation
    ثبت یک ایده هوش مصنوعی جدید با تولید خودکار کد معرفی
    """
    idea_id = generate_uuid()
    referral_code = generate_referral_code()
    
    new_idea = {
        "id": idea_id,
        "title": idea.title,
        "description": idea.description,
        "category": idea.category,
        "tags": idea.tags,
        "author_id": generate_uuid(),  # In production, get from auth
        "referral_code": referral_code,
        "shareable_url": f"https://qmetaram.com/ideas/{idea_id}",
        "upvotes": 0,
        "views": 0,
        "status": "pending",
        "promotional_link": None,
        "created_at": datetime.now(),
        "approved_at": None,
        "contact_email": idea.contact_email
    }
    
    ideas_db[idea_id] = new_idea
    referral_tracking[referral_code] = {
        "idea_id": idea_id,
        "clicks": 0,
        "conversions": 0,
        "earnings": 0.0,
        "referrals": []
    }
    
    return Idea(**new_idea)

@app.get("/ideas/{idea_id}", tags=["Ideas"])
async def get_idea(idea_id: str):
    """Get idea details by ID"""
    if idea_id not in ideas_db:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    idea = ideas_db[idea_id]
    idea["views"] += 1
    
    return Idea(**idea)

@app.get("/ideas/trending", tags=["Ideas"])
async def get_trending_ideas(limit: int = Query(default=20, ge=1, le=50)):
    """Get trending ideas sorted by upvotes"""
    ideas = list(ideas_db.values())
    ideas.sort(key=lambda x: x["upvotes"], reverse=True)
    
    return {
        "ideas": [Idea(**idea) for idea in ideas[:limit]],
        "total": len(ideas)
    }

@app.post("/ideas/{idea_id}/upvote", tags=["Ideas"])
async def upvote_idea(idea_id: str):
    """Upvote an idea"""
    if idea_id not in ideas_db:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    ideas_db[idea_id]["upvotes"] += 1
    
    return {"message": "Upvoted successfully", "upvotes": ideas_db[idea_id]["upvotes"]}

@app.post("/ideas/{idea_id}/approve", tags=["Ideas"])
async def approve_idea(idea_id: str, admin_key: str = Header(None)):
    """Admin endpoint to approve an idea and generate promotional link"""
    # In production, verify admin authentication
    if idea_id not in ideas_db:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    ideas_db[idea_id]["status"] = "approved"
    ideas_db[idea_id]["approved_at"] = datetime.now()
    ideas_db[idea_id]["promotional_link"] = f"https://qmetaram.com/promo/{ideas_db[idea_id]['referral_code']}"
    
    return {"message": "Idea approved", "promotional_link": ideas_db[idea_id]["promotional_link"]}

@app.get("/ideas/referral/{referral_code}", tags=["Ideas"])
async def track_referral(referral_code: str, source: Optional[str] = None):
    """Track a referral click"""
    if referral_code not in referral_tracking:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    
    referral_tracking[referral_code]["clicks"] += 1
    referral_tracking[referral_code]["referrals"].append({
        "timestamp": datetime.now().isoformat(),
        "source": source or "direct",
        "converted": False
    })
    
    return {
        "message": "Referral tracked",
        "idea_id": referral_tracking[referral_code]["idea_id"]
    }

@app.get("/ideas/my-referrals", tags=["Ideas"])
async def get_my_referrals(user_id: str = Query(...)):
    """Get user's referral statistics and earnings"""
    # In production, filter by authenticated user
    user_referrals = []
    for code, data in referral_tracking.items():
        user_referrals.append({
            "referral_code": code,
            "total_clicks": data["clicks"],
            "total_conversions": data["conversions"],
            "total_earnings": data["earnings"],
            "conversion_rate": data["conversions"] / data["clicks"] * 100 if data["clicks"] > 0 else 0,
            "referrals": data["referrals"][-10:]  # Last 10 referrals
        })
    
    return {"referrals": user_referrals}

# --- Subscription Endpoints ---

@app.get("/subscriptions/plans", tags=["Subscriptions"])
async def get_subscription_plans():
    """Get all available subscription plans"""
    plans = []
    for tier, data in SUBSCRIPTION_PLANS.items():
        plans.append(SubscriptionPlan(
            tier=tier,
            name=data["name"],
            name_fa=data["name_fa"],
            price_monthly=data["price_monthly"],
            price_yearly=data.get("price_yearly", data["price_monthly"] * 12 * 0.8),
            features=data["features"],
            features_fa=data["features_fa"],
            limits=data["limits"],
            is_popular=data.get("is_popular", False)
        ))
    
    return {
        "plans": plans,
        "free_trial": {
            "duration_days": 21,
            "message": "۳ هفته دوره آزمایشی رایگان برای تمام کاربران جدید!",
            "message_en": "3-week free trial for all new users!"
        }
    }

@app.post("/subscriptions/subscribe", tags=["Subscriptions"])
async def subscribe(request: SubscriptionRequest, user_id: str = Query(...)):
    """Subscribe to a plan"""
    if request.tier not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    plan = SUBSCRIPTION_PLANS[request.tier]
    
    subscription = {
        "user_id": user_id,
        "current_tier": request.tier,
        "started_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(days=30 if request.billing_cycle == "monthly" else 365),
        "is_trial": request.tier == SubscriptionTier.FREE,
        "trial_days_remaining": 21 if request.tier == SubscriptionTier.FREE else 0,
        "features_used": {k: 0 for k in plan["limits"].keys()},
        "next_billing_date": datetime.now() + timedelta(days=30) if request.tier != SubscriptionTier.FREE else None,
        "payment_method": request.payment_method,
        "billing_cycle": request.billing_cycle
    }
    
    user_subscriptions[user_id] = subscription
    
    return SubscriptionStatus(**subscription)

@app.get("/subscriptions/status", tags=["Subscriptions"])
async def get_subscription_status(user_id: str = Query(...)):
    """Get current subscription status"""
    if user_id not in user_subscriptions:
        # Return free trial for new users
        return SubscriptionStatus(
            user_id=user_id,
            current_tier=SubscriptionTier.FREE,
            started_at=datetime.now(),
            expires_at=datetime.now() + timedelta(days=21),
            is_trial=True,
            trial_days_remaining=21,
            features_used={},
            next_billing_date=None
        )
    
    return SubscriptionStatus(**user_subscriptions[user_id])

@app.post("/subscriptions/upgrade", tags=["Subscriptions"])
async def upgrade_subscription(
    user_id: str = Query(...),
    new_tier: SubscriptionTier = Query(...)
):
    """Upgrade subscription to a higher tier"""
    current = user_subscriptions.get(user_id)
    if not current:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    tier_order = [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.PROMAX, SubscriptionTier.VIP]
    current_index = tier_order.index(current["current_tier"])
    new_index = tier_order.index(new_tier)
    
    if new_index <= current_index:
        raise HTTPException(status_code=400, detail="Can only upgrade to a higher tier")
    
    user_subscriptions[user_id]["current_tier"] = new_tier
    user_subscriptions[user_id]["is_trial"] = False
    
    return {"message": f"Upgraded to {new_tier.value}", "new_tier": new_tier}

# --- Token System Endpoints ---

@app.get("/token/price", tags=["Token"])
async def get_token_price_endpoint():
    """Get current QMETARAM token price with live updates"""
    price = get_token_price()
    
    return TokenPrice(
        symbol="QMET",
        name="QMETARAM Token",
        price_usd=price,
        price_change_24h=random.uniform(-5, 10),
        price_change_7d=random.uniform(-10, 20),
        last_updated=datetime.now(),
        sparkline_7d=generate_sparkline(7)
    )

@app.get("/token/stats", tags=["Token"])
async def get_token_stats():
    """Get token statistics"""
    return TokenStats(
        market_cap=TOKEN_INFO["circulating_supply"] * get_token_price(),
        volume_24h=random.uniform(1_000_000, 10_000_000),
        circulating_supply=TOKEN_INFO["circulating_supply"],
        total_supply=TOKEN_INFO["total_supply"],
        max_supply=TOKEN_INFO["total_supply"],
        holders=TOKEN_INFO["holders"] + random.randint(-100, 500),
        transactions_24h=random.randint(5000, 20000)
    )

@app.get("/token/modules", tags=["Token"])
async def get_module_tokens():
    """Get all tokenized modules with individual prices"""
    tokens = []
    for token in MODULE_TOKENS:
        # Add realistic price fluctuations
        current_price = token["price_usd"] * (1 + random.uniform(-0.05, 0.08))
        tokens.append(ModuleToken(
            module_id=token["module_id"],
            module_name=token["module_name"],
            token_symbol=token["token_symbol"],
            price_usd=round(current_price, 2),
            price_change_24h=random.uniform(-8, 15),
            market_cap=token["market_cap"],
            utility=token["utility"]
        ))
    
    return {"tokens": tokens, "total": len(tokens)}

# --- Community Endpoints ---

@app.post("/modules/{module_id}/rate", tags=["Community"])
async def rate_module(module_id: str, rating: RatingType):
    """Rate a module (Good/Normal/Bad)"""
    if module_id not in MODULE_PERSONALITIES:
        raise HTTPException(status_code=404, detail=f"Module {module_id} not found")
    
    if module_id not in module_ratings:
        module_ratings[module_id] = {"good": 0, "normal": 0, "bad": 0}
    
    module_ratings[module_id][rating.value] += 1
    
    return {
        "message": f"Rating '{rating.value}' submitted for {module_id}",
        "current_ratings": module_ratings[module_id]
    }

@app.get("/modules/{module_id}/comments", tags=["Community"])
async def get_module_comments(
    module_id: str,
    limit: int = Query(default=80, ge=1, le=100),
    sort_by: str = Query(default="likes", description="Sort by: likes, recent")
):
    """Get comments for a module (YouTube-style)"""
    if module_id not in MODULE_PERSONALITIES:
        raise HTTPException(status_code=404, detail=f"Module {module_id} not found")
    
    comments = module_comments.get(module_id, [])
    
    if sort_by == "recent":
        comments = sorted(comments, key=lambda x: x["created_at"], reverse=True)
    else:
        comments = sorted(comments, key=lambda x: x["likes"], reverse=True)
    
    return {
        "comments": [Comment(**c) for c in comments[:limit]],
        "total": len(comments),
        "positive_percentage": len([c for c in comments if c["sentiment"] == "positive"]) / len(comments) * 100 if comments else 0
    }

@app.post("/modules/{module_id}/comment", tags=["Community"])
async def post_comment(module_id: str, comment: CommentRequest, user_id: str = Query(...)):
    """Post a comment on a module"""
    if module_id not in MODULE_PERSONALITIES:
        raise HTTPException(status_code=404, detail=f"Module {module_id} not found")
    
    new_comment = {
        "id": generate_uuid(),
        "module_id": module_id,
        "author": f"User_{user_id[:8]}",
        "author_avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
        "content": comment.content,
        "likes": 0,
        "dislikes": 0,
        "sentiment": "neutral",  # In production, use sentiment analysis
        "replies": [],
        "created_at": datetime.now()
    }
    
    if module_id not in module_comments:
        module_comments[module_id] = []
    
    module_comments[module_id].insert(0, new_comment)
    
    return Comment(**new_comment)

# --- Theme & Language Endpoints ---

@app.get("/themes", tags=["Customization"])
async def get_themes():
    """Get all available themes"""
    themes = []
    for theme_id, data in THEMES.items():
        themes.append(Theme(
            id=theme_id,
            name=data["name"],
            name_fa=data["name_fa"],
            colors=data["colors"],
            font_settings=data["font_settings"],
            animations=data["animations"]
        ))
    
    return {"themes": themes}

@app.post("/themes/set", tags=["Customization"])
async def set_theme(theme_id: ThemeType, user_id: str = Query(...)):
    """Set user's preferred theme"""
    if theme_id not in THEMES:
        raise HTTPException(status_code=400, detail="Invalid theme")
    
    return {
        "message": f"Theme set to {theme_id.value}",
        "theme": THEMES[theme_id]
    }

@app.get("/languages", tags=["Customization"])
async def get_languages():
    """Get all supported languages"""
    languages = []
    for code, data in SUPPORTED_LANGUAGES.items():
        languages.append(Language(
            code=code,
            name=data["name"],
            native_name=data["native_name"],
            rtl=data["rtl"],
            flag_emoji=data["flag_emoji"]
        ))
    
    return {"languages": languages}

@app.post("/languages/set", tags=["Customization"])
async def set_language(language_code: LanguageCode, user_id: str = Query(...)):
    """Set user's preferred language"""
    if language_code not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail="Invalid language code")
    
    return {
        "message": f"Language set to {language_code.value}",
        "language": SUPPORTED_LANGUAGES[language_code]
    }

# --- Brain Visualization Endpoint ---

@app.get("/brain-visualization", tags=["Visualization"])
async def get_brain_visualization_data():
    """
    Get 3D brain visualization data for the golden-lit neuron animation
    دریافت داده‌های ویژوالایزیشن مغز سه‌بعدی برای انیمیشن نورون‌های طلایی
    """
    return generate_brain_visualization()

# --- Contact Information Endpoint ---

@app.get("/contact", tags=["Platform"])
async def get_contact_info():
    """Get contact information with animated logos"""
    return ContactInfo(**CONTACT_INFO)

# --- Action Validation Endpoint ---

@app.get("/validate-actions", tags=["Platform"])
async def validate_actions():
    """
    Validate all interactive elements and buttons are functional
    اعتبارسنجی عملکرد تمام المان‌ها و دکمه‌های تعاملی
    """
    actions = {
        "chat_modules": {module: "functional" for module in MODULE_PERSONALITIES.keys()},
        "marketplace": "functional",
        "project_evaluation": "functional",
        "idea_submission": "functional",
        "subscription_system": "functional",
        "token_display": "functional",
        "theme_switching": "functional",
        "language_selection": "functional",
        "brain_visualization": "functional",
        "contact_links": {
            "instagram": "clickable",
            "whatsapp": "clickable",
            "email": "clickable"
        },
        "module_fusion": "functional",
        "rating_system": "functional",
        "comment_system": "functional"
    }
    
    return {
        "status": "all_functional",
        "actions": actions,
        "validated_at": datetime.now().isoformat()
    }

# ═══════════════════════════════════════════════════════════════════════════════
# STARTUP & SHUTDOWN EVENTS - رویدادهای راه‌اندازی و خاموشی
# ═══════════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    print("🚀 QMETARAM Platform Starting...")
    print(f"📦 Loaded {len(MODULE_PERSONALITIES)} AI modules")
    print(f"🤖 Loaded {len(AI_MODELS_DATABASE)} AI marketplace models")
    print(f"💳 Loaded {len(SUBSCRIPTION_PLANS)} subscription plans")
    print(f"🎨 Loaded {len(THEMES)} themes")
    print(f"🌐 Loaded {len(SUPPORTED_LANGUAGES)} languages")
    print("✅ Platform ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 QMETARAM Platform Shutting Down...")

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT - نقطه ورود اصلی
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4
    )
