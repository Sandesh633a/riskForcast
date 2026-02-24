import React, { useState, useEffect } from 'react';
import AnchorNav from '../components/ui/AnchorNav';

export default function Layout({ children, onAddData, apiStatus }) {
    // Scroll-reveal observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
        );

        const revealEls = document.querySelectorAll('.reveal');
        revealEls.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    });

    return (
        <div className="page-wrap">
            <AnchorNav onAddData={onAddData} apiStatus={apiStatus} />
            {children}
        </div>
    );
}
