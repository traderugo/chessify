'use client'

import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Analytics({ calculated, vendors }) {
  const costBreakdownData = [
    { name: 'Supabase', value: parseFloat(calculated.supabaseTotalCost) || 0, color: '#a855f7' },
    { name: 'R2 Storage', value: parseFloat(calculated.r2StorageCost) || 0, color: '#ec4899' },
    { name: 'R2 Egress', value: parseFloat(calculated.r2EgressCost) || 0, color: '#3b82f6' },
  ]

  const supabaseBreakdownData = [
    { name: 'Base Plan', cost: calculated.supabasePlan || 0 },
    { name: 'DB Compute', cost: parseFloat(calculated.supabaseDbComputeCost) || 0 },
    { name: 'Edge Funcs', cost: parseFloat(calculated.supabaseEdgeFunctionsCost) || 0 },
    { name: 'Realtime', cost: parseFloat(calculated.supabaseRealtimeCost) || 0 },
    { name: 'Auth', cost: parseFloat(calculated.supabaseAuthCost) || 0 },
    { name: 'Storage', cost: parseFloat(calculated.supabaseMiscStorageCost) || 0 },
  ]

  const scalingData = Array.from({ length: 10 }, (_, i) => {
    const scale = (i + 1) * 0.5
    const scaledVendors = Math.round(vendors * scale)
    const scaledBuyers = calculated.buyers ? Math.round((calculated.buyers / vendors) * scaledVendors) : 0
    const scaledTotal = parseFloat(calculated.grandTotal) * scale || 0
    
    return {
      vendors: scaledVendors,
      buyers: scaledBuyers,
      cost: scaledTotal.toFixed(0),
    }
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
          <p className="text-white font-bold">{payload[0].name}</p>
          <p className="text-purple-300">${payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  const CustomTooltipBar = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
          <p className="text-white font-bold">{payload[0].payload.name}</p>
          <p className="text-purple-300">${payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  const CustomTooltipLine = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
          <p className="text-white font-bold">{payload[0].payload.vendors} vendors</p>
          <p className="text-blue-300">{payload[0].payload.buyers.toLocaleString()} buyers</p>
          <p className="text-green-300">${payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-black text-white mb-6">📊 analytics</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cost Distribution Pie Chart */}
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-6">cost distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {costBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Supabase Breakdown Bar Chart */}
        <div className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/20">
          <h3 className="text-xl font-bold text-white mb-6">supabase breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supabaseBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#a855f7" tick={{ fill: '#c084fc' }} />
              <YAxis stroke="#a855f7" tick={{ fill: '#c084fc' }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="cost" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scaling Projection Line Chart */}
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 md:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6">scaling projection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scalingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="vendors" stroke="#3b82f6" tick={{ fill: '#60a5fa' }} label={{ value: 'Vendors', position: 'insideBottom', offset: -5, fill: '#60a5fa' }} />
              <YAxis stroke="#3b82f6" tick={{ fill: '#60a5fa' }} label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft', fill: '#60a5fa' }} />
              <Tooltip content={<CustomTooltipLine />} />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} name="Monthly Cost ($)" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-gray-400 text-sm mt-4 text-center">projection based on current buyer multiplier ratio</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <MetricCard
          icon="💾"
          label="total storage"
          value={`${calculated.totalImageSizeGB} GB`}
          color="purple"
        />
        <MetricCard
          icon="👁️"
          label="image views"
          value={calculated.totalImageViews?.toLocaleString()}
          color="pink"
        />
        <MetricCard
          icon="🌐"
          label="monthly traffic"
          value={`${calculated.totalImageTrafficGB} GB`}
          color="blue"
        />
        <MetricCard
          icon="⚡"
          label="cost per vendor"
          value={`$${(parseFloat(calculated.grandTotal) / vendors).toFixed(2)}`}
          color="green"
        />
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color }) {
  const colors = {
    purple: 'from-purple-900/30 to-purple-800/20 border-purple-500/30',
    pink: 'from-pink-900/30 to-pink-800/20 border-pink-500/30',
    blue: 'from-blue-900/30 to-blue-800/20 border-blue-500/30',
    green: 'from-green-900/30 to-green-800/20 border-green-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-xl rounded-2xl p-6 border`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value || '0'}</p>
    </div>
  )
}