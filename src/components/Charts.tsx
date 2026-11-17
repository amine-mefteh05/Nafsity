"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid } from "recharts";
const COLORS = ["#2563EB", "#38BDF8", "#1E3A8A", "#5EEAD4", "#93C5FD", "#A5B4FC", "#99F6E4"];
const wrap = (c: React.ReactElement) => <div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%">{c}</ResponsiveContainer></div>;
export const MoodLine = ({ data }: { data: { date: string; score: number }[] }) =>
  data.length ? wrap(<LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="date" fontSize={11} /><YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={11} /><Tooltip /><Line type="monotone" dataKey="score" name="Humeur (1-5)" stroke="#2563EB" strokeWidth={3} dot /></LineChart>) : <p className="text-sm text-muted">Pas encore de données.</p>;
export const ActivityBars = ({ data }: { data: { date: string; count: number }[] }) =>
  wrap(<BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" name="Activités" fill="#38BDF8" radius={[8, 8, 0, 0]} /></BarChart>);
export const CatPie = ({ data }: { data: { name: string; value: number }[] }) =>
  data.length ? wrap(<PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>) : <p className="text-sm text-muted">Aucun exercice terminé sur cette période.</p>;
