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

  useEffect(() => {
    const buyers = vendors * buyerMultiplier
    const totalImages = vendors * imagesPerVendor
    const totalImageSizeGB = (totalImages * constants.imageSizeKB) / (1024 * 1024)
    const r2StorageCost = totalImageSizeGB * constants.r2StoragePerGB
    
    const totalImageViews = buyers * constants.imagesViewedPerBuyer
    const totalImageTrafficGB = (totalImageViews * constants.imageSizeKB) / (1024 * 1024)
    const r2EgressCost = totalImageTrafficGB * constants.r2EgressPerGB
    
    const dbOperationsPerMonth = (
      vendors * 500 +
      buyers * 200 +
      totalImageViews * 0.5 +
      (buyers * 10) +
      (vendors * 20)
    )
    
    const supabaseDbComputeCost = (dbOperationsPerMonth / 1000000) * constants.supabaseDbCompute * 1000
    
    const edgeFunctionInvocations = buyers * 15 + vendors * 30
    const supabaseEdgeFunctionsCost = Math.max(constants.supabaseEdgeFunctions, (edgeFunctionInvocations / 1000000) * 2)
    
    const activeRealtimeConnections = buyers * 0.1
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
    })
  }, [vendors, imagesPerVendor, buyerMultiplier, constants])

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

        <Analytics calculated={calculated} vendors={vendors} />

        <CostBreakdown calculated={calculated} />

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