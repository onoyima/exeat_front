'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, updateRoles, updateAssignedHostels } from '@/lib/services/authSlice';
import { api } from '@/lib/services/api';

export default function SoundNotifier() {
  const prevCountRef = useRef<number>(0);
  const firstPollRef = useRef<boolean>(true);
  const currentUser = useSelector(selectCurrentUser) as any;
  const roles: string[] = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isHostelAdmin = roles.includes('hostel_admin');
  const [enabled, setEnabled] = useState<boolean>(isHostelAdmin);
  // const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === 'attendance.veritas.edu.ng')
  const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === 'testexeat.veritas.edu.ng')
    // ? 'https://attendance.veritas.edu.ng/api'
    ? 'https://testexeat.veritas.edu.ng/api'
    : 'http://localhost:8000/api';
  const dispatch = useDispatch();
  const retryDelayRef = useRef<number>(2000);
  const reconnectTimerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gestureBoundRef = useRef<boolean>(false);

  useEffect(() => {
    setEnabled(isHostelAdmin);
    let timer: any;
    let es: EventSource | null = null;
    const playAlertSound = async (audioUrl: string) => {
      // Try WebAudio decoding of MP3 first for reliability
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current!;
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        const res = await fetch(audioUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('audio fetch failed');
        const buf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(buf);
        const src = ctx.createBufferSource();
        src.buffer = audioBuf;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1.0, ctx.currentTime);
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        return;
      } catch (_) {
        // Fallback to HTMLAudio
        try {
          const audio = new Audio(audioUrl);
          audio.crossOrigin = 'anonymous';
          await audio.play();
          return;
        } catch (__) {
          // Last resort: short beep
          try {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current!;
            if (ctx.state === 'suspended') {
              await ctx.resume().catch(() => {});
            }
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.85);
          } catch (___) {}
        }
      }
    };
    const fetchCountAndNotify = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_BASE_URL}/staff/notifications/unread-count`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        const count = json?.data?.unread_count ?? 0;
        if (firstPollRef.current) {
          prevCountRef.current = count;
          firstPollRef.current = false;
          return;
        }
        if (count > prevCountRef.current && enabled) {
          await playAlertSound(`${API_BASE_URL}/notifications/alert-audio`);
          dispatch(api.util.invalidateTags(['Notifications']));
        }
        prevCountRef.current = count;
      } catch (_) {}
    };

    fetchCountAndNotify();
    const setupStream = () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        es = new EventSource(`${API_BASE_URL}/staff/notifications/stream?token=${encodeURIComponent(token)}`);
        es.onmessage = async (e) => {
          try {
            const data = JSON.parse(e.data || '{}');
            const count = Number(data?.unread_count ?? 0);
            const latestEvent = String(data?.latest_event || '');
            if (firstPollRef.current) {
              prevCountRef.current = count;
              firstPollRef.current = false;
              retryDelayRef.current = 2000;
              return;
            }
            if (latestEvent === 'roles_updated' || latestEvent === 'hostel_assignment_updated') {
              try {
                const res = await fetch(`${API_BASE_URL}/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                const json = await res.json();
                const roles = Array.isArray(json?.roles) ? json.roles : [];
                const assignedHostels = Array.isArray(json?.assigned_hostels) ? json.assigned_hostels : [];
                dispatch(updateRoles(roles));
                dispatch(updateAssignedHostels(assignedHostels));
                dispatch(api.util.invalidateTags(['Profile', 'DashboardStats', 'Staff', 'ExeatRequests']));
              } catch (_) {}
            }
            if (count > prevCountRef.current && enabled && (latestEvent === 'gate_signout' || latestEvent === 'gate_signin')) {
              await playAlertSound(`${API_BASE_URL}/notifications/alert-audio`);
              dispatch(api.util.invalidateTags(['Notifications']));
            }
            prevCountRef.current = count;
          } catch {}
        };
        es.onerror = () => {
          try { es && es.close(); } catch {}
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          const delay = Math.min(retryDelayRef.current, 30000);
          reconnectTimerRef.current = setTimeout(() => {
            retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
            setupStream();
          }, delay);
        };
      } catch {}
    };
    setupStream();
    if (!gestureBoundRef.current) {
      gestureBoundRef.current = true;
      const resume = () => {
        try { audioCtxRef.current && audioCtxRef.current.resume(); } catch {}
        document.removeEventListener('pointerdown', resume);
        document.removeEventListener('keydown', resume);
      };
      document.addEventListener('pointerdown', resume, { once: true });
      document.addEventListener('keydown', resume, { once: true });
    }

    timer = setInterval(fetchCountAndNotify, 10000);
    return () => {
      if (timer) clearInterval(timer);
      if (es) es.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [enabled, API_BASE_URL, dispatch, isHostelAdmin]);

  return null;
}