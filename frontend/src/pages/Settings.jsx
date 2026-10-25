import { useEffect, useState } from 'react'
import api from '../api'

const initialProfile = { name: '', email: '', preferences: { emailUpdates: true, healthReminders: true } }

export default function Settings() {
  const [profile, setProfile] = useState(initialProfile)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [deletePassword, setDeletePassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setProfile(data.user))
      .catch((err) => setError(err.response?.data?.error || 'Unable to load your profile'))
      .finally(() => setLoading(false))
  }, [])

  const updateProfile = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/profile', profile)
      setProfile(data.user)
      setMessage('Profile and preferences saved.')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save your profile')
    } finally {
      setSaving(false)
    }

  }

  const changePassword = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setSaving(true)
    try {
      await api.post('/auth/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password updated successfully.')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to change your password')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!deletePassword) {
      setError('Enter your password to delete your account')
      return
    }
    if (!window.confirm('Delete your account and all saved screenings? This cannot be undone.')) return
    setError('')
    setSaving(true)
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } })
      localStorage.removeItem('token')
      window.location.href = '/login'
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete your account')
      setSaving(false)
    }
  }

  if (loading) return <section className="card"><p className="muted">Loading your account settings...</p></section>

  return <div>
    <div className="page-title">
      <span className="eyebrow">PROFILE & SETTINGS</span>
      <h1>Manage your RenalCare account.</h1>
      <p className="muted">Update your personal details, security, and communication preferences.</p>
    </div>
    {error && <p className="error">{error}</p>}
    {message && <p className="success">{message}</p>}
    <section className="card settings-card">
      <div className="settings-heading"><div><span className="eyebrow">PERSONAL DETAILS</span><h2>Your profile</h2></div><span className="settings-avatar">{profile.name?.charAt(0).toUpperCase() || '?'}</span></div>
      <form onSubmit={updateProfile}>
        <div className="settings-form-grid">
          <label>Full name<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
          <label>Email address<input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
        </div>
        <div className="settings-preferences">
          <h3>Account preferences</h3>
          <label className="setting-toggle"><input type="checkbox" checked={profile.preferences?.emailUpdates ?? true} onChange={(event) => setProfile({ ...profile, preferences: { ...profile.preferences, emailUpdates: event.target.checked } })} /><span><strong>Product updates</strong><small>Receive occasional RenalCare account and feature updates.</small></span></label>
          <label className="setting-toggle"><input type="checkbox" checked={profile.preferences?.healthReminders ?? true} onChange={(event) => setProfile({ ...profile, preferences: { ...profile.preferences, healthReminders: event.target.checked } })} /><span><strong>Health reminders</strong><small>Allow reminders about reviewing your saved screening history.</small></span></label>
        </div>
        <button className="primary-button" disabled={saving}>Save changes</button>
      </form>
    </section>
    <section className="card settings-card">
      <div className="settings-heading"><div><span className="eyebrow">ACCOUNT SECURITY</span><h2>Change password</h2></div></div>
      <form onSubmit={changePassword}>
        <div className="settings-form-grid">
          <label>Current password<input required type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} /></label>
          <label>New password<input required minLength="8" type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} /></label>
          <label>Confirm new password<input required minLength="8" type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} /></label>
        </div>
        <p className="settings-help">Use at least 8 characters. Your current password is required to make this change.</p>
        <button disabled={saving}>Update password</button>
      </form>
    </section>
    <section className="card settings-card danger-card">
      <div><span className="eyebrow">DANGER ZONE</span><h2>Delete account</h2><p className="muted">This permanently deletes your account and all saved screening history. This action cannot be undone.</p></div>
      <div className="delete-account-row"><input aria-label="Password for account deletion" type="password" placeholder="Enter your password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} /><button className="delete-button" type="button" disabled={saving} onClick={deleteAccount}>Delete account</button></div>
    </section>
  </div>
}
