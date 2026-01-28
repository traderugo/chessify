export default function CostBreakdown({ calculated }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-black text-white mb-6">💰 cost breakdown</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <CostCard
          title="📦 cloudflare r2"
          items={[
            { label: 'storage', value: `$${calculated.r2StorageCost}`, sub: `${calculated.totalImageSizeGB} GB` },
            { label: 'egress', value: `$${calculated.r2EgressCost}`, sub: `${calculated.totalImageTrafficGB} GB` },
          ]}
          total={parseFloat(calculated.r2StorageCost || 0) + parseFloat(calculated.r2EgressCost || 0)}
          color="purple"
        />
        
        <CostCard
          title="🗄️ supabase core"
          items={[
            { label: 'base plan', value: `$${calculated.supabasePlan?.toFixed(2)}` },
            { label: 'db compute', value: `$${calculated.supabaseDbComputeCost}` },
            { label: 'edge functions', value: `$${calculated.supabaseEdgeFunctionsCost}` },
          ]}
          total={
            parseFloat(calculated.supabasePlan || 0) +
            parseFloat(calculated.supabaseDbComputeCost || 0) +
            parseFloat(calculated.supabaseEdgeFunctionsCost || 0)
          }
          color="pink"
        />
        
        <CostCard
          title="🔥 supabase extras"
          items={[
            { label: 'realtime', value: `$${calculated.supabaseRealtimeCost}` },
            { label: 'auth', value: `$${calculated.supabaseAuthCost}` },
            { label: 'misc storage', value: `$${calculated.supabaseMiscStorageCost}` },
          ]}
          total={
            parseFloat(calculated.supabaseRealtimeCost || 0) +
            parseFloat(calculated.supabaseAuthCost || 0) +
            parseFloat(calculated.supabaseMiscStorageCost || 0)
          }
          color="blue"
        />
      </div>
    </div>
  )
}

function CostCard({ title, items, total, color }) {
  const colors = {
    purple: {
      bg: 'from-purple-900/30 to-purple-800/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      total: 'text-purple-300',
    },
    pink: {
      bg: 'from-pink-900/30 to-pink-800/20',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      total: 'text-pink-300',
    },
    blue: {
      bg: 'from-blue-900/30 to-blue-800/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      total: 'text-blue-300',
    },
  }

  const theme = colors[color]

  return (
    <div className={`bg-gradient-to-br ${theme.bg} backdrop-blur-xl rounded-3xl p-8 border ${theme.border}`}>
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm uppercase tracking-wide">{item.label}</p>
              {item.sub && <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>}
            </div>
            <p className={`font-mono font-bold text-lg ${theme.text}`}>{item.value}</p>
          </div>
        ))}
        <div className="pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <p className="text-white font-bold uppercase tracking-wide">subtotal</p>
            <p className={`font-mono font-black text-2xl ${theme.total}`}>${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
