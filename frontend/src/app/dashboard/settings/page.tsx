"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSettingsStore } from "@/store/useSettingsStore"
import { useAuth } from "@/lib/AuthContext"

import { useRouter } from "next/navigation"
import Link from "next/link"

const TABS = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security & Privacy" },
  { id: "notifications", label: "Notifications" },
  { id: "payments", label: "Payment Preferences" },
  { id: "about", label: "Help & Support" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  
  // Zustand State
  const { profile, appearance, privacy, notifications, payments, updateProfile, updateAppearance, updatePrivacy, updateNotifications, updatePayments } = useSettingsStore()
  
  // Auth Context for Sign Out & Default Data
  const { user, logout, updateUserPassword, deleteUserAccount } = useAuth()
  const router = useRouter()

  // Additional State for Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ old: "", new1: "", new2: "" })
  const [passwordError, setPasswordError] = useState("")
  const [hasCreatedPassword, setHasCreatedPassword] = useState(false)
  const isGoogleUser = user?.email?.includes("google") || false;
  const showCreatePassword = isGoogleUser && !hasCreatedPassword;

  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Internal state for profile form (to track edits before saving)
  const [profileForm, setProfileForm] = useState(profile)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Sync profile form when profile store changes
  useEffect(() => {
    Promise.resolve().then(() => setProfileForm(profile))
  }, [profile])

  const handleSaveProfile = () => {
    updateProfile(profileForm)
    setSaveStatus("Changes saved")
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Profile</h3>
                <p className="text-slate-500 text-sm">Manage your personal information.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-slate-700 text-sm font-semibold">Full Name</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#4a72ff] transition-colors" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-700 text-sm font-semibold">Username</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#4a72ff] transition-colors" value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-700 text-sm font-semibold">Email Address</label>
                  <input type="email" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#4a72ff] transition-colors" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-700 text-sm font-semibold">Phone Number</label>
                  <input type="tel" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#4a72ff] transition-colors" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-700 text-sm font-semibold">Country</label>
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#4a72ff] transition-colors appearance-none" value={profileForm.country} onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}>
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="IN">India</option>
                    <option value="SG">Singapore</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <button onClick={handleSaveProfile} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors">
                  Save Changes
                </button>
                <button onClick={() => setProfileForm(profile)} className="text-slate-500 font-semibold text-sm hover:text-slate-800 transition-colors">
                  Cancel
                </button>
                {saveStatus && (
                  <span className="text-emerald-500 text-sm font-medium ml-2 animate-fade-in">{saveStatus}</span>
                )}
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Preferences</h3>
                <p className="text-slate-500 text-sm">Customize your Ziro experience.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 flex flex-col">
                  <label className="text-slate-700 text-sm font-semibold">Appearance</label>
                  <div className="inline-flex bg-slate-100 rounded-2xl p-1 gap-1 self-start">
                    {(["Light", "Dark"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateAppearance({ theme })}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                          appearance.theme === theme
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {theme === "Light" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        )}
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-slate-700 text-sm font-semibold">Performance Mode</label>
                  <div className="inline-flex bg-white border border-slate-200 rounded-2xl px-5 py-2.5 gap-6 items-center self-start">
                    <span className="text-sm text-slate-800 font-medium whitespace-nowrap">Compact Layout</span>
                    <button 
                      onClick={() => updateAppearance({ performanceMode: !appearance.performanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 transition-colors ${
                        appearance.performanceMode ? 'bg-[#35E58A]' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appearance.performanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 rounded-[32px] p-8 border border-red-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8 mb-2">
              <div>
                <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
                <p className="text-red-500/80 text-sm mt-1">Permanently delete your Ziro account and associated data.</p>
              </div>
              <button onClick={() => setShowDeleteModal(true)} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-red-600 transition-colors shrink-0">
                Delete Account
              </button>
            </div>
          </div>
        )
      case "security":
        return (
          <div className="space-y-8">
            {/* Security Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Security</h3>
                <p className="text-slate-500 text-sm">Manage your account security and authentication.</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
                  <div>
                    <div className="font-semibold text-slate-900">Password</div>
                    <div className="text-slate-500 text-sm mt-1">{showCreatePassword ? "Not set" : "Last changed recently"}</div>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="bg-white border border-slate-200 text-slate-800 px-5 py-2 rounded-full font-semibold text-sm hover:bg-slate-50 transition-colors">
                    {showCreatePassword ? "Create Password" : "Change Password"}
                  </button>
                </div>
                
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
                  <div>
                    <div className="font-semibold text-slate-900">Two-Factor Authentication</div>
                    <div className="text-slate-500 text-sm mt-1">Status: {is2FAEnabled ? "Enabled" : "Not enabled"}</div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!is2FAEnabled) alert("A confirmation has been sent to your google account to complete 2FA setup.");
                      setIs2FAEnabled(!is2FAEnabled);
                    }} 
                    className="bg-slate-900 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-slate-800 transition-colors"
                  >
                    {is2FAEnabled ? "Disable" : "Enable"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Active Sessions</div>
                    <div className="text-slate-500 text-sm mt-1">Chrome · Windows (Current session, Active now)</div>
                  </div>
                  <button onClick={handleSignOut} className="bg-white border border-slate-200 text-slate-800 px-5 py-2 rounded-full font-semibold text-sm hover:bg-slate-50 transition-colors text-red-500 border-red-200 hover:bg-red-50">
                    End all
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Privacy</h3>
                <p className="text-slate-500 text-sm">Control your data and visibility.</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Profile visibility</div>
                    <div className="text-slate-500 text-sm mt-1">Controls who can see your Ziro profile.</div>
                  </div>
                  <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none appearance-none font-medium text-sm" value={privacy.profileVisibility} onChange={(e) => updatePrivacy({ profileVisibility: e.target.value as any })}>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Transaction privacy</div>
                    <div className="text-slate-500 text-sm mt-1">Controls visibility of your public transactions.</div>
                  </div>
                  <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none appearance-none font-medium text-sm" value={privacy.transactionPrivacy} onChange={(e) => updatePrivacy({ transactionPrivacy: e.target.value as any })}>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-6 mt-2">
                  <div>
                    <div className="font-semibold text-slate-900">AI data usage</div>
                    <div className="text-slate-500 text-sm mt-1 max-w-md">Ziro's AI features only use anonymized transaction metadata to optimize smart settlement routing.</div>
                  </div>
                  <button onClick={() => alert("AI Data has been successfully reset.")} className="bg-white border border-slate-200 text-red-500 px-5 py-2 rounded-full font-semibold text-sm hover:bg-red-50 transition-colors">
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case "notifications":
        return (
          <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
              <p className="text-slate-500 text-sm">Choose what updates you want to receive.</p>
            </div>
            
            <div className="space-y-6">
              {[
                { id: 'paymentConfirmations', title: 'Payment confirmations', desc: 'Receive notifications when payments are completed.' },
                { id: 'paymentSecurityAlerts', title: 'Payment security alerts', desc: 'Get notified when Ziro detects a suspicious payment.' },
                { id: 'transferStatusUpdates', title: 'Transfer status updates', desc: 'Receive updates about pending and completed transfers.' },
                { id: 'trustScoreUpdates', title: 'TrustScore updates', desc: 'Receive notifications when your TrustScore changes.' },
                { id: 'consultantNotifications', title: 'Consultant notifications', desc: 'Get reminders and updates about consultations.' },
                { id: 'productUpdates', title: 'Product updates', desc: 'Receive occasional updates about new Ziro features.' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-slate-500 text-sm mt-1">{item.desc}</div>
                  </div>
                  <button 
                    onClick={() => updateNotifications({ [item.id]: !(notifications as any)[item.id] })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      (notifications as any)[item.id] ? 'bg-[#35E58A]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      (notifications as any)[item.id] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      case "payments":
        return (
          <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900">Payment Preferences</h3>
              <p className="text-slate-500 text-sm">Configure how Ziro handles your transactions.</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-slate-900 font-semibold">Default currency</label>
                <div className="w-full md:w-1/2 bg-slate-100 rounded-xl px-4 py-3 text-slate-500 font-medium">
                  USD
                </div>
                <p className="text-xs text-slate-500">Fixed for this account type.</p>
              </div>

              <div className="pt-6 border-t border-slate-200/60 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Payment confirmation</div>
                    <div className="text-slate-500 text-sm mt-1">Require confirmation before sending funds</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[#35E58A] opacity-50 cursor-not-allowed">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Security screening</div>
                    <div className="text-slate-500 text-sm mt-1">Always screen payments before sending</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[#35E58A] opacity-50 cursor-not-allowed">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 italic">Critical security mechanisms cannot be disabled.</p>
              </div>
            </div>
          </div>
        )
      case "about":
        return (
          <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900">Help & Support</h3>
              <p className="text-slate-500 text-sm">Get assistance with your Ziro account.</p>
            </div>
            
            <div className="space-y-4">
              <Link href="/dashboard/help" className="block w-full text-left bg-white border border-slate-200 rounded-2xl px-6 py-4 hover:border-[#4a72ff] hover:shadow-sm transition-all">
                <div className="font-semibold text-slate-900">Help Center</div>
                <div className="text-slate-500 text-sm mt-1">Read guides and FAQs.</div>
              </Link>
              <a href="mailto:support@ziro.app" className="block w-full text-left bg-white border border-slate-200 rounded-2xl px-6 py-4 hover:border-[#4a72ff] hover:shadow-sm transition-all">
                <div className="font-semibold text-slate-900">Contact Ziro Support</div>
                <div className="text-slate-500 text-sm mt-1">Send us an email.</div>
              </a>
              <a href="mailto:support@ziro.app?subject=Payment%20Issue" className="block w-full text-left bg-white border border-slate-200 rounded-2xl px-6 py-4 hover:border-[#4a72ff] hover:shadow-sm transition-all">
                <div className="font-semibold text-slate-900">Report a Payment Issue</div>
                <div className="text-slate-500 text-sm mt-1">File a ticket for a transaction.</div>
              </a>
              <Link href="/dashboard/consultants" className="block w-full text-left bg-[#4a72ff]/5 border border-[#4a72ff]/20 rounded-2xl px-6 py-4 hover:border-[#4a72ff] hover:bg-[#4a72ff]/10 transition-all">
                <div className="font-semibold text-[#4a72ff]">Talk to a Consultant</div>
                <div className="text-slate-600 text-sm mt-1">Get one-to-one human payment assistance.</div>
              </Link>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-full p-6 md:p-10 lg:p-12 w-full max-w-[1200px] mx-auto">
      
      {/* Settings Header */}
      <div className="mb-10">
        <h1 className="text-[2.5rem] font-bold tracking-tight text-slate-900 leading-tight">
          Settings
        </h1>
        <p className="text-slate-500 text-lg mt-2">
          Manage your Ziro account, security, preferences, and notifications.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        
        {/* Left Nav */}
        <div className="w-full md:w-[260px] shrink-0 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-white shadow-sm shadow-black/5 text-[#4a72ff]"
                  : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Panel */}
        <div className="flex-1 w-full min-w-0 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">{showCreatePassword ? "Create Password" : "Change Password"}</h3>
              {passwordError && <div className="mb-4 text-red-500 text-sm font-medium">{passwordError}</div>}
              <div className="space-y-4">
                {!showCreatePassword && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Old Password</label>
                    <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4a72ff]" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <input type="password" value={passwordForm.new1} onChange={e => setPasswordForm({...passwordForm, new1: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4a72ff]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                  <input type="password" value={passwordForm.new2} onChange={e => setPasswordForm({...passwordForm, new2: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4a72ff]" />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => {setShowPasswordModal(false); setPasswordError("")}} className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200">Cancel</button>
                <button onClick={async () => {
                  if (passwordForm.new1 !== passwordForm.new2) {
                    setPasswordError("Passwords do not match"); return;
                  }
                  if (passwordForm.new1.length < 6) {
                    setPasswordError("Password must be at least 6 characters"); return;
                  }
                  try {
                    await updateUserPassword(passwordForm.new1);
                    setHasCreatedPassword(true);
                    setShowPasswordModal(false);
                    setPasswordForm({old: "", new1: "", new2: ""});
                    setPasswordError("");
                    alert("Password updated successfully!");
                  } catch (err: any) {
                    setPasswordError(err.message || "Failed to update password");
                  }
                }} className="flex-1 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800">
                  {showCreatePassword ? "Create" : "Update"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h3>
              <p className="text-sm text-slate-500 mb-8">This action is permanent and cannot be undone. All your data will be erased.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200">Cancel</button>
                <button onClick={async () => {
                  try {
                    await deleteUserAccount();
                    router.push("/login");
                  } catch (err: any) {
                    alert("Failed to delete account: " + err.message);
                  }
                }} className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
