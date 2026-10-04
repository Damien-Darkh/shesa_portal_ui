// data.js - Extended mock data strictly mirroring models.py ORM schema

export const dbData = {
  // Current logged in user (Damien Vance)
  currentUser: {
    id: 1,
    email: "damien.vance@company.com",
    workos_user_id: "user_01H8X9Z10293847566",
    first_name: "Damien",
    last_name: "Vance",
    is_admin: true  ,
    disabled: false,
    created_at: "2026-01-15T08:30:00Z",

    dsm_username: "damien.vance",
    dsm_password_token: "tok_syn_9920138401",
    dsm_temp_password: null,
    dsm_password_expires_at: null,
    dsm_must_change_password: false,

    profile: {
      id: 101,
      user_id: 1,
      department_id: 3,
      job_title: "Lead Frontend Engineer",
      phone: "+1 (555) 019-2834",
      office_location: "Building A - Floor 4",
      bio: "Focusing on frontend architecture, design systems, and client-side security.",
      photo_url: "./avatar.jpg",
      start_date: "2023-03-01",
      updated_at: "2026-09-01T10:00:00Z"
    },

    roles: [
      { id: 1, name: "admin", description: "System administrator" },
      { id: 2, name: "manager", description: "Department manager" }
    ],

    devices: [
      {
        id: 501,
        user_id: 1,
        device_name: "Work MacBook Pro",
        created_at: "2026-01-15T09:00:00Z",
        wg_uuid: "wg-peer-7f8a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
        wg_api_name: "damien_macbook_pro",
        wg_address: "10.10.10.15/32",
        revoked_at: null,
        auto_revoked: false,
        launcher_token: null,
        launcher_script: null,
        launcher_token_expires_at: null,
        is_revoked: false,
        launcher_available: true
      },
      {
        id: 502,
        user_id: 1,
        device_name: "Windows Desktop PC",
        created_at: "2026-02-10T14:20:00Z",
        wg_uuid: "wg-peer-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        wg_api_name: "damien_win_desktop",
        wg_address: "10.10.10.16/32",
        revoked_at: null,
        auto_revoked: false,
        launcher_token: "launch_tok_882910394820",
        launcher_script: "PrivateKey = ...",
        launcher_token_expires_at: "2026-09-27T10:00:00Z",
        is_revoked: false,
        launcher_available: false
      }
    ]
  },

  // LeaveBalances (Step 5)
  leaveBalances: [
    { id: 1, user_id: 1, year: 2026, leave_type: "vacation", accrued_days: 25.0, used_days: 5.0, pending_days: 2.0, carryover_days: 3.0 },
    { id: 2, user_id: 1, year: 2026, leave_type: "sick", accrued_days: 10.0, used_days: 1.0, pending_days: 0.0, carryover_days: 0.0 },
    { id: 3, user_id: 1, year: 2026, leave_type: "personal", accrued_days: 5.0, used_days: 2.0, pending_days: 0.0, carryover_days: 0.0 }
  ],

  // LeaveRequests (Step 5)
  leaveRequests: [
    { id: 1, user_id: 1, leave_type: "vacation", start_date: "2026-10-05", end_date: "2026-10-07", days_requested: 3.0, reason: "Family trip", status: "PENDING", approver_id: 2, approver_comment: null, created_at: "2026-09-20T10:00:00Z" },
    { id: 2, user_id: 1, leave_type: "sick", start_date: "2026-06-12", end_date: "2026-06-12", days_requested: 1.0, reason: "Medical appointment", status: "APPROVED", approver_id: 2, approver_comment: null, created_at: "2026-06-11T14:00:00Z" },
    { id: 3, user_id: 4, leave_type: "vacation", start_date: "2026-10-12", end_date: "2026-10-16", days_requested: 5.0, reason: "Autumn break", status: "PENDING", approver_id: 1, approver_comment: null, created_at: "2026-09-25T09:12:00Z" }
  ],

  // TimeAttendance Logs (Step 5)
  timeAttendance: [
    { id: 10, user_id: 1, clock_in: "2026-09-28T08:02:15Z", clock_out: null, duration_minutes: null, notes: "Working from office" },
    { id: 9, user_id: 1, clock_in: "2026-09-25T08:10:00Z", clock_out: "2026-09-25T17:05:00Z", duration_minutes: 535, notes: null }
  ],

  // Departments (Step 4)
  departments: [
    { id: 1, name: "Executive & Admin", description: "Company leadership and operations", parent_id: null, manager_id: 2 },
    { id: 2, name: "Engineering", description: "Product development and infrastructure", parent_id: 1, manager_id: 1 },
    { id: 3, name: "Frontend Architecture", description: "Design systems and web client applications", parent_id: 2, manager_id: 1 },
    { id: 4, name: "Human Resources", description: "People operations, hiring, and compliance", parent_id: 1, manager_id: 3 }
  ],

  // Users Directory (Step 4)
  usersDirectory: [
    {
      id: 1,
      email: "damien.vance@company.com",
      first_name: "Damien",
      last_name: "Vance",
      disabled: false,
      profile: { job_title: "Lead Frontend Engineer", department_id: 3, phone: "+1 (555) 019-2834", office_location: "Building A - Floor 4", photo_url: "./avatar.jpg" }
    },
    {
      id: 2,
      email: "sarah.connor@company.com",
      first_name: "Sarah",
      last_name: "Connor",
      disabled: false,
      profile: { job_title: "VP of Engineering", department_id: 2, phone: "+1 (555) 019-9988", office_location: "Building A - Floor 5", photo_url: null }
    },
    {
      id: 3,
      email: "elena.rodriguez@company.com",
      first_name: "Elena",
      last_name: "Rodriguez",
      disabled: false,
      profile: { job_title: "HR Director", department_id: 4, phone: "+1 (555) 019-4411", office_location: "Building B - Floor 1", photo_url: null }
    },
    {
      id: 4,
      email: "alex.chen@company.com",
      first_name: "Alex",
      last_name: "Chen",
      disabled: false,
      profile: { job_title: "Software Engineer", department_id: 3, phone: "+1 (555) 019-3322", office_location: "Building A - Floor 4", photo_url: null }
    }
  ],

  // Onboarding Tasks (Custom ESS Checklist linked to HR)
  onboardingTasks: [
    { id: 1, title: "Sign Data Privacy Agreement", completed: true, completed_at: "2026-01-15T09:30:00Z", verified_by_hr: true },
    { id: 2, title: "Setup WireGuard VPN Profile", completed: true, completed_at: "2026-01-15T10:00:00Z", verified_by_hr: true },
    { id: 3, title: "Review Emergency Contact Policy", completed: false, completed_at: null, verified_by_hr: false }
  ],

  // Notifications (Step 5)
  notifications: [
    { id: 101, user_id: 1, notification_type: "LEAVE_APPROVED", title: "Leave approved", message: "Your sick leave from 2026-06-12 to 2026-06-12 was approved.", link: "calander.html", is_read: false, sent_at: "2026-06-11T14:05:00Z" },
    { id: 102, user_id: 1, notification_type: "LEAVE_REQUESTED", title: "New leave request", message: "Alex Chen requested vacation leave from 2026-10-12 to 2026-10-16.", link: "admin.html#leave", is_read: false, sent_at: "2026-09-25T09:12:00Z" }
  ]
};

// Keep usersDirectory consistent with currentUser (admin.html reads devices/is_admin from here).
// Flask: these come straight from the User row + user.devices, so this block disappears when ported.
{
  const me = dbData.usersDirectory.find(u => u.id === dbData.currentUser.id);
  if (me) Object.assign(me, { is_admin: dbData.currentUser.is_admin, devices: dbData.currentUser.devices });
  dbData.usersDirectory.forEach(u => { u.devices ??= []; u.is_admin ??= false; });
}

// Extra mock leave so the admin calendar has several employees to show (approved = solid, pending = dashed).
dbData.leaveRequests.push(
  { id: 4, user_id: 2, leave_type: "vacation", start_date: "2026-10-19", end_date: "2026-10-23", days_requested: 5.0, reason: "Holiday", status: "APPROVED", approver_id: 1, approver_comment: null, created_at: "2026-09-10T09:00:00Z" },
  { id: 5, user_id: 3, leave_type: "sick", start_date: "2026-10-08", end_date: "2026-10-08", days_requested: 1.0, reason: "Medical appointment", status: "APPROVED", approver_id: 1, approver_comment: null, created_at: "2026-09-28T09:00:00Z" },
  { id: 6, user_id: 4, leave_type: "personal", start_date: "2026-10-28", end_date: "2026-10-29", days_requested: 2.0, reason: "Moving house", status: "APPROVED", approver_id: 1, approver_comment: null, created_at: "2026-09-15T09:00:00Z" }
);
