'use client';

import Link from 'next/link';
import { Shield, TrendingUp, FileText, MessageSquare, Clock, BarChart3, PieChart, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  // Mock data for charts
  const queryData = [
    { day: 'Mon', queries: 45 },
    { day: 'Tue', queries: 52 },
    { day: 'Wed', queries: 61 },
    { day: 'Thu', queries: 58 },
    { day: 'Fri', queries: 70 },
    { day: 'Sat', queries: 35 },
    { day: 'Sun', queries: 28 },
  ];

  const confidenceDistribution = [
    { range: '90-100%', count: 145, color: 'bg-green-500' },
    { range: '80-89%', count: 89, color: 'bg-blue-500' },
    { range: '70-79%', count: 34, color: 'bg-yellow-500' },
    { range: '<70%', count: 12, color: 'bg-red-500' },
  ];

  const documentCategories = [
    { name: 'Financial Reports', count: 45, percentage: 35, color: 'bg-blue-600' },
    { name: 'Policy Documents', count: 38, percentage: 30, color: 'bg-purple-600' },
    { name: 'Technical Specs', count: 25, percentage: 20, color: 'bg-green-600' },
    { name: 'Other', count: 20, percentage: 15, color: 'bg-gray-600' },
  ];

  const maxQueries = Math.max(...queryData.map(d => d.queries));

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200">
        <div className="px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-800">AI Portal Assistant</div>
              <div className="text-xs text-slate-500">Admin Dashboard</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Documents
            </Link>
            <Link href="/admin/analytics" className="text-sm font-medium text-blue-700 border-b-2 border-blue-700 pb-1">
              Analytics
            </Link>
            <Link href="/admin/settings" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Settings
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-700">AD</span>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">Admin</div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Container */}
      <div className="px-8 py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link href="/admin" className="hover:text-slate-900">Admin</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Analytics</span>
        </div>

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-2">System performance and usage metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-700" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Queries</div>
            <div className="text-3xl font-bold text-slate-900">1,247</div>
            <div className="text-xs text-green-600 mt-2">+12% from last week</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-700" />
              </div>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Indexed Documents</div>
            <div className="text-3xl font-bold text-slate-900">128</div>
            <div className="text-xs text-gray-500 mt-2">Across 4 categories</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-700" />
              </div>
              <BarChart3 className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Avg Response Time</div>
            <div className="text-3xl font-bold text-slate-900">1.8s</div>
            <div className="text-xs text-green-600 mt-2">-0.3s improvement</div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-700" />
              </div>
              <PieChart className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Accuracy Rate</div>
            <div className="text-3xl font-bold text-slate-900">94.2%</div>
            <div className="text-xs text-green-600 mt-2">+2.1% this month</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Queries Per Day Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Queries Per Day</h3>
                <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              {queryData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-12 text-xs font-medium text-slate-600">{item.day}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${(item.queries / maxQueries) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{item.queries}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Categories Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Document Categories</h3>
                <p className="text-xs text-slate-500 mt-1">Distribution by type</p>
              </div>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            {/* Pie Chart (Horizontal Bars) */}
            <div className="space-y-4">
              {documentCategories.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Distribution Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Confidence Score Distribution</h3>
              <p className="text-xs text-slate-500 mt-1">Response confidence levels</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {confidenceDistribution.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-3">
                  <div className={`w-20 h-20 ${item.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-700">{item.range}</div>
                </div>
                <div className="text-xs text-slate-500">responses</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Status */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">System Health</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-xs text-gray-500">OpenSearch</div>
                <div className="text-sm font-semibold text-green-700">Active</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-xs text-gray-500">Bedrock</div>
                <div className="text-sm font-semibold text-green-700">Connected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-xs text-gray-500">S3</div>
                <div className="text-sm font-semibold text-green-700">Healthy</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-xs text-gray-500">Lambda</div>
                <div className="text-sm font-semibold text-green-700">Running</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
