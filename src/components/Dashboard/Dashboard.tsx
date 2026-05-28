import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { Session, Student, HealthRecord } from '../../types/interfaces';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  sessions: Session[];
  students: Student[];
  healthRecords: HealthRecord[];
}

function getZScoreCategory(zScore: number | undefined): string {
  if (zScore === undefined || zScore === null) return 'Not assessed';
  if (zScore < -3) return 'Severe Thinness (<-3SD)';
  if (zScore < -2) return 'Moderate Thinness (-3SD to -2SD)';
  if (zScore < -1) return 'Mild Thinness (-2SD to -1SD)';
  if (zScore <= 1) return 'Normal';
  if (zScore <= 2) return 'Overweight (+1SD to +2SD)';
  if (zScore <= 3) return 'Obese Class 1 (+2SD to +3SD)';
  return 'Obese Class 2 (>+3SD)';
}

function getZScoreCategoryShort(zScore: number | undefined): string {
  if (zScore === undefined || zScore === null) return 'N/A';
  if (zScore < -3) return '<-3SD';
  if (zScore < -2) return '-3SD→-2SD';
  if (zScore < -1) return '-2SD→-1SD';
  if (zScore <= 1) return 'Normal';
  if (zScore <= 2) return '+1SD→+2SD';
  if (zScore <= 3) return '+2SD→+3SD';
  return '>+3SD';
}

const ZSCORE_COLORS = {
  '<-3SD': '#dc2626',
  '-3SD→-2SD': '#f97316',
  '-2SD→-1SD': '#eab308',
  'Normal': '#22c55e',
  '+1SD→+2SD': '#eab308',
  '+2SD→+3SD': '#f97316',
  '>+3SD': '#dc2626',
  'N/A': '#9ca3af',
};

const ZSCORE_ORDER = ['<-3SD', '-3SD→-2SD', '-2SD→-1SD', 'Normal', '+1SD→+2SD', '+2SD→+3SD', '>+3SD'];

export default function Dashboard({ sessions, students, healthRecords }: DashboardProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');

  // Filter records by session
  const filteredRecords = useMemo(() => {
    if (selectedSessionId === 'all') return healthRecords;
    return healthRecords.filter(r => r.sessionId === selectedSessionId);
  }, [healthRecords, selectedSessionId]);

  const filteredStudentIds = useMemo(() => {
    return new Set(filteredRecords.map(r => r.studentId));
  }, [filteredRecords]);

  const filteredStudents = useMemo(() => {
    if (selectedSessionId === 'all') return students;
    return students.filter(s => filteredStudentIds.has(s.id));
  }, [students, selectedSessionId, filteredStudentIds]);

  // Get latest record per student (for stats)
  const latestRecordPerStudent = useMemo(() => {
    const map = new Map<string, HealthRecord>();
    const sorted = [...filteredRecords].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (const record of sorted) {
      if (!map.has(record.studentId)) {
        map.set(record.studentId, record);
      }
    }
    return Array.from(map.values());
  }, [filteredRecords]);

  // ===== STATISTICS =====
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const totalRecords = filteredRecords.length;
    const studentsWithRecords = latestRecordPerStudent.length;

    const bmis = latestRecordPerStudent.map(r => r.bmi).filter(b => b > 0);
    const avgBmi = bmis.length > 0 ? bmis.reduce((a, b) => a + b, 0) / bmis.length : 0;

    const zScores = latestRecordPerStudent
      .map(r => r.zScore ?? r.zScoreValue)
      .filter((z): z is number => z !== undefined && z !== null);
    const avgZScore = zScores.length > 0 ? zScores.reduce((a, b) => a + b, 0) / zScores.length : 0;

    const normalCount = zScores.filter(z => z >= -1 && z <= 1).length;
    const normalPercent = zScores.length > 0 ? (normalCount / zScores.length) * 100 : 0;

    const underweightCount = zScores.filter(z => z < -2).length;
    const overweightCount = zScores.filter(z => z > 2).length;
    const atRiskCount = underweightCount + overweightCount;

    return {
      totalStudents,
      totalRecords,
      studentsWithRecords,
      avgBmi,
      avgZScore,
      normalPercent,
      atRiskCount,
      underweightCount,
      overweightCount,
    };
  }, [filteredStudents, filteredRecords, latestRecordPerStudent]);

  // ===== Z-SCORE DISTRIBUTION (Pie) =====
  const zScoreDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    ZSCORE_ORDER.forEach(cat => (counts[cat] = 0));

    for (const record of latestRecordPerStudent) {
      const z = record.zScore ?? record.zScoreValue;
      const cat = getZScoreCategoryShort(z);
      if (cat !== 'N/A') {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }

    const labels = ZSCORE_ORDER.filter(cat => counts[cat] > 0);
    const data = labels.map(cat => counts[cat]);
    const colors = labels.map(cat => ZSCORE_COLORS[cat as keyof typeof ZSCORE_COLORS]);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map(c => c + '40'),
        borderWidth: 2,
      }],
    };
  }, [latestRecordPerStudent]);

  // ===== BMI BY CLASS (Bar) =====
  const bmiByClass = useMemo(() => {
    const classMap = new Map<string, { total: number; count: number }>();

    for (const record of latestRecordPerStudent) {
      const student = students.find(s => s.id === record.studentId);
      const className = student?.class || 'Unknown';
      const existing = classMap.get(className) || { total: 0, count: 0 };
      existing.total += record.bmi;
      existing.count += 1;
      classMap.set(className, existing);
    }

    const entries = Array.from(classMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = entries.map(([cls]) => cls);
    const avgData = entries.map(([, val]) => +(val.total / val.count).toFixed(1));
    const countData = entries.map(([, val]) => val.count);

    return {
      labels,
      datasets: [
        {
          label: 'Average BMI',
          data: avgData,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Students',
          data: countData,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y1',
        },
      ],
    };
  }, [latestRecordPerStudent, students]);

  // ===== GENDER DISTRIBUTION (Doughnut) =====
  const genderDistribution = useMemo(() => {
    const maleCount = filteredStudents.filter(s => s.gender === 'male').length;
    const femaleCount = filteredStudents.filter(s => s.gender === 'female').length;

    return {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [maleCount, femaleCount],
        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(236, 72, 153)'],
        borderWidth: 2,
      }],
    };
  }, [filteredStudents]);

  // ===== Z-SCORE BY GENDER (Grouped Bar) =====
  const zScoreByGender = useMemo(() => {
    const maleCounts: Record<string, number> = {};
    const femaleCounts: Record<string, number> = {};
    ZSCORE_ORDER.forEach(cat => {
      maleCounts[cat] = 0;
      femaleCounts[cat] = 0;
    });

    for (const record of latestRecordPerStudent) {
      const student = students.find(s => s.id === record.studentId);
      const z = record.zScore ?? record.zScoreValue;
      const cat = getZScoreCategoryShort(z);
      if (cat === 'N/A') continue;

      if (student?.gender === 'male') {
        maleCounts[cat] = (maleCounts[cat] || 0) + 1;
      } else {
        femaleCounts[cat] = (femaleCounts[cat] || 0) + 1;
      }
    }

    const activeCategories = ZSCORE_ORDER.filter(cat => maleCounts[cat] > 0 || femaleCounts[cat] > 0);

    return {
      labels: activeCategories,
      datasets: [
        {
          label: 'Male',
          data: activeCategories.map(cat => maleCounts[cat]),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Female',
          data: activeCategories.map(cat => femaleCounts[cat]),
          backgroundColor: 'rgba(236, 72, 153, 0.7)',
          borderColor: 'rgb(236, 72, 153)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [latestRecordPerStudent, students]);

  // ===== BMI TREND BY SESSION (Line) =====
  const bmiTrendBySession = useMemo(() => {
    const sessionMap = new Map<string, { name: string; date: string; total: number; count: number }>();

    for (const record of healthRecords) {
      const session = sessions.find(s => s.id === record.sessionId);
      if (!session) continue;
      const existing = sessionMap.get(session.id) || {
        name: session.name,
        date: session.date,
        total: 0,
        count: 0,
      };
      existing.total += record.bmi;
      existing.count += 1;
      sessionMap.set(session.id, existing);
    }

    const entries = Array.from(sessionMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: entries.map(e => e.name),
      datasets: [{
        label: 'Average BMI',
        data: entries.map(e => +(e.total / e.count).toFixed(1)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    };
  }, [healthRecords, sessions]);

  // No data state
  const hasData = healthRecords.length > 0;

  return (
    <div className="space-y-6">
      {/* Session Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">📊 Statistics Dashboard</h2>
            <p className="text-sm text-gray-500">Student health status overview</p>
          </div>
          <div className="sm:w-72">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All sessions</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.school}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Total Students"
          value={stats.totalStudents}
          color="blue"
        />
        <StatCard
          icon="📋"
          label="Records"
          value={stats.totalRecords}
          subtitle={`${stats.studentsWithRecords} students examined`}
          color="green"
        />
        <StatCard
          icon="📏"
          label="Average BMI"
          value={stats.avgBmi > 0 ? stats.avgBmi.toFixed(1) : '—'}
          subtitle={stats.avgZScore !== 0 ? `Avg Z-Score: ${stats.avgZScore.toFixed(2)}` : undefined}
          color="purple"
        />
        <StatCard
          icon={stats.normalPercent >= 70 ? '✅' : '⚠️'}
          label="Normal"
          value={stats.normalPercent > 0 ? `${stats.normalPercent.toFixed(0)}%` : '—'}
          subtitle={stats.atRiskCount > 0 ? `${stats.atRiskCount} students at risk` : undefined}
          color={stats.normalPercent >= 70 ? 'green' : 'yellow'}
        />
      </div>

      {/* Alert for at-risk students */}
      {stats.atRiskCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-amber-900">Nutrition Alert</h3>
              <p className="text-sm text-amber-700 mt-1">
                There are <strong>{stats.underweightCount}</strong> underweight students (Z-Score &lt; -2SD) 
                and <strong>{stats.overweightCount}</strong> overweight/obese students (Z-Score &gt; +2SD) 
                who need monitoring and intervention.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">
            Create a session, add students, and take measurements to view statistics charts.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row 1: Z-Score Distribution + Gender */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Z-Score Pie Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                🥧 Nutrition Classification by Z-Score
              </h3>
              {latestRecordPerStudent.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-64 h-64">
                    <Pie
                      data={zScoreDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => {
                                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return `${ctx.label}: ${ctx.parsed} students (${pct}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  {/* Custom legend */}
                  <div className="flex-1 space-y-2">
                    {zScoreDistribution.labels.map((label, i) => {
                      const count = zScoreDistribution.datasets[0].data[i];
                      const total = zScoreDistribution.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                      const pct = ((count / total) * 100).toFixed(1);
                      const color = ZSCORE_COLORS[label as keyof typeof ZSCORE_COLORS];
                      const fullLabel = getZScoreCategory(
                        label === 'Normal' ? 0 :
                        label === '<-3SD' ? -4 :
                        label === '-3SD→-2SD' ? -2.5 :
                        label === '-2SD→-1SD' ? -1.5 :
                        label === '+1SD→+2SD' ? 1.5 :
                        label === '+2SD→+3SD' ? 2.5 : 4
                      );
                      return (
                        <div key={label} className="flex items-center gap-3 text-sm">
                          <div
                            className="w-4 h-4 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="flex-1 text-gray-700">{fullLabel}</span>
                          <span className="font-semibold text-gray-900">{count}</span>
                          <span className="text-gray-500 w-14 text-right">({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyChart />
              )}
            </div>

            {/* Gender Doughnut */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                🧑‍🤝‍🧑 Gender Distribution
              </h3>
              {filteredStudents.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48">
                    <Doughnut
                      data={genderDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: { position: 'bottom', labels: { padding: 16 } },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => {
                                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="mt-4 flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredStudents.filter(s => s.gender === 'male').length}
                      </div>
                      <div className="text-gray-500">Male</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-500">
                        {filteredStudents.filter(s => s.gender === 'female').length}
                      </div>
                      <div className="text-gray-500">Female</div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          {/* Charts Row 2: BMI by Class */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              📊 Average BMI & Student Count by Class
            </h3>
            {bmiByClass.labels.length > 0 ? (
              <div className="h-72">
                <Bar
                  data={bmiByClass}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            if (ctx.dataset.yAxisID === 'y') return `Avg BMI: ${ctx.parsed.y}`;
                            return `Students: ${ctx.parsed.y}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Average BMI' },
                        beginAtZero: false,
                        suggestedMin: 12,
                        suggestedMax: 30,
                      },
                      y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Student Count' },
                        beginAtZero: true,
                        grid: { drawOnChartArea: false },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Charts Row 3: Z-Score by Gender + BMI Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Z-Score by Gender */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                📈 Z-Score Comparison by Gender
              </h3>
              {zScoreByGender.labels.length > 0 ? (
                <div className="h-64">
                  <Bar
                    data={zScoreByGender}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Student Count' },
                          ticks: { stepSize: 1 },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <EmptyChart />
              )}
            </div>

            {/* BMI Trend by Session */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                📉 BMI Trend Across Sessions
              </h3>
              {bmiTrendBySession.labels.length > 0 ? (
                <div className="h-64">
                  <Line
                    data={bmiTrendBySession}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => `Avg BMI: ${ctx.parsed.y}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          title: { display: true, text: 'Average BMI' },
                          beginAtZero: false,
                          suggestedMin: 14,
                          suggestedMax: 28,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              📋 Summary Table by Class
            </h3>
            <ClassSummaryTable
              records={latestRecordPerStudent}
              students={students}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function StatCard({ icon, label, value, subtitle, color }: {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-48 text-gray-400">
      <div className="text-center">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm">No data available</p>
      </div>
    </div>
  );
}

function ClassSummaryTable({ records, students }: {
  records: HealthRecord[];
  students: Student[];
}) {
  const classStats = useMemo(() => {
    const map = new Map<string, {
      total: number;
      male: number;
      female: number;
      bmiSum: number;
      normal: number;
      underweight: number;
      overweight: number;
    }>();

    for (const record of records) {
      const student = students.find(s => s.id === record.studentId);
      const className = student?.class || 'Unknown';
      const z = record.zScore ?? record.zScoreValue;

      const existing = map.get(className) || {
        total: 0, male: 0, female: 0, bmiSum: 0,
        normal: 0, underweight: 0, overweight: 0,
      };

      existing.total += 1;
      existing.bmiSum += record.bmi;
      if (student?.gender === 'male') existing.male += 1;
      else existing.female += 1;

      if (z !== undefined && z !== null) {
        if (z >= -1 && z <= 1) existing.normal += 1;
        else if (z < -2) existing.underweight += 1;
        else if (z > 2) existing.overweight += 1;
      }

      map.set(className, existing);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([cls, s]) => ({
        class: cls,
        ...s,
        avgBmi: s.total > 0 ? (s.bmiSum / s.total).toFixed(1) : '—',
      }));
  }, [records, students]);

  if (classStats.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
            <th className="text-center py-3 px-3 font-semibold text-gray-700">Total</th>
            <th className="text-center py-3 px-3 font-semibold text-blue-600">Male</th>
            <th className="text-center py-3 px-3 font-semibold text-pink-600">Female</th>
            <th className="text-center py-3 px-3 font-semibold text-gray-700">Avg BMI</th>
            <th className="text-center py-3 px-3 font-semibold text-green-600">Normal</th>
            <th className="text-center py-3 px-3 font-semibold text-orange-600">Underweight</th>
            <th className="text-center py-3 px-3 font-semibold text-red-600">Overweight</th>
          </tr>
        </thead>
        <tbody>
          {classStats.map((row) => (
            <tr key={row.class} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{row.class}</td>
              <td className="text-center py-3 px-3">{row.total}</td>
              <td className="text-center py-3 px-3 text-blue-600">{row.male}</td>
              <td className="text-center py-3 px-3 text-pink-600">{row.female}</td>
              <td className="text-center py-3 px-3 font-medium">{row.avgBmi}</td>
              <td className="text-center py-3 px-3">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {row.normal}
                </span>
              </td>
              <td className="text-center py-3 px-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  row.underweight > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {row.underweight}
                </span>
              </td>
              <td className="text-center py-3 px-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  row.overweight > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {row.overweight}
                </span>
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-gray-50 font-semibold">
            <td className="py-3 px-4">Total</td>
            <td className="text-center py-3 px-3">{classStats.reduce((s, r) => s + r.total, 0)}</td>
            <td className="text-center py-3 px-3 text-blue-600">{classStats.reduce((s, r) => s + r.male, 0)}</td>
            <td className="text-center py-3 px-3 text-pink-600">{classStats.reduce((s, r) => s + r.female, 0)}</td>
            <td className="text-center py-3 px-3">—</td>
            <td className="text-center py-3 px-3">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                {classStats.reduce((s, r) => s + r.normal, 0)}
              </span>
            </td>
            <td className="text-center py-3 px-3">
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                {classStats.reduce((s, r) => s + r.underweight, 0)}
              </span>
            </td>
            <td className="text-center py-3 px-3">
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                {classStats.reduce((s, r) => s + r.overweight, 0)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
