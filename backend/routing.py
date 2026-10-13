from datetime import datetime, date
from config import Config

def evaluate_request_routing(from_dt: datetime, to_dt: datetime):
    """
    Evaluates whether a leave or outpass request routes to a Teacher or a Warden.
    
    Case A: Normal College Working Days and Timings
    - Entirely within normal college working hours (default Mon-Fri, 9:00 AM to 5:00 PM).
    - Must be on the same calendar working day.
    - Neither start nor end falls on a holiday or weekly off-day.
    - Routes to: 'teacher' with initial status 'Pending Teacher Approval'.
    
    Case B: Holidays, Weekly Off-Days, or Outside College Timings
    - Spans overnight / multiple calendar days.
    - Falls on a weekend or college holiday.
    - Starts before 9:00 AM or ends after 5:00 PM.
    - Routes to: 'warden' with initial status 'Pending Warden Approval'.
    """
    reasons = []

    # Check 1: Multi-day / overnight stay
    if from_dt.date() != to_dt.date():
        reasons.append("Request spans across multiple calendar days / overnight")
    
    # Check 2: Holidays
    from_date_str = from_dt.date().isoformat()
    to_date_str = to_dt.date().isoformat()
    holiday_hit = False
    for holiday in Config.COLLEGE_HOLIDAYS:
        if from_date_str == holiday or to_date_str == holiday:
            holiday_hit = True
            break
    if holiday_hit:
        reasons.append("Requested period includes a scheduled college holiday")

    # Check 3: Weekly off-days (e.g., Saturday, Sunday)
    if from_dt.weekday() in Config.COLLEGE_OFF_DAYS or to_dt.weekday() in Config.COLLEGE_OFF_DAYS:
        reasons.append("Requested date falls on a weekly off-day (weekend)")

    # Check 4: Working hours check (09:00 to 17:00)
    from_time = from_dt.time()
    to_time = to_dt.time()
    if from_time < Config.COLLEGE_START_TIME:
        reasons.append(f"Starts before college opening time ({Config.COLLEGE_START_TIME.strftime('%I:%M %p')})")
    if to_time > Config.COLLEGE_END_TIME:
        reasons.append(f"Ends after college closing time ({Config.COLLEGE_END_TIME.strftime('%I:%M %p')})")

    # Decision logic
    if not reasons:
        # Falls entirely within working hours on a regular college day
        return {
            "assigned_approver_role": "teacher",
            "initial_status": "Pending Teacher Approval",
            "routing_reason": "Falls entirely within normal college working hours (Mon-Fri 09:00 AM - 05:00 PM)."
        }
    else:
        # Outside college hours, weekly off-days, or holidays -> Warden
        return {
            "assigned_approver_role": "warden",
            "initial_status": "Pending Warden Approval",
            "routing_reason": f"Routed to Warden because: {'; '.join(reasons)}."
        }
