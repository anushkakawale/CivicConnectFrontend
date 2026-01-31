import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const BarChartComponent = ({ data, xKey, yKey, title, height = 300, color = "#3B82F6" }) => {
    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-muted">No data available</div>;
    }

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                            type="category"
                            dataKey={xKey}
                            width={150}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={yKey} fill={color} name="Complaints" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const PieChartComponent = ({ data, nameKey, valueKey, title, height = 300 }) => {
    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-muted">No data available</div>;
    }

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={height / 2.5}
                            fill="#8884d8"
                            dataKey={valueKey}
                            nameKey={nameKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
