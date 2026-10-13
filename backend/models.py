from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'teacher', 'warden'
    roll_number = db.Column(db.String(50), nullable=True)  # Nullable for teachers & wardens
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    requests = db.relationship("LeaveRequest", backref="student", lazy=True, foreign_keys="LeaveRequest.student_id")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "roll_number": self.roll_number,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class LeaveRequest(db.Model):
    __tablename__ = "leave_requests"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    leave_type = db.Column(db.String(20), nullable=False)  # 'leave' or 'outpass'
    reason = db.Column(db.Text, nullable=False)
    from_datetime = db.Column(db.DateTime, nullable=False)
    to_datetime = db.Column(db.DateTime, nullable=False)
    destination = db.Column(db.String(255), nullable=True)  # Optional for leave, required for outpass
    assigned_approver_role = db.Column(db.String(20), nullable=False)  # 'teacher' or 'warden'
    final_status = db.Column(db.String(50), nullable=False)
    # Statuses:
    # 'Pending Teacher Approval'
    # 'Pending Warden Approval'
    # 'Approved by Teacher'
    # 'Approved by Warden'
    # 'Rejected'
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else None,
            "roll_number": self.student.roll_number if self.student else None,
            "student_email": self.student.email if self.student else None,
            "leave_type": self.leave_type,
            "reason": self.reason,
            "from_datetime": self.from_datetime.isoformat() if self.from_datetime else None,
            "to_datetime": self.to_datetime.isoformat() if self.to_datetime else None,
            "destination": self.destination,
            "assigned_approver_role": self.assigned_approver_role,
            "final_status": self.final_status,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
