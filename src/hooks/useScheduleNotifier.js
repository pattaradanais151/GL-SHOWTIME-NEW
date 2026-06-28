import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { notifyScheduleDigest, notifyScheduleReminder } from '../utils/telegram';
import {
  getBangkokDateKey,
  getMovieNotifyKey,
  getUpcomingReminders,
  shouldSendDailyDigest,
} from '../../lib/scheduleNotify.js';

const CHECK_INTERVAL_MS = 60 * 1000;
const MOVIES_REFRESH_MS = 30 * 60 * 1000;
const STORAGE_PREFIX = 'showtime_notify_';

function wasSent(key) {
  return localStorage.getItem(STORAGE_PREFIX + key) === '1';
}

function markSent(key) {
  localStorage.setItem(STORAGE_PREFIX + key, '1');
}

export function useScheduleNotifier() {
  const moviesRef = useRef([]);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.VITE_SCHEDULE_NOTIFY === 'false') return;

    const loadMovies = async () => {
      try {
        const [glRes, blRes] = await Promise.all([
          supabase.from('movies').select('*'),
          supabase.from('movies_bl').select('*'),
        ]);
        const gl = glRes.data ? glRes.data.map((m) => ({ ...m, domain: 'GL' })) : [];
        const bl = blRes.data ? blRes.data.map((m) => ({ ...m, domain: 'BL' })) : [];
        moviesRef.current = [...gl, ...bl];
      } catch (err) {
        console.warn('Schedule notifier: failed to load movies', err);
      }
    };

    const runCheck = async () => {
      if (checkingRef.current || moviesRef.current.length === 0) return;
      checkingRef.current = true;

      try {
        const now = new Date();
        const dateKey = getBangkokDateKey(now);
        const movies = moviesRef.current;

        if (shouldSendDailyDigest(now)) {
          const digestKey = `digest_${dateKey}`;
          if (!wasSent(digestKey)) {
            await notifyScheduleDigest(movies);
            markSent(digestKey);
          }
        }

        const reminders = getUpcomingReminders(movies, now);
        for (const movie of reminders) {
          const alertKey = `alert_${getMovieNotifyKey(movie)}_${dateKey}`;
          if (!wasSent(alertKey)) {
            await notifyScheduleReminder(movie);
            markSent(alertKey);
          }
        }
      } finally {
        checkingRef.current = false;
      }
    };

    loadMovies().then(runCheck);

    const checkTimer = setInterval(runCheck, CHECK_INTERVAL_MS);
    const refreshTimer = setInterval(loadMovies, MOVIES_REFRESH_MS);

    return () => {
      clearInterval(checkTimer);
      clearInterval(refreshTimer);
    };
  }, []);
}
