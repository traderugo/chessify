'use client'

import { useState, useEffect } from 'react'
import MetricsInput from './components/MetricsInput'
import CostBreakdown from './components/CostBreakdown'
import Analytics from './components/Analytics'
import FeaturesList from './components/FeaturesList'

export default function CostCalculator() {
  const [vendors, setVendors] = useState(100)
  const [imagesPerVendor, setImagesPerVendor] = useState(15)
  const [buyerMultiplier, setBuyerMultiplier] = useState(5)
  const [surgeMode, setSurgeMode] = useState('normal')
  const [vendorSubscriptionNaira, setVendorSubscriptionNaira] = useState(5000)
  const [exchangeRate, setExchangeRate] = useState(1650)
  
  const [constants] = useState({
    imageSizeKB: 250,
    imagesViewedPerBuyer: 50,
    r2StoragePerGB: 0.015,
    r2EgressPerGB: 0.0,
    supabasePlan: 25,
    supabaseDbCompute: 0.00034,
    supabaseEdgeFunctions: 2,
    supabaseRealtime: 2.5,
    supabaseAuth: 0.00005,
    supabaseMiscStorage: 0.021,
  })

  const [calculated, setCalculated] = useState({})

  const surgeMultipliers = {
    normal: { traffic: 1, concurrent: 0.1, db: 1, label: 'Normal' },
    busy: { traffic: 1.5, concurrent: 0.25, db: 1.3, label: 'Busy (Weekend)' },
    promotion: { traffic: 3, concurrent: 0.4, db: 2, label: 'Sale/Promo' },
    viral: { traffic: 10, concurrent: 0.7, db: 5, label: 'Viral 🔥' },
    blackfriday: { traffic: 15, concurrent: 0.8, db: 8, label: 'Black Friday' },
  }

  useEffect(() => {
    const surge = surgeMultipliers[surgeMode]
    const buyers = vendors * buyerMultiplier
    const totalImages = vendors * imagesPerVendor
    const totalImageSizeGB = (totalImages * constants.imageSizeKB) / (1024 * 1024)
    const r2StorageCost = totalImageSizeGB * constants.r2StoragePerGB
    
    const totalImageViews = buyers * constants.imagesViewedPerBuyer * surge.traffic
    const totalImageTrafficGB = (totalImageViews * constants.imageSizeKB) / (1024 * 1024)
    const r2EgressCost = totalImageTrafficGB * constants.r2EgressPerGB
    
    const dbOperationsPerMonth = (
      vendors * 500 +
      buyers * 200 +
      totalImageViews * 0.5 +
      (buyers * 10) +
      (vendors * 20)
    ) * surge.db
    
    const supabaseDbComputeCost = (dbOperationsPerMonth / 1000000) * constants.supabaseDbCompute * 1000
    
    const edgeFunctionInvocations = buyers * 15 + vendors * 30
    const supabaseEdgeFunctionsCost = Math.max(constants.supabaseEdgeFunctions, (edgeFunctionInvocations / 1000000) * 2)
    
    const activeRealtimeConnections = buyers * surge.concurrent
    const supabaseRealtimeCost = Math.max(constants.supabaseRealtime, activeRealtimeConnections * 0.01)
    
    const authOperations = buyers * 20 + (buyers * 0.3 * 5)
    const supabaseAuthCost = Math.max(0, (authOperations / 1000000) * constants.supabaseAuth * 1000)
    
    const miscStorageGB = (
      vendors * 0.01 +
      buyers * 0.005 +
      (buyers * 10 * 0.001) +
      0.5
    )
    const supabaseMiscStorageCost = miscStorageGB * constants.supabaseMiscStorage
    
    const supabaseTotalCost = (
      constants.supabasePlan +
      supabaseDbComputeCost +
      supabaseEdgeFunctionsCost +
      supabaseRealtimeCost +
      supabaseAuthCost +
      supabaseMiscStorageCost
    )
    
    const grandTotal = r2StorageCost + r2EgressCost + supabaseTotalCost
    
    // Revenue & Profit calculations
    const monthlyRevenueNaira = vendors * vendorSubscriptionNaira
    const monthlyRevenueDollars = monthlyRevenueNaira / exchangeRate
    const profitDollars = monthlyRevenueDollars - grandTotal
    const profitNaira = profitDollars * exchangeRate
    const profitMargin = ((profitDollars / monthlyRevenueDollars) * 100)
    const costPerVendor = grandTotal / vendors
    const costPerVendorNaira = costPerVendor * exchangeRate
    const breakEvenVendors = Math.ceil(grandTotal / (vendorSubscriptionNaira / exchangeRate))
    
    setCalculated({
      buyers,
      totalImages,
      totalImageSizeGB: totalImageSizeGB.toFixed(3),
      r2StorageCost: r2StorageCost.toFixed(2),
      totalImageViews,
      totalImageTrafficGB: totalImageTrafficGB.toFixed(3),
      r2EgressCost: r2EgressCost.toFixed(2),
      supabaseDbComputeCost: supabaseDbComputeCost.toFixed(2),
      supabaseEdgeFunctionsCost: supabaseEdgeFunctionsCost.toFixed(2),
      supabaseRealtimeCost: supabaseRealtimeCost.toFixed(2),
      supabaseAuthCost: supabaseAuthCost.toFixed(2),
      supabaseMiscStorageCost: supabaseMiscStorageCost.toFixed(2),
      supabaseTotalCost: supabaseTotalCost.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      supabasePlan: constants.supabasePlan,
      surgeLabel: surge.label,
      monthlyRevenueNaira: monthlyRevenueNaira.toFixed(0),
      monthlyRevenueDollars: monthlyRevenueDollars.toFixed(2),
      profitDollars: profitDollars.toFixed(2),
      profitNaira: profitNaira.toFixed(0),
      profitMargin: profitMargin.toFixed(1),
      costPerVendor: costPerVendor.toFixed(2),
      costPerVendorNaira: costPerVendorNaira.toFixed(0),
      breakEvenVendors,
    })
  }, [vendors, imagesPerVendor, buyerMultiplier, surgeMode, vendorSubscriptionNaira, exchangeRate, constants])

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl top-1/3 right-0 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 tracking-tight">
            cost calculator
          </h1>
          <p className="text-gray-400 text-lg">pragmatic estimates for your ecommerce project</p>
        </div>

        <MetricsInput
          vendors={vendors}
          setVendors={setVendors}
          imagesPerVendor={imagesPerVendor}
          setImagesPerVendor={setImagesPerVendor}
          buyerMultiplier={buyerMultiplier}
          setBuyerMultiplier={setBuyerMultiplier}
          calculated={calculated}
        />

        <div className="mb-12 bg-gradient-to-br from-orange-900/30 to-red-900/20 backdrop-blur-xl rounded-3xl p-8 border border-orange-500/30">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            traffic surge mode
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(surgeMultipliers).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSurgeMode(key)}
                className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  surgeMode === key
                    ? 'bg-orange-500 text-white scale-105 shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {data.label}
              </button>
            ))}
          </div>
          <p className="text-orange-300 text-sm mt-4">
            Current mode: <span className="font-bold">{calculated.surgeLabel}</span> • 
            {surgeMode !== 'normal' && ' Costs adjusted for traffic spike scenarios'}
          </p>
        </div>

        <Analytics calculated={calculated} vendors={vendors} />

        <CostBreakdown calculated={calculated} />

        {/* Revenue & Profitability Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6">💵 revenue & profitability</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Pricing Inputs */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">₦</span>
                pricing settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-green-200 text-sm mb-2">vendor subscription (₦/month)</label>
                  <input
                    type="number"
                    value={vendorSubscriptionNaira}
                    onChange={(e) => setVendorSubscriptionNaira(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border-2 border-green-500/30 rounded-2xl px-6 py-4 text-white text-3xl font-bold focus:outline-none focus:border-green-400 transition-all"
                    min="0"
                  />
                  <p className="text-green-300 text-sm mt-2">
                    ≈ ${(vendorSubscriptionNaira / exchangeRate).toFixed(2)} per vendor
                  </p>
                </div>

                <div>
                  <label className="block text-green-200 text-sm mb-2">exchange rate (₦/$)</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    className="w-full bg-black/40 border-2 border-green-500/30 rounded-2xl px-6 py-4 text-white text-2xl font-bold focus:outline-none focus:border-green-400 transition-all"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-green-300 text-sm mt-2">current NGN to USD rate</p>
                </div>
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-800/20 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                revenue overview
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-blue-200 text-sm mb-1">monthly revenue</p>
                  <p className="text-white text-2xl font-bold">₦{parseInt(calculated.monthlyRevenueNaira || 0).toLocaleString()}</p>
                  <p className="text-blue-300 text-sm mt-1">${calculated.monthlyRevenueDollars}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-blue-200 text-sm mb-1">monthly costs</p>
                  <p className="text-white text-2xl font-bold">${calculated.grandTotal}</p>
                  <p className="text-blue-300 text-sm mt-1">₦{(parseFloat(calculated.grandTotal || 0) * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>

                <div className={`${parseFloat(calculated.profitDollars) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-xl p-4 border ${parseFloat(calculated.profitDollars) >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <p className="text-gray-200 text-sm mb-1">net profit</p>
                  <p className={`text-3xl font-black ${parseFloat(calculated.profitDollars) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(calculated.profitDollars) >= 0 ? '+' : ''}${calculated.profitDollars}
                  </p>
                  <p className={`text-sm mt-1 ${parseFloat(calculated.profitDollars) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ₦{parseInt(calculated.profitNaira || 0).toLocaleString()} ({calculated.profitMargin}% margin)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
              <p className="text-purple-200 text-sm uppercase tracking-wide mb-2">cost per vendor</p>
              <p className="text-white text-2xl font-bold">${calculated.costPerVendor}</p>
              <p className="text-purple-300 text-sm mt-1">₦{parseInt(calculated.costPerVendorNaira || 0).toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
              <p className="text-pink-200 text-sm uppercase tracking-wide mb-2">profit per vendor</p>
              <p className="text-white text-2xl font-bold">
                ${((parseFloat(calculated.profitDollars) || 0) / vendors).toFixed(2)}
              </p>
              <p className="text-pink-300 text-sm mt-1">
                ₦{((parseFloat(calculated.profitNaira) || 0) / vendors).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
              <p className="text-orange-200 text-sm uppercase tracking-wide mb-2">break-even point</p>
              <p className="text-white text-2xl font-bold">{calculated.breakEvenVendors}</p>
              <p className="text-orange-300 text-sm mt-1">vendors needed</p>
            </div>

            <div className={`bg-gradient-to-br ${parseFloat(calculated.profitMargin) >= 50 ? 'from-green-900/30 to-green-800/20' : parseFloat(calculated.profitMargin) >= 20 ? 'from-yellow-900/30 to-yellow-800/20' : 'from-red-900/30 to-red-800/20'} backdrop-blur-xl rounded-2xl p-6 border ${parseFloat(calculated.profitMargin) >= 50 ? 'border-green-500/30' : parseFloat(calculated.profitMargin) >= 20 ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
              <p className="text-gray-200 text-sm uppercase tracking-wide mb-2">profit margin</p>
              <p className={`text-2xl font-bold ${parseFloat(calculated.profitMargin) >= 50 ? 'text-green-400' : parseFloat(calculated.profitMargin) >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {calculated.profitMargin}%
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {parseFloat(calculated.profitMargin) >= 50 ? 'healthy 🔥' : parseFloat(calculated.profitMargin) >= 20 ? 'decent 👍' : 'tight ⚠️'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md rounded-3xl p-8 border border-purple-500/20">
          <div className="text-center">
            <h3 className="text-2xl text-purple-300 mb-3 font-bold">monthly total</h3>
            <div className="relative inline-block">
              <p className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                ${calculated.grandTotal}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-2xl opacity-20" />
            </div>
            <p className="text-gray-400 mt-6 text-lg">
              {vendors} vendors • {calculated.buyers?.toLocaleString()} buyers • {calculated.totalImages?.toLocaleString()} images
            </p>
          </div>
        </div>

        <FeaturesList />

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>estimates based on realistic usage • calculations factor in all features fr</p>
        </div>
      </div>
    </div>
  )
}
