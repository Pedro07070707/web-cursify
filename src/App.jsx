import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SearchCourse from './components/SearchCourse';
import CourseRedirect from './components/CourseRedirect';
import StudentCourseView from './components/StudentCourseView';
import TeacherCourseView from './components/TeacherCourseView';
import VideoClass from './components/VideoClass';
import PublishCourse from './components/PublishCourse';
import PublishVideo from './components/PublishVideo';
import Chat from './components/Chat';
import SubjectDetails from './components/SubjectDetails';
import TeacherTopicView from './components/TeacherTopicView';
import AdminDashboard from './components/AdminDashboard';
import ChangePassword from './components/ChangePassword';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/search" element={<SearchCourse />} />
          <Route path="/course/:id" element={<CourseRedirect />} />
          <Route path="/course-view/:id" element={<CourseRedirect />} />
          <Route path="/student-course/:id" element={<StudentCourseView />} />
          <Route path="/teacher-course/:id" element={<TeacherCourseView />} />
          <Route path="/video/:courseId/:videoId" element={<VideoClass />} />
          <Route path="/course/:subject/:level/:topic" element={<CourseRedirect />} />
          <Route path="/teacher-topic/:subject/:level/:topic" element={<TeacherTopicView />} />
          <Route path="/publish-course" element={<PublishCourse />} />
          <Route path="/publish-video/:courseId" element={<PublishVideo />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/subject/:subjectKey/:levelKey" element={<SubjectDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;