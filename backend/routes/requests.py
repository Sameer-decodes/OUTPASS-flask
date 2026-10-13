from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from models import db, LeaveRequest, User
from auth_utils import token_required, role_required
from routing import evaluate_request_routing
from config import Config

requests_bp = Blueprint("requests", __name__, url_prefix="/api/requests")

def parse_iso_datetime(dt_str):
    """Parses an ISO format datetime string (e.g., 2026-10-14T09:30 or with seconds)."""
    if not dt_str:
        return None
    # Replace space with T if needed
    cleaned = dt_str.replace(" ", "T")
    # Truncate timezone offset or milliseconds if present for simple parsing
    try:
        return datetime.fromisoformat(cleaned)
    except ValueError:
        for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(cleaned, fmt)
            except ValueError:
                continue
    return None

@requests_bp.route("/routing-preview", methods=["GET"])
@token_required
def routing_preview():
    from_str = request.args.get("from_datetime")
    to_str = request.args.get("to_datetime")
    
    if not from_str or not to_str:
        return jsonify({"error": "Both from_datetime and to_datetime are required"}), 400
    
    from_dt = parse_iso_datetime(from_str)
    to_dt = parse_iso_datetime(to_str)
    
    if not from_dt or not to_dt:
        return jsonify({"error": "Invalid datetime format"}), 400
    
    if from_dt >= to_dt:
        return jsonify({"error": "'To' datetime must be after 'From' datetime"}), 400

    routing_info = evaluate_request_routing(from_dt, to_dt)
    return jsonify(routing_info), 200

@requests_bp.route("/college-policy", methods=["GET"])
@token_required
def get_college_policy():
    days_map = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    working_days_names = [days_map[d] for d in Config.COLLEGE_WORKING_DAYS]
    off_days_names = [days_map[d] for d in Config.COLLEGE_OFF_DAYS]

    return jsonify({
        "working_days": working_days_names,
        "weekly_off_days": off_days_names,
        "working_hours": f"{Config.COLLEGE_START_TIME.strftime('%I:%M %p')} to {Config.COLLEGE_END_TIME.strftime('%I:%M %p')}",
        "holidays": Config.COLLEGE_HOLIDAYS
    }), 200

@requests_bp.route("", methods=["POST"])
@role_required(["student"])
def create_request():
    data = request.get_json() or {}
    
    leave_type = data.get("leave_type", "").strip().lower()
    reason = data.get("reason", "").strip()
    from_str = data.get("from_datetime", "").strip()
    to_str = data.get("to_datetime", "").strip()
    destination = data.get("destination", "").strip()

    # Validations
    if leave_type not in ["leave", "outpass"]:
        return jsonify({"error": "leave_type must be either 'leave' or 'outpass'"}), 400

    if not reason:
        return jsonify({"error": "Reason is required"}), 400

    if not from_str or not to_str:
        return jsonify({"error": "Both 'from_datetime' and 'to_datetime' are required"}), 400

    from_dt = parse_iso_datetime(from_str)
    to_dt = parse_iso_datetime(to_str)

    if not from_dt or not to_dt:
        return jsonify({"error": "Invalid date or time format. Please provide valid datetimes."}), 400

    if from_dt >= to_dt:
        return jsonify({"error": "'To Date & Time' must be strictly after 'From Date & Time'"}), 400

    # Destination validation: optional for leave, required for outpass
    if leave_type == "outpass" and not destination:
        return jsonify({"error": "Destination is required for Out-Pass requests"}), 400

    # Automatic routing logic on backend
    routing_result = evaluate_request_routing(from_dt, to_dt)
    assigned_approver_role = routing_result["assigned_approver_role"]
    initial_status = routing_result["initial_status"]

    new_request = LeaveRequest(
        student_id=request.current_user.id,
        leave_type=leave_type,
        reason=reason,
        from_datetime=from_dt,
        to_datetime=to_dt,
        destination=destination if destination else None,
        assigned_approver_role=assigned_approver_role,
        final_status=initial_status,
        rejection_reason=None
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "message": f"Request submitted successfully. Routed to {assigned_approver_role.capitalize()} Dashboard.",
        "request": new_request.to_dict(),
        "routing_reason": routing_result["routing_reason"]
    }), 201

@requests_bp.route("", methods=["GET"])
@token_required
def get_requests():
    user = request.current_user
    
    if user.role == "student":
        # Students can view only their own requests
        reqs = LeaveRequest.query.filter_by(student_id=user.id).order_by(LeaveRequest.created_at.desc()).all()
    elif user.role == "teacher":
        # Teachers can view requests routed to teacher
        reqs = LeaveRequest.query.filter_by(assigned_approver_role="teacher").order_by(LeaveRequest.created_at.desc()).all()
    elif user.role == "warden":
        # Wardens can view requests routed to warden
        reqs = LeaveRequest.query.filter_by(assigned_approver_role="warden").order_by(LeaveRequest.created_at.desc()).all()
    else:
        reqs = []

    return jsonify({"requests": [r.to_dict() for r in reqs]}), 200

@requests_bp.route("/<int:request_id>/action", methods=["POST"])
@role_required(["teacher", "warden"])
def process_request_action(request_id):
    user = request.current_user
    req = LeaveRequest.query.get(request_id)
    
    if not req:
        return jsonify({"error": "Leave request not found"}), 404

    # Security check: Approver can only process requests assigned to their role
    if req.assigned_approver_role != user.role:
        return jsonify({
            "error": f"Unauthorized. This request is assigned to {req.assigned_approver_role.capitalize()}, not {user.role.capitalize()}."
        }), 403

    # Check if request has already been finalized
    if req.final_status in ["Approved by Teacher", "Approved by Warden", "Rejected"]:
        return jsonify({
            "error": f"This request has already been finalized as '{req.final_status}'."
        }), 400

    data = request.get_json() or {}
    action = data.get("action", "").strip().lower()
    rejection_reason = data.get("rejection_reason", "").strip()

    if action not in ["approve", "reject"]:
        return jsonify({"error": "Invalid action. Must be 'approve' or 'reject'"}), 400

    if action == "approve":
        if user.role == "teacher":
            req.final_status = "Approved by Teacher"
        elif user.role == "warden":
            req.final_status = "Approved by Warden"
        req.rejection_reason = None
    elif action == "reject":
        req.final_status = "Rejected"
        req.rejection_reason = rejection_reason if rejection_reason else "Request rejected by approver."

    req.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        "message": f"Request {action}d successfully.",
        "request": req.to_dict()
    }), 200
