import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LandingComponent } from './landing/landing.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './shared/auth.guard';
import { TutorGuard } from './shared/tutor/tutor.guard';
import { StudentGuard } from './shared/student/student.guard';
import { AdminGuard } from './shared/admin/admin.guard'; // 👈 Import AdminGuard
import { ClassroomManagementComponent } from './pages/classroom-management/classroom-management.component';
import { ClassroomDetailsComponent } from './classroom-details/classroom-details.component';
import { AssignmentsComponent } from './assignments/assignments.component';
import { TutorClassroomManagementComponent } from './pages/tutor-classroom-management/tutor-classroom-management.component';
import { AssignStudentsComponent } from './pages/assign-students/assign-students.component';
import { StudentClassroomsComponent } from './student-classrooms/student-classrooms.component';
import { StudentClassroomDetailComponent } from './student-classroom-detail/student-classroom-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'student-classrooms', component: StudentClassroomsComponent },

  

  { 
    path: 'classroom-management', 
    component: ClassroomManagementComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'classroom/:id', 
    component: ClassroomDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'student/classrooms/:id',
    component: StudentClassroomDetailComponent,
    canActivate: [AuthGuard] // if needed
  }
  
,  
  { 
    path: 'assignments', 
    component: AssignmentsComponent,
    canActivate: [AuthGuard]
  },
  { path: 'student/classrooms/:id', component: StudentClassroomDetailComponent },

  {
    path: 'learner-dashboard/my-classroom',
    loadComponent: () => import('./learner-dashboard/my-classroom/my-classroom.component').then(m => m.MyClassroomComponent)
  },

  { 
    path: 'classroom/:classroomId/assignments', 
    component: AssignmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'live-coding',
    loadComponent: () =>
      import('./live-coding/live-coding.component').then(m => m.LiveCodingComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Student routes
      {
        path: 'courses',
        canActivate: [AuthGuard, StudentGuard],
        loadComponent: () =>
          import('./courses/course-list/course-list.component')
            .then(m => m.CourseListComponent)
      },
      {
        path: 'courses/:id',
        canActivate: [AuthGuard, StudentGuard],
        loadComponent: () =>
          import('./courses/course-details/course-detail.component')
            .then(m => m.CourseDetailComponent)
      },
      {
        path: 'my-courses',
        canActivate: [AuthGuard, StudentGuard],
        loadComponent: () =>
          import('./courses/my-course/my-courses.component')
            .then(m => m.MyCoursesComponent)
      },
      {
        path: 'student-dashboard',
        canActivate: [AuthGuard, StudentGuard],
        loadComponent: () =>
          import('./dashboard/student/student-dashboard.component')
            .then(m => m.StudentDashboardComponent)
      },
      {
        path: 'student-progress',
        canActivate: [AuthGuard, StudentGuard],
        loadComponent: () =>
          import('./dashboard/student/student-progress/student-progress.component')
            .then(m => m.StudentProgressComponent)
      },

      // Tutor routes
      {
        path: 'tutor-dashboard',
        canActivate: [AuthGuard, TutorGuard],
        loadComponent: () =>
          import('./dashboard/tutor/tutor-dashboard.component')
            .then(m => m.TutorDashboardComponent)
      },
      {
        path: 'tutor-classrooms',
        canActivate: [AuthGuard, TutorGuard],
        component: TutorClassroomManagementComponent
      },
      {
        path: 'create-course',
        canActivate: [AuthGuard, TutorGuard],
        loadComponent: () =>
          import('./courses/create-course/create-course.component')
            .then(m => m.CreateCourseComponent)
      },
      {
        path: 'tutor-dashboard/course/:id',
        canActivate: [AuthGuard, TutorGuard],
        loadComponent: () =>
          import('./courses/manage-course/manage-course.component')
            .then(m => m.ManageCourseComponent)
      },
      {
        path: 'edit-course/:id',
        canActivate: [AuthGuard, TutorGuard],
        loadComponent: () =>
          import('./courses/edit-course/edit-course.component')
            .then(m => m.EditCourseComponent)
      },
      {
        path: 'tutor-progress',
        canActivate: [AuthGuard, TutorGuard],
        loadComponent: () =>
          import('./dashboard/tutor/tutor-progress/tutor-progress.component')
            .then(m => m.TutorProgressComponent)
      },

      // Admin route
      {
        path: 'admin-dashboard',
        canActivate: [AuthGuard, AdminGuard], // 👈 Admin-only access
        loadComponent: () =>
          import('./dashboard/admin/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },

      // Chatroom
      {
        path: 'community/chatroom',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./chatroom/chatroom.component').then(m => m.ChatroomComponent)
      },
    ]
  },
  {
    path: 'assign-students/:id',
    component: AssignStudentsComponent
  },
  { path: '**', redirectTo: 'welcome' }
];
