"import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    await db.users.delete_many({})
    await db.notices.delete_many({})
    await db.events.delete_many({})
    await db.clubs.delete_many({})
    
    users = [
        {
            \"id\": \"user-1\",
            \"email\": \"student1@demo.edu\",
            \"password\": pwd_context.hash(\"password123\"),
            \"name\": \"Alice Johnson\",
            \"role\": \"student\",
            \"college_id\": \"DC2024001\",
            \"created_at\": \"2024-01-15T10:00:00Z\"
        },
        {
            \"id\": \"user-2\",
            \"email\": \"student2@demo.edu\",
            \"password\": pwd_context.hash(\"password123\"),
            \"name\": \"Bob Smith\",
            \"role\": \"student\",
            \"college_id\": \"DC2024002\",
            \"created_at\": \"2024-01-16T10:00:00Z\"
        },
        {
            \"id\": \"club-1\",
            \"email\": \"club1@demo.edu\",
            \"password\": pwd_context.hash(\"password123\"),
            \"name\": \"Tech Club\",
            \"role\": \"club\",
            \"created_at\": \"2024-01-10T10:00:00Z\"
        },
        {
            \"id\": \"club-2\",
            \"email\": \"club2@demo.edu\",
            \"password\": pwd_context.hash(\"password123\"),
            \"name\": \"Arts Society\",
            \"role\": \"club\",
            \"created_at\": \"2024-01-11T10:00:00Z\"
        },
        {
            \"id\": \"admin-1\",
            \"email\": \"admin@demo.edu\",
            \"password\": pwd_context.hash(\"password123\"),
            \"name\": \"Dr. Sarah Williams\",
            \"role\": \"admin\",
            \"created_at\": \"2024-01-01T10:00:00Z\"
        }
    ]
    
    notices = [
        {
            \"id\": \"notice-1\",
            \"title\": \"Mid-Semester Exams Schedule Released\",
            \"content\": \"The mid-semester examination schedule has been published. Check the academic portal for your exam dates and timings.\",
            \"author_id\": \"admin-1\",
            \"author_name\": \"Dr. Sarah Williams\",
            \"date\": \"2025-01-10T09:00:00Z\",
            \"status\": \"approved\",
            \"type\": \"academic\",
            \"is_urgent\": True
        },
        {
            \"id\": \"notice-2\",
            \"title\": \"Library Hours Extended\",
            \"content\": \"The college library will remain open until 10 PM starting next week to support exam preparation.\",
            \"author_id\": \"admin-1\",
            \"author_name\": \"Dr. Sarah Williams\",
            \"date\": \"2025-01-08T14:00:00Z\",
            \"status\": \"approved\",
            \"type\": \"general\",
            \"is_urgent\": False
        },
        {
            \"id\": \"notice-3\",
            \"title\": \"Career Fair 2025 Registration Open\",
            \"content\": \"Register now for the annual Career Fair featuring top companies. Limited spots available!\",
            \"author_id\": \"club-1\",
            \"author_name\": \"Tech Club\",
            \"date\": \"2025-01-05T11:00:00Z\",
            \"status\": \"approved\",
            \"type\": \"event\",
            \"is_urgent\": False
        }
    ]
    
    events = [
        {
            \"id\": \"event-1\",
            \"title\": \"Hackathon 2025\",
            \"description\": \"24-hour coding challenge with amazing prizes and mentorship from industry experts.\",
            \"date\": \"2025-02-15\",
            \"time\": \"09:00\",
            \"location\": \"Computer Science Building, Hall A\",
            \"organizer_id\": \"club-1\",
            \"organizer_name\": \"Tech Club\",
            \"registrations\": [],
            \"max_attendees\": 100,
            \"created_at\": \"2025-01-05T10:00:00Z\",
            \"status\": \"approved\"
        },
        {
            \"id\": \"event-2\",
            \"title\": \"Art Exhibition Opening\",
            \"description\": \"Showcase of student artwork from various mediums. All welcome to attend.\",
            \"date\": \"2025-02-01\",
            \"time\": \"17:00\",
            \"location\": \"Arts Building, Gallery 1\",
            \"organizer_id\": \"club-2\",
            \"organizer_name\": \"Arts Society\",
            \"registrations\": [],
            \"max_attendees\": 200,
            \"created_at\": \"2025-01-06T10:00:00Z\",
            \"status\": \"approved\"
        },
        {
            \"id\": \"event-3\",
            \"title\": \"Guest Lecture: AI in Healthcare\",
            \"description\": \"Join us for an insightful talk by Dr. Patel on the applications of AI in modern medicine.\",
            \"date\": \"2025-01-25\",
            \"time\": \"14:00\",
            \"location\": \"Main Auditorium\",
            \"organizer_id\": \"admin-1\",
            \"organizer_name\": \"Dr. Sarah Williams\",
            \"registrations\": [],
            \"max_attendees\": 500,
            \"created_at\": \"2025-01-03T10:00:00Z\",
            \"status\": \"approved\"
        }
    ]
    
    clubs = [
        {
            \"id\": \"club-tech\",
            \"name\": \"Tech Club\",
            \"description\": \"For students passionate about technology, coding, and innovation. Join us for hackathons, workshops, and projects!\",
            \"category\": \"Technology\",
            \"members\": [],
            \"admin_id\": \"club-1\",
            \"created_at\": \"2024-01-10T10:00:00Z\"
        },
        {
            \"id\": \"club-arts\",
            \"name\": \"Arts Society\",
            \"description\": \"Celebrate creativity through painting, sculpture, photography, and more. All skill levels welcome!\",
            \"category\": \"Arts\",
            \"members\": [],
            \"admin_id\": \"club-2\",
            \"created_at\": \"2024-01-11T10:00:00Z\"
        },
        {
            \"id\": \"club-debate\",
            \"name\": \"Debate Society\",
            \"description\": \"Sharpen your critical thinking and public speaking skills. Weekly debates and competitions.\",
            \"category\": \"Academic\",
            \"members\": [],
            \"admin_id\": \"club-1\",
            \"created_at\": \"2024-01-12T10:00:00Z\"
        },
        {
            \"id\": \"club-music\",
            \"name\": \"Music Club\",
            \"description\": \"For music enthusiasts! Jam sessions, concerts, and music production workshops.\",
            \"category\": \"Arts\",
            \"members\": [],
            \"admin_id\": \"club-2\",
            \"created_at\": \"2024-01-13T10:00:00Z\"
        }
    ]
    
    await db.users.insert_many(users)
    await db.notices.insert_many(notices)
    await db.events.insert_many(events)
    await db.clubs.insert_many(clubs)
    
    print(\"✅ Database seeded successfully!\")
    print(f\"   - {len(users)} users created\")
    print(f\"   - {len(notices)} notices created\")
    print(f\"   - {len(events)} events created\")
    print(f\"   - {len(clubs)} clubs created\")
    
    client.close()

if __name__ == \"__main__\":
    asyncio.run(seed_database())
"
