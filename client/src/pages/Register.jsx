import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      login(res.user, res.token);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-extrabold text-navy dark:text-white mb-6 text-center">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-primary to-primary-light text-white font-bold py-3 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
      <p className="text-sm text-muted text-center mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
