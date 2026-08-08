import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HardHat, 
  Radio, 
  Stethoscope, 
  ClipboardList, 
  Bell,
  BookOpen,
  Activity,
  Flame,
  Wind,
  User
} from 'lucide-react';

// --- DATABASE & MAPPINGS ---
const EQUIPMENT_DB = {
  ppe: [
    { id: 'p1', name: 'Hard Hat', desc: 'Protects against falling debris.' },
    { id: 'p2', name: 'Steel-Toe Boots', desc: 'Prevents crush injuries.' },
    { id: 'p3', name: 'Hi-Vis Clothing', desc: 'Ensures visibility in low light.' },
    { id: 'p4', name: 'Respirator Mask', desc: 'Filters harmful particulates.' },
    { id: 'p5', name: 'Safety Glasses', desc: 'Protects eyes from dust.' },
    { id: 'p6', name: 'Heavy-Duty Gloves', desc: 'Prevents cuts and abrasions.' },
    { id: 'p7', name: 'Ear Protection', desc: 'Prevents hearing loss from machinery.' }
  ],
  devices: [
    { id: 'd1', name: 'Cap Lamp (>80%)', desc: 'Primary light source. Check battery.' },
    { id: 'd2', name: 'Multi-Gas Monitor', desc: 'Detects invisible toxic/combustible gases.' },
    { id: 'd3', name: 'Two-Way Radio', desc: 'Essential for surface/underground comms.' },
    { id: 'd4', name: 'SCSR Unit', desc: 'Provides 60 mins of emergency oxygen.' },
    { id: 'd5', name: 'Inspection Tablet', desc: 'For logging audits and conditions.' }
  ],
  medical: [
    { id: 'm1', name: 'Tourniquet', desc: 'Stops severe arterial bleeding.' },
    { id: 'm2', name: 'Burn Dressings', desc: 'Treats thermal or chemical burns.' },
    { id: 'm3', name: 'Splints', desc: 'Immobilizes fractures.' },
    { id: 'm4', name: 'Antiseptic', desc: 'Cleans minor wounds.' },
    { id: 'm5', name: 'Sterile Gauze', desc: 'Basic wound dressing.' },
    { id: 'm6', name: 'Eye Wash', desc: 'Flushes particulates from eyes.' }
  ]
};

const ROLE_REQUIREMENTS = {
  'Underground Miner': {
    ppe: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
    devices: ['d1', 'd2', 'd3', 'd4'],
    medical: ['m4', 'm5']
  },
  'Heavy Machinery Operator': {
    ppe: ['p1', 'p2', 'p3', 'p5', 'p7'],
    devices: ['d3'],
    medical: ['m4', 'm5']
  },
  'Medic / First Responder': {
    ppe: ['p1', 'p2', 'p3', 'p5'],
    devices: ['d1', 'd3'],
    medical: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']
  },
  'Supervisor / Manager': {
    ppe: ['p1', 'p2', 'p3', 'p5'],
    devices: ['d1', 'd2', 'd3', 'd4', 'd5'],
    medical: ['m4', 'm5']
  }
};

export default function App() {
  // NEW STATE: Authentication and User ID
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workerId, setWorkerId] = useState('');

  const [activeTab, setActiveTab] = useState('checklist');
  const [selectedRole, setSelectedRole] = useState('Underground Miner');
  const [checklistState, setChecklistState] = useState({});
  const [supervisorAlerts, setSupervisorAlerts] = useState([
    { id: 1, time: '07:15 AM', user: 'John Doe (Miner)', issue: 'Defective SCSR Seal', status: 'Blocked' }
  ]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [activeIssueItem, setActiveIssueItem] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');

  // Re-initialize checklist when role changes
  useEffect(() => {
    const initialState = {};
    const reqs = ROLE_REQUIREMENTS[selectedRole];
    
    ['ppe', 'devices', 'medical'].forEach(category => {
      reqs[category].forEach(itemId => {
        initialState[itemId] = { checked: false, defective: false, note: '' };
      });
    });
    setChecklistState(initialState);
  }, [selectedRole]);

  const handleToggleCheck = (id) => {
    if (checklistState[id]?.defective) return;
    setChecklistState(prev => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id].checked }
    }));
  };

  const openIssueModal = (item) => {
    setActiveIssueItem(item);
    setIssueDescription('');
    setShowIssueModal(true);
  };

  const reportIssue = () => {
    if (!activeIssueItem || !issueDescription.trim()) return;

    setChecklistState(prev => ({
      ...prev,
      [activeIssueItem.id]: { checked: false, defective: true, note: issueDescription }
    }));

    const newAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${workerId || 'Worker'} (${selectedRole})`,
      issue: `${activeIssueItem.name}: ${issueDescription}`,
      status: 'Blocked'
    };
    setSupervisorAlerts([newAlert, ...supervisorAlerts]);
    
    setShowIssueModal(false);
  };

  const requiredIds = Object.keys(checklistState);
  const totalItems = requiredIds.length;
  const checkedItems = requiredIds.filter(id => checklistState[id]?.checked).length;
  const defectiveItems = requiredIds.filter(id => checklistState[id]?.defective).length;
  const progressPercentage = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);
  const isCleared = progressPercentage === 100;
  const isBlocked = defectiveItems > 0;

  const getFullItemDetails = (id, category) => {
    return EQUIPMENT_DB[category].find(item => item.id === id);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  // --- LOGIN SCREEN RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          
          <div className="text-center mb-8">
            <div className="bg-amber-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <HardHat className="text-slate-900 w-10 h-10" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">MineSafe Portal</h1>
            <p className="text-slate-500">Sign in to start your shift</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Worker ID Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your ID (e.g. EMP-042)" 
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Shift / Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white text-slate-800 font-medium appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
              >
                {Object.keys(ROLE_REQUIREMENTS).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold text-lg py-4 rounded-lg shadow-sm transition-all mt-4"
            >
              Begin Pre-Shift Check
            </button>
          </form>

        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER (unchanged, just nested under the if statement) ---
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <HardHat className="text-amber-500 w-8 h-8" />
          <h1 className="text-xl font-bold text-white tracking-wide">MineSafe</h1>
        </div>
        
        {/* User Info Display */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active User</p>
          <p className="text-white font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" /> {workerId || 'EMP-000'}
          </p>
          <p className="text-sm text-slate-400 mt-1">{selectedRole}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('checklist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'checklist' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}
          >
            <ClipboardList className="w-5 h-5" /> Pre-Shift Check
          </button>
          <button 
            onClick={() => setActiveTab('supervisor')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'supervisor' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" /> Alerts
            </div>
            {supervisorAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {supervisorAlerts.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('emergency')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'emergency' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" /> Emergency Guide
          </button>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-sm font-semibold"
          >
            End Shift / Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        
        {/* --- TAB: CHECKLIST --- */}
        {activeTab === 'checklist' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Shift Clearance Checklist</h2>
              <p className="text-slate-600">Verify your equipment before entering the mine.</p>
            </header>

            {/* Status Banner */}
            {isBlocked ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-4 mb-6 shadow-sm">
                <ShieldAlert className="text-red-500 w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 text-lg">Shift Blocked</h3>
                  <p className="text-red-600">Defective equipment reported. Supervisor has been alerted. Do not proceed.</p>
                </div>
              </div>
            ) : isCleared ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-4 mb-6 shadow-sm">
                <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-800 text-lg">Cleared for Shift</h3>
                  <p className="text-green-600">All equipment verified. You may proceed safely.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex items-center gap-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-slate-700">Readiness Progress</span>
                    <span className="font-bold text-amber-600">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Lists */}
            <div className="space-y-6">
              {[
                { key: 'ppe', title: 'Personal Protective Equipment', icon: HardHat },
                { key: 'devices', title: 'Safety Devices & Survival', icon: Radio },
                { key: 'medical', title: 'Medical & First Aid', icon: Stethoscope }
              ].map(category => (
                <div key={category.key} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                    <category.icon className="text-slate-500 w-5 h-5" />
                    <h3 className="font-bold text-lg text-slate-800">{category.title}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {ROLE_REQUIREMENTS[selectedRole][category.key].map(itemId => {
                      const item = getFullItemDetails(itemId, category.key);
                      const state = checklistState[itemId] || {};
                      
                      return (
                        <div key={itemId} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${state.checked ? 'bg-amber-50/30' : ''} ${state.defective ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-start gap-4">
                            <button 
                              onClick={() => handleToggleCheck(itemId)}
                              disabled={state.defective}
                              className={`mt-1 w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                                ${state.checked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white hover:border-amber-400'}
                                ${state.defective ? 'opacity-50 cursor-not-allowed bg-slate-200 border-slate-300' : 'cursor-pointer'}
                              `}
                            >
                              {state.checked && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div>
                              <p className={`font-semibold ${state.defective ? 'text-red-700 line-through' : 'text-slate-800'}`}>
                                {item.name}
                              </p>
                              <p className="text-sm text-slate-500">{item.desc}</p>
                              {state.defective && (
                                <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Reported: {state.note}
                                </p>
                              )}
                            </div>
                          </div>
                          {!state.defective && !state.checked && (
                            <button 
                              onClick={() => openIssueModal(item)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                            >
                              Report Defect
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: SUPERVISOR DASHBOARD --- */}
        {activeTab === 'supervisor' && (
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Supervisor Dashboard</h2>
              <p className="text-slate-600">Monitor active safety alerts and crew readiness.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
                <AlertTriangle className="text-white w-6 h-6" />
                <h3 className="font-bold text-lg text-white">Active Safety Alerts</h3>
              </div>
              
              {supervisorAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-300 mb-3" />
                  <p>No active alerts. All personnel cleared.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {supervisorAlerts.map(alert => (
                    <div key={alert.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded">{alert.time}</span>
                          <span className="font-semibold text-slate-900">{alert.user}</span>
                        </div>
                        <p className="text-red-700 font-medium flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" /> {alert.issue}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-sm">
                          {alert.status}
                        </span>
                        <button 
                          onClick={() => setSupervisorAlerts(supervisorAlerts.filter(a => a.id !== alert.id))}
                          className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: EMERGENCY GUIDE --- */}
        {activeTab === 'emergency' && (
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Emergency Protocols & Equipment</h2>
              <p className="text-slate-600">Crucial information for crisis response.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Situations */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="text-red-600 w-6 h-6" />
                  <h3 className="font-bold text-xl text-red-900">Fire or Explosion</h3>
                </div>
                <ul className="space-y-3 text-red-800 list-disc list-inside marker:text-red-400">
                  <li><strong>DON SCSR IMMEDIATELY:</strong> Do not wait. Put on your Self-Rescuer right away.</li>
                  <li><strong>STAY LOW:</strong> Smoke and heat rise. Keep close to the floor.</li>
                  <li><strong>DO NOT REMOVE SCSR:</strong> Keep it on until you reach a designated fresh air base or surface.</li>
                  <li><strong>FOLLOW LIFELINES:</strong> Use tactile lifelines to navigate to safety if visibility is zero.</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Wind className="text-amber-600 w-6 h-6" />
                  <h3 className="font-bold text-xl text-amber-900">Gas Leak (Alarm Sounds)</h3>
                </div>
                <ul className="space-y-3 text-amber-800 list-disc list-inside marker:text-amber-400">
                  <li><strong>STOP MACHINERY:</strong> Kill power to prevent sparks in combustible environments.</li>
                  <li><strong>ALERT OTHERS:</strong> Use radio or visual signals to warn nearby crew.</li>
                  <li><strong>CHECK WIND:</strong> Move against the ventilation flow to find fresh air.</li>
                  <li><strong>READ MONITOR:</strong> Note O2 levels and toxic gas readings to relay to supervisors.</li>
                </ul>
              </div>
            </div>

            {/* Equipment Quick Guide */}
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-slate-500" /> Equipment Vital Functions
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-1">SCSR (Self-Rescuer)</h4>
                <p className="text-sm text-slate-600">Generates ~60 mins of oxygen chemically. Bite the mouthpiece tightly, attach nose clip to prevent breathing outside air.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-1">Multi-Gas Monitor</h4>
                <p className="text-sm text-slate-600">Detects Methane (CH4), Carbon Monoxide (CO), Hydrogen Sulfide (H2S), and Oxygen (O2) drops. Do not ignore alarms.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-1">Tourniquet</h4>
                <p className="text-sm text-slate-600">Use for massive limb bleeding. Apply 2-3 inches above the wound. Tighten until bleeding stops. Record time applied.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ISSUE REPORTING MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Report Defective Item
              </h3>
            </div>
            <div className="p-6">
              <p className="font-semibold text-slate-800 mb-4">
                Reporting issue with: <span className="text-red-600">{activeIssueItem?.name}</span>
              </p>
              <label className="block text-sm text-slate-600 mb-2">Describe the problem (Required):</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none h-24 mb-4"
                placeholder="e.g., Frayed strap, battery won't hold charge..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={reportIssue}
                  disabled={!issueDescription.trim()}
                  className="px-4 py-2 font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Report & Block Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}