import React, { useEffect, useState } from 'react';

/**
 * Represents the shape of the data returned by the metrics API.
 * * This interface guarantees that the dashboard components
 * receive consistent and strictly typed data structures
 * for rendering charts and numerical summaries.
 * * @interface DashboardMetrics
 * @property {number} totalUsers The aggregate count of registered users.
 * @property {number} activeSessions The current number of logged-in users.
 * @property {number} revenue The total revenue generated in the current period.
 */
export interface DashboardMetrics {
    totalUsers: number;
    activeSessions: number;
    revenue: number;
}

/**
 * Renders the main dashboard overview panel.
 * * This component fetches live metrics on mount and displays
 * them in a grid layout. It also handles loading states
 * and renders an error fallback if the API request fails.
 * * @returns {JSX.Element} The main dashboard container.
 */
export const DashboardOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        /**
         * Fetches the latest metrics from the backend service.
         * * Uses the global fetch API to retrieve JSON data.
         * Updates the component state with the parsed result
         * and toggles the loading flag upon completion.
         * * @returns {Promise<void>}
         */
        const loadData = async () => {
            const response = await fetch('/api/metrics/current');
            const data = await response.json();
            setMetrics(data);
            setIsLoading(false);
        };

        loadData();
    }, []);

    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }

    if (!metrics) {
        return <div>Failed to load metrics.</div>;
    }

    return (
        <div className="dashboard-grid">
            <div className="metric-card">
                <h3>Total Users</h3>
                <p>{metrics.totalUsers}</p>
            </div>
            <div className="metric-card">
                <h3>Active Sessions</h3>
                <p>{metrics.activeSessions}</p>
            </div>
            <div className="metric-card">
                <h3>Revenue</h3>
                <p>${metrics.revenue}</p>
            </div>
        </div>
    );
};