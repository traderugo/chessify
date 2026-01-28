export default function FeaturesList() {
  const features = [
    { name: 'styling', emoji: '🎨', category: 'design' },
    { name: 'image CDN', emoji: '🖼️', category: 'infrastructure' },
    { name: 'complete auth', emoji: '🔐', category: 'auth' },
    { name: 'subscriptions', emoji: '💳', category: 'payments' },
    { name: 'payment integration', emoji: '💰', category: 'payments' },
    { name: 'captcha', emoji: '🤖', category: 'security' },
    { name: 'google login', emoji: '🔑', category: 'auth' },
    { name: 'notifications', emoji: '🔔', category: 'features' },
    { name: 'in-app messaging', emoji: '💬', category: 'features' },
    { name: 'comments', emoji: '💭', category: 'social' },
    { name: 'admin panel', emoji: '⚙️', category: 'admin' },
    { name: 'optimized queries', emoji: '⚡', category: 'performance' },
    { name: 'vendor storefront', emoji: '🏪', category: 'features' },
    { name: 'explore page', emoji: '🔍', category: 'discovery' },
    { name: 'beta testing', emoji: '🧪', category: 'qa' },
    { name: 'affiliate system', emoji: '🤝', category: 'monetization' },
    { name: 'rating system', emoji: '⭐', category: 'social' },
  ]

  const categories = {
    design: 'purple',
    infrastructure: 'blue',
    auth: 'green',
    payments: 'yellow',
    security: 'red',
    features: 'pink',
    social: 'indigo',
    admin: 'orange',
    performance: 'cyan',
    discovery: 'teal',
    qa: 'lime',
    monetization: 'amber',
  }

  const categoryColors = {
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    green: 'bg-green-500/20 border-green-500/30 text-green-300',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    red: 'bg-red-500/20 border-red-500/30 text-red-300',
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-300',
    indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
    orange: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
    teal: 'bg-teal-500/20 border-teal-500/30 text-teal-300',
    lime: 'bg-lime-500/20 border-lime-500/30 text-lime-300',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  }

  return (
    <div className="mt-12 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30">
      <h3 className="text-2xl font-black text-white mb-6">🎯 features included</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((feature, i) => {
          const color = categoryColors[categories[feature.category]]
          return (
            <div
              key={i}
              className={`${color} backdrop-blur-sm rounded-xl px-4 py-3 border flex items-center gap-2 hover:scale-105 transition-transform duration-200`}
            >
              <span className="text-xl">{feature.emoji}</span>
              <span className="text-sm font-medium">{feature.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}