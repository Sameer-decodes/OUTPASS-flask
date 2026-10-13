import json
from datetime import datetime, timedelta, timezone
from app import create_app
from models import db, User, LeaveRequest

def run_tests():
    app = create_app()
    client = app.test_client()

    print("--- Test 1: Health check ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("[PASS] Health check OK")

    print("\n--- Test 2: Student Login ---")
    res = client.post("/api/auth/login", json={
        "email": "student@college.com",
        "password": "Student@123"
    })
    assert res.status_code == 200, f"Login failed: {res.data}"
    student_token = res.get_json()["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[PASS] Student login OK")

    print("\n--- Test 3: Teacher Login ---")
    res = client.post("/api/auth/login", json={
        "email": "teacher@college.com",
        "password": "Teacher@123"
    })
    assert res.status_code == 200
    teacher_token = res.get_json()["token"]
    teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
    print("[PASS] Teacher login OK")

    print("\n--- Test 4: Warden Login ---")
    res = client.post("/api/auth/login", json={
        "email": "warden@college.com",
        "password": "Warden@123"
    })
    assert res.status_code == 200
    warden_token = res.get_json()["token"]
    warden_headers = {"Authorization": f"Bearer {warden_token}"}
    print("[PASS] Warden login OK")

    print("\n--- Test 5: Automatic Routing Logic ---")
    # A) Within college hours on a working day (Wednesday 10:00 to 14:00)
    wednesday_dt = "2026-10-14T10:00:00"
    wednesday_end = "2026-10-14T14:00:00"
    res = client.get(f"/api/requests/routing-preview?from_datetime={wednesday_dt}&to_datetime={wednesday_end}", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["assigned_approver_role"] == "teacher", f"Expected teacher, got {data}"
    assert data["initial_status"] == "Pending Teacher Approval"
    print("[PASS] Normal working hours routed to Teacher correctly")

    # B) Outside college hours on working day (Wednesday 18:00 to 21:00)
    wednesday_evening = "2026-10-14T18:00:00"
    wednesday_night = "2026-10-14T21:00:00"
    res = client.get(f"/api/requests/routing-preview?from_datetime={wednesday_evening}&to_datetime={wednesday_night}", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["assigned_approver_role"] == "warden", f"Expected warden, got {data}"
    print("[PASS] Outside hours routed to Warden correctly")

    # C) Weekend (Sunday)
    sunday_dt = "2026-10-18T10:00:00"
    sunday_end = "2026-10-18T14:00:00"
    res = client.get(f"/api/requests/routing-preview?from_datetime={sunday_dt}&to_datetime={sunday_end}", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["assigned_approver_role"] == "warden"
    print("[PASS] Weekend routed to Warden correctly")

    # D) College Holiday (2026-10-02 Gandhi Jayanti)
    holiday_start = "2026-10-02T10:00:00"
    holiday_end = "2026-10-02T12:00:00"
    res = client.get(f"/api/requests/routing-preview?from_datetime={holiday_start}&to_datetime={holiday_end}", headers=student_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["assigned_approver_role"] == "warden"
    print("[PASS] Holiday routed to Warden correctly")

    print("\n--- Test 6: Student Creates Requests ---")
    # Create request 1: Teacher routed
    res = client.post("/api/requests", headers=student_headers, json={
        "leave_type": "outpass",
        "reason": "Library research at Central University",
        "from_datetime": "2026-10-14T11:00:00",
        "to_datetime": "2026-10-14T15:00:00",
        "destination": "Central Library"
    })
    assert res.status_code == 201
    req_teacher = res.get_json()["request"]
    assert req_teacher["assigned_approver_role"] == "teacher"
    assert req_teacher["final_status"] == "Pending Teacher Approval"
    print("[PASS] Student submitted request routed to Teacher successfully")

    # Create request 2: Warden routed
    res = client.post("/api/requests", headers=student_headers, json={
        "leave_type": "leave",
        "reason": "Weekend family visit",
        "from_datetime": "2026-10-17T10:00:00",
        "to_datetime": "2026-10-18T20:00:00",
        "destination": "Home"
    })
    assert res.status_code == 201
    req_warden = res.get_json()["request"]
    assert req_warden["assigned_approver_role"] == "warden"
    assert req_warden["final_status"] == "Pending Warden Approval"
    print("[PASS] Student submitted request routed to Warden successfully")

    print("\n--- Test 7: Role Authorization and Cross-Approval Prevention ---")
    # Teacher tries to approve req_warden -> Should fail (403 Forbidden)
    res = client.post(f"/api/requests/{req_warden['id']}/action", headers=teacher_headers, json={"action": "approve"})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("[PASS] Teacher prevented from approving Warden request (403 Forbidden)")

    # Warden tries to approve req_teacher -> Should fail (403 Forbidden)
    res = client.post(f"/api/requests/{req_teacher['id']}/action", headers=warden_headers, json={"action": "approve"})
    assert res.status_code == 403
    print("[PASS] Warden prevented from approving Teacher request (403 Forbidden)")

    # Student tries to approve own request -> Should fail (403 Forbidden)
    res = client.post(f"/api/requests/{req_teacher['id']}/action", headers=student_headers, json={"action": "approve"})
    assert res.status_code == 403
    print("[PASS] Student prevented from approving requests (403 Forbidden)")

    print("\n--- Test 8: Valid Approvals and Rejections ---")
    # Teacher approves req_teacher
    res = client.post(f"/api/requests/{req_teacher['id']}/action", headers=teacher_headers, json={"action": "approve"})
    assert res.status_code == 200
    assert res.get_json()["request"]["final_status"] == "Approved by Teacher"
    print("[PASS] Teacher approved request -> 'Approved by Teacher'")

    # Warden rejects req_warden with reason
    res = client.post(f"/api/requests/{req_warden['id']}/action", headers=warden_headers, json={
        "action": "reject",
        "rejection_reason": "Parental consent required for overnight leave."
    })
    assert res.status_code == 200
    assert res.get_json()["request"]["final_status"] == "Rejected"
    assert res.get_json()["request"]["rejection_reason"] == "Parental consent required for overnight leave."
    print("[PASS] Warden rejected request -> 'Rejected' with reason")

    print("\n--- Test 9: Student Views Updated Requests ---")
    res = client.get("/api/requests", headers=student_headers)
    assert res.status_code == 200
    requests = res.get_json()["requests"]
    assert len(requests) >= 2
    print(f"[PASS] Student retrieved {len(requests)} requests with live updated statuses")

    print("\n================ ALL BACKEND TESTS PASSED! ================\n")

if __name__ == "__main__":
    run_tests()
