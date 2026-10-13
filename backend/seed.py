from datetime import datetime, timedelta, timezone
from app import create_app
from models import db, User, LeaveRequest
from routing import evaluate_request_routing

def seed_database():
    app = create_app()
    with app.app_context():
        print("Ensuring database tables exist in PostgreSQL...")
        db.create_all()

        demo_users = [
            {
                "email": "student@college.com",
                "name": "Alex Morgan",
                "role": "student",
                "roll_number": "CS-2026-042",
                "password": "Student@123"
            },
            {
                "email": "teacher@college.com",
                "name": "Prof. Robert Smith",
                "role": "teacher",
                "roll_number": None,
                "password": "Teacher@123"
            },
            {
                "email": "warden@college.com",
                "name": "Dr. Evelyn Reed",
                "role": "warden",
                "roll_number": None,
                "password": "Warden@123"
            }
        ]

        created_users = {}
        for u_data in demo_users:
            user = User.query.filter_by(email=u_data["email"]).first()
            if not user:
                user = User(
                    email=u_data["email"],
                    name=u_data["name"],
                    role=u_data["role"],
                    roll_number=u_data["roll_number"]
                )
                user.set_password(u_data["password"])
                db.session.add(user)
                print(f"Created demo account: {u_data['email']} ({u_data['role']})")
            else:
                user.name = u_data["name"]
                user.role = u_data["role"]
                user.roll_number = u_data["roll_number"]
                user.set_password(u_data["password"])
                print(f"Updated demo account: {u_data['email']} ({u_data['role']})")
            created_users[u_data["role"]] = user

        db.session.commit()

        # Check if sample requests already exist, if not create sample data for immediate testing
        student = created_users["student"]
        if LeaveRequest.query.count() == 0:
            print("Seeding initial sample requests...")
            
            # Request 1: Working hours outpass (e.g. today 10:00 to 14:00) -> routed to Teacher
            base_date = datetime.now(timezone.utc).replace(hour=10, minute=0, second=0, microsecond=0)
            # Adjust to a working weekday (Monday-Friday)
            while base_date.weekday() > 4:
                base_date += timedelta(days=1)
            
            req1_from = base_date
            req1_to = base_date.replace(hour=14, minute=0)
            routing1 = evaluate_request_routing(req1_from, req1_to)

            req1 = LeaveRequest(
                student_id=student.id,
                leave_type="outpass",
                reason="Attending inter-college coding competition seminar",
                from_datetime=req1_from,
                to_datetime=req1_to,
                destination="City Convention Center, Hall B",
                assigned_approver_role=routing1["assigned_approver_role"],
                final_status=routing1["initial_status"]
            )
            db.session.add(req1)

            # Request 2: Weekend / overnight leave -> routed to Warden
            req2_from = base_date.replace(hour=18, minute=0)
            req2_to = (base_date + timedelta(days=2)).replace(hour=20, minute=0)
            routing2 = evaluate_request_routing(req2_from, req2_to)

            req2 = LeaveRequest(
                student_id=student.id,
                leave_type="leave",
                reason="Visiting hometown for family gathering",
                from_datetime=req2_from,
                to_datetime=req2_to,
                destination="Hometown",
                assigned_approver_role=routing2["assigned_approver_role"],
                final_status=routing2["initial_status"]
            )
            db.session.add(req2)

            db.session.commit()
            print("Sample leave & outpass requests successfully seeded!")

        print("\n=== DATABASE SEEDING COMPLETED SUCCESSFULLY ===")
        print("Demo Credentials for Testing:")
        print("1. Student: student@college.com | Password: Student@123")
        print("2. Teacher: teacher@college.com | Password: Teacher@123")
        print("3. Warden:  warden@college.com  | Password: Warden@123")

if __name__ == "__main__":
    seed_database()
