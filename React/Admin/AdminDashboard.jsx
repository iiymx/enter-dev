import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, PlusCircle, Settings, LogOut, 
  Image, Eye, Trash2, Edit3, ArrowUp, ArrowDown, Database, 
  Key, ShieldCheck, Check, Upload, AlertCircle, RefreshCw,
  Globe, Smartphone, Layers, ExternalLink, HelpCircle
} from 'lucide-react';
import './AdminDashboard.css';
import { 
  isSupabaseActive, 
  getSupabaseCredentials, 
  testSupabaseConnection, 
  fetchCloudProjects, 
  insertCloudProject, 
  updateCloudProject, 
  deleteCloudProject, 
  syncProjectsOrder, 
  uploadCloudImage, 
  bulkMigrateLocalToCloud 
} from './supabaseService';

export default function AdminDashboard({ onClose, projects, onUpdateProjects }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('home');

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    desc: '',
    category: 'مواقع الويب',
    url: '',
    tags: '',
    image: '',
    bgClass: 'project-5-bg'
  });
  
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Settings Credentials State
  const [newPasscode, setNewPasscode] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  // Cloud Database States
  const [cloudEnabled, setCloudEnabled] = useState(() => localStorage.getItem('enter_cloud_enabled') === 'true');
  const [supabaseUrlState, setSupabaseUrlState] = useState(() => localStorage.getItem('enter_supabase_url') || '');
  const [supabaseAnonKeyState, setSupabaseAnonKeyState] = useState(() => localStorage.getItem('enter_supabase_anon_key') || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // { success, message }
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);

  // Initial authentication check (from localStorage)
  useEffect(() => {
    const savedAuth = localStorage.getItem('enter_admin_authenticated');
    const authExpiry = localStorage.getItem('enter_admin_auth_expiry');
    if (savedAuth === 'true' && authExpiry && Date.now() < parseInt(authExpiry)) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle Admin Log In
  const handleLogin = (e) => {
    e.preventDefault();
    const storedPasscode = localStorage.getItem('enter_admin_passcode') || 'admin123';
    
    if (passcode === storedPasscode) {
      setIsAuthenticated(true);
      setAuthError(false);
      if (rememberMe) {
        // Authenticated for 24 hours
        localStorage.setItem('enter_admin_authenticated', 'true');
        localStorage.setItem('enter_admin_auth_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      }
    } else {
      setAuthError(true);
      setPasscode('');
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  // Handle Log Out
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('enter_admin_authenticated');
    localStorage.removeItem('enter_admin_auth_expiry');
  };

  // Handle Image Upload & convert to Base64 (or upload to Supabase if active)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الملف كبير جداً! الحد الأقصى هو 5 ميجابايت.");
        return;
      }
      setUploadedImageName(file.name);

      if (isSupabaseActive()) {
        setIsUploadingImage(true);
        try {
          const publicUrl = await uploadCloudImage(file);
          if (publicUrl) {
            setFormData(prev => ({ ...prev, image: publicUrl }));
            setSuccessMessage("تم رفع الصورة إلى مخزن السحاب بنجاح!");
            setTimeout(() => setSuccessMessage(''), 3000);
          }
        } catch (error) {
          alert("خطأ أثناء رفع الصورة إلى السحابة: " + error.message);
        } finally {
          setIsUploadingImage(false);
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Select a preset background gradient
  const selectPresetBg = (bgClass) => {
    setFormData(prev => ({ 
      ...prev, 
      bgClass: bgClass,
      image: '' // Reset uploaded image if preset selected
    }));
    setUploadedImageName('');
  };

  // Handle Submit Form (Add or Edit)
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) {
      alert("الرجاء ملء جميع الحقول المطلوبة!");
      return;
    }

    const tagArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const currentFormData = { ...formData, tags: tagArray };

    if (isSupabaseActive()) {
      try {
        if (isEditing) {
          await updateCloudProject(currentFormData);
          setSuccessMessage("تم تعديل المشروع في السحابة بنجاح!");
        } else {
          await insertCloudProject(currentFormData, projects.length);
          setSuccessMessage("تم إضافة المشروع إلى السحابة بنجاح!");
        }

        // Pull latest state from Supabase to refresh parent state
        const newList = await fetchCloudProjects();
        onUpdateProjects(newList);
      } catch (error) {
        alert("فشل الحفظ السحابي: " + error.message);
        return;
      }
    } else {
      if (isEditing) {
        const updatedList = projects.map(proj => 
          proj.id === formData.id 
            ? currentFormData 
            : proj
        );
        onUpdateProjects(updatedList);
        setSuccessMessage("تم تعديل المشروع بنجاح!");
      } else {
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        const newProject = {
          ...currentFormData,
          id: newId
        };
        onUpdateProjects([...projects, newProject]);
        setSuccessMessage("تم إضافة المشروع بنجاح!");
      }
    }

    // Reset Form and redirect to list
    setTimeout(() => {
      setSuccessMessage('');
      resetForm();
      setActiveTab('projects');
    }, 1500);
  };

  // Trigger Edit Mode
  const startEditProject = (project) => {
    setFormData({
      id: project.id,
      title: project.title,
      desc: project.desc,
      category: project.category,
      url: project.url || '',
      tags: project.tags.join(', '),
      image: project.image || '',
      bgClass: project.bgClass || 'project-5-bg'
    });
    setUploadedImageName(project.image ? 'تم تحميل صورة مخصصة' : '');
    setIsEditing(true);
    setActiveTab('add');
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المشروع نهائياً؟")) {
      if (isSupabaseActive()) {
        try {
          await deleteCloudProject(id);
          const newList = await fetchCloudProjects();
          onUpdateProjects(newList);
          setSuccessMessage("تم حذف المشروع من السحابة بنجاح!");
          setTimeout(() => setSuccessMessage(''), 2000);
        } catch (error) {
          alert("فشل حذف المشروع من السحابة: " + error.message);
        }
      } else {
        const updatedList = projects.filter(proj => proj.id !== id);
        onUpdateProjects(updatedList);
      }
    }
  };

  // Move Project Index (Reordering)
  const moveProject = async (index, direction) => {
    const newProjects = [...projects];
    if (direction === 'up' && index > 0) {
      const temp = newProjects[index];
      newProjects[index] = newProjects[index - 1];
      newProjects[index - 1] = temp;
    } else if (direction === 'down' && index < projects.length - 1) {
      const temp = newProjects[index];
      newProjects[index] = newProjects[index + 1];
      newProjects[index + 1] = temp;
    }
    
    // Update local state immediately so UI is responsive
    onUpdateProjects(newProjects);

    if (isSupabaseActive()) {
      try {
        await syncProjectsOrder(newProjects);
      } catch (error) {
        console.error("Failed to sync project ordering to cloud:", error);
      }
    }
  };

  // Change Admin Settings Passcode
  const handleUpdatePasscode = (e) => {
    e.preventDefault();
    if (newPasscode.length < 5) {
      setSettingsMessage("يجب أن تكون كلمة المرور 5 أحرف أو أكثر!");
      return;
    }
    localStorage.setItem('enter_admin_passcode', newPasscode);
    setNewPasscode('');
    setSettingsMessage("تم تحديث كلمة المرور بنجاح!");
    setTimeout(() => setSettingsMessage(''), 3000);
  };

  // Database backups: Export JSON
  const handleExportDB = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `enter_dev_projects_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Database backups: Import JSON
  const handleImportDB = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedProjects = JSON.parse(event.target.result);
          if (Array.isArray(importedProjects)) {
            onUpdateProjects(importedProjects);
            alert("تم استيراد قاعدة البيانات بنجاح وتحديث المعرض!");
          } else {
            alert("صيغة الملف غير صحيحة! يجب أن يكون مصفوفة من المشاريع.");
          }
        } catch (err) {
          alert("خطأ في قراءة ملف الـ JSON!");
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to default initial layout
  const handleResetDB = () => {
    if (window.confirm("هل أنت متأكد من إعادة تعيين المعرض للمشاريع الافتراضية؟ سيؤدي ذلك لحذف كافة التغييرات.")) {
      localStorage.removeItem('enter_dev_projects');
      window.location.reload();
    }
  };

  // Test and save Supabase credentials
  const handleTestAndSaveSupabase = async (e) => {
    e.preventDefault();
    if (!supabaseUrlState || !supabaseAnonKeyState) {
      setConnectionStatus({ success: false, message: "يرجى تعبئة كلا الحقلين لإتمام الفحص!" });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      const result = await testSupabaseConnection(supabaseUrlState.trim(), supabaseAnonKeyState.trim());
      setConnectionStatus(result);

      if (result.success) {
        // Save to localStorage
        localStorage.setItem('enter_supabase_url', supabaseUrlState.trim());
        localStorage.setItem('enter_supabase_anon_key', supabaseAnonKeyState.trim());
        localStorage.setItem('enter_cloud_enabled', 'true');
        setCloudEnabled(true);
        
        // Fetch projects to update application state
        const newList = await fetchCloudProjects();
        onUpdateProjects(newList);
        
        setSettingsMessage("تم حفظ وتفعيل الاتصال السحابي بنجاح!");
        setTimeout(() => setSettingsMessage(''), 4000);
      }
    } catch (error) {
      setConnectionStatus({ success: false, message: error.message });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Switch back to LocalStorage
  const handleSwitchToLocal = () => {
    localStorage.setItem('enter_cloud_enabled', 'false');
    setCloudEnabled(false);
    setConnectionStatus(null);
    setSettingsMessage("تم العودة إلى وضع التخزين المحلي (LocalStorage).");
    setTimeout(() => setSettingsMessage(''), 4000);
    
    // Reload local storage projects
    const local = localStorage.getItem('enter_dev_projects');
    if (local) {
      try {
        onUpdateProjects(JSON.parse(local));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sync local data to Supabase
  const handleMigrateLocalToCloud = async () => {
    if (projects.length === 0) {
      alert("لا يوجد مشاريع محلية لرفعها إلى السحابة!");
      return;
    }
    setIsSyncingData(true);
    try {
      const success = await bulkMigrateLocalToCloud(projects);
      if (success) {
        alert("تمت الهجرة والمزامنة بنجاح! مشاريعك الآن محفوظة بالكامل سحابياً.");
        const newList = await fetchCloudProjects();
        onUpdateProjects(newList);
      }
    } catch (error) {
      alert("خطأ أثناء المزامنة: " + error.message);
    } finally {
      setIsSyncingData(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      desc: '',
      category: 'مواقع الويب',
      url: '',
      tags: '',
      image: '',
      bgClass: 'project-5-bg'
    });
    setUploadedImageName('');
    setIsEditing(false);
  };

  // Category counts for stats
  const totalProjects = projects.length;
  const webProjects = projects.filter(p => p.category === 'مواقع الويب').length;
  const appProjects = projects.filter(p => p.category === 'تطبيقات الجوال').length;
  const uiuxProjects = projects.filter(p => p.category === 'UI/UX').length;

  // Render Passcode Form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="login-backdrop-glow"></div>
        <div className="login-glass-panel">
          <div className="login-header">
            <div className="shield-icon-wrapper">
              <ShieldCheck size={36} className="neon-green-text" />
            </div>
            <h2>لوحة إدارة <span className="gradient-text">enter.dev</span></h2>
            <p>أدخل كلمة مرور المشرف للوصول إلى لوحة التحكم والتعديل</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className={`input-group ${authError ? 'error-pulse' : ''}`}>
              <Key size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="كلمة مرور لوحة التحكم"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                dir="rtl"
                required
              />
            </div>
            
            {authError && (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>كلمة المرور غير صحيحة! أعد المحاولة</span>
              </div>
            )}

            <div className="remember-me-checkbox">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">تذكرني لمدة 24 ساعة</label>
            </div>

            <button type="submit" className="login-btn">
              <span>تسجيل الدخول الآمن</span>
              <Check size={18} />
            </button>
          </form>

          <button onClick={onClose} className="back-site-btn">
            العودة للموقع الرئيسي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-brand">
          <div className="brand-dot"></div>
          <div>
            <h3>enter.dev</h3>
            <span>لوحة التحكم CMS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); resetForm(); }}
          >
            <LayoutDashboard size={20} />
            <span>الرئيسية</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => { setActiveTab('projects'); resetForm(); }}
          >
            <Briefcase size={20} />
            <span>إدارة الأعمال</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => { setActiveTab('add'); resetForm(); }}
          >
            <PlusCircle size={20} />
            <span>{isEditing ? 'تعديل مشروع' : 'إضافة عمل جديد'}</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); resetForm(); }}
          >
            <Settings size={20} />
            <span>قاعدة البيانات والأمان</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onClose} className="view-site-link">
            <Eye size={16} />
            <span>عرض الموقع الحي</span>
          </button>
          
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content-area">
        {successMessage && (
          <div className="global-success-banner">
            <Check size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Home Dashboard Overview */}
        {activeTab === 'home' && (
          <div className="dashboard-view animate-fade">
            <div className="view-title-block">
              <h2>مرحباً بك في لوحة تحكم الأعمال والخدمات الإنشائية! 🚀</h2>
              <p>إحصائيات فورية ومؤشرات حول محتوى وأعمال معرض enter.dev الرقمي</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-dashboard-grid">
              <div className="stat-dash-card">
                <div className="stat-icon-wrap all">
                  <Briefcase size={24} />
                </div>
                <div className="stat-data">
                  <h4>إجمالي الأعمال</h4>
                  <h3>{totalProjects}</h3>
                </div>
                <div className="stat-bg-glow"></div>
              </div>

              <div className="stat-dash-card">
                <div className="stat-icon-wrap web">
                  <Globe size={24} />
                </div>
                <div className="stat-data">
                  <h4>مواقع الويب</h4>
                  <h3>{webProjects}</h3>
                </div>
                <div className="stat-bg-glow"></div>
              </div>

              <div className="stat-dash-card">
                <div className="stat-icon-wrap app">
                  <Smartphone size={24} />
                </div>
                <div className="stat-data">
                  <h4>تطبيقات الجوال</h4>
                  <h3>{appProjects}</h3>
                </div>
                <div className="stat-bg-glow"></div>
              </div>

              <div className="stat-dash-card">
                <div className="stat-icon-wrap uiux">
                  <Layers size={24} />
                </div>
                <div className="stat-data">
                  <h4>واجهات UI/UX</h4>
                  <h3>{uiuxProjects}</h3>
                </div>
                <div className="stat-bg-glow"></div>
              </div>
            </div>

            {/* Quick Tips & Cloud Sync */}
            <div className="dashboard-features-row">
              <div className="glass-card flex-2">
                <h3>إرشادات سريعة للتحكم الرقمي 💡</h3>
                <ul className="dashboard-tips-list">
                  <li><strong>إضافة الصور:</strong> يمكنك رفع صورة مخصصة لمشاريعك عبر أداة الإضافة، وسيتم تشفيرها وحفظها بشكل فوري ومستقر بالكامل.</li>
                  <li><strong>ترتيب المعرض:</strong> توجه لعلامة تبويب "إدارة الأعمال" واستخدم الأسهم لنقل المشاريع للأعلى أو للأسفل لتغيير موقع ظهورها على الموقع مباشرة.</li>
                  <li><strong>الروابط الحية:</strong> لا تترك رابط المشروع فارغاً؛ أضف رابط الموقع الحقيقي للعميل (مثل https://www.khibracontracting.com/) لتمكين زر CTA.</li>
                  <li><strong>النسخ الاحتياطي:</strong> يفضل حفظ نسخة احتياطية من قاعدة بيانات أعمالك من خلال قسم الإعدادات عند إجراء تغييرات كبيرة.</li>
                </ul>
              </div>

              <div className="glass-card flex-1 cloud-sync-card">
                <div className="cloud-header">
                  <Database size={20} className="neon-green-text" />
                  <h3>حالة المزامنة السحابية</h3>
                </div>
                {cloudEnabled && isSupabaseActive() ? (
                  <>
                    <div className="cloud-status-indicator active">
                      <div className="status-dot" style={{ backgroundColor: '#00ff87' }}></div>
                      <span>قاعدة بيانات نشطة ومؤمنة (سحابياً)</span>
                    </div>
                    <p className="cloud-desc">مشاريعك ومرفقات الصور تتم مزامنتها بشكل آمن ومستمر مع محرك قاعدة بيانات Supabase سحابياً.</p>
                  </>
                ) : (
                  <>
                    <div className="cloud-status-indicator active">
                      <div className="status-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                      <span>قاعدة بيانات نشطة ومؤمنة (محلياً)</span>
                    </div>
                    <p className="cloud-desc">المشاريع حالياً يتم حفظها ومزامنتها محلياً مع مخزن المتصفح السريع LocalStorage.</p>
                  </>
                )}
                
                <div className="cloud-adapters-icons">
                  <div className="adapter-logo disabled" title="Firebase">
                    <span>Firebase</span>
                  </div>
                  <div className={`adapter-logo ${cloudEnabled && isSupabaseActive() ? 'active-adapter' : 'disabled'}`} title="Supabase">
                    <span>Supabase</span>
                  </div>
                </div>
                <span className="cloud-note">يمكن إدارة الاتصال وتصدير البيانات ومزامنتها من خلال صفحة الإعدادات.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Projects List */}
        {activeTab === 'projects' && (
          <div className="dashboard-view animate-fade">
            <div className="view-title-block flex-header">
              <div>
                <h2>إدارة وترتيب المشاريع الحالية 🛠️</h2>
                <p>يمكنك تعديل معلومات أي مشروع، حذفه نهائياً، أو التحكم المباشر بترتيب ظهوره في معرض المعروضات</p>
              </div>
              <button onClick={() => { resetForm(); setActiveTab('add'); }} className="primary-glow-btn small">
                <PlusCircle size={16} />
                <span>إضافة مشروع جديد</span>
              </button>
            </div>

            <div className="projects-table-wrapper glass-panel">
              {projects.length === 0 ? (
                <div className="empty-projects-view">
                  <AlertCircle size={48} className="text-muted" />
                  <h3>لا يوجد أي مشاريع حالياً في المعرض!</h3>
                  <p>أضف بعض المشاريع الرقمية للبدء.</p>
                  <button onClick={() => setActiveTab('add')} className="primary-glow-btn">أضف أول مشروع الآن</button>
                </div>
              ) : (
                <table className="projects-admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>المظهر</th>
                      <th>اسم المشروع</th>
                      <th>الفئة</th>
                      <th>أدوات التقنية المستخدمة</th>
                      <th style={{ width: '120px' }}>الترتيب</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>العمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.id}>
                        <td>
                          <div className="table-img-preview">
                            {project.image ? (
                              <img src={project.image} alt={project.title} />
                            ) : (
                              <div className={`table-placeholder-bg ${project.bgClass || 'project-5-bg'}`}></div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="table-project-meta">
                            <strong>{project.title}</strong>
                            <p>{project.desc.substring(0, 50)}...</p>
                          </div>
                        </td>
                        <td>
                          <span className="table-category-tag">{project.category}</span>
                        </td>
                        <td>
                          <div className="table-tags-wrap">
                            {project.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
                          </div>
                        </td>
                        <td>
                          <div className="order-buttons-wrap">
                            <button 
                              onClick={() => moveProject(index, 'up')}
                              disabled={index === 0}
                              className="order-btn"
                              title="نقل للأعلى"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button 
                              onClick={() => moveProject(index, 'down')}
                              disabled={index === projects.length - 1}
                              className="order-btn"
                              title="نقل للأسفل"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons-wrap">
                            <button 
                              onClick={() => startEditProject(project)}
                              className="act-btn edit" 
                              title="تعديل المشروع"
                            >
                              <Edit3 size={15} />
                              <span>تعديل</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="act-btn delete" 
                              title="حذف المشروع"
                            >
                              <Trash2 size={15} />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Add / Edit Project Form */}
        {activeTab === 'add' && (
          <div className="dashboard-view animate-fade">
            <div className="view-title-block">
              <h2>{isEditing ? 'تعديل وتعديل المشروع المختار ✏️' : 'إضافة عمل رقمي جديد للمعرض 🏗️'}</h2>
              <p>املأ الحقول التالية بالمعلومات الهندسية والتقنية لتحديث واجهة الأعمال فوراً</p>
            </div>

            <form onSubmit={handleSubmitProject} className="project-editor-form glass-panel">
              <div className="form-grid">
                {/* Right Column: Text Information */}
                <div className="form-column">
                  <div className="form-group-custom">
                    <label>اسم المشروع / المنصة الرقمية <span className="req">*</span></label>
                    <input 
                      type="text" 
                      placeholder="مثال: Lumina E-Commerce أو Khibra Contracting"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>وصف المشروع تفصيلي ومهني <span className="req">*</span></label>
                    <textarea 
                      placeholder="أدخل وصفاً مشوقاً واحترافياً يوضح طبيعة خدمات المنصة..."
                      value={formData.desc}
                      onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="form-row-custom">
                    <div className="form-group-custom flex-1">
                      <label>فئة وتصنيف العمل <span className="req">*</span></label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="مواقع الويب">مواقع الويب (Websites)</option>
                        <option value="تطبيقات الجوال">تطبيقات الجوال (Mobile Apps)</option>
                        <option value="UI/UX">تصميم واجهة وتجربة المستخدم (UI/UX)</option>
                      </select>
                    </div>

                    <div className="form-group-custom flex-1">
                      <label>رابط المشروع الحي (CTA Link)</label>
                      <input 
                        type="url" 
                        placeholder="مثال: https://www.khibracontracting.com/"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label>أدوات التقنية واللغات المستخدمة (مفصولة بفاصلة) <span className="req">*</span></label>
                    <input 
                      type="text" 
                      placeholder="مثال: React.js, Tailwind, Cloud, Node.js"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      required
                    />
                    <small>افصل بين كل لغة أو تقنية بفاصلة ( , ) لتظهر على شكل بطاقات ووسوم ذكية.</small>
                  </div>
                </div>

                {/* Left Column: Visual Asset Manager */}
                <div className="form-column visual-column">
                  <label className="section-label-form">غلاف وبطاقة معاينة المشروع</label>
                  
                  {/* Preview Container */}
                  <div className="dynamic-card-preview-container">
                    <div className="portfolio-card style-mock">
                      <div className="portfolio-img-wrapper">
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                          <div className={`img-placeholder ${formData.bgClass}`}></div>
                        )}
                        <div className="portfolio-overlay style-mock-overlay">
                          <span className="mock-btn"><ExternalLink size={18} /></span>
                        </div>
                      </div>
                      <div className="portfolio-info text-right">
                        <h3>{formData.title || 'اسم المشروع يظهر هنا'}</h3>
                        <p>{formData.desc || 'وصف المشروع المختصر سيتم عرضه هنا للعملاء بدقة وعناية.'}</p>
                        <div className="tags" style={{ justifyContent: 'flex-end' }}>
                          {formData.tags ? 
                            formData.tags.split(',').map((t, i) => t.trim() && <span key={i}>{t.trim()}</span>)
                            : <span>React</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="media-uploader-box">
                    <div className="upload-btn-wrapper">
                      <button className="uploader-trigger-btn" type="button">
                        <Upload size={16} />
                        <span>{uploadedImageName ? 'تغيير الصورة المخصصة' : 'تحميل غلاف مخصص (صورة)'}</span>
                      </button>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    {uploadedImageName && <span className="file-name-indicator">{uploadedImageName}</span>}
                    <p className="upload-note">يرجى رفع صور بامتداد PNG أو JPG لا تتعدى 2MB لضمان سرعة التصفح.</p>
                  </div>

                  {/* Or Select Preset Gradients */}
                  <div className="presets-selector-wrapper">
                    <span>أو اختر تدرجاً لونياً مستقبلياً جاهزاً:</span>
                    <div className="presets-grid">
                      <button 
                        type="button" 
                        onClick={() => selectPresetBg('project-1-bg')}
                        className={`preset-btn project-1-bg ${formData.bgClass === 'project-1-bg' && !formData.image ? 'active' : ''}`}
                        title="أخضر ورمادي عميق"
                      ></button>
                      <button 
                        type="button" 
                        onClick={() => selectPresetBg('project-2-bg')}
                        className={`preset-btn project-2-bg ${formData.bgClass === 'project-2-bg' && !formData.image ? 'active' : ''}`}
                        title="تدرج داكن نيوني"
                      ></button>
                      <button 
                        type="button" 
                        onClick={() => selectPresetBg('project-3-bg')}
                        className={`preset-btn project-3-bg ${formData.bgClass === 'project-3-bg' && !formData.image ? 'active' : ''}`}
                        title="أخضر زمردي غامق"
                      ></button>
                      <button 
                        type="button" 
                        onClick={() => selectPresetBg('project-5-bg')}
                        className={`preset-btn project-5-bg ${formData.bgClass === 'project-5-bg' && !formData.image ? 'active' : ''}`}
                        title="أخضر مضيء ومستقبلي"
                      ></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="form-submit-row">
                <button type="submit" className="primary-glow-btn">
                  <Check size={18} />
                  <span>{isEditing ? 'تعديل وحفظ التغييرات' : 'حفظ ونشر العمل فوراً'}</span>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { resetForm(); setActiveTab('projects'); }}
                  className="cancel-form-btn"
                >
                  إلغاء التراجع
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Settings & DB Backup Controls */}
        {activeTab === 'settings' && (
          <div className="dashboard-view animate-fade">
            <div className="view-title-block">
              <h2>إعدادات قاعدة البيانات والأمن الإلكتروني 🔐</h2>
              <p>تصدير واستيراد بيانات أعمالك، إعادة تهيئة النظام، أو تغيير كلمة مرور الوصول الآمن للوحة</p>
            </div>

            <div className="dashboard-features-row">
              {/* Box 1: DB Tools */}
              <div className="glass-card flex-1">
                <div className="card-sub-header">
                  <Database size={18} className="neon-green-text" />
                  <h3>أدوات إدارة وتصدير البيانات</h3>
                </div>
                <p className="settings-box-desc">نظام تخزين المشاريع مدعوم بأدوات سحابية لتصدير ملفات JSON صلبة لسهولة التنقل أو استيرادها دفعة واحدة.</p>
                
                <div className="db-actions-vertical">
                  <button onClick={handleExportDB} className="db-act-btn outline">
                    <Database size={16} />
                    <span>تصدير نسخة احتياطية (JSON)</span>
                  </button>

                  <div className="db-import-wrapper">
                    <button className="db-act-btn outline import-btn-trigger">
                      <Upload size={16} />
                      <span>استيراد واسترجاع قاعدة بيانات</span>
                    </button>
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleImportDB}
                    />
                  </div>

                  <button onClick={handleResetDB} className="db-act-btn reset">
                    <RefreshCw size={16} />
                    <span>إعادة تعيين للمصنع (تنظيف شامل)</span>
                  </button>
                </div>
              </div>

              {/* Box 2: Lock Access Credentials */}
              <div className="glass-card flex-1">
                <div className="card-sub-header">
                  <Key size={18} className="neon-green-text" />
                  <h3>تغيير كلمة مرور المشرف</h3>
                </div>
                <p className="settings-box-desc">قم بتعديل كلمة مرور تسجيل الدخول لتأمين لوحة التحكم والتحكم بالأعمال بشكل خاص وقوي.</p>
                
                <form onSubmit={handleUpdatePasscode} className="settings-pass-form">
                  <div className="input-group">
                    <Key size={16} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="كلمة مرور جديدة (5 رموز على الأقل)"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      required
                    />
                  </div>
                  
                  {settingsMessage && (
                    <span className="settings-feedback-msg">{settingsMessage}</span>
                  )}

                  <button type="submit" className="primary-glow-btn small">
                    تحديث كلمة المرور
                  </button>
                </form>
              </div>
            </div>

            {/* Box 3: Cloud Database Hookup Slots */}
            <div className="glass-card full-width-card mt-2">
              <div className="card-sub-header">
                <ShieldCheck size={18} className="neon-green-text" />
                <h3>ربط مزامنة السحابة الخارجية (Supabase API)</h3>
              </div>
              <p className="settings-box-desc">إذا كنت ترغب بالترقية من نظام LocalStorage المحلي إلى قاعدة بيانات سحابية خارجية (Supabase) مستمرة، أدخل بيانات الربط أدناه وقم بتفعيل الربط السحابي:</p>
              
              <div className="cloud-config-form">
                <div className="cloud-engine-selectors">
                  <div 
                    className={`engine-select-option ${!cloudEnabled ? 'active' : ''}`}
                    onClick={handleSwitchToLocal}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`radio-check ${!cloudEnabled ? 'active' : ''}`}></div>
                    <span>LocalStorage (محلي نشط)</span>
                  </div>
                  
                  <div 
                    className={`engine-select-option ${cloudEnabled ? 'active' : ''}`}
                    onClick={() => {
                      if (!supabaseUrlState || !supabaseAnonKeyState) {
                        alert("يرجى إدخال مفاتيح اتصال Supabase أدناه أولاً للفحص والاتصال!");
                        return;
                      }
                      localStorage.setItem('enter_cloud_enabled', 'true');
                      setCloudEnabled(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`radio-check ${cloudEnabled ? 'active' : ''}`}></div>
                    <span>Supabase DB Engine (سحابي نشط)</span>
                  </div>
                </div>

                <form onSubmit={handleTestAndSaveSupabase} className="cloud-inputs-row">
                  <div className="mock-input-row" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div className="mock-input-group flex-1">
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Cloud API Endpoint / Database URL</label>
                      <input 
                        type="text" 
                        placeholder="https://your-project.supabase.co" 
                        value={supabaseUrlState}
                        onChange={(e) => setSupabaseUrlState(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(7, 10, 9, 0.6)',
                          border: '1.5px solid rgba(16, 185, 129, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          textAlign: 'left'
                        }}
                        required
                      />
                    </div>
                    <div className="mock-input-group flex-1">
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Public Access Token / Anon Key</label>
                      <input 
                        type="password" 
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                        value={supabaseAnonKeyState}
                        onChange={(e) => setSupabaseAnonKeyState(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(7, 10, 9, 0.6)',
                          border: '1.5px solid rgba(16, 185, 129, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          textAlign: 'left'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {connectionStatus && (
                    <div 
                      className="connection-status-alert" 
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        backgroundColor: connectionStatus.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: connectionStatus.success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                        color: connectionStatus.success ? '#00ff87' : '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{connectionStatus.message}</span>
                    </div>
                  )}

                  <div className="settings-cloud-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      type="submit" 
                      className="primary-glow-btn small"
                      disabled={isTestingConnection}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {isTestingConnection ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={16} />}
                      <span>{isTestingConnection ? 'جاري فحص الاتصال...' : 'فحص وتفعيل الاتصال السحابي'}</span>
                    </button>

                    {cloudEnabled && isSupabaseActive() && (
                      <button
                        type="button"
                        onClick={handleMigrateLocalToCloud}
                        className="db-act-btn outline"
                        disabled={isSyncingData}
                        style={{
                          margin: 0,
                          padding: '0.6rem 1.2rem',
                          border: '1px solid rgba(0, 255, 135, 0.25)',
                          color: '#00ff87',
                          backgroundColor: 'rgba(0, 255, 135, 0.05)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isSyncingData ? <RefreshCw size={14} className="spin" /> : <Database size={16} />}
                        <span>{isSyncingData ? 'جاري مزامنة قاعدة البيانات...' : 'مزامنة ورفع البيانات المحلية إلى السحاب ⚡'}</span>
                      </button>
                    )}
                  </div>
                </form>
                
                <span className="cloud-note" style={{ display: 'block', marginTop: '1.25rem' }}>
                  <HelpCircle size={14} /> التمكين السحابي الخارجي يتطلب تفعيل تراخيص API وجداول من Supabase ومحمي ببروتوكولات التشفير الآمن للمشرف.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
