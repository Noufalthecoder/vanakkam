'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Database,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Server,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Search,
} from 'lucide-react'

interface UserRecord {
  id?: number
  name: string
  email: string
  occasion?: string
  style?: string
  finish?: string
  lipstick_shade?: string
  blush_shade?: string
  eyeshadow_shade?: string
  budget_inr?: number
  experience_level?: string
  concerns?: string
  notes?: string
  created_at?: string
  source?: 'mysql' | 'local_fallback'
}

interface DbStatus {
  connected: boolean
  mode: string
  host: string
  port: number
  user: string
  database: string
  tableName: string
  recordCount: number
  message: string
}

export default function MysqlUsersPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [users, setUsers] = useState<UserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form State
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<UserRecord>({
    name: '',
    email: '',
    occasion: 'Bridal',
    style: 'Traditional',
    finish: 'Satin',
    lipstick_shade: '#A81C28 (Ruby Woo Red)',
    blush_shade: '#E68A7E (Soft Coral Peach)',
    eyeshadow_shade: '#D4AF37 (Champagne Gold)',
    budget_inr: 7500,
    experience_level: 'Beginner',
    concerns: 'Under-eye dark circles',
    notes: 'Bride preferring golden warm tones.',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // SQL Schema Modal
  const [showSqlModal, setShowSqlModal] = useState(false)
  const [sqlContent, setSqlContent] = useState('')
  const [copiedSql, setCopiedSql] = useState(false)

  // Load Status & Users on mount
  const loadData = async () => {
    setIsRefreshing(true)
    try {
      const [statusRes, usersRes] = await Promise.all([
        fetch('/api/mysql/status').then((r) => r.json()),
        fetch('/api/mysql/users').then((r) => r.json()),
      ])
      if (statusRes.success) setStatus(statusRes)
      if (usersRes.success) setUsers(usersRes.users)
    } catch (err: any) {
      setNotification({ type: 'error', text: `Failed to connect to backend: ${err.message}` })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Handle Add User Form Submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      setNotification({ type: 'error', text: 'Name and email are required.' })
      return
    }

    setFormSubmitting(true)
    try {
      const res = await fetch('/api/mysql/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        setNotification({ type: 'success', text: 'User profile stored successfully!' })
        setShowAddForm(false)
        setFormData({
          name: '',
          email: '',
          occasion: 'Bridal',
          style: 'Traditional',
          finish: 'Satin',
          lipstick_shade: '#A81C28',
          blush_shade: '#E68A7E',
          eyeshadow_shade: '#D4AF37',
          budget_inr: 5000,
          experience_level: 'Beginner',
          concerns: '',
          notes: '',
        })
        loadData()
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to save user.' })
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: `Network error: ${err.message}` })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async (id?: number) => {
    if (!id) return
    if (!confirm(`Are you sure you want to delete user record #${id}?`)) return

    try {
      const res = await fetch(`/api/mysql/users?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setNotification({ type: 'success', text: `Record #${id} deleted.` })
        setUsers(users.filter((u) => u.id !== id))
      } else {
        setNotification({ type: 'error', text: data.error || 'Could not delete user.' })
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: `Error deleting: ${err.message}` })
    }
  }

  // Fetch and show SQL Schema
  const handleShowSql = async () => {
    try {
      const res = await fetch('/api/mysql/export')
      const text = await res.text()
      setSqlContent(text)
      setShowSqlModal(true)
    } catch (err: any) {
      setNotification({ type: 'error', text: `Failed to generate SQL dump: ${err.message}` })
    }
  }

  // Copy SQL to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.occasion && u.occasion.toLowerCase().includes(q)) ||
      (u.style && u.style.toLowerCase().includes(q))
    )
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        padding: '30px 20px 60px',
        fontFamily: "'Comic Sans MS', 'Comic Sans', cursive, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--ink)',
            paddingBottom: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'var(--cream)',
                border: '1.5px solid var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                color: 'var(--ink)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              <ArrowLeft size={16} /> Back to Makeup Assistant
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--yellow)',
                  border: '1.5px solid var(--ink)',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Database size={16} />
              </div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
                MySQL User Data Store
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={loadData}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--cream)',
                border: '1.5px solid var(--ink)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleShowSql}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--yellow)',
                border: '1.5px solid var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Export SQL Dump
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            style={{
              padding: '12px 18px',
              marginBottom: '20px',
              background: notification.type === 'success' ? '#F0FFF4' : '#FFF0F0',
              border: '2px solid ' + (notification.type === 'success' ? '#2E7D32' : '#D32F2F'),
              color: notification.type === 'success' ? '#1B5E20' : '#B71C1C',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Connection Status Banner */}
        <div
          style={{
            background: 'var(--cream)',
            border: '2px solid var(--ink)',
            boxShadow: '6px 6px 0 var(--yellow)',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: status?.connected ? '#2E7D32' : '#E6A23C',
                  display: 'inline-block',
                }}
              />
              <strong style={{ fontSize: '15px' }}>
                {status?.connected ? 'Live MySQL Database Connected' : 'Local Fallback Storage Active'}
              </strong>
              <span
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: status?.connected ? '#E8F5E9' : '#FFF8E1',
                  border: '1px solid var(--ink)',
                }}
              >
                {status?.mode === 'mysql_live' ? 'ENGINE: MySQL InnoDB' : 'MODE: Auto-Persistence'}
              </span>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--muted)' }}>
              {status?.message || 'Checking database parameters...'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '12px' }}>
              <span>
                <strong>Host:</strong> {status?.host || 'localhost'}:{status?.port || 3306}
              </span>
              <span>
                <strong>Database:</strong> {status?.database || 'lemon_makeup_db'}
              </span>
              <span>
                <strong>Table:</strong> {status?.tableName || 'lemon_users'}
              </span>
              <span>
                <strong>Total Records:</strong> {users.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '12px 20px',
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--yellow)',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            {showAddForm ? 'Close Form' : 'Store New User Data'}
          </button>
        </div>

        {/* Add User Modal / Collapsible Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddUser}
            style={{
              background: 'var(--cream)',
              border: '2px solid var(--ink)',
              boxShadow: '6px 6px 0 var(--ink)',
              padding: '24px',
              marginBottom: '28px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 800 }}>
              Insert User Record into MySQL (`lemon_users`)
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  User Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Sengupta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink)',
                    background: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. diya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink)',
                    background: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Occasion
                </label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink)',
                    background: '#fff',
                    fontSize: '13px',
                  }}
                >
                  <option value="Bridal">Bridal</option>
                  <option value="Reception">Reception</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Party">Party</option>
                  <option value="Everyday">Everyday</option>
                  <option value="Photoshoot">Photoshoot</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Style & Finish
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink)',
                    background: '#fff',
                    fontSize: '13px',
                  }}
                >
                  <option value="Traditional">Traditional</option>
                  <option value="Soft Glam">Soft Glam</option>
                  <option value="Full Glam">Full Glam</option>
                  <option value="Natural">Natural</option>
                  <option value="Minimalist">Minimalist</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Budget (INR ₹)
                </label>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  step="100"
                  value={formData.budget_inr || 5000}
                  onChange={(e) => setFormData({ ...formData, budget_inr: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink)',
                    background: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Lipstick Shade
                </label>
                <input
                  type="text"
                  placeholder="#A81C28 Ruby Woo Red"
                  value={formData.lipstick_shade || ''}
                  onChange={(e) => setFormData({ ...formData, lipstick_shade: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink)',
                    background: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                Skin Concerns & Techniques
              </label>
              <input
                type="text"
                placeholder="e.g. Under-eye darkness, visible redness"
                value={formData.concerns || ''}
                onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1.5px solid var(--ink)',
                  background: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={formSubmitting}
                style={{
                  padding: '10px 20px',
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: '1.5px solid var(--ink)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: formSubmitting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {formSubmitting ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                Execute INSERT Statement
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1.5px solid var(--ink)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Search & Stats Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--cream)',
              border: '1.5px solid var(--ink)',
              padding: '6px 12px',
              minWidth: '280px',
            }}
          >
            <Search size={14} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search user, email, occasion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '12px',
                width: '100%',
              }}
            />
          </div>

          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>
            Showing {filteredUsers.length} of {users.length} user records
          </span>
        </div>

        {/* User Data Table */}
        <div
          style={{
            background: 'var(--cream)',
            border: '2px solid var(--ink)',
            boxShadow: '6px 6px 0 var(--yellow)',
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--yellow)', borderBottom: '2px solid var(--ink)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>#ID</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>User Profile</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Occasion & Style</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Selected Shades</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Budget (INR)</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Concerns & Notes</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Storage</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                    {isLoading ? 'Loading records...' : 'No user records found. Click "Store New User Data" to add one!'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--muted)' }}>
                      #{user.id}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800 }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: 'var(--yellow)',
                          border: '1px solid var(--ink)',
                          fontSize: '11px',
                          fontWeight: 700,
                          marginRight: '6px',
                        }}
                      >
                        {user.occasion || 'Bridal'}
                      </span>
                      <span style={{ fontSize: '11px' }}>{user.style || 'Traditional'}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px' }}>
                      <div>💄 {user.lipstick_shade || 'Ruby Woo Red'}</div>
                      <div>✨ {user.blush_shade || 'Soft Coral'}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800 }}>
                      ₹{user.budget_inr ? Number(user.budget_inr).toLocaleString('en-IN') : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', maxWidth: '220px' }}>
                      {user.concerns && <div><strong>Concerns:</strong> {user.concerns}</div>}
                      {user.notes && <div style={{ color: 'var(--muted)' }}>{user.notes}</div>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 800,
                          background: user.source === 'mysql' ? '#E8F5E9' : '#FFF9C4',
                          border: '1px solid var(--ink)',
                        }}
                      >
                        {user.source === 'mysql' ? 'MySQL' : 'Fallback'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete record from database"
                        style={{
                          border: '1px solid #D32F2F',
                          background: '#FFEBEE',
                          color: '#C62828',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SQL Schema / Dump Modal */}
        {showSqlModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 999,
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '720px',
                background: 'var(--cream)',
                border: '2px solid var(--ink)',
                boxShadow: '10px 10px 0 var(--ink)',
                padding: '24px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  MySQL DDL & Schema Export
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--yellow)',
                      border: '1.5px solid var(--ink)',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                    {copiedSql ? 'Copied!' : 'Copy SQL'}
                  </button>
                  <a
                    href="/api/mysql/export"
                    download="lemon_users_schema.sql"
                    style={{
                      padding: '6px 12px',
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      border: '1.5px solid var(--ink)',
                      fontWeight: 700,
                      fontSize: '11px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={12} /> Download .sql
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowSqlModal(false)}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1.5px solid var(--ink)',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={sqlContent}
                style={{
                  flex: 1,
                  minHeight: '340px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '12px',
                  background: '#1c1b16',
                  color: '#f4d84a',
                  border: '1.5px solid var(--ink)',
                  whiteSpace: 'pre',
                  overflowY: 'auto',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
