import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SearchCourse from './components/SearchCourse';
import CourseView from './components/CourseView';
import VideoClass from './components/VideoClass';
import PublishCourse from './components/PublishCourse';
import PublishVideo from './components/PublishVideo';
import Chat from './components/Chat';
import SubjectDetails from './components/SubjectDetails';
import TeacherTopicView from './components/TeacherTopicView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/search" element={<SearchCourse />} />
          <Route path="/course/:id" element={<CourseView />} />
          <Route path="/video/:courseId/:videoId" element={<VideoClass />} />
          <Route path="/course/:subject/:level/:topic" element={<CourseView />} />
          <Route path="/teacher-topic/:subject/:level/:topic" element={<TeacherTopicView />} />
          <Route path="/publish-course" element={<PublishCourse />} />
          <Route path="/publish-video/:courseId" element={<PublishVideo />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/subject/:subjectKey/:levelKey" element={<SubjectDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;