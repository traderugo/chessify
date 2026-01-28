export default function MetricsInput({
  vendors,
  setVendors,
  imagesPerVendor,
  setImagesPerVendor,
  buyerMultiplier,
  setBuyerMultiplier,
  calculated,
}) {
  return (
    <div className="mb-12">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
            <h3 className="text-xl font-bold text-white">vendors</h3>
          </div>
          <input
            type="number"
            value={vendors}
            onChange={(e) => setVendors(parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border-2 border-purple-500/30 rounded-2xl px-6 py-4 text-white text-3xl font-bold focus:outline-none focus:border-purple-400 transition-all"
            min="0"
          />
          <p className="text-purple-300 text-sm mt-3">total vendors in marketplace</p>
        </div>

        <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/30 shadow-2xl hover:border-pink-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-xl font-bold text-white">images/vendor</h3>
          </div>
          <input
            type="number"
            value={imagesPerVendor}
            onChange={(e) => setImagesPerVendor(parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border-2 border-pink-500/30 rounded-2xl px-6 py-4 text-white text-3xl font-bold focus:outline-none focus:border-pink-400 transition-all"
            min="0"
          />
          <p className="text-pink-300 text-sm mt-3">avg products per vendor</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/30 shadow-2xl hover:border-blue-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-white">buyer multiplier</h3>
          </div>
          <input
            type="number"
            value={buyerMultiplier}
            onChange={(e) => setBuyerMultiplier(parseFloat(e.target.value) || 0)}
            step="0.5"
            className="w-full bg-black/40 border-2 border-blue-500/30 rounded-2xl px-6 py-4 text-white text-3xl font-bold focus:outline-none focus:border-blue-400 transition-all"
            min="0"
          />
          <p className="text-blue-300 text-sm mt-3">
            = {calculated.buyers?.toLocaleString() || 0} buyers (vendors × {buyerMultiplier})
          </p>
        </div>
      </div>
    </div>
  )
}