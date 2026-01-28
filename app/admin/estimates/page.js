'use client'

import { useState, useEffect } from 'react'

export default function CostCalculator() {
  const [vendors, setVendors] = useState(100)
  const [imagesPerVendor, setImagesPerVendor] = useState(15)
  const [buyerMultiplier, setBuyerMultiplier] = useState(5)
  const [surgeMode, setSurgeMode] = useState('normal')
  const [vendorSubscriptionNaira, setVendorSubscriptionNaira] = useState(5000)
  const [exchangeRate, setExchangeRate] = useState(1650)
  const [imageSizeKB, setImageSizeKB] = useState(250)
  const [imagesViewedMultiplier, setImagesViewedMultiplier] = useState(1)
  
  const [constants] = useState({
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
    busy: { traffic: 1.5, concurrent: 0.25, db: 1.3, label: 'Busy' },
    promotion: { traffic: 3, concurrent: 0.4, db: 2, label: 'Promo' },
    viral: { traffic: 10, concurrent: 0.7, db: 5, label: 'Viral' },
    blackfriday: { traffic: 15, concurrent: 0.8, db: 8, label: 'Black Friday' },
  }

  useEffect(() => {
    const surge = surgeMultipliers[surgeMode]
    const buyers = vendors * buyerMultiplier
    const totalImages = vendors * imagesPerVendor
    const totalImageSizeGB = (totalImages * imageSizeKB) / (1024 * 1024)
    const r2StorageCost = totalImageSizeGB * constants.r2StoragePerGB
    
    const baseImagesViewedPerBuyer = 50
    const imagesViewedPerBuyer = baseImagesViewedPerBuyer * imagesViewedMultiplier
    
    const totalImageViews = buyers * imagesViewedPerBuyer * surge.traffic
    const totalImageTrafficGB = (totalImageViews * imageSizeKB) / (1024 * 1024)
    const r2EgressCost = totalImageTrafficGB * constants.r2EgressPerGB
    
    // Comprehensive DB operations
    const avgCommentsPerVendor = 20
    const avgRatingsPerVendor = 15
    const avgMessagesPerUser = 5
    
    const totalBaseOperations = (
      // Vendor operations
      vendors * 100 + vendors * 200 + vendors * 50 + vendors * 30 + vendors * 20 +
      // Buyer operations
      buyers * 150 + buyers * 50 + buyers * 30 + buyers * 40 + buyers * 20 +
      // Image operations
      totalImageViews * 0.3 + totalImages * 2 + totalImages * 0.5 +
      // Comments
      vendors * avgCommentsPerVendor * 2 + buyers * 10 * 3 + vendors * avgCommentsPerVendor * 0.5 + buyers * 2 +
      // Ratings
      vendors * avgRatingsPerVendor * 2 + buyers * 8 * 2 + vendors * avgRatingsPerVendor * 1 + vendors * 5 +
      // Auth
      buyers * 15 + buyers * 0.3 * 8 + buyers * 5 + buyers * 0.1 * 3 + vendors * 10 + vendors * 2 +
      // Notifications
      buyers * 20 + vendors * 15 + buyers * 5 + buyers * 3 +
      // Messaging
      (buyers + vendors) * avgMessagesPerUser * 3 + (buyers + vendors) * 10 + (buyers + vendors) * 5 +
      // Subscriptions
      vendors * 10 + vendors * 2 + vendors * 5 + vendors * 1 +
      // Admin
      vendors * 0.1 * 100 + 50 + vendors * 0.05 * 20 + 30 +
      // Affiliate
      vendors * 0.2 * 50 + buyers * 0.1 * 10 + vendors * 0.2 * 20 +
      // Explore
      buyers * 30 + buyers * 20 + buyers * 15 + buyers * 10 +
      // Captcha
      (buyers + vendors) * 0.3 * 2 +
      // Misc
      buyers * 5 + vendors * 3 + 100
    )
    
    const dbOperationsPerMonth = totalBaseOperations * surge.db * 1.15
    const supabaseDbComputeCost = (dbOperationsPerMonth / 1000000) * constants.supabaseDbCompute * 1000
    
    const edgeFunctionInvocations = (
      buyers * 15 + buyers * 0.3 * 5 + vendors * 2 + vendors * 0.5 +
      totalImages * 0.3 + totalImages * 0.1 + (buyers + vendors) * 10 +
      (buyers + vendors) * 5 + vendors * 0.1 * 5 + (buyers + vendors) * 0.3 +
      vendors * 0.2 * 10 + buyers * 3 + vendors * 5
    )
    
    const supabaseEdgeFunctionsCost = Math.max(
      constants.supabaseEdgeFunctions, 
      (edgeFunctionInvocations / 1000000) * 2
    )
    
    const activeRealtimeConnections = (
      buyers * surge.concurrent + vendors * 0.3 + buyers * 0.05 * 2 +
      buyers * 0.1 + vendors * 0.2
    )
    
    const supabaseRealtimeCost = Math.max(
      constants.supabaseRealtime, 
      activeRealtimeConnections * 0.01
    )
    
    const authOperations = (
      buyers * 15 + buyers * 0.3 * 8 + buyers * 5 + buyers * 0.1 * 3 +
      vendors * 10 + vendors * 2
    )
    
    const supabaseAuthCost = Math.max(0, (authOperations / 1000000) * constants.supabaseAuth * 1000)
    
    const miscStorageGB = (
      vendors * 0.01 + buyers * 0.005 + vendors * avgCommentsPerVendor * 0.0001 +
      vendors * avgRatingsPerVendor * 0.00005 + (buyers + vendors) * avgMessagesPerUser * 0.0002 +
      buyers * 0.001 + vendors * 0.002 + vendors * 0.001 + vendors * 0.0005 + 0.5
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
      imagesViewedPerBuyer: imagesViewedPerBuyer.toFixed(0),
    })
  }, [vendors, imagesPerVendor, buyerMultiplier, surgeMode, vendorSubscriptionNaira, exchangeRate, imageSizeKB, imagesViewedMultiplier, constants, surgeMultipliers])

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[#21262d]">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Ecommerce Cost Calculator
          </h1>
          <p className="text-[#7d8590] text-sm">
            Realistic infrastructure cost estimates for your marketplace
          </p>
        </div>

        {/* Config Section */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white mb-3">Configuration</h2>
          
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <InputCard
              label="Vendors"
              value={vendors}
              onChange={setVendors}
              hint="Total vendors in marketplace"
            />
            <InputCard
              label="Images per Vendor"
              value={imagesPerVendor}
              onChange={setImagesPerVendor}
              hint="Average products per vendor"
            />
            <InputCard
              label="Buyer Multiplier"
              value={buyerMultiplier}
              onChange={setBuyerMultiplier}
              step="0.5"
              hint={`= ${calculated.buyers?.toLocaleString() || 0} buyers`}
              hintColor="text-[#58a6ff]"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <SmallInputCard
              label="Image Size (KB)"
              value={imageSizeKB}
              onChange={setImageSizeKB}
            />
            <SmallInputCard
              label="Views Multiplier"
              value={imagesViewedMultiplier}
              onChange={setImagesViewedMultiplier}
              step="0.5"
              hint={`= ${calculated.imagesViewedPerBuyer || 0} views/buyer`}
            />
            <div className="bg-[#161b22] rounded-md border border-[#30363d] p-3 col-span-2">
              <p className="text-xs font-medium text-[#7d8590] mb-1">Tips</p>
              <p className="text-xs text-[#7d8590]">
                Adjust multipliers for different behaviors • Use surge mode for traffic spikes
              </p>
            </div>
          </div>
        </div>

        {/* Surge Mode */}
        <div className="mb-4 bg-[#161b22] rounded-md border border-[#30363d] p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-[#f85149]" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.47.22A.75.75 0 015 0h6a.75.75 0 01.53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 01-.22.53l-4.25 4.25A.75.75 0 0111 16H5a.75.75 0 01-.53-.22L.22 11.53A.75.75 0 010 11V5a.75.75 0 01.22-.53L4.47.22z"/>
            </svg>
            <h3 className="text-xs font-semibold text-white">Traffic Surge Mode</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(surgeMultipliers).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSurgeMode(key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  surgeMode === key
                    ? 'bg-[#1f6feb] text-white'
                    : 'bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]'
                }`}
              >
                {data.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#7d8590]">
            Current: <span className="text-[#58a6ff]">{calculated.surgeLabel}</span>
            {surgeMode !== 'normal' && ' • Simulating traffic spike'}
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white mb-3">Cost Breakdown</h2>
          
          <div className="grid md:grid-cols-3 gap-3">
            <CostCard
              title="Cloudflare R2"
              items={[
                { label: 'Storage', value: `$${calculated.r2StorageCost}` },
                { label: 'Egress', value: `$${calculated.r2EgressCost}` },
              ]}
              total={(parseFloat(calculated.r2StorageCost || 0) + parseFloat(calculated.r2EgressCost || 0)).toFixed(2)}
            />
            
            <CostCard
              title="Supabase Core"
              items={[
                { label: 'Base Plan', value: `$${calculated.supabasePlan?.toFixed(2)}` },
                { label: 'DB Compute', value: `$${calculated.supabaseDbComputeCost}` },
                { label: 'Edge Functions', value: `$${calculated.supabaseEdgeFunctionsCost}` },
              ]}
              total={(
                parseFloat(calculated.supabasePlan || 0) +
                parseFloat(calculated.supabaseDbComputeCost || 0) +
                parseFloat(calculated.supabaseEdgeFunctionsCost || 0)
              ).toFixed(2)}
            />
            
            <CostCard
              title="Supabase Extras"
              items={[
                { label: 'Realtime', value: `$${calculated.supabaseRealtimeCost}` },
                { label: 'Auth', value: `$${calculated.supabaseAuthCost}` },
                { label: 'Storage', value: `$${calculated.supabaseMiscStorageCost}` },
              ]}
              total={(
                parseFloat(calculated.supabaseRealtimeCost || 0) +
                parseFloat(calculated.supabaseAuthCost || 0) +
                parseFloat(calculated.supabaseMiscStorageCost || 0)
              ).toFixed(2)}
            />
          </div>
        </div>

        {/* Grand Total */}
        <div className="mb-4 bg-[#161b22] rounded-md border border-[#30363d] p-4">
          <div className="text-center">
            <p className="text-xs text-[#7d8590] mb-2">Monthly Infrastructure Cost</p>
            <p className="text-4xl font-bold text-[#58a6ff] mb-3">${calculated.grandTotal}</p>
            <div className="flex items-center justify-center gap-3 text-xs text-[#7d8590]">
              <span>{vendors} vendors</span>
              <span>•</span>
              <span>{calculated.buyers?.toLocaleString()} buyers</span>
              <span>•</span>
              <span>{calculated.totalImages?.toLocaleString()} images</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white mb-3">Revenue & Profitability</h2>
          
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="bg-[#161b22] rounded-md border border-[#30363d] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Pricing</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#7d8590] mb-1">
                    Vendor Subscription (₦/month)
                  </label>
                  <input
                    type="number"
                    value={vendorSubscriptionNaira}
                    onChange={(e) => setVendorSubscriptionNaira(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6feb]"
                  />
                  <p className="text-xs text-[#7d8590] mt-1">
                    ≈ ${(vendorSubscriptionNaira / exchangeRate).toFixed(2)} per vendor
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7d8590] mb-1">
                    Exchange Rate (₦/$)
                  </label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    step="0.01"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6feb]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#161b22] rounded-md border border-[#30363d] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#7d8590]">Monthly Revenue</span>
                  <span className="text-white font-mono">
                    ₦{parseInt(calculated.monthlyRevenueNaira || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#7d8590]">Monthly Costs</span>
                  <span className="text-white font-mono">${calculated.grandTotal}</span>
                </div>
                <div className={`flex justify-between items-center text-sm p-2 rounded-md ${
                  parseFloat(calculated.profitDollars) >= 0 ? 'bg-[#238636]/10' : 'bg-[#da3633]/10'
                }`}>
                  <span className="text-white font-medium">Net Profit</span>
                  <span className={`font-mono font-bold ${
                    parseFloat(calculated.profitDollars) >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
                  }`}>
                    {parseFloat(calculated.profitDollars) >= 0 ? '+' : ''}${calculated.profitDollars}
                  </span>
                </div>
                <div className="text-xs text-[#7d8590]">
                  {calculated.profitMargin}% margin • Break-even at {calculated.breakEvenVendors} vendors
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <MetricCard label="Cost/Vendor" value={`$${calculated.costPerVendor}`} />
            <MetricCard 
              label="Profit/Vendor" 
              value={`$${((parseFloat(calculated.profitDollars) || 0) / vendors).toFixed(2)}`} 
            />
            <MetricCard label="Break-even" value={`${calculated.breakEvenVendors} vendors`} />
            <MetricCard 
              label="Margin" 
              value={`${calculated.profitMargin}%`}
              color={parseFloat(calculated.profitMargin) >= 50 ? 'green' : parseFloat(calculated.profitMargin) >= 20 ? 'yellow' : 'red'}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#161b22] rounded-md border border-[#30363d] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Executive Summary</h3>
            <button
              onClick={() => {
                const summary = document.getElementById('summary-text').innerText
                navigator.clipboard.writeText(summary)
                alert('Copied!')
              }}
              className="px-2.5 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium rounded-md transition-colors"
            >
              Copy
            </button>
          </div>
          
          <div id="summary-text" className="text-sm text-[#c9d1d9] space-y-3 leading-relaxed">
            <p>
              <strong className="text-white">Platform:</strong> {vendors} vendors with {imagesPerVendor} images each = {calculated.totalImages?.toLocaleString()} total images ({calculated.totalImageSizeGB}GB). {calculated.buyers?.toLocaleString()} buyers ({buyerMultiplier}x ratio).
            </p>

            <p>
              <strong className="text-white">Costs:</strong> ${calculated.grandTotal}/month (₦{(parseFloat(calculated.grandTotal || 0) * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}) = ${calculated.costPerVendor}/vendor.
              {surgeMode !== 'normal' && <span className="text-[#f85149]"> ⚠️ {surgeMultipliers[surgeMode].label} mode - costs are temporary.</span>}
            </p>

            <p>
              <strong className="text-white">Revenue:</strong> ₦{vendorSubscriptionNaira.toLocaleString()}/vendor = ₦{parseInt(calculated.monthlyRevenueNaira || 0).toLocaleString()}/month (${calculated.monthlyRevenueDollars}).
              {parseFloat(calculated.profitDollars) >= 0 ? (
                <> Profit: ${calculated.profitDollars} ({calculated.profitMargin}% margin). Break-even: {calculated.breakEvenVendors} vendors.</>
              ) : (
                <> Loss: ${Math.abs(parseFloat(calculated.profitDollars))}. Need {calculated.breakEvenVendors} vendors to break even.</>
              )}
