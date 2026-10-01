import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  EnvelopeIcon,
  PencilIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  DocumentCheckIcon,
  EyeIcon
} from "@heroicons/react/24/solid";

import { lazy, Suspense } from "react";

/* -------------------- HOD -------------------- */
const HODHome = lazy(() => import("@/pages/dashboard/hod/Home"));
const HODProfile = lazy(() => import("@/pages/dashboard/hod/Profile"));
const Email = lazy(() => import("@/components/email/MailSender"));
const HODSemesterTable = lazy(() =>
  import("@/pages/dashboard/hod/SemesterTable")
);
const HODNotifications = lazy(() =>
  import("@/pages/dashboard/hod/Notifications")
);

/* -------------------- PROFESSOR -------------------- */
const ProfessorHome = lazy(() => import("@/pages/dashboard/professor/Home"));
const ProfessorProfile = lazy(() =>
  import("@/pages/dashboard/professor/Profile")
);
const ProfessorNotifications = lazy(() =>
  import("@/pages/dashboard/professor/Notifications")
);
const TeacherAlertPanel = lazy(() =>
  import("@/components/proctoring/TeacherAlertPanel")
);
const AttendancePage = lazy(() =>
  import("@/pages/dashboard/professor/Attendance/AttendanceFlow")
);
const ExamConductingPortal = lazy(() =>
  import("@/pages/dashboard/professor/ExamConductingPortal")
);
const TeacherExamPanel = lazy(() =>
  import("@/pages/dashboard/professor/TeacherExamPanel")
);

/* -------------------- STUDENT -------------------- */
const StudentHome = lazy(() => import("@/pages/dashboard/student/Home"));
const StudentProfile = lazy(() => import("@/pages/dashboard/student/Profile"));
const StudentNotifications = lazy(() =>
  import("@/pages/dashboard/student/Notifications")
);
const StudentSemesterTable = lazy(() =>
  import("@/pages/dashboard/student/SemesterTable")
);
const StudentExamList = lazy(() =>
  import("@/pages/dashboard/student/StudentExamList")
);
const ExamPanel = lazy(() =>
  import("@/pages/dashboard/student/ExamPanel")
);

/* -------------------- AUTH -------------------- */
const HODSignIn = lazy(() => import("@/pages/auth/hod/HODSignIn"));
const HODSignUp = lazy(() => import("@/pages/auth/hod/HODSignUp"));

const ProfessorSignIn = lazy(() =>
  import("@/pages/auth/professor/ProfessorSignIn")
);
const ProfessorSignUp = lazy(() =>
  import("@/pages/auth/professor/ProfessorSignUp")
);

const StudentSignIn = lazy(() => import("@/pages/auth/student/StudentSignIn"));
const StudentSignUp = lazy(() => import("@/pages/auth/student/StudentSignUp"));

const ForgotPasswordFlow = lazy(() =>
  import("./pages/forgotPassword/ForgotPasswordFlow")
);

/* -------------------- COMMON -------------------- */
const icon = {
  className: "w-5 h-5 text-inherit",
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
      <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
    </div>
  </div>
);

/* -------------------- ROUTES -------------------- */
export const routes = [
  /* -------------------- HOD -------------------- */
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "HOD dashboard",
        path: "/hod/home",
        element: <Suspense fallback={<LoadingSpinner />}><HODHome /></Suspense>,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "HOD Information",
        path: "/hod/information",
        element: <Suspense fallback={<LoadingSpinner />}><HODProfile /></Suspense>,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "HOD Semesters",
        path: "/hod/semesters",
        element: <Suspense fallback={<LoadingSpinner />}><HODSemesterTable /></Suspense>,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "HOD notifications",
        path: "/hod/notifications",
        element: <Suspense fallback={<LoadingSpinner />}><HODNotifications /></Suspense>,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "HOD E-Mail",
        path: "/hod/email",
        element: <Suspense fallback={<LoadingSpinner />}><Email /></Suspense>,
      },
    ],
  },

  /* -------------------- PROFESSOR -------------------- */
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Professor dashboard",
        path: "/professor/home",
        element: <Suspense fallback={<LoadingSpinner />}><ProfessorHome /></Suspense>,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Professor Information",
        path: "/professor/information",
        element: <Suspense fallback={<LoadingSpinner />}><ProfessorProfile /></Suspense>,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Professor notifications",
        path: "/professor/notifications",
        element: <Suspense fallback={<LoadingSpinner />}><ProfessorNotifications /></Suspense>,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Student Attendance",
        path: "/professor/attendance",
        element: <Suspense fallback={<LoadingSpinner />}><AttendancePage /></Suspense>,
      },
      {
        icon: <BellAlertIcon {...icon} />,
        name: "Proctoring Alerts",
        path: "/professor/proctoring",
        element: <Suspense fallback={<LoadingSpinner />}><TeacherAlertPanel /></Suspense>,
      },
      {
        icon: <EyeIcon {...icon} />,
        name: "Exam Conducting",
        path: "/professor/exam-conducting",
        element: <Suspense fallback={<LoadingSpinner />}><ExamConductingPortal /></Suspense>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Exam Management",
        path: "/professor/exam-management",
        element: <Suspense fallback={<LoadingSpinner />}><TeacherExamPanel /></Suspense>,
      },
    ],
  },

  /* -------------------- STUDENT -------------------- */
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Student dashboard",
        path: "/student/home",
        element: <Suspense fallback={<LoadingSpinner />}><StudentHome /></Suspense>,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Student Information",
        path: "/student/information",
        element: <Suspense fallback={<LoadingSpinner />}><StudentProfile /></Suspense>,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Student notifications",
        path: "/student/notifications",
        element: <Suspense fallback={<LoadingSpinner />}><StudentNotifications /></Suspense>,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Student Semester Table",
        path: "/student/semestertable",
        element: <Suspense fallback={<LoadingSpinner />}><StudentSemesterTable /></Suspense>,
      },

      /* ✅ NEW EXAM LIST ROUTE */
      {
        icon: <DocumentCheckIcon {...icon} />,
        name: "Exam List",
        path: "/student/exams",
        element: <Suspense fallback={<LoadingSpinner />}><StudentExamList /></Suspense>,
      },

      {
        icon: <ShieldCheckIcon {...icon} />,
        name: "Take Exam",
        path: "/student/exam/:examId",
        element: <Suspense fallback={<LoadingSpinner />}><ExamPanel /></Suspense>,
      },
    ],
  },

  /* -------------------- AUTH -------------------- */
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Student sign-in",
        path: "student/sign-in",
        element: <Suspense fallback={<LoadingSpinner />}><StudentSignIn /></Suspense>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Student sign-up",
        path: "student/sign-up",
        element: <Suspense fallback={<LoadingSpinner />}><StudentSignUp /></Suspense>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "forgot password",
        path: "/forgot-password",
        element: <Suspense fallback={<LoadingSpinner />}><ForgotPasswordFlow /></Suspense>,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Professor sign-in",
        path: "professor/sign-in",
        element: <Suspense fallback={<LoadingSpinner />}><ProfessorSignIn /></Suspense>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Professor sign-up",
        path: "professor/sign-up",
        element: <Suspense fallback={<LoadingSpinner />}><ProfessorSignUp /></Suspense>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "HOD sign-in",
        path: "hod/sign-in",
        element: <Suspense fallback={<LoadingSpinner />}><HODSignIn /></Suspense>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "HOD sign-up",
        path: "hod/sign-up",
        element: <Suspense fallback={<LoadingSpinner />}><HODSignUp /></Suspense>,
      },
    ],
  },
];

export default routes;