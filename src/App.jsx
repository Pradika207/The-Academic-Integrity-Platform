import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip as RechartsTooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, AlertTriangle, CheckCircle, TrendingDown, TrendingUp,
  Calendar, BookOpen, Activity, Award, Bell,
  ChevronRight, Info, MessageSquare, MessageCircle, ShieldAlert, AlertCircle,
  ArrowUpRight, Clock, Sparkles, BrainCircuit, Heart, Fingerprint,
  Code2, Trophy, Zap, Star, User, Github, GraduationCap, Medal,
  Settings, Link, Trash2, Plus, Search, LogOut,
  Sparkle, Target, Brain, Lightbulb, ClipboardList, History
} from 'lucide-react';

import { students, calculateRiskScore, getStatusColor, getRiskLevel } from './data/mockData';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass-card stat-card-flex" style={{ borderLeft: `4px solid ${color}` }}>
    <div style={{ flex: 1 }}>
      <p className="text-bright text-xs font-black uppercase tracking-widest mb-1">{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h3 className="text-3xl font-black text-white">{value}</h3>
        {trend && <span className="trend-label" style={{ color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>}
      </div>
    </div>
    <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color }}>
      <Icon size={24} />
    </div>
  </div>
);

const PlatformCard = ({ name, icon: Icon, stats, color, logoColor, extra, trend = 'up', isLoading }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate a mock progress percentage based on stats
  const progressValue = useMemo(() => {
    const total = Object.values(stats).reduce((acc, curr) => {
      const val = typeof curr === 'number' ? curr : parseInt(curr) || 0;
      return acc + val;
    }, 0);
    return Math.min(Math.max((total / 1000) * 100, 20), 95); // Just a mock logic
  }, [stats]);

  const getProgressColor = (val) => {
    if (val > 80) return 'var(--success)';
    if (val > 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight size={10} />;
    if (trend === 'down') return <TrendingDown size={10} />;
    return <AlertTriangle size={10} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`glass-card platform-card ${isLoading ? 'opacity-80' : ''}`}
    >
      <div className="platform-header">
        <div className="platform-logo" style={{ backgroundColor: logoColor, boxShadow: `0 4px 12px ${logoColor}40` }}>
          {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Activity size={20} color="#fff" /></motion.div> : <Icon size={20} color="#fff" />}
        </div>
        <div className="flex-1">
          <h3 className="platform-name text-white">{name}</h3>
          <div className={`trend-indicator ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-low'}`}>
            {getTrendIcon()}
            <span>{trend === 'up' ? 'Growing' : trend === 'down' ? 'Declining' : 'Stable'}</span>
          </div>
        </div>
      </div>
      
      <div className="platform-stats">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="stat-item">
            <span className="stat-label">{label}</span>
            <span className="stat-value text-white">{value || 'N/A'}</span>
          </div>
        ))}
      </div>
      
      {extra && !isLoading && (
        <div className="platform-extra mt-3 pt-3 border-t border-white/5">
          {extra}
        </div>
      )}
      
      <div className="mt-auto pt-4">
        <div className="progress-label">
          <span>Expertise Level</span>
          <span className="progress-percent" style={{ color: getProgressColor(progressValue) }}>{isLoading ? '...' : `${Math.round(progressValue)}%`}</span>
        </div>
        <div className="platform-progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: (isLoaded && !isLoading) ? `${progressValue}%` : '0%', 
              backgroundColor: getProgressColor(progressValue),
              boxShadow: `0 0 10px ${getProgressColor(progressValue)}40`
            }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardSummary = ({ student }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="summary-container"
  >
    <div className="summary-item">
      <div className="summary-icon-box text-primary">
        <Zap size={20} />
      </div>
      <div className="summary-content">
        <p>Engagement Score</p>
        <span className="summary-value">88.4%</span>
      </div>
    </div>
    <div className="summary-item">
      <div className="summary-icon-box text-secondary">
        <Activity size={20} />
      </div>
      <div className="summary-content">
        <p>Active Platforms</p>
        <span className="summary-value">5/5</span>
      </div>
    </div>
    <div className="summary-item">
      <div className="summary-icon-box text-success">
        <Trophy size={20} />
      </div>
      <div className="summary-content">
        <p>Weekly Solved</p>
        <span className="summary-value">+34</span>
      </div>
    </div>
  </motion.div>
);

function App() {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddingComp, setIsAddingComp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', rank: '', year: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', status: 'In Progress' });
  const [isLoggedOut, setIsLoggedOut] = useState(true); // Default to login
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'student', or 'teacher'
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditingAcademics, setIsEditingAcademics] = useState(false);
  const [editedAcademics, setEditedAcademics] = useState({ cgpa: '', attendance: '' });
  const [teacherFeedback, setTeacherFeedback] = useState([]);
  const [selectedTeacherStudentId, setSelectedTeacherStudentId] = useState(null);
  const [newNote, setNewNote] = useState({ subject: 'Mathematics', content: '' });
  const [newFeedback, setNewFeedback] = useState({ subject: 'Programming', type: 'Performance', message: '', priority: 'Medium' });
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'cgpa'
  const [riskSearch, setRiskSearch] = useState('');





  const handleAddComp = () => {
    if (!newComp.name || !newComp.year) return;
    
    setSyncedData(prev => {
      const studentData = prev[selectedStudentId] || {};
      const currentComps = studentData.competitions || student.competitions || [];
      return {
        ...prev,
        [selectedStudentId]: {
          ...studentData,
          competitions: [...currentComps, newComp]
        }
      };
    });
    setNewComp({ name: '', rank: '', year: '' });
    setIsAddingComp(false);
  };

  const handleEditProfile = () => {
    setEditedProfile({
      name: student.name,
      role: student.role,
      bio: student.bio,
      department: student.department || 'N/A',
      year: student.year || 'N/A',
      skills: student.skills?.join(', ') || '',
      careerInterests: student.careerInterests?.join(', ') || '',
      cgpa: student.cgpa
    });
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    const profileToSave = {
      ...editedProfile,
      skills: typeof editedProfile.skills === 'string' ? editedProfile.skills.split(',').map(s => s.trim()).filter(Boolean) : editedProfile.skills,
      careerInterests: typeof editedProfile.careerInterests === 'string' ? editedProfile.careerInterests.split(',').map(s => s.trim()).filter(Boolean) : editedProfile.careerInterests
    };

    setSyncedData(prev => ({
      ...prev,
      [student.id]: {
        ...(prev[student.id] || {}),
        profileUpdates: profileToSave
      }
    }));
    setIsEditingProfile(false);
  };

  const handleDeleteComp = (index) => {
    setSyncedData(prev => {
      const studentData = prev[selectedStudentId] || {};
      const currentComps = studentData.competitions || student.competitions || [];
      const updatedComps = currentComps.filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedStudentId]: {
          ...studentData,
          competitions: updatedComps
        }
      };
    });
  };

  // Persistence logic
  const [syncedData, setSyncedData] = useState(() => {
    try {
      const saved = localStorage.getItem('studentPulseData');
      if (saved && saved !== '[object Object]') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Local storage corruption", e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('studentPulseData', JSON.stringify(syncedData));
      if (syncedData.teacherFeedback) setTeacherFeedback(syncedData.teacherFeedback);
    } catch (e) {
      console.error("Sync error", e);
    }
  }, [syncedData]);

  const processedStudents = useMemo(() => students.map(s => {
    const synced = syncedData[s.id] || {};
    const profile = synced.profileUpdates || {};
    const updatedStudent = {
      ...s,
      name: profile.name || s.name,
      role: profile.role || s.role,
      bio: profile.bio || s.bio,
      department: profile.department || s.department || 'N/A',
      year: profile.year || s.year || 'N/A',
      skills: profile.skills || s.skills || [],
      careerInterests: profile.careerInterests || s.careerInterests || [],
      cgpa: profile.cgpa || s.cgpa,
      attendance: profile.attendance || s.attendance,
      internalMarks: synced.internalMarks || s.internalMarks || [],
      projects: synced.projects || s.projects || [],
      handles: { ...s.handles, ...synced.handles },
      leetcode: { ...s.leetcode, ...(synced.leetcode || {}) },
      codeforces: { ...s.codeforces, ...(synced.codeforces || {}) },
      codechef: { ...s.codechef, ...(synced.codechef || {}) },
      github: { ...s.github, ...(synced.github || {}) },
      hackerrank: { ...s.hackerrank, ...(synced.hackerrank || {}) },
      behaviorScore: synced.behavior?.behaviorScore || s.behaviorScore,
      behaviorMetrics: synced.behavior?.behaviorMetrics || s.behaviorMetrics,
      competitions: synced.competitions || s.competitions || []
    };
    const riskScore = calculateRiskScore(updatedStudent);
    return {
      ...updatedStudent,
      riskScore,
      riskLevel: getRiskLevel(riskScore)
    };
  }).sort((a, b) => b.riskScore - a.riskScore), [syncedData]);

  const filteredRiskStudents = useMemo(() => {
    let result = [...processedStudents];
    
    // Apply Filters
    if (riskFilter === 'high') {
      result = result.filter(s => s.riskLevel === 'High Risk');
    }
    
    // Apply Search
    if (riskSearch) {
      result = result.filter(s => s.name.toLowerCase().includes(riskSearch.toLowerCase()));
    }
    
    // Apply Sorting for CGPA
    if (riskFilter === 'cgpa') {
      result = [...result].sort((a, b) => (a.cgpa || 0) - (b.cgpa || 0));
    } else {
      // Default to risk score sort (already done in processedStudents, but we might have new filtered list)
      result = [...result].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
    }
    
    return result;
  }, [processedStudents, riskFilter, riskSearch]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return [];
    return processedStudents.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedStudents, searchTerm]);


  const selectedStudent = useMemo(() =>
    processedStudents.find(s => s.id === selectedStudentId) || processedStudents[0],
    [selectedStudentId, processedStudents]
  );

  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState(false);

  useEffect(() => {
    const fetchLiveLeetCode = async () => {
      const handle = selectedStudent.handles?.leetcode;
      if (!handle) return;
      
      // Cache check: if we already have synced data for this handle within the last 5 mins
      const cached = syncedData[selectedStudent.id]?.leetcode;
      const lastSync = syncedData[selectedStudent.id]?.lastLcSync;
      const now = Date.now();
      
      if (cached && lastSync && (now - lastSync < 300000)) {
        return;
      }

      setLcLoading(true);
      setLcError(false);
      try {
        const response = await fetch(`/api/stats/leetcode/${handle}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        setSyncedData(prev => ({
          ...prev,
          [selectedStudent.id]: {
            ...(prev[selectedStudent.id] || {}),
            leetcode: data,
            lastLcSync: now
          }
        }));
      } catch (err) {
        console.error('LeetCode auto-sync failed:', err);
        setLcError(true);
      } finally {
        setLcLoading(false);
      }
    };

    if (selectedStudentId) {
      fetchLiveLeetCode();
    }
  }, [selectedStudentId, selectedStudent.handles?.leetcode]);


  const handleAddProject = () => {
    if (!newProject.title) return;
    const projectToAdd = {
      ...newProject,
      technologies: typeof newProject.technologies === 'string' ? newProject.technologies.split(',').map(t => t.trim()) : newProject.technologies
    };
    
    setSyncedData(prev => ({
      ...prev,
      [selectedStudentId]: {
        ...(prev[selectedStudentId] || {}),
        projects: [...(selectedStudent.projects || []), projectToAdd]
      }
    }));
    setNewProject({ title: '', description: '', technologies: '', status: 'In Progress' });
    setIsAddingProject(false);
  };

  const handleUpdateInternalMark = (subject, marks) => {
    setSyncedData(prev => {
      const studentData = prev[selectedStudentId] || {};
      const currentMarks = studentData.internalMarks || student.internalMarks || [];
      const updatedMarks = currentMarks.map(m => 
        m.subject === subject ? { ...m, marks: parseInt(marks) || 0 } : m
      );
      
      // If subject doesn't exist, add it
      if (!updatedMarks.find(m => m.subject === subject)) {
        updatedMarks.push({ subject, marks: parseInt(marks) || 0 });
      }

      return {
        ...prev,
        [selectedStudentId]: {
          ...studentData,
          internalMarks: updatedMarks
        }
      };
    });
  };

  const syncStats = async () => {
    if (!selectedStudent.handles || Object.values(selectedStudent.handles).every(v => !v)) {
      alert('Please enter at least one handle in the settings below!');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/student-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ handles: selectedStudent.handles })
      });

      if (!response.ok) throw new Error('Server returned an error');

      const data = await response.json();
      setSyncedData(prev => ({
        ...prev,
        [selectedStudent.id]: {
          ...(prev[selectedStudent.id] || {}),
          ...data
        }
      }));
      console.log('Synced Data:', data);
    } catch (err) {
      console.error('Sync failed:', err);
      alert('Sync failed - make sure the backend server (npm run server) is running!');
    } finally {
      setIsSyncing(false);
    }
  };


  const saveNote = () => {
    if (!newNote.content || !selectedTeacherStudentId) return;
    const noteEntry = {
      ...newNote,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      teacher: "Prof. Smith"
    };

    setSyncedData(prev => {
      const studentData = prev[selectedTeacherStudentId] || {};
      const currentNotes = studentData.notes || [];
      return {
        ...prev,
        [selectedTeacherStudentId]: {
          ...studentData,
          notes: [noteEntry, ...currentNotes]
        }
      };
    });
    setNewNote({ ...newNote, content: '' });
  };

  const submitFeedback = () => {
    if (!newFeedback.message || !selectedTeacherStudentId) return;
    const feedbackEntry = {
      ...newFeedback,
      id: Date.now(),
      studentId: selectedTeacherStudentId,
      studentName: students.find(s => s.id === selectedTeacherStudentId)?.name || 'Unknown',
      date: new Date().toLocaleDateString(),
      teacher: "Prof. Smith"
    };

    setSyncedData(prev => {
      const currentFeedback = prev.teacherFeedback || [];
      return {
        ...prev,
        teacherFeedback: [feedbackEntry, ...currentFeedback]
      };
    });
    setNewFeedback({ subject: 'Programming', type: 'Performance', message: '', priority: 'Medium' });
    alert('Feedback sent to Admin successfully!');
  };

  // Merge synced data with students
  const student = useMemo(() => {
    const s = selectedStudent;
    const synced = syncedData[s.id] || {};

    return {
      ...s,
      leetcode: { ...s.leetcode, ...(synced.leetcode || {}) },
      codeforces: { ...s.codeforces, ...(synced.codeforces || {}) },
      codechef: { ...s.codechef, ...(synced.codechef || {}) },
      github: { ...s.github, ...(synced.github || {}) },
      hackerrank: { ...s.hackerrank, ...(synced.hackerrank || {}) },
      behaviorScore: synced.behavior?.behaviorScore || s.behaviorScore,
      behaviorMetrics: synced.behavior?.behaviorMetrics || s.behaviorMetrics,
      competitions: synced.competitions || s.competitions || []
    };
  }, [selectedStudent, syncedData]);


  const cohortAverages = useMemo(() => {
    const count = processedStudents.length;
    return {
      attendance: Math.round(processedStudents.reduce((acc, s) => acc + s.attendance, 0) / count),
      leetcode: Math.round(processedStudents.reduce((acc, s) => acc + s.leetcode.solved, 0) / count),
      codeforces: Math.round(processedStudents.reduce((acc, s) => acc + s.codeforces.rating, 0) / count),
      codechef: Math.round(processedStudents.reduce((acc, s) => acc + s.codechef.rating, 0) / count)
    };
  }, [processedStudents]);

  const comparisonData = useMemo(() => [
    { name: 'Attendance', Student: student.attendance, Cohort: cohortAverages.attendance },
    { name: 'LeetCode', Student: (student.leetcode.solved / 600) * 100, Cohort: (cohortAverages.leetcode / 600) * 100 },
    { name: 'Codeforces', Student: (student.codeforces.rating / 2500) * 100, Cohort: (cohortAverages.codeforces / 2500) * 100 },
    { name: 'CodeChef', Student: (student.codechef.rating / 3000) * 100, Cohort: (cohortAverages.codechef / 3000) * 100 },
  ], [student, cohortAverages]);

  const behaviorData = useMemo(() => [
    { subject: 'Adaptive Thinking', A: student.behaviorMetrics.leadership, fullMark: 100 },
    { subject: 'Social Synergy', A: student.behaviorMetrics.teamwork, fullMark: 100 },
    { subject: 'Engagement Velocity', A: student.behaviorMetrics.punctuality, fullMark: 100 },
    { subject: 'Digital Presence', A: student.behaviorMetrics.communication, fullMark: 100 },
    { subject: 'Cognitive Load', A: student.behaviorScore, fullMark: 100 },
  ], [student]);


  const getRecommendations = (student) => {
    const recs = [];
    if (student.attendance < 85) recs.push({ icon: Calendar, text: "Focus on morning sessions to improve attendance above 90%", priority: "High" });
    if (student.leetcode.solved < 30) recs.push({ icon: Code2, text: "Solve 5 more medium problems on LeetCode this week", priority: "Medium" });
    if (student.cgpa < 8.0) recs.push({ icon: GraduationCap, text: "Review Mathematics and Science internal marks for better CGPA", priority: "High" });
    if (student.projects?.length < 2) recs.push({ icon: Target, text: "Start a new project in React or Python to boost your portfolio", priority: "Medium" });
    if (student.behaviorScore < 80) recs.push({ icon: Heart, text: "Participate more in Cohort discussions to improve Social Synergy", priority: "Low" });
    return recs;
  };

  if (isLoggedOut) {
    return (
      <div className="login-overlay">
        <div className="glass-card login-card animate-in fade-in zoom-in-95 duration-500">
          <div className="header-logo mb-8 justify-center">
            <Fingerprint size={48} className="text-primary animate-pulse" />
            <h1 className="logo-text text-3xl">STUDENT<span>PULSE</span></h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">Identity Portal</h2>
            
            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
              <button 
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${userRole === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-dim hover:text-white'}`}
                onClick={() => setUserRole('admin')}
              >
                ADMIN
              </button>
              <button 
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${userRole === 'teacher' ? 'bg-primary text-white shadow-lg' : 'text-dim hover:text-white'}`}
                onClick={() => setUserRole('teacher')}
              >
                TEACHER
              </button>
              <button 
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${userRole === 'student' ? 'bg-primary text-white shadow-lg' : 'text-dim hover:text-white'}`}
                onClick={() => setUserRole('student')}
              >
                STUDENT
              </button>
            </div>

            <div className="input-group">
              <label>
                {userRole === 'admin' ? 'Admin Credential' : 
                 userRole === 'teacher' ? 'Teacher ID' : 'Student ID'}
              </label>
              <input 
                type="text" 
                placeholder={
                  userRole === 'admin' ? "Admin Username" : 
                  userRole === 'teacher' ? "e.g. TCH2026-001" : "e.g. STU2026-001"
                } 
                defaultValue={
                  userRole === 'admin' ? "ADMIN_ROOT" : 
                  userRole === 'teacher' ? "TEACHER_PRO" : "STUDENT_001"
                } 
              />
            </div>
            <div className="input-group">
              <label>Secure Token / Password</label>
              <input type="password" placeholder="••••••••" defaultValue="password" />
            </div>

            {userRole === 'student' && (
              <div className="input-group">
                <label>Select Student Identity (Demo)</label>
                <select 
                  className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map(s => <option key={s.id} value={s.id} className="bg-bg-darker">{s.name}</option>)}
                </select>
              </div>
            )}

            <button 
              className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              onClick={() => setIsLoggedOut(false)}
            >
              Initialize Dashboard
            </button>
            <p className="text-[10px] text-dim text-center mt-4 uppercase tracking-widest">
              Biometric Encryption Active • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (

    <div className="app-container">

      {/* Main Content */}
      <main className="app-main">
        <header className="content-header">
          <div className="header-left">
            <div className="header-logo">
              <Fingerprint size={32} className="text-primary" />
              <h1 className="logo-text">STUDENT<span>PULSE</span></h1>
            </div>

            <nav className="header-nav">
              <button
                className={`header-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span>{userRole === 'teacher' ? 'Overview' : 'Dashboard'}</span>
              </button>
              {userRole === 'admin' ? (
                <>
                  <button
                    className={`header-nav-item ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                  >
                    <span>Cohort</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    <span>Analytics</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'feedback-center' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedback-center')}
                  >
                    <span>Feedback Admin</span>
                  </button>
                </>
              ) : userRole === 'teacher' ? (
                <>
                  <button
                    className={`header-nav-item ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                  >
                    <span>Students</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'subject-notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subject-notes')}
                  >
                    <span>Subject Notes</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'feedback-center' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedback-center')}
                  >
                    <span>Feedback Center</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'risk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('risk')}
                  >
                    <span>Risk Alerts</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    <span>Analytics</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`header-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <span>My Profile</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                  >
                    <span>Projects</span>
                  </button>
                  <button
                    className={`header-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <span>Settings</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {userRole === 'admin' && (
            <div className="header-center" style={{ flex: 1, padding: '0 2rem', position: 'relative' }}>
              <div className="search-bar-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
                {showSearchResults && filteredStudents.length > 0 && (
                  <div className="search-results-dropdown glass-card animate-in fade-in zoom-in-95 duration-200">
                    {filteredStudents.map(s => (
                      <div 
                        key={s.id} 
                        className="search-result-item"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSearchTerm('');
                          setShowSearchResults(false);
                          setActiveTab('overview');
                        }}
                      >
                        <div className="result-avatar mini-placeholder">
                          <User size={12} />
                        </div>
                        <div className="result-info">
                          <p className="result-name">{s.name}</p>
                          <p className="result-meta">{s.role}</p>
                        </div>
                        <div className="result-risk-tag" style={{ color: getStatusColor(s.riskScore) }}>
                          {s.riskLevel}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showSearchResults && searchTerm && filteredStudents.length === 0 && (
                  <div className="search-results-dropdown glass-card p-4 text-center text-dim text-xs">
                    No students found for "{searchTerm}"
                  </div>
                )}
              </div>
              {showSearchResults && searchTerm && (
                <div 
                  className="fixed inset-0 z-[-1]" 
                  onClick={() => setShowSearchResults(false)}
                ></div>
              )}
            </div>
          )}


          <div className="header-actions">
            <div className="header-user">
              <div className="mini-avatar">
                {userRole === 'admin' ? 'AD' : userRole === 'teacher' ? 'TR' : student.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-details">
                <p className="user-name">
                  {userRole === 'admin' ? 'Admin Dashboard' : userRole === 'teacher' ? 'Teacher Portal' : student.name}
                </p>
                <p className="user-role">
                  {userRole === 'admin' ? 'Principal Investigator' : userRole === 'teacher' ? 'Faculty Member' : student.role}
                </p>
              </div>
              <button 
                className="ml-4 p-2 text-dim hover:text-danger transition-colors bg-white/5 rounded-lg tooltip-wrapper"
                onClick={() => {
                    setIsLoggedOut(true);
                    setIsEditingProfile(false);
                    setIsEditingAcademics(false);
                    setActiveTab('overview');
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {userRole === 'student' ? (
          <div className="dashboard-content animate-in fade-in duration-700">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Risk Alert Banner for Student */}
                {student.riskLevel !== 'Low Risk' && (
                  <div className="risk-banner animate-in fade-in slide-in-from-top-4 duration-500" style={{ backgroundColor: `${getStatusColor(student.riskScore)}15`, borderColor: getStatusColor(student.riskScore) }}>
                    <ShieldAlert className="risk-icon" style={{ color: getStatusColor(student.riskScore) }} />
                    <div className="risk-banner-content">
                      <h4 style={{ color: getStatusColor(student.riskScore) }}>{student.riskLevel} Status</h4>
                      <p>Your current academic indicators suggest you might need support. Check the AI recommendations below.</p>
                    </div>
                    <button className="risk-action-btn" style={{ backgroundColor: getStatusColor(student.riskScore) }} onClick={() => setActiveTab('profile')}>Update Academic Profile</button>
                  </div>
                )}

                <div className="main-grid">
                  <div className="left-column space-y-6">
                    {/* Profile Banner with Edit Toggle */}
                    <div className="glass-card profile-banner group">
                      <div className="banner-content">
                        <div className="profile-large-placeholder">
                          <User size={48} />
                        </div>
                        <div className="profile-info flex-1">
                          {isEditingProfile ? (
                            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                              <input 
                                className="bg-white/5 border border-white/10 rounded p-1 w-full text-xl font-bold text-white"
                                value={editedProfile.name}
                                onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                                placeholder="Name"
                              />
                              <input 
                                className="bg-white/5 border border-white/10 rounded p-1 text-xs w-full text-primary font-bold"
                                value={editedProfile.role}
                                onChange={e => setEditedProfile({...editedProfile, role: e.target.value})}
                                placeholder="Role/Position"
                              />
                              <textarea 
                                className="bg-white/5 border border-white/10 rounded p-1 w-full text-xs h-16 text-dim"
                                value={editedProfile.bio}
                                onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                                placeholder="Tell us about yourself..."
                              />
                              <div className="flex gap-2">
                                <button onClick={saveProfile} className="bg-primary px-3 py-1 rounded text-xs font-bold text-white">💾 Save Changes</button>
                                <button onClick={() => setIsEditingProfile(false)} className="bg-white/10 px-3 py-1 rounded text-xs text-dim">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h2 className="profile-name text-xl font-black text-white">{student.name}</h2>
                                  <p className="text-primary font-bold text-[10px] uppercase tracking-widest">{student.role}</p>
                                </div>
                                <button 
                                  onClick={handleEditProfile}
                                  className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2"
                                >
                                  ✏️ EDIT PROFILE
                                </button>
                              </div>
                              <p className="profile-bio text-xs text-dim leading-relaxed mb-4 line-clamp-2">{student.bio}</p>
                              <div className="flex gap-4 p-3 bg-white/2 rounded-xl border border-white/5">
                                <div className="text-center flex-1">
                                    <p className="text-[9px] text-dim uppercase">CGPA</p>
                                    <p className="text-sm font-black text-white">{student.cgpa}</p>
                                </div>
                                <div className="w-px bg-white/5"></div>
                                <div className="text-center flex-1">
                                    <p className="text-[9px] text-dim uppercase">Attend</p>
                                    <p className="text-sm font-black text-secondary">{student.attendance}%</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Platform Stats Summary */}
                    <div className="flex justify-between items-center mb-0 mt-2">
                      <h3 className="section-subtitle">Technical Skill Analytics</h3>
                      <button className="sync-btn scale-90" onClick={syncStats} disabled={isSyncing}>
                        <Activity size={12} />
                        <span>{isSyncing ? '...' : 'Sync'}</span>
                      </button>
                    </div>
                    
                    <DashboardSummary student={student} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PlatformCard
                        name="LeetCode"
                        icon={Code2}
                        color="#ffa116"
                        logoColor="#ffa116"
                        isLoading={lcLoading}
                        stats={{
                          Solved: lcError ? 'Retry' : (student.leetcode.solved || '0'),
                          Easy: student.leetcode.easy || 0,
                          Med: student.leetcode.medium || 0,
                          Hard: student.leetcode.hard || 0,
                          Rank: student.leetcode.rank || 'N/A'
                        }}
                        extra={
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-[10px]">
                              <span className="text-dim uppercase font-black">Acceptance</span>
                              <span className="text-white font-bold">{student.leetcode.acceptanceRate || 'N/A'}</span>
                            </div>
                            {student.leetcode.recentSubmissions?.length > 0 && (
                              <div className="text-[9px] mt-2">
                                <p className="text-dim uppercase font-black mb-1">Recent Submits:</p>
                                {student.leetcode.recentSubmissions.slice(0, 2).map((sub, i) => (
                                  <div key={i} className="flex justify-between items-center bg-white/2 p-1 rounded mb-1">
                                    <span className="truncate w-24 text-white opacity-80">{sub.title}</span>
                                    <span className={sub.status === 'Accepted' ? 'text-success' : 'text-danger'}>{sub.status === 'Accepted' ? 'AC' : 'WA'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        }
                        trend="up"
                      />

                      <PlatformCard
                        name="Codeforces"
                        icon={Trophy}
                        color="#1a8fff"
                        logoColor="#1a8fff"
                        stats={{
                          Rating: student.codeforces.rating,
                          Rank: student.codeforces.rank,
                          Max: student.codeforces.maxRating,
                        }}
                        trend="up"
                      />

                      <PlatformCard
                        name="CodeChef"
                        icon={Award}
                        color="#5b4638"
                        logoColor="#5b4638"
                        stats={{
                          Rating: student.codechef.rating,
                          Stars: student.codechef.stars,
                          Solved: student.codechef.solved,
                          'Global Rank': student.codechef.globalRank || 'N/A',
                        }}
                        trend="up"
                      />

                      <PlatformCard
                        name="HackerRank"
                        icon={Star}
                        color="#2ec866"
                        logoColor="#2ec866"
                        stats={{
                          Solved: student.hackerrank.solved,
                          Badges: student.hackerrank.badges,
                          Rank: student.hackerrank.rank,
                          'Skill Rank': student.hackerrank.skillRank || 'N/A'
                        }}
                        trend="active"
                      />

                      <PlatformCard
                        name="GitHub"
                        icon={Github}
                        color="#333"
                        logoColor="#333"
                        stats={{
                          Repos: student.github.repos,
                          Stars: student.github.stars,
                          Followers: student.github.followers,
                          Location: student.github.location
                        }}
                        trend="up"
                      />
                    </div>
                  </div>

                  <div className="right-column space-y-6">
                    {/* Stat Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatCard title="Overall Attendance" value={`${student.attendance}%`} icon={Calendar} color="#8b5cf6" trend={2.4} />
                      <StatCard title="Risk Status" value={student.riskLevel} icon={AlertTriangle} color={getStatusColor(student.riskScore)} />
                    </div>

                    {/* Subject Mastery Mini Matrix */}
                    <div className="glass-card">
                      <h3 className="card-title mb-4 flex items-center gap-2">
                        <BookOpen size={16} className="text-secondary" />
                        Mastery Matrix
                      </h3>
                      <div className="space-y-3">
                        {student.internalMarks?.slice(0, 4).map((mark, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] px-1">
                              <span className="text-dim uppercase font-black">{mark.subject}</span>
                              <span className="font-bold">{mark.marks}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-secondary rounded-full" style={{ width: `${mark.marks}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="glass-card">
                      <h3 className="card-title mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-warning" />
                        AI Performance Sync
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getRecommendations(student).slice(0, 2).map((rec, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white/2 rounded-xl border border-white/5">
                            <div className="p-2 rounded-lg bg-white/5 text-primary h-fit">
                              <rec.icon size={14} />
                            </div>
                            <p className="text-[10px] leading-tight text-white">{rec.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Profile Card */}
                <div className="glass-card profile-banner">
                  <div className="banner-content flex-col items-center text-center">
                    <div className="profile-large-placeholder mb-4">
                      <User size={64} />
                    </div>
                    {isEditingProfile ? (
                        <div className="space-y-3 p-4 bg-white/5 rounded-2xl w-full">
                          <input 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm"
                            value={editedProfile.name}
                            onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                            placeholder="Full Name"
                          />
                           <input 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm"
                            value={editedProfile.role}
                            onChange={e => setEditedProfile({...editedProfile, role: e.target.value})}
                            placeholder="Current Role"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm"
                              value={editedProfile.department}
                              onChange={e => setEditedProfile({...editedProfile, department: e.target.value})}
                              placeholder="Department"
                            />
                            <input 
                              className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm"
                              value={editedProfile.year}
                              onChange={e => setEditedProfile({...editedProfile, year: e.target.value})}
                              placeholder="Year"
                            />
                          </div>
                          <textarea 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm h-16"
                            value={editedProfile.bio}
                            onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                            placeholder="Academic Bio"
                          />
                           <input 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm"
                            value={editedProfile.skills}
                            onChange={e => setEditedProfile({...editedProfile, skills: e.target.value})}
                            placeholder="Skills (comma separated)"
                          />
                          <input 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white text-sm"
                            value={editedProfile.careerInterests}
                            onChange={e => setEditedProfile({...editedProfile, careerInterests: e.target.value})}
                            placeholder="Career Interests"
                          />
                          <div className="flex gap-2">
                            <button onClick={saveProfile} className="flex-1 bg-primary py-2 rounded-lg text-xs font-bold text-white">Save Changes</button>
                            <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-white/10 py-2 rounded-lg text-xs text-dim">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="profile-name text-2xl">{student.name}</h2>
                          <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{student.role}</p>
                          
                          <div className="flex justify-center gap-4 mt-4 py-2 border-y border-white/5">
                            <div className="text-center">
                              <p className="text-[10px] text-dim uppercase">Dept</p>
                              <p className="text-xs font-bold">{student.department}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-dim uppercase">Year</p>
                              <p className="text-xs font-bold">{student.year}</p>
                            </div>
                          </div>

                          <p className="profile-bio mt-4 text-sm px-4 leading-relaxed">{student.bio}</p>
                          
                          <div className="mt-6 space-y-4 px-4 text-left">
                            <div>
                              <p className="text-[9px] text-dim uppercase font-black mb-2">Key Competencies</p>
                              <div className="flex flex-wrap gap-1.5">
                                {student.skills?.map((skill, i) => (
                                  <span key={i} className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">{skill}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] text-dim uppercase font-black mb-2">Career Focus</p>
                              <div className="flex flex-wrap gap-1.5">
                                {student.careerInterests?.map((interest, i) => (
                                  <span key={i} className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-md">{interest}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center gap-2 mt-8">
                            <button onClick={handleEditProfile} className="bg-primary/20 text-primary border border-primary/30 px-6 py-2 rounded-xl text-xs font-bold hover:bg-primary transition-all hover:text-white">Edit Profile</button>
                          </div>
                        </>
                      )}
                  </div>
                </div>

                {/* Academic Metrics & Scores */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card">
                    <h3 className="card-title mb-6 flex items-center gap-2">
                       <GraduationCap size={18} className="text-primary" />
                       Performance Indicators
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isEditingAcademics ? (
                        <div className="col-span-2 space-y-3 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="input-group">
                              <label className="text-[10px] text-dim uppercase font-black">Current CGPA</label>
                              <input 
                                type="number" 
                                step="0.01" 
                                className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white"
                                value={editedAcademics.cgpa}
                                onChange={e => setEditedAcademics({...editedAcademics, cgpa: e.target.value})}
                              />
                            </div>
                            <div className="input-group">
                              <label className="text-[10px] text-dim uppercase font-black">Attendance (%)</label>
                              <input 
                                type="number" 
                                className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white"
                                value={editedAcademics.attendance}
                                onChange={e => setEditedAcademics({...editedAcademics, attendance: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button 
                              className="flex-1 bg-secondary py-2 rounded-lg text-xs font-bold text-white"
                              onClick={() => {
                                setSyncedData(prev => ({
                                  ...prev,
                                  [selectedStudentId]: {
                                    ...(prev[selectedStudentId] || {}),
                                    profileUpdates: { 
                                      ...(prev[selectedStudentId]?.profileUpdates || {}), 
                                      cgpa: editedAcademics.cgpa,
                                      attendance: editedAcademics.attendance
                                    }
                                  }
                                }));
                                setIsEditingAcademics(false);
                              }}
                            >
                              Update Scores
                            </button>
                            <button onClick={() => setIsEditingAcademics(false)} className="flex-1 bg-white/10 py-2 rounded-lg text-xs text-dim">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-dim uppercase font-black mb-1">Academic Standing</p>
                            <div className="flex justify-between items-baseline">
                              <span className="text-2xl font-black text-primary">{student.cgpa}</span>
                              <span className="text-[10px] text-success font-bold">+0.2 from last sem</span>
                            </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-dim uppercase font-black mb-1">Attendance Trend</p>
                            <div className="flex justify-between items-baseline">
                              <span className="text-2xl font-black text-secondary">{student.attendance}%</span>
                              <span className="text-[10px] text-dim font-bold">Total Sessions</span>
                            </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-dim uppercase font-black mb-1">Risk Assessment</p>
                            <span className="risk-tag mt-1 block w-fit" style={{ 
                              backgroundColor: `${getStatusColor(student.riskScore)}20`, 
                              color: getStatusColor(student.riskScore) 
                            }}>{student.riskLevel}</span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                            <button 
                              onClick={() => {
                                setEditedAcademics({ cgpa: student.cgpa, attendance: student.attendance });
                                setIsEditingAcademics(true);
                              }}
                              className="text-[10px] font-black text-primary hover:text-white transition-all uppercase tracking-widest"
                            >
                              Edit Academic Data
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                    <div className="glass-card">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="card-title">Internal Assessment History</h3>
                        {isEditingAcademics && (
                          <button 
                            onClick={() => {
                              const sub = prompt('Enter new subject name:');
                              if (sub) handleUpdateInternalMark(sub, 0);
                            }}
                            className="text-[10px] font-black text-success hover:text-white transition-all uppercase tracking-widest border border-success/30 px-2 py-1 rounded"
                          >
                            + Add Subject
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {student.internalMarks?.map((mark, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <span className="text-[11px] font-bold text-dim w-24 truncate">{mark.subject}</span>
                            {isEditingAcademics ? (
                               <input 
                                 type="number" 
                                 className="bg-bg-darker border border-white/10 rounded p-1 w-16 text-xs text-center text-white"
                                 value={mark.marks}
                                 onChange={e => handleUpdateInternalMark(mark.subject, e.target.value)}
                               />
                            ) : (
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/40" style={{ width: `${mark.marks}%` }}></div>
                              </div>
                            )}
                            {!isEditingAcademics && (
                                <span className="text-xs font-black w-12 text-right">{mark.marks}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {activeTab === 'projects' && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white">Innovation Lab</h3>
                    <p className="text-dim text-sm">Manage and showcase your academic and personal projects.</p>
                  </div>
                  <button onClick={() => setIsAddingProject(!isAddingProject)} className="bg-success text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-success/80 transition-all">
                    <Plus size={16} /> ADD NEW PROJECT
                  </button>
                </div>

                {isAddingProject && (
                  <div className="glass-card border-success/30 animate-in zoom-in-95 duration-200">
                    <h4 className="card-title mb-4">Project Blueprint</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        className="bg-bg-darker border border-white/10 rounded-lg p-2 text-sm col-span-2"
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      />
                      <textarea 
                        className="bg-bg-darker border border-white/10 rounded-lg p-2 text-sm h-24 col-span-2"
                        placeholder="Project Mission & Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      />
                      <input 
                        className="bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                        placeholder="Technology Stack (e.g. React, Node, SQL)"
                        value={newProject.technologies}
                        onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                      />
                      <select 
                        className="bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                      >
                        <option value="Idea">Idea Stage</option>
                        <option value="In Progress">Development</option>
                        <option value="Completed">Live / Published</option>
                      </select>
                      <button 
                        className="bg-success text-white text-sm font-bold py-3 rounded-lg col-span-2 hover:opacity-90 transition-all mt-2"
                        onClick={handleAddProject}
                      >
                        Deploy Project Record
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {student.projects?.map((proj, i) => (
                    <div key={i} className="glass-card group hover:border-primary/50 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Code2 size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${proj.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                          {proj.status}
                        </span>
                      </div>
                      <h4 className="font-black text-lg text-white mb-2">{proj.title}</h4>
                      <p className="text-xs text-dim mb-6 line-clamp-3 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {proj.technologies?.map((tech, j) => (
                          <span key={j} className="text-[10px] bg-white/5 border border-white/5 py-1 px-3 rounded-lg text-dim font-bold">{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {student.projects?.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card border-dashed">
                      <p className="text-dim italic">Your innovation portfolio is empty. Add your first project to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto">
                 <div className="glass-card">
                  <h3 className="card-title mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-primary" />
                    Student Configuration
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-dim uppercase mb-4 tracking-widest">Platform Connectivity</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                          <label className="text-[10px] text-dim uppercase">LeetCode Username</label>
                          <input 
                            type="text" 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white"
                            value={selectedStudent.handles?.leetcode || ''} 
                            placeholder="e.g. mubeen_dev"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSyncedData(prev => ({
                                ...prev,
                                [selectedStudent.id]: { 
                                  ...(prev[selectedStudent.id] || {}),
                                  handles: { ...(selectedStudent.handles || {}), leetcode: val } 
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="input-group">
                          <label className="text-[10px] text-dim uppercase">GitHub Username</label>
                          <input 
                            type="text" 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white"
                            value={selectedStudent.handles?.github || ''} 
                            placeholder="e.g. mubeen-dev"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSyncedData(prev => ({
                                ...prev,
                                [selectedStudent.id]: { 
                                  ...(prev[selectedStudent.id] || {}),
                                  handles: { ...(selectedStudent.handles || {}), github: val } 
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="input-group">
                          <label className="text-[10px] text-dim uppercase">Codeforces Username</label>
                          <input 
                            type="text" 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white"
                            value={selectedStudent.handles?.codeforces || ''} 
                            placeholder="e.g. mubeen_cf"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSyncedData(prev => ({
                                ...prev,
                                [selectedStudent.id]: { 
                                  ...(prev[selectedStudent.id] || {}),
                                  handles: { ...(selectedStudent.handles || {}), codeforces: val } 
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="input-group">
                          <label className="text-[10px] text-dim uppercase">CodeChef Handle</label>
                          <input 
                            type="text" 
                            className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-white"
                            value={selectedStudent.handles?.codechef || ''} 
                            placeholder="e.g. mubeen_chef"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSyncedData(prev => ({
                                ...prev,
                                [selectedStudent.id]: { 
                                  ...(prev[selectedStudent.id] || {}),
                                  handles: { ...(selectedStudent.handles || {}), codechef: val } 
                                }
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                       <h4 className="text-xs font-black text-dim uppercase mb-4 tracking-widest">System Preferences</h4>
                       <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div>
                            <p className="text-sm font-bold text-white">Email Notifications</p>
                            <p className="text-[10px] text-dim">Receive performance alerts and AI suggestions</p>
                          </div>
                          <div className="w-10 h-6 bg-primary rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                          </div>
                       </div>
                    </div>

                    <button className="w-full bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-black text-danger hover:bg-danger/10 transition-all mt-4">
                      RESET ALL LOCAL DATA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {userRole === 'admin' && (
              <>
                {/* Admin Navigator */}
                <nav className="header-nav mx-auto mb-8 justify-center flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
                    <button className={`header-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>Dashboard</span></button>
                    <button className={`header-nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><span>Cohort Matrix</span></button>
                    <button className={`header-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><span>Analytics Insights</span></button>
                </nav>
              </>
            )}

            {userRole === 'admin' && activeTab === 'overview' && (

          <div className="dashboard-content">
            {/* Top Stat Grid */}
            <div className="stat-grid">
              <StatCard title="Overall Attendance" value={`${student.attendance}%`} icon={Calendar} color="#8b5cf6" trend={2.4} />
              <StatCard title="CGPA" value={student.cgpa} icon={GraduationCap} color="#06b6d4" trend={0.5} />
              <StatCard title="Risk Level" value={student.riskLevel} icon={AlertTriangle} color={getStatusColor(student.riskScore)} />
            </div>

            {/* Risk Alert Banner */}
            {student.riskLevel !== 'Low Risk' && (
              <div className="risk-banner animate-in fade-in slide-in-from-top-4 duration-500" style={{ backgroundColor: `${getStatusColor(student.riskScore)}15`, borderColor: getStatusColor(student.riskScore) }}>
                <ShieldAlert className="risk-icon" style={{ color: getStatusColor(student.riskScore) }} />
                <div className="risk-banner-content">
                  <h4 style={{ color: getStatusColor(student.riskScore) }}>{student.riskLevel} Warning</h4>
                  <p>Student performance indicators suggest immediate intervention is needed in academic tracking.</p>
                </div>
                <button className="risk-action-btn" style={{ backgroundColor: getStatusColor(student.riskScore) }}>View Recommendations</button>
              </div>
            )}


            <div className="main-grid">
              {/* Profile & Platforms */}
              <div className="left-column">
                <div className="glass-card profile-banner group">
                  <div className="banner-content">
                    <div className="profile-large-placeholder">
                      <User size={48} />
                    </div>
                    <div className="profile-info flex-1">
                      {isEditingProfile ? (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                          <input 
                            className="bg-white/5 border border-white/10 rounded p-1 w-full text-xl font-bold"
                            value={editedProfile.name}
                            onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                          />
                          <div className="flex gap-2">
                            <input 
                              className="bg-white/5 border border-white/10 rounded p-1 text-xs w-20"
                              value={editedProfile.cgpa}
                              onChange={e => setEditedProfile({...editedProfile, cgpa: e.target.value})}
                              placeholder="CGPA"
                            />
                            <input 
                              className="bg-white/5 border border-white/10 rounded p-1 text-xs flex-1"
                              value={editedProfile.role}
                              onChange={e => setEditedProfile({...editedProfile, role: e.target.value})}
                              placeholder="Role"
                            />
                          </div>
                          <textarea 
                            className="bg-white/5 border border-white/10 rounded p-1 w-full text-xs h-16"
                            value={editedProfile.bio}
                            onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                          />
                          <div className="flex gap-2">
                            <button onClick={saveProfile} className="bg-primary px-3 py-1 rounded text-xs font-bold">Save</button>
                            <button onClick={() => setIsEditingProfile(false)} className="bg-white/10 px-3 py-1 rounded text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="profile-name text-xl font-black text-white">{student.name}</h2>
                                <p className="text-primary font-bold text-[10px] uppercase tracking-widest">{student.role}</p>
                            </div>
                            <button 
                              onClick={handleEditProfile}
                              className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2"
                            >
                              <Settings size={12} /> EDIT PROFILE
                            </button>
                          </div>
                          <p className="profile-bio text-xs text-dim leading-relaxed mb-4">{student.bio}</p>
                          <div className="flex gap-4 p-3 bg-white/2 rounded-xl border border-white/5">
                            <div className="text-center flex-1">
                                <p className="text-[9px] text-dim uppercase">CGPA</p>
                                <p className="text-sm font-black text-white">{student.cgpa}</p>
                            </div>
                            <div className="w-px bg-white/5"></div>
                            <div className="text-center flex-1">
                                <p className="text-[9px] text-dim uppercase">Attendance</p>
                                <p className="text-sm font-black text-secondary">{student.attendance}%</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h3 className="section-subtitle">Technical Skill Analytics</h3>
                  <button
                    className={`sync-btn ${isSyncing ? 'syncing' : ''}`}
                    onClick={syncStats}
                    disabled={isSyncing}
                  >
                    <Activity size={16} />
                    <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
                  </button>
                </div>

                <DashboardSummary student={student} />

                <div className="platform-grid">
                  <PlatformCard
                    name="LeetCode"
                    icon={Code2}
                    color="#ffa116"
                    logoColor="#ffa116"
                    isLoading={lcLoading}
                    stats={{
                      Solved: lcError ? 'Retry' : (student.leetcode.solved || '0'),
                      Easy: student.leetcode.easy || 0,
                      Med: student.leetcode.medium || 0,
                      Hard: student.leetcode.hard || 0,
                      Rank: student.leetcode.rank || 'N/A'
                    }}
                    extra={
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-dim uppercase font-black">Acceptance</span>
                          <span className="text-white font-bold">{student.leetcode.acceptanceRate || 'N/A'}</span>
                        </div>
                        {student.leetcode.recentSubmissions?.length > 0 && (
                          <div className="text-[9px] mt-2">
                            <p className="text-dim uppercase font-black mb-1">Recent Submits:</p>
                            {student.leetcode.recentSubmissions.slice(0, 2).map((sub, i) => (
                              <div key={i} className="flex justify-between items-center bg-white/2 p-1 rounded mb-1">
                                <span className="truncate w-24 text-white opacity-80">{sub.title}</span>
                                <span className={sub.status === 'Accepted' ? 'text-success' : 'text-danger'}>{sub.status === 'Accepted' ? 'AC' : 'WA'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {lcError && (
                          <p className="text-[9px] text-danger animate-pulse font-bold">⚠️ LeetCode data unavailable</p>
                        )}
                      </div>
                    }
                  />
                  <PlatformCard
                    name="Codeforces"
                    icon={Trophy}
                    color="#1a8fff"
                    logoColor="#1a8fff"
                    stats={{
                      Rating: student.codeforces.rating,
                      Rank: student.codeforces.rank,
                      Max: student.codeforces.maxRating,
                    }}
                    extra={
                      student.codeforces.recentSubmissions?.length > 0 && (
                        <div className="text-[10px] space-y-1">
                          <p className="text-dim uppercase font-black tracking-tighter mb-1">Recent Submissions:</p>
                          {student.codeforces.recentSubmissions.slice(0, 3).map((sub, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-1 rounded">
                              <span className="truncate w-32">{sub.name}</span>
                              <span style={{ color: sub.verdict === 'OK' ? 'var(--success)' : 'var(--danger)' }}>
                                {sub.verdict === 'OK' ? 'AC' : 'WA'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                  />
                  <PlatformCard
                    name="HackerRank"
                    icon={Star}
                    color="#2ec866"
                    logoColor="#2ec866"
                    stats={{
                      Solved: student.hackerrank.solved,
                      Badges: student.hackerrank.badges,
                      Rank: student.hackerrank.rank,
                      Followers: student.hackerrank.followers
                    }}
                  />
                  <PlatformCard
                    name="CodeChef"
                    icon={Award}
                    color="#5b4638"
                    logoColor="#5b4638"
                    stats={{
                      Rating: student.codechef.rating,
                      Stars: student.codechef.stars,
                      Solved: student.codechef.solved,
                      'Global Rank': student.codechef.globalRank || 'N/A',
                      'Course Paths': student.codechef.courses || 0
                    }}
                  />
                  <PlatformCard
                    name="GitHub"
                    icon={Github}
                    color="#333"
                    logoColor="#333"
                    stats={{
                      Repos: student.github.repos,
                      Stars: student.github.stars,
                      Followers: student.github.followers || 0,
                      Location: student.github.location || 'N/A'
                    }}
                  />

                </div>

                {/* Internal Marks Section */}
                <div className="glass-card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="text-primary" size={20} />
                      <h3 className="card-title">Internal Subject Marks</h3>
                    </div>
                  </div>
                  <div className="marks-grid">
                    {student.internalMarks?.map((mark, i) => (
                      <div key={i} className="mark-card">
                        <span className="subject-name">{mark.subject}</span>
                        <div className="subject-input-wrapper">
                          <input 
                            type="number" 
                            className="mark-input"
                            value={mark.marks}
                            onChange={(e) => handleUpdateInternalMark(mark.subject, e.target.value)}
                          />
                          <span className="mark-total">/ 100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Section */}
                <div className="glass-card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="text-secondary" size={20} />
                      <h3 className="card-title">Academic Projects</h3>
                    </div>
                    <button 
                      className="text-xs text-secondary hover:text-white flex items-center gap-1 transition-colors"
                      onClick={() => setIsAddingProject(!isAddingProject)}
                    >
                      {isAddingProject ? 'Cancel' : <><Plus size={12} /> Add Project</>}
                    </button>
                  </div>

                  {isAddingProject && (
                    <div className="bg-white/5 p-4 rounded-xl mb-4 border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input 
                        className="w-full bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      />
                      <textarea 
                        className="w-full bg-bg-darker border border-white/10 rounded-lg p-2 text-sm h-16"
                        placeholder="Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      />
                      <input 
                        className="w-full bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                        placeholder="Technologies (comma separated)"
                        value={newProject.technologies}
                        onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                      />
                      <select 
                        className="w-full bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button 
                        className="w-full bg-secondary text-white text-sm font-bold py-2 rounded-lg hover:opacity-90 transition-all"
                        onClick={handleAddProject}
                      >
                        Create Project
                      </button>
                    </div>
                  )}

                  <div className="projects-list space-y-3">
                    {student.projects?.length > 0 ? (
                      student.projects.map((proj, i) => (
                        <div key={i} className="project-item glass-card-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm">{proj.title}</h4>
                            <span className={`project-status ${proj.status.toLowerCase().replace(' ', '-')}`}>
                              {proj.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-dim mb-2 line-clamp-2">{proj.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {proj.technologies?.map((tech, j) => (
                              <span key={j} className="tech-tag">{tech}</span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-dim text-xs italic py-4 text-center">No projects listed.</p>
                    )}
                  </div>
                </div>


                <div className="glass-card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Medal className="text-warning" size={20} />
                      <h3 className="card-title">Competitions & Achievements</h3>
                    </div>
                    <button 
                      className="text-xs text-primary hover:text-white flex items-center gap-1 transition-colors"
                      onClick={() => setIsAddingComp(!isAddingComp)}
                    >
                      {isAddingComp ? 'Cancel' : <><Zap size={12} /> Add Achievement</>}
                    </button>
                  </div>

                  {isAddingComp && (
                    <div className="bg-white/5 p-4 rounded-xl mb-4 border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input 
                        className="w-full bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                        placeholder="Competition Name"
                        value={newComp.name}
                        onChange={(e) => setNewComp({...newComp, name: e.target.value})}
                      />
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                          placeholder="Rank/Result"
                          value={newComp.rank}
                          onChange={(e) => setNewComp({...newComp, rank: e.target.value})}
                        />
                        <input 
                          className="w-20 bg-bg-darker border border-white/10 rounded-lg p-2 text-sm"
                          placeholder="Year"
                          value={newComp.year}
                          onChange={(e) => setNewComp({...newComp, year: e.target.value})}
                        />
                      </div>
                      <button 
                        className="w-full bg-primary text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-dark transition-all"
                        onClick={handleAddComp}
                      >
                        Save Achievement
                      </button>
                    </div>
                  )}

                  <div className="competitions-list space-y-2">
                    {(student.competitions || []).length > 0 ? (
                      student.competitions.map((comp, i) => (
                        <div key={i} className="competition-item group bg-white/[0.03] hover:bg-white/[0.08] transition-all p-3 rounded-xl flex items-center justify-between border border-white/[0.05] hover:border-white/10">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="comp-name font-bold text-sm">{comp.name}</span>
                              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-dim">{comp.year}</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: comp.rank?.toLowerCase().includes('gold') || comp.rank?.toLowerCase().includes('1') ? 'var(--warning)' : 'var(--text-dim)' }}>
                              {comp.rank}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteComp(i)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-danger hover:bg-danger/10 rounded-lg transition-all"
                            title="Delete Achievement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-dim text-sm italic py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                        No achievements recorded yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Analytics & Selection */}
              <div className="right-column">
                <div className="glass-card comparison-chart-card">
                  <h3 className="card-title">Comparative Analysis</h3>
                  <div className="radar-container" style={{ height: '250px', marginTop: '1.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 700 }} />
                        <Radar name="Student" dataKey="Student" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                        <Radar name="Cohort Avg" dataKey="Cohort" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.3} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(10, 15, 25, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card behavior-card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title">Behavioral patterns</h3>
                    <div className="behavior-score" style={{ color: getStatusColor(100 - student.behaviorScore) }}>
                      {student.behaviorScore}%
                    </div>
                  </div>

                  <div className="radar-container" style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={behaviorData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 8, fontWeight: 700 }} />
                        <Radar
                          name="Behavior"
                          dataKey="A"
                          stroke="var(--secondary)"
                          fill="var(--secondary)"
                          fillOpacity={0.6}
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(10, 15, 25, 0.95)', border: '1px solid rgba(217, 70, 239, 0.3)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                          itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="behavior-indicators mt-4 grid grid-cols-2 gap-2">
                    <div className="indicator-item flex items-center gap-2 text-[10px] bg-white/5 p-1.5 rounded-lg border border-white/5">
                      <BrainCircuit size={12} className="text-secondary" />
                      <span className="text-dim">Adaptive Thinking</span>
                    </div>
                    <div className="indicator-item flex items-center gap-2 text-[10px] bg-white/5 p-1.5 rounded-lg border border-white/5">
                      <Heart size={12} className="text-danger" />
                      <span className="text-dim">Social Synergy</span>
                    </div>
                    <div className="indicator-item flex items-center gap-2 text-[10px] bg-white/5 p-1.5 rounded-lg border border-white/5">
                      <Zap size={12} className="text-warning" />
                      <span className="text-dim">Engagement Velocity</span>
                    </div>
                    <div className="indicator-item flex items-center gap-2 text-[10px] bg-white/5 p-1.5 rounded-lg border border-white/5">
                      <Activity size={12} className="text-info" />
                      <span className="text-dim">Digital Presence</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title">Identity Configuration</h3>
                    <button 
                      className="manage-btn-modern"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings size={14} />
                      {showSettings ? 'Close Panel' : 'Manage Handles'}
                    </button>
                  </div>
                  
                   {showSettings ? (
                    <div className="handle-inputs animate-in zoom-in-95 duration-200">
                      <div className="col-span-2 pb-2 mb-2 border-b border-white/5">
                        <p className="text-[10px] text-dim uppercase font-black mb-2">Academic Stats</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="input-group">
                            <label>Current CGPA</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={selectedStudent.cgpa} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setSyncedData(prev => ({
                                  ...prev,
                                  [selectedStudent.id]: { 
                                    ...(prev[selectedStudent.id] || {}),
                                    profileUpdates: { ...(prev[selectedStudent.id]?.profileUpdates || {}), cgpa: val } 
                                  }
                                }));
                              }}
                              placeholder="e.g. 9.5"
                            />
                          </div>
                          <div className="input-group">
                            <label>Attendance (%)</label>
                            <input 
                              type="number" 
                              value={selectedStudent.attendance} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setSyncedData(prev => ({
                                  ...prev,
                                  [selectedStudent.id]: { 
                                    ...(prev[selectedStudent.id] || {}),
                                    profileUpdates: { ...(prev[selectedStudent.id]?.profileUpdates || {}), attendance: val } 
                                  }
                                }));
                              }}
                              placeholder="e.g. 92"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] text-dim uppercase font-black mb-2 mt-2">Platform Handles</p>
                           <div className="space-y-3 mt-4">
                        {[
                          { id: 'leetcode', label: 'LeetCode', icon: Code2, color: '#ffa116' },
                          { id: 'codeforces', label: 'Codeforces', icon: Trophy, color: '#1a8fff' },
                          { id: 'hackerrank', label: 'HackerRank', icon: Star, color: '#2ec866' },
                          { id: 'codechef', label: 'CodeChef', icon: Award, color: '#5b4638' },
                          { id: 'github', label: 'GitHub', icon: Github, color: '#fff' }
                        ].map(platform => (
                          <div key={platform.id} className="input-group-modern group bg-white/2 hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <platform.icon size={16} style={{ color: platform.color }} />
                                <label className="text-xs font-bold text-white mb-0">{platform.label}</label>
                              </div>
                              <span className={`handle-status ${selectedStudent.handles?.[platform.id] ? 'status-connected' : 'status-empty'}`}>
                                {selectedStudent.handles?.[platform.id] ? 'Connected ✅' : 'Not Connected'}
                              </span>
                            </div>
                            <input 
                              type="text" 
                              className="bg-bg-darker border border-white/10 rounded-lg p-2 w-full text-xs"
                              value={selectedStudent.handles?.[platform.id] || ''} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setSyncedData(prev => ({
                                  ...prev,
                                  [selectedStudent.id]: { 
                                    ...(prev[selectedStudent.id] || {}),
                                    handles: { ...(selectedStudent.handles || {}), [platform.id]: val } 
                                  }
                                }));
                              }}
                              placeholder={`Enter ${platform.label} handle`}
                            />
                          </div>
                        ))}
                      </div>
                  </div>
                    </div>
                  ) : (
                    <div className="py-2 px-1">
                      <p className="text-dim text-[11px] italic leading-relaxed">
                        Platform handles are configured to pull real-time performance data. 
                        Click 'Manage Handles' to update student credentials.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {userRole === 'teacher' && activeTab === 'overview' && (
          <div className="dashboard-content teacher-overview space-y-8 animate-in fade-in duration-700">
            {/* Improved Overview Cards Grid */}
            <div className="grid grid-rescue grid-5-cols">
               <StatCard title="Total Students" value={processedStudents.length} icon={User} color="#8b5cf6" />
               <StatCard title="At-Risk" value={processedStudents.filter(s => s.riskLevel !== 'Low Risk').length} icon={AlertTriangle} color="#ef4444" />
               <StatCard title="Avg Class CGPA" value={processedStudents.length > 0 ? (processedStudents.reduce((acc, s) => acc + parseFloat(s.cgpa || 0), 0) / processedStudents.length).toFixed(2) : "0.00"} icon={GraduationCap} color="#06b6d4" />
               <StatCard title="Avg Attendance" value={processedStudents.length > 0 ? `${Math.round(processedStudents.reduce((acc, s) => acc + (s.attendance || 0), 0) / processedStudents.length)}%` : "0%"} icon={Calendar} color="#10b981" />
               <StatCard title="Active Coding" value="84%" icon={Zap} color="#ffa116" />
            </div>

            <div className="main-layout-grid">
              {/* Left Column - Alerts & Activity */}
              <div className="sidebar-col">
                 {/* High Risk Alerts Panel */}
                 <div className="glass-card" style={{ border: '1px solid rgba(244, 63, 94, 0.2)', backgroundColor: 'rgba(244, 63, 94, 0.02)' }}>
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-sm font-black text-danger flex items-center gap-2">
                          <AlertTriangle size={16} /> HIGH RISK ALERTS
                       </h3>
                       <button onClick={() => setActiveTab('risk')} className="chart-filter-btn">View All</button>
                    </div>
                    <div className="space-y-4">
                        {processedStudents.filter(s => s.riskLevel === 'High Risk').slice(0, 3).map(s => (
                          <div key={s.id} className="p-4 bg-danger/10 border border-danger/20 rounded-xl hover:bg-danger/20 transition-all cursor-pointer flex justify-between items-center" onClick={() => { setSelectedTeacherStudentId(s.id); setActiveTab('teacher-student-detail'); }}>
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-white">{s.name}</span>
                                <span className="text-[10px] text-danger font-black uppercase tracking-widest">Attendance: {s.attendance}%</span>
                             </div>
                             <div className="text-right">
                                <span className="text-[10px] bg-danger text-white px-2 py-1 rounded font-black">CRITICAL</span>
                             </div>
                          </div>
                        ))}
                       {processedStudents.filter(s => s.riskLevel === 'High Risk').length === 0 && (
                          <div className="text-center py-6 text-dim text-xs italic">No high risk students currently.</div>
                       )}
                    </div>
                 </div>

                 {/* Recent Teacher Activity */}
                 <div className="glass-card">
                    <h3 className="card-title mb-6 flex items-center gap-2 text-white">
                       <History size={16} className="text-primary" /> RECENT ACTIVITY
                    </h3>
                    <div className="space-y-4">
                       {[
                         ...teacherFeedback.map(f => ({ type: 'feedback', ...f })),
                         ...Object.values(syncedData).flatMap(s => (s.notes || []).map(n => ({ type: 'note', ...n })))
                       ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((activity, i) => (
                         <div key={i} className="flex gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${activity.type === 'feedback' ? 'bg-primary' : 'bg-secondary'}`}></div>
                            <div>
                               <p className="text-xs font-bold text-white">
                                 {activity.type === 'feedback' ? `Feedback sent to ${activity.studentName}` : `Note added for ${activity.studentName || 'Student'} (${activity.subject})`}
                               </p>
                               <p className="text-[10px] text-dim">{activity.date}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Quick Student Access */}
                  <div className="glass-card">
                     <h3 className="card-title mb-6 flex items-center gap-2 text-white">
                        <Users size={16} className="text-secondary" /> QUICK ACCESS
                     </h3>
                     <div className="grid quick-access-grid">
                        {processedStudents.slice(0, 6).map(s => (
                          <button key={s.id} onClick={() => { setSelectedTeacherStudentId(s.id); setActiveTab('teacher-student-detail'); }} className="quick-access-item group">
                             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/20">
                                <User size={14} className="text-white" />
                             </div>
                             <span className="truncate text-white font-black">{s.name}</span>
                          </button>
                        ))}
                     </div>
                  </div>
              </div>

              {/* Main Column - Charts & Previews */}
              <div className="space-y-6">
                <div className="glass-card">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3 className="card-title flex items-center gap-2 text-white">
                        <Trophy size={18} className="text-warning" /> CLASS CODING ENGAGEMENT
                      </h3>
                      <div className="flex gap-2">
                         {['All', 'LeetCode', 'GitHub', 'Codeforces'].map(f => (
                           <button key={f} className="chart-filter-btn">{f}</button>
                         ))}
                      </div>
                   </div>
                   <div style={{ height: '350px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={processedStudents.map(s => ({ name: s.name.split(' ')[0], solved: s.leetcode?.solved || 0 }))}>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                           <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                           <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                           <Tooltip contentStyle={{ backgroundColor: 'var(--bg-darker)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                           <Bar dataKey="solved" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="grid md-grid-cols-2 gap-6">
                   {/* Subject Notes Preview */}
                   <div className="glass-card">
                      <h3 className="card-title mb-6 flex items-center gap-2 text-white">
                         <ClipboardList size={16} className="text-success" /> RECENT NOTES
                      </h3>
                      <div className="space-y-4">
                         {Object.values(syncedData).flatMap(s => (s.notes || []).map(n => ({...n, studentId: s.id}))).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map((note, i) => {
                           const student = processedStudents.find(s => s.id === note.studentId);
                           return (
                             <div key={i} className="p-3 bg-white-tiny rounded-xl border border-white-low border-l-4 border-l-success">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] font-black text-success uppercase">{note.subject} → {student?.name}</span>
                                   <span className="text-[10px] text-dim">{note.date}</span>
                                </div>
                                <p className="text-xs text-white line-clamp-2 italic">"{note.content}"</p>
                             </div>
                           )
                         })}
                      </div>
                   </div>

                   {/* Feedback Sent Panel */}
                   <div className="glass-card">
                      <h3 className="card-title mb-6 flex items-center gap-2 text-white">
                         <MessageSquare size={16} className="text-secondary" /> RECENT FEEDBACK
                      </h3>
                      <div className="space-y-4">
                         {teacherFeedback.slice(0, 3).map((fb, i) => (
                            <div key={i} className="p-3 bg-white-tiny rounded-xl border border-white-low border-l-4 border-l-secondary">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-black text-secondary uppercase">{fb.studentName}</span>
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${fb.priority === 'High' ? 'bg-danger text-white' : 'bg-white-mid text-white'}`}>{fb.priority}</span>
                               </div>
                               <p className="text-sm text-white line-clamp-2 italic">"{fb.message}"</p>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(userRole === 'teacher' || userRole === 'admin') && activeTab === 'students' && (
          <div className="cohort-view space-y-6">
            <div className="flex justify-between items-center bg-white/2 p-4 rounded-2xl border border-white/5">
              <h3 className="text-xl font-black">Student Monitoring Matrix</h3>
              <div className="flex gap-2">
                 <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 flex items-center gap-2">
                    <Search size={14} className="text-dim" />
                    <input type="text" placeholder="Filter student..." className="bg-transparent border-none text-xs outline-none" />
                 </div>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden">
              <div className="table-container">
                <table className="cohort-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>CGPA</th>
                      <th>Attendance</th>
                      <th>Risk Status</th>
                      <th>Coding activity</th>
                      <th>Engagement</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedStudents.map(s => (
                      <tr key={s.id} className="hover:bg-white/2 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <span className="font-bold">{s.name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-primary">{s.cgpa}</td>
                        <td className="font-mono">{s.attendance}%</td>
                        <td>
                          <span className="risk-tag" style={{ 
                            backgroundColor: `${getStatusColor(s.riskScore)}20`, 
                            color: getStatusColor(s.riskScore) 
                          }}>{s.riskLevel}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-[10px] uppercase font-black">
                            <Zap size={10} className="text-warning" />
                            {s.leetcode.solved > 100 ? 'Expert' : 'Active'}
                          </div>
                        </td>
                        <td>
                           <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-secondary" style={{ width: `${s.behaviorScore}%` }}></div>
                           </div>
                        </td>
                        <td>
                          <button 
                            onClick={() => { setSelectedTeacherStudentId(s.id); setActiveTab('teacher-student-detail'); }}
                            className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-primary transition-all"
                          >
                            VIEW STUDENT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teacher-student-detail' && selectedTeacherStudentId && (
          <div className="space-y-6">
            <button onClick={() => setActiveTab('students')} className="flex items-center gap-2 text-dim hover:text-white transition-all text-xs mb-4">
               <ArrowUpRight size={14} style={{ transform: 'rotate(-135deg)' }} /> Back to Class List
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1">
                  <div className="glass-card text-center py-8">
                     <div className="w-24 h-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4 border border-white/10">
                        <User size={48} className="text-dim" />
                     </div>
                     <h2 className="text-2xl font-black">{processedStudents.find(s => s.id === selectedTeacherStudentId)?.name}</h2>
                     <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{processedStudents.find(s => s.id === selectedTeacherStudentId)?.role}</p>
                     
                     <div className="grid grid-cols-2 gap-4 mt-8 px-4">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                           <p className="text-[10px] text-dim uppercase mb-1">CGPA</p>
                           <p className="text-lg font-black">{processedStudents.find(s => s.id === selectedTeacherStudentId)?.cgpa}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-dim uppercase mb-1">Attend</p>
                            <p className="text-lg font-black text-secondary">{processedStudents.find(s => s.id === selectedTeacherStudentId)?.attendance}%</p>
                         </div>
                     </div>

                     <div className="mt-6 px-4">
                        <span className="risk-tag w-full py-2 block" style={{ 
                          backgroundColor: `${getStatusColor(processedStudents.find(s => s.id === selectedTeacherStudentId)?.riskScore)}20`, 
                          color: getStatusColor(processedStudents.find(s => s.id === selectedTeacherStudentId)?.riskScore) 
                        }}>
                          {processedStudents.find(s => s.id === selectedTeacherStudentId)?.riskLevel} Priority
                        </span>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card">
                     <h3 className="card-title mb-6">Technical Performance Analytics</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                           { name: 'LeetCode', icon: Code2, color: '#ffa116', value: processedStudents.find(s => s.id === selectedTeacherStudentId)?.leetcode?.solved, unit: 'Solved' },
                           { name: 'Codeforces', icon: Trophy, color: '#1a8fff', value: processedStudents.find(s => s.id === selectedTeacherStudentId)?.codeforces?.rating, unit: 'Rating' },
                           { name: 'CodeChef', icon: Award, color: '#5b4638', value: processedStudents.find(s => s.id === selectedTeacherStudentId)?.codechef?.rating, unit: 'Stars', extra: processedStudents.find(s => s.id === selectedTeacherStudentId)?.codechef?.stars },
                           { name: 'HackerRank', icon: Star, color: '#2ec866', value: processedStudents.find(s => s.id === selectedTeacherStudentId)?.hackerrank?.solved, unit: 'Solved' },
                           { name: 'GitHub', icon: Github, color: '#fff', value: processedStudents.find(s => s.id === selectedTeacherStudentId)?.github?.repos, unit: 'Repos' }
                        ].map((p, idx) => (
                          <div key={idx} className="p-4 bg-white/2 rounded-xl border border-white/5">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-bold flex items-center gap-2"><p.icon size={14} style={{ color: p.color }} /> {p.name}</span>
                                <span className="text-[10px] font-mono">{p.value} {p.unit}</span>
                             </div>
                             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full" style={{ width: '50%', backgroundColor: p.color }}></div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card">
                      <h3 className="card-title mb-4">Subject Mastery Matrix</h3>
                      <div className="space-y-4">
                          {students.find(s => s.id === selectedTeacherStudentId)?.internalMarks.map((m, i) => (
                            <div key={i} className="flex items-center gap-4">
                               <span className="text-[10px] font-bold text-dim w-24 truncate">{m.subject}</span>
                               <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/40" style={{ width: `${m.marks}%` }}></div>
                               </div>
                               <span className="text-[10px] font-black">{m.marks}%</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="glass-card">
                       <h3 className="card-title mb-4">Academic Observation Timeline</h3>
                       <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                          {(syncedData[selectedTeacherStudentId]?.notes || []).length > 0 ? (
                             syncedData[selectedTeacherStudentId].notes.map((note, i) => (
                               <div key={i} className="p-3 bg-white/2 rounded-xl border border-white/5 relative border-l-2 border-l-secondary">
                                  <div className="flex justify-between text-[8px] mb-1">
                                     <span className="text-secondary font-black">{note.subject}</span>
                                     <span className="text-dim">{note.date}</span>
                                  </div>
                                  <p className="text-[10px] leading-relaxed text-white/70">"{note.content}"</p>
                               </div>
                             ))
                          ) : (
                             <p className="text-[10px] text-dim text-center py-4">No observations recorded yet.</p>
                          )}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {userRole === 'teacher' && activeTab === 'subject-notes' && (
          <div className="space-y-6 max-w-4xl mx-auto">
             <div className="glass-card">
                <h3 className="card-title mb-6 flex items-center gap-2">
                   <ClipboardList size={18} className="text-secondary" />
                   Internal Observation Logs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <div className="input-group">
                      <label>Select Student</label>
                      <select 
                        className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none"
                        value={selectedTeacherStudentId || ''}
                        onChange={(e) => setSelectedTeacherStudentId(e.target.value)}
                      >
                         <option value="">Choose Student...</option>
                         {students.map(s => <option key={s.id} value={s.id} className="bg-bg-darker">{s.name}</option>)}
                      </select>
                   </div>
                   <div className="input-group">
                      <label>Academic Subject</label>
                      <select 
                        className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none"
                        value={newNote.subject}
                        onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                      >
                         <option value="Mathematics">Mathematics</option>
                         <option value="Advanced Programming">Advanced Programming</option>
                         <option value="Data Structures">Data Structures</option>
                         <option value="Machine Learning">Machine Learning</option>
                      </select>
                   </div>
                </div>
                <div className="input-group mb-4">
                   <label>Observation Remarks</label>
                   <textarea 
                     className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white h-32 focus:border-secondary outline-none transition-all"
                     placeholder="Detailed feedback regarding student performance, behavior or assignments..."
                     value={newNote.content}
                     onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                   />
                </div>
                <button 
                  onClick={saveNote}
                  className="w-full bg-secondary text-white font-black py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                   <Plus size={18} /> RECORD OBSERVATION
                </button>
             </div>

             {selectedTeacherStudentId && (
                <div className="space-y-4">
                   <h4 className="text-sm font-black uppercase text-dim tracking-widest pl-2">Observation History</h4>
                   {(syncedData[selectedTeacherStudentId]?.notes || []).length > 0 ? (
                      syncedData[selectedTeacherStudentId].notes.map((note, i) => (
                        <div key={i} className="glass-card p-4 flex gap-4 border-l-4 border-l-secondary">
                           <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                 <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">{note.subject}</span>
                                 <span className="text-[10px] text-dim italic">{note.date}</span>
                              </div>
                              <p className="text-sm text-white/80 italic">"{note.content}"</p>
                              <p className="text-[10px] text-dim mt-3 font-bold">— {note.teacher}</p>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="text-center py-12 glass-card opacity-50">
                         <History size={32} className="mx-auto text-dim mb-2" />
                         <p className="text-xs">No previous logs for this student.</p>
                      </div>
                   )}
                </div>
             )}
          </div>
        )}

        {((userRole === 'teacher' && activeTab === 'feedback-center') || (userRole === 'admin' && activeTab === 'feedback-center')) && (
          <div className="feedback-center space-y-8 max-w-5xl mx-auto">
             {userRole === 'teacher' && (
                <div className="glass-card">
                   <h3 className="card-title mb-6 flex items-center gap-2">
                      <MessageSquare size={18} className="text-primary" />
                      Incident & Feedback Portal
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="input-group">
                         <label>Target Student</label>
                         <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs" value={selectedTeacherStudentId || ''} onChange={e => setSelectedTeacherStudentId(e.target.value)}>
                            <option value="">Select...</option>
                            {students.map(s => <option key={s.id} value={s.id} className="bg-bg-darker">{s.name}</option>)}
                         </select>
                      </div>
                      <div className="input-group">
                         <label>Feedback Type</label>
                         <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs" value={newFeedback.type} onChange={e => setNewFeedback({...newFeedback, type: e.target.value})}>
                            <option value="Performance">Performance</option>
                            <option value="Behavior">Behavior</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Coding Activity">Coding Activity</option>
                         </select>
                      </div>
                      <div className="input-group">
                         <label>Priority level</label>
                         <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs" value={newFeedback.priority} onChange={e => setNewFeedback({...newFeedback, priority: e.target.value})}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                         </select>
                      </div>
                   </div>
                   <div className="input-group mb-4">
                      <label>Narrative Message</label>
                      <textarea className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24" placeholder="Briefly describe the feedback for administrator review..." value={newFeedback.message} onChange={e => setNewFeedback({...newFeedback, message: e.target.value})} />
                   </div>
                   <button onClick={submitFeedback} className="bg-primary text-white font-black px-6 py-3 rounded-xl text-xs hover:scale-105 transition-all">POST FEEDBACK TO ADMIN</button>
                </div>
             )}

             <div className="glass-card">
                <h3 className="card-title mb-6 flex items-center gap-2">
                   <AlertCircle size={18} className="text-dim" />
                   Administrative Feedback queue
                </h3>
                <div className="space-y-4">
                   {teacherFeedback.length > 0 ? (
                      teacherFeedback.map(fb => (
                        <div key={fb.id} className="flex flex-col md:flex-row gap-4 p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                           <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="text-xs font-black text-white">{fb.studentName}</span>
                                 <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${fb.priority === 'High' ? 'bg-danger/20 text-danger' : fb.priority === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>{fb.priority} Priority</span>
                              </div>
                              <p className="text-xs text-dim mb-3 italic">"{fb.message}"</p>
                              <div className="flex items-center gap-4 text-[9px] uppercase font-black text-dim tracking-tighter">
                                 <span>Type: {fb.type}</span>
                                 <span>Subject: {fb.subject}</span>
                                 <span>Posted: {fb.date}</span>
                              </div>
                           </div>
                           <div className="flex items-center">
                              <span className="text-[10px] text-primary font-black border border-primary/20 px-3 py-1 rounded-lg">SUBMITTED BY: {fb.teacher}</span>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="text-center py-10 opacity-30">
                         <p>No feedback tickets in the current queue.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {userRole === 'teacher' && activeTab === 'risk' && (
          <div className="space-y-8 animate-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-3xl font-black flex items-center gap-3 text-white">
                      <AlertTriangle className="text-danger" size={32} />
                      EARLY WARNING SYSTEM
                   </h2>
                   <p className="text-dim text-sm mt-1 pl-11">AI-powered identification for academic & behavioral intervention</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                   <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                      <button 
                        onClick={() => setRiskFilter('all')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${riskFilter === 'all' ? 'bg-primary text-white shadow-lg' : 'text-dim hover:text-white'}`}
                      >
                        ALL STUDENTS
                      </button>
                      <button 
                        onClick={() => setRiskFilter('high')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${riskFilter === 'high' ? 'bg-danger text-white shadow-lg' : 'text-dim hover:text-white'}`}
                      >
                        HIGH RISK ONLY
                      </button>
                      <button 
                        onClick={() => setRiskFilter('cgpa')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${riskFilter === 'cgpa' ? 'bg-secondary text-white shadow-lg' : 'text-dim hover:text-white'}`}
                      >
                        FILTER BY CGPA
                      </button>
                   </div>
                   <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" size={14} />
                      <input 
                        type="text"
                        placeholder="Search student profile..."
                        value={riskSearch}
                        onChange={(e) => setRiskSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                      />
                   </div>
                </div>
             </div>

             {/* Risk Summary Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="summary-stat-card border-danger/30">
                   <p className="text-[10px] font-black text-danger uppercase mb-1">Critical Intervention</p>
                   <p className="text-4xl font-black text-white">{processedStudents.filter(s => s.riskLevel === 'High Risk').length}</p>
                   <p className="text-xs text-dim mt-2">Immediate Attention Required</p>
                </div>
                <div className="summary-stat-card border-warning/30">
                   <p className="text-[10px] font-black text-warning uppercase mb-1">Under Observation</p>
                   <p className="text-4xl font-black text-white">{processedStudents.filter(s => s.riskLevel === 'Medium Risk').length}</p>
                   <p className="text-xs text-dim mt-2">Declining Performance Trends</p>
                </div>
                <div className="summary-stat-card border-success/30">
                   <p className="text-[10px] font-black text-success uppercase mb-1">Healthy Progress</p>
                   <p className="text-4xl font-black text-white">{processedStudents.filter(s => s.riskLevel === 'Low Risk').length}</p>
                   <p className="text-xs text-dim mt-2">Consistent & Improving</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {(filteredRiskStudents || []).length > 0 ? (
                  filteredRiskStudents.map(s => {
                    const isImproving = (s.lastWeekAttendance || 0) < s.attendance;
                    const isDeclining = (s.lastWeekAttendance || 0) > s.attendance;
                    
                    return (
                      <div key={s.id} className={`glass-card p-0 overflow-hidden border-l-8 transition-all hover:border-l-primary/50 flex flex-col ${
                        s.riskLevel === 'High Risk' ? 'border-l-danger bg-danger/[0.03]' : 
                        s.riskLevel === 'Medium Risk' ? 'border-l-warning bg-warning/[0.03]' : 'border-l-success bg-success/[0.03]'
                      }`}>
                         <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                               {/* Left Section: Student Profile */}
                               <div className="md:w-1/4">
                                  <div className="flex items-center gap-4 mb-4">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                                       s.riskLevel === 'High Risk' ? 'bg-danger/20 text-danger' : 
                                       s.riskLevel === 'Medium Risk' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                                     }`}>
                                        {s.name?.charAt(0) || '?'}
                                     </div>
                                     <div>
                                        <h4 className="text-xl font-black text-white">{s.name || 'Unknown'}</h4>
                                        <div className={`risk-badge ${s.riskLevel === 'High Risk' ? 'high' : s.riskLevel === 'Medium Risk' ? 'medium' : 'low'}`}>
                                           <AlertCircle size={10} /> {s.riskLevel || 'Low Risk'}
                                        </div>
                                     </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                     <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                        <div>
                                           <p className="text-[10px] uppercase font-black text-dim">Risk Score</p>
                                           <p className="text-2xl font-black text-white">{s.riskScore || 0}/100</p>
                                        </div>
                                        <div className={`trend-indicator ${isImproving ? 'trend-up' : isDeclining ? 'trend-down' : 'trend-stable'}`}>
                                           {isImproving ? <TrendingUp size={14} /> : isDeclining ? <TrendingDown size={14} /> : <TrendingUp size={14} className="opacity-0" />}
                                           {isImproving ? 'IMPROVING' : isDeclining ? 'DECLINING' : 'STABLE'}
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {/* Middle Section: Metrics Matrix */}
                               <div className="md:w-1/3 grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                     <p className="text-[10px] uppercase font-bold text-dim mb-1">Attendance</p>
                                     <p className={`text-lg font-black ${s.attendance < 75 ? 'text-danger' : 'text-white'}`}>{s.attendance || 0}%</p>
                                     <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full ${s.attendance < 75 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${s.attendance || 0}%` }}></div>
                                     </div>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                     <p className="text-[10px] uppercase font-bold text-dim mb-1">CGPA Status</p>
                                     <p className="text-lg font-black text-white">{s.cgpa || 0}</p>
                                     <p className="text-[10px] text-dim font-bold">Historical: {s.historicalAvg || 0}%</p>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                     <p className="text-[10px] uppercase font-bold text-dim mb-1">Coding Logic</p>
                                     <p className="text-sm font-black text-secondary uppercase">{(s.leetcode?.solved || 0) > 50 ? 'Active Dev' : 'Near Stagnant'}</p>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                     <p className="text-[10px] uppercase font-bold text-dim mb-1">LMS Reach</p>
                                     <p className="text-sm font-black text-white">{s.lmsActivity || 0} Hrs/Day</p>
                                  </div>
                               </div>

                               {/* Right Section: AI Factors & Recommendations */}
                               <div className="flex-1 space-y-4">
                                  <div>
                                     <p className="text-[10px] uppercase font-black text-dim mb-2 tracking-widest flex items-center gap-2">
                                        <Brain size={12} className="text-primary" /> RISK FACTORS (AI INSIGHTS)
                                     </p>
                                     <div className="space-y-1">
                                        {s.riskLevel === 'High Risk' && (
                                           <>
                                              <div className="ai-reason-item"><div className="w-1.5 h-1.5 rounded-full bg-danger"></div> Attendance significantly below benchmark</div>
                                              <div className="ai-reason-item"><div className="w-1.5 h-1.5 rounded-full bg-danger"></div> Multi-week decline in coding participation</div>
                                           </>
                                        )}
                                        {s.riskLevel === 'Medium Risk' && (
                                           <>
                                              <div className="ai-reason-item"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> Inconsistent submission pattern detected</div>
                                              <div className="ai-reason-item"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> Participation trend is stabilized but stagnant</div>
                                           </>
                                        )}
                                        {s.riskLevel === 'Low Risk' && (
                                           <div className="ai-reason-item text-success"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> All parameters within optimal thresholds</div>
                                        )}
                                     </div>
                                  </div>

                                  <div className="ai-recommendation-box">
                                     <p className="text-[10px] uppercase font-black text-primary mb-2 flex items-center gap-2">
                                        <Zap size={12} /> AI NEXT-STEPS
                                     </p>
                                     <p className="text-[11px] leading-relaxed text-white/90">
                                        {s.riskLevel === 'High Risk' ? 'Immediate counseling required. Focus on attendance regularization and peer-coding support.' : 
                                         s.riskLevel === 'Medium Risk' ? 'Encourage participation in the next hackathon. Monitor project milestones.' : 
                                         'Continue current track. Good candidate for advanced leadership roles.'}
                                     </p>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Bottom Action Bar */}
                         <div className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-between items-center">
                            <div className="flex gap-4">
                               <button onClick={() => { setSelectedTeacherStudentId(s.id); setActiveTab('teacher-student-detail'); }} className="text-[11px] font-black text-primary hover:underline flex items-center gap-2">
                                  <User size={14} /> PROFILE ANALYSIS
                               </button>
                               <button onClick={() => { setSelectedTeacherStudentId(s.id); setActiveTab('feedback-center'); }} className="text-[11px] font-black text-dim hover:text-white flex items-center gap-2 transition-all">
                                  <MessageCircle size={14} /> SEND ADVISORY
                               </button>
                               <button onClick={() => { setSelectedTeacherStudentId(s.id); setActiveTab('subject-notes'); }} className="text-[11px] font-black text-dim hover:text-white flex items-center gap-2 transition-all">
                                  <BookOpen size={14} /> LOG OBSERVATION
                               </button>
                            </div>
                            <div className="text-[10px] text-dim font-bold uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-white/5">
                               ID: {s.id}-PULSE
                            </div>
                         </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center glass-card border-dashed">
                    <Search size={48} className="mx-auto text-dim opacity-20 mb-4" />
                    <p className="text-xl font-black text-white">No students found</p>
                    <p className="text-dim text-sm mt-2">Adjust your filters or search terms and try again.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {userRole === 'admin' && activeTab === 'students' && (
          <div className="cohort-view">
            <div className="glass-card mb-8">
              <h3 className="card-title mb-6">Cohort Distribution</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedStudents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-darker)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="attendance" name="Attendance" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="card-title mb-6">Student Activity Matrix</h3>
              <div className="table-container">
                <table className="cohort-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Attendance</th>
                      <th>LeetCode</th>
                      <th>Codeforces</th>
                      <th>HackerRank</th>
                      <th>CodeChef</th>
                      <th>CGPA</th>
                      <th>Risk Level</th>
                      <th>Behavior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedStudents.map(student => (
                      <tr key={student.id} onClick={() => { setSelectedStudentId(student.id); setActiveTab('overview'); }} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="mini-placeholder" style={{ width: '24px', height: '24px' }}>
                              <User size={12} />
                            </div>
                            <span className="font-bold">{student.name}</span>
                          </div>
                        </td>
                        <td className="font-mono">{student.attendance}%</td>
                        <td className="font-mono text-warning">{student.leetcode.solved}</td>
                        <td className="font-mono text-primary">{student.codeforces.rating}</td>
                        <td className="font-mono text-success">{student.hackerrank.solved}</td>
                        <td className="font-mono" style={{ color: '#5b4638' }}>{student.codechef.rating}</td>
                        <td className="font-mono" style={{ color: '#06b6d4' }}>{student.cgpa}</td>
                        <td>
                          <span className="risk-tag" style={{ 
                            backgroundColor: `${getStatusColor(student.riskScore)}20`, 
                            color: getStatusColor(student.riskScore),
                            border: `1px solid ${getStatusColor(student.riskScore)}40` 
                          }}>
                            {student.riskLevel}
                          </span>
                        </td>
                        <td className="font-mono text-secondary">{student.behaviorScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="dashboard-content analytics-view animate-in fade-in duration-700">
            <div className="analytics-grid">
              {/* Platform Dominance */}
              <div className="glass-card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="card-title">Cohort Platform Dominance</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-dim">Total Activity</span>
                  </div>
                </div>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'LeetCode', value: processedStudents.reduce((acc, s) => acc + (s.leetcode?.solved || 0), 0) },
                          { name: 'Codeforces', value: processedStudents.reduce((acc, s) => acc + (s.codeforces?.rating || 0), 0) },
                          { name: 'HackerRank', value: processedStudents.reduce((acc, s) => acc + (s.hackerrank?.solved || 0), 0) },
                          { name: 'CodeChef', value: processedStudents.reduce((acc, s) => acc + (s.codechef?.rating || 0), 0) },
                          { name: 'GitHub', value: processedStudents.reduce((acc, s) => acc + (s.github?.repos || 0) * 10, 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#ffa116" />
                        <Cell fill="#1a8fff" />
                        <Cell fill="#2ec866" />
                        <Cell fill="#5b4638" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-darker)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="pie-legend">
                  <div className="legend-item"><span style={{ background: '#ffa116' }}></span> LeetCode</div>
                  <div className="legend-item"><span style={{ background: '#1a8fff' }}></span> Codeforces</div>
                  <div className="legend-item"><span style={{ background: '#2ec866' }}></span> HackerRank</div>
                  <div className="legend-item"><span style={{ background: '#5b4638' }}></span> CodeChef</div>
                  <div className="legend-item"><span style={{ background: '#8b5cf6' }}></span> GitHub</div>
                </div>
              </div>

              {/* Achievers Leaderboard */}
              <div className="glass-card">
                <h3 className="card-title mb-6">Top Performers Leaderboard</h3>
                <div className="leaderboard-list">
                  {[...processedStudents]
                    .sort((a, b) => {
                      const scoreA = (a.leetcode?.solved || 0) + (a.codeforces?.rating || 0) + (a.hackerrank?.solved || 0) + (a.github?.repos || 0) * 5;
                      const scoreB = (b.leetcode?.solved || 0) + (b.codeforces?.rating || 0) + (b.hackerrank?.solved || 0) + (b.github?.repos || 0) * 5;
                      return scoreB - scoreA;
                    })
                    .slice(0, 5)
                    .map((student, idx) => (
                      <div key={student.id} className="leaderboard-item group hover:bg-white/5 transition-all p-2 rounded-xl">
                        <div className="rank">#{idx + 1}</div>
                        <div className="mini-placeholder group-hover:scale-110 transition-transform">
                          <User size={16} />
                        </div>
                        <div className="info">
                          <p className="name">{student.name}</p>
                          <p className="meta">{student.role}</p>
                        </div>
                        <div className="score font-mono text-primary">
                          {((student.leetcode?.solved || 0) + (student.codeforces?.rating || 0) + (student.hackerrank?.solved || 0) + (student.github?.repos || 0) * 5).toLocaleString()} <span className="text-[10px] text-dim">pts</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Attendance vs Assessment */}
            <div className="glass-card mt-8">
              <h3 className="card-title mb-6">Cohort Engagement Trends</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedStudents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-darker)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="attendance" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="behaviorScore" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </main>
</div>
);
}

export default App;
