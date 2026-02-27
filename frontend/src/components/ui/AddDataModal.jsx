import React, { useState } from 'react';
import { addData } from '../../lib/api';

export default function AddDataModal({ onClose, onSuccess }) {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lastAdded = localStorage.getItem('lastDataAddDate');
    const alreadyAdded = lastAdded === today;

    const handleSubmit = async () => {
        if (alreadyAdded) {
            setError('Data has already been added for today. Try again tomorrow.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await addData({ date });
            localStorage.setItem('lastDataAddDate', today);
            onSuccess?.(result?.message || 'Data added successfully');
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to add data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <h2>Add Daily Data</h2>
                <p>Submit environmental data for processing. Data can only be added once per day.</p>

                {alreadyAdded && (
                    <div className="modal-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Data has already been added for today ({today}).
                    </div>
                )}

                {error && <div className="modal-error">{error}</div>}

                <label htmlFor="data-date">Date</label>
                <input
                    id="data-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    max={today}
                    disabled={alreadyAdded}
                />

                <div className="modal-actions">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || alreadyAdded}
                        style={{ opacity: (loading || alreadyAdded) ? 0.5 : 1 }}
                    >
                        {loading ? 'Submitting...' : 'Submit Data'}
                    </button>
                </div>
            </div>
        </div>
    );
}
